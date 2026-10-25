// Rise Nocturne · Career / Data Lab: formación, skills y portfolio con evidencias privadas.
// Registros hub_records(domain='work', record_type='career_item'); evidencias en el bucket privado
// 'portfolio-files' dentro de la carpeta del propietario (política portfolio_files_owner ya existente).
// Nada se crea sin acción explícita del usuario; no se borra: archivar conserva el registro.
const COLUMNS="id,owner_id,domain,record_type,title,status,occurred_at,payload,created_at,updated_at";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const CAREER_KINDS=Object.freeze({
 course:{label:"Formación / certificado",statuses:["planned","in_progress","completed"]},
 skill:{label:"Skill",statuses:["active"]},
 project:{label:"Caso de portfolio",statuses:["draft","published"]}
});
export const STATUS_LABEL=Object.freeze({planned:"Planificado",in_progress:"En curso",completed:"Completado",active:"Activa",draft:"Borrador",published:"Listo para mostrar",archived:"Archivado"});
export const SKILL_AREAS=Object.freeze(["SQL","Python","Power BI","Excel","SAP","Logística","Inventario","Otro"]);
const EVIDENCE_MIME=new Set(["application/pdf","image/jpeg","image/png","image/webp"]);
const MAX_EVIDENCE=10*1024*1024;
function owner(uid){if(typeof uid!=="string"||!UUID.test(uid))throw Error("Inicia sesión para usar Career.");return uid;}
const text=(v,max)=>String(v??"").trim().slice(0,max);
function isoDate(v){const s=text(v,10);if(!s)return null;if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||new Date(s+"T00:00:00Z").toISOString().slice(0,10)!==s)throw Error("Fecha no válida.");return s;}
function httpsUrl(v){const s=text(v,500);if(!s)return null;try{const u=new URL(s);if(u.protocol!=="https:")throw 0;return u.href;}catch{throw Error("El enlace debe empezar por https://.");}}

