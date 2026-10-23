// Native Nocturne captures. Existing Classic payloads and private files stay intact.
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COLUMNS='id,owner_id,domain,record_type,title,status,payload,updated_at,occurred_at';
export const CAPTURE_TYPES=Object.freeze(['Task','Note','Idea','Expense','Study','Dutch','Reminder','Document','Project','Food','Weight','Photo','Groceries','Workout','Career','Portfolio','Other']);
export const FINANCIAL_CAPTURE_TYPES=new Set(['expense','receipt','payslip','income','invoice','money']);
function owner(uid){if(!UUID.test(uid||''))throw Error('Inicia sesión para abrir tu bandeja.');return uid;}
function unwrap(r){if(!r||r.error)throw Error(r?.error?.message||'No se pudo confirmar el guardado.');return r.data;}
export function captureStatus(row){return String(row?.payload?.status||row?.status||'needs_review');}
export function captureNeedsFinance(row){return FINANCIAL_CAPTURE_TYPES.has(String(row?.payload?.category||'').toLowerCase());}
export function captureReviewAvailable(row){
 if(!captureNeedsFinance(row))return true;
 const p=row?.payload||{},x=p.extracted||{};
 return p.source==='jarvis'&&['expense','receipt'].includes(String(p.category).toLowerCase())&&
  typeof x.amount==='number'&&Number.isFinite(x.amount)&&x.amount>0&&x.amount<=1000000&&
  (!x.currency||x.currency==='EUR');
}
export async function loadInbox(client,uid){
 owner(uid);if(!client?.from)throw Error('Conexión privada no disponible.');
 const rows=[];
 for(let from=0;;from+=1000){
  const page=unwrap(await client.from('hub_records').select(COLUMNS).eq('owner_id',uid)
   .eq('record_type','renzo_inbox').order('occurred_at',{ascending:false}).order('id',{ascending:false}).range(from,from+999))||[];
  rows.push(...page);if(page.length<1000)return rows;
 }
}
export function captureRow(uid,{id,title,category='Note',note=''},at=new Date()){
 owner(uid);if(!UUID.test(id||''))throw Error('Identificador de captura inválido.');
 const label=String(title||'').trim();
 if(!label||label.length>180||String(note).length>2000||!CAPTURE_TYPES.includes(category))throw Error('Revisa el título, tipo y nota de la captura.');
 const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'}).format(at);
 return {id,owner_id:uid,domain:'system',record_type:'renzo_inbox',title:label,status:'needs_review',
  occurred_at:at.toISOString(),source:'capture',requires_review:true,
  payload:{id,title:label,category,note:String(note).trim(),date,status:'needs_review',source:'capture',requiresReview:true}};
}
export async function createCapture(client,uid,input){
 const row=captureRow(uid,input);
 // The UI keeps this ID until confirmation. A retry cannot add another capture.
 unwrap(await client.from('hub_records').upsert(row,{onConflict:'id',ignoreDuplicates:true}));
 const saved=unwrap(await client.from('hub_records').select(COLUMNS).eq('id',row.id).eq('owner_id',uid).eq('record_type','renzo_inbox').single());
 if(!saved)throw Error('No se ha confirmado la captura. Reintenta sin cambiar el formulario.');
 return saved;
}
function ownRow(uid,row){
 owner(uid);if(row?.owner_id!==uid||row.record_type!=='renzo_inbox'||!UUID.test(row.id||'')||!row.updated_at)
  throw Error('Actualiza la bandeja antes de guardar.');
}
async function patchCapture(client,uid,row,patch){
 ownRow(uid,row);
 const saved=unwrap(await client.from('hub_records').update(patch).eq('id',row.id).eq('owner_id',uid)
  .eq('domain',row.domain).eq('record_type','renzo_inbox').eq('updated_at',row.updated_at).select(COLUMNS).maybeSingle());
 if(!saved)throw Error('Esta captura cambió en otro dispositivo. Actualiza antes de continuar.');
 return saved;
}
export async function changeCaptureStatus(client,uid,row,status){
 ownRow(uid,row);
 const current=captureStatus(row);
 if(!((status==='archived'&&current==='needs_review')||(status==='needs_review'&&current==='archived')))
  throw Error('Transición de estado no permitida.');
 return patchCapture(client,uid,row,{status,requires_review:status==='needs_review',
  payload:{...row.payload,status,requiresReview:status==='needs_review'}});
}
export async function reviewCapture(client,uid,row){
 ownRow(uid,row);
 if(!captureReviewAvailable(row))throw Error('Confirma los documentos financieros desde Money o Nóminas.');
 const result=unwrap(await client.rpc('nocturne_review_capture',{p_capture:row.id,p_expected_updated_at:row.updated_at}));
 if(result?.ok!==true)throw Error('No se ha confirmado la revisión.');
 return result;
}
const MIME=new Set(['image/jpeg','image/png','image/webp','application/pdf','text/plain','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
export function privateCapturePath(uid,path){
 owner(uid);
 if(typeof path!=='string'||!path.startsWith(uid+'/')||path.split('/').some(p=>!p||p==='.'||p==='..')||/[\\:%?#\u0000-\u001f]/.test(path))
  throw Error('El adjunto no pertenece a la carpeta privada de esta cuenta.');
 return path;
}
export async function attachCaptureFile(client,uid,row,file){
 ownRow(uid,row);
 if(captureStatus(row)!=='needs_review'||row.payload?.attachment)throw Error('El adjunto ya existe o la captura está cerrada.');
 if(!file||!MIME.has(file.type)||file.size<1||file.size>10*1024*1024)throw Error('Selecciona un archivo admitido de hasta 10 MB.');
 const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',await file.arrayBuffer()));
 const hash=[...bytes].map(n=>n.toString(16).padStart(2,'0')).join('');
 const safe=String(file.name||'adjunto').replace(/[^a-zA-Z0-9._-]/g,'_').slice(-100);
 const path=privateCapturePath(uid,`${uid}/${row.id}/${hash}-${safe}`);
 const {error}=await client.storage.from('hub-private').upload(path,file,{contentType:file.type,upsert:false});
 // A lost response may leave a file. Its content hash gives retries the same path.
 if(error&&String(error.statusCode||error.status)!=='409')throw Error('No se pudo subir el adjunto privado. La captura se conserva; puedes reintentarlo.');
 return patchCapture(client,uid,row,{payload:{...row.payload,attachment:{path,name:String(file.name||'adjunto').slice(0,200),mime:file.type,size:file.size}}});
}
export async function downloadCaptureFile(client,uid,row){
 ownRow(uid,row);
 const attachment=row.payload?.attachment;
 const path=privateCapturePath(uid,attachment?.path);
 const blob=unwrap(await client.storage.from('hub-private').download(path));
 if(!blob)throw Error('No se pudo descargar el adjunto.');
 return {blob,name:String(attachment.name||'adjunto').replace(/[\\/\u0000-\u001f]/g,'_')};
}