export function careerPayload(kind,v,previous={}){
 const spec=CAREER_KINDS[kind];if(!spec)throw Error("Tipo de elemento no válido.");
 const title=text(v.title,160);if(!title)throw Error("Indica un título.");
 const status=text(v.status,20)||spec.statuses[0];if(!spec.statuses.includes(status))throw Error("Estado no válido.");
 const base={...previous,kind,title,status,notes:text(v.notes,2000),url:httpsUrl(v.url)};
 if(kind==="course"){
  const completedOn=isoDate(v.completedOn);
  if(status==="completed"&&!completedOn)throw Error("Indica la fecha en que lo completaste.");
  return {...base,provider:text(v.provider,120),area:text(v.area,40),completedOn:status==="completed"?completedOn:null};
 }
 if(kind==="skill"){
  const level=Number(v.level);if(!Number.isInteger(level)||level<1||level>5)throw Error("Nivel de 1 a 5.");
  return {...base,area:SKILL_AREAS.includes(v.area)?v.area:"Otro",level};
 }
 return {...base,area:text(v.area,40),outcome:text(v.outcome,600),skills:text(v.skills,300)};
}
export function sortCareer(rows=[]){
 const rank={in_progress:0,planned:1,draft:1,active:2,published:2,completed:3,archived:9};
 return rows.slice().sort((a,b)=>(rank[a.status]??5)-(rank[b.status]??5)||String(b.updated_at||"").localeCompare(String(a.updated_at||"")));
}
export function careerSummary(rows=[]){
 const live=rows.filter(r=>r.status!=="archived");
 return {courses:live.filter(r=>r.payload?.kind==="course"),completed:live.filter(r=>r.payload?.kind==="course"&&r.status==="completed").length,
  skills:live.filter(r=>r.payload?.kind==="skill"),projects:live.filter(r=>r.payload?.kind==="project"),archived:rows.length-live.length};
}
export async function loadCareer(client,uid){
 const id=owner(uid);
 const {data,error}=await client.from("hub_records").select(COLUMNS).eq("owner_id",id).eq("domain","work").eq("record_type","career_item").order("updated_at",{ascending:false}).limit(1000);
 if(error||!Array.isArray(data))throw Error("No se pudo cargar Career.");
 if(data.some(r=>r.owner_id!==id))throw Error("Respuesta de otra cuenta rechazada.");
 return sortCareer(data);
}
export async function addCareerItem(client,uid,kind,v,id=globalThis.crypto.randomUUID()){
 const payload=careerPayload(kind,v);
 const {data,error}=await client.from("hub_records").insert({id,owner_id:owner(uid),domain:"work",record_type:"career_item",title:payload.title,status:payload.status,
  occurred_at:payload.completedOn?payload.completedOn+"T12:00:00Z":new Date().toISOString(),payload}).select(COLUMNS).single();
 if(error||!data)throw Error("No se pudo guardar. Revisa la conexión y vuelve a intentarlo.");
 return data;
}
async function patch(client,uid,row,fields){
 if(!row?.id||!row.updated_at||row.owner_id!==owner(uid))throw Error("Actualiza antes de editar.");
 const {data,error}=await client.from("hub_records").update(fields).eq("id",row.id).eq("owner_id",uid).eq("domain","work").eq("record_type","career_item")
  .eq("updated_at",row.updated_at).select(COLUMNS).maybeSingle();
 if(error)throw Error("No se pudo guardar.");
 if(!data)throw Error("Este elemento cambió en otro dispositivo. Actualiza antes de guardar.");
 return data;
}
export function updateCareerItem(client,uid,row,v){
 const payload=careerPayload(row.payload?.kind,v,row.payload);
 return patch(client,uid,row,{title:payload.title,status:payload.status,payload,...(payload.completedOn?{occurred_at:payload.completedOn+"T12:00:00Z"}:{})});
}
export function archiveCareerItem(client,uid,row,archived=true){
 const status=archived?"archived":(row.payload?.status||CAREER_KINDS[row.payload?.kind]?.statuses[0]);
 return patch(client,uid,row,{status});
}
export function evidencePath(uid,path){
 owner(uid);
 if(typeof path!=="string"||!path.startsWith(uid+"/career/")||path.split("/").some(p=>!p||p==="."||p==="..")||/[\\:%?#\u0000-\u001f]/.test(path))
  throw Error("La evidencia no pertenece a la carpeta privada de esta cuenta.");
 return path;
}
export async function attachEvidence(client,uid,row,file){
 if(!file||!EVIDENCE_MIME.has(file.type)||file.size<1||file.size>MAX_EVIDENCE)throw Error("Selecciona un PDF o imagen de hasta 10 MB.");
 const list=Array.isArray(row?.payload?.evidence)?row.payload.evidence:[];
 if(list.length>=10)throw Error("Máximo 10 evidencias por elemento.");
 const bytes=new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256",await file.arrayBuffer()));
 const hash=[...bytes].map(n=>n.toString(16).padStart(2,"0")).join("");
 if(list.some(e=>e.sha256===hash))throw Error("Esa evidencia ya está adjunta.");
 const safe=String(file.name||"evidencia").replace(/[^a-zA-Z0-9._-]/g,"_").slice(-100);
 const path=evidencePath(uid,`${uid}/career/${row.id}/${hash}-${safe}`);
 const {error}=await client.storage.from("portfolio-files").upload(path,file,{contentType:file.type,upsert:false});
 // Respuesta perdida: el hash del contenido da la misma ruta en el reintento (409 = ya existe).
 if(error&&String(error.statusCode||error.status)!=="409")throw Error("No se pudo subir la evidencia. El elemento se conserva; reintenta.");
 return patch(client,uid,row,{payload:{...row.payload,evidence:[...list,{path,name:String(file.name||"evidencia").slice(0,200),mime:file.type,size:file.size,sha256:hash,addedAt:new Date().toISOString()}]}});
}
export async function downloadEvidence(client,uid,evidence){
 const path=evidencePath(uid,evidence?.path);
 const {data,error}=await client.storage.from("portfolio-files").download(path);
 if(error||!data)throw Error("No se pudo descargar la evidencia.");
 return {blob:data,name:String(evidence.name||"evidencia").replace(/[\\/\u0000-\u001f]/g,"_")};
}
