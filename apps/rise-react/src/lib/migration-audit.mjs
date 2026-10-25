// Rise Nocturne · owner-scoped migration preflight and compatible backup.
// Never copies user records to staging, logs contents, or mutates any tables.
export const MIGRATION_TABLES=Object.freeze({
 profiles:"user_id",user_settings:"user_id",system_preferences:"user_id",system_records:"user_id",
 hub_user_state:"owner_id",hub_records:"owner_id",skin_notes:"user_id",
 skin_routine_logs:"user_id",gym_plans:"user_id",gym_sessions:"user_id",
 news_briefs:"user_id",payroll_employers:"user_id",payroll_documents:"user_id",
 payroll_payslips:"user_id",payroll_payslip_versions:"user_id",payroll_line_items:"user_id",
 payroll_validations:"user_id",payroll_anomalies:"user_id",payroll_corrections:"user_id",
 payroll_events:"user_id",payroll_balance_imports:"owner_id"
});
export const MIGRATION_BUCKETS=Object.freeze(["payroll","hub-private","portfolio-files","progress-photos"]);
const BATCH=500,MAX_BYTES=60*1024*1024;
const SINGLETON_TABLES=new Set(["profiles","user_settings","system_preferences","hub_user_state","gym_plans"]);
function uidCheck(uid){
 if(typeof uid!=="string"||!/^[0-9a-f-]{36}$/i.test(uid))throw Error("Identidad no válida");
 return uid;
}
export async function verifyMigrationOwner(client,uid){
 uidCheck(uid);
 const {data,error}=await client.auth.getUser();
 if(error||data?.user?.id!==uid)throw Error("La sesión no coincide con el propietario solicitado.");
 return uid;
}
export async function auditPrivateTables(client,uid,{verifyOwner=verifyMigrationOwner,onProgress=()=>{}}={}){
 await verifyOwner(client,uid);
 const counts={},errors=[];
 for(const [table,column] of Object.entries(MIGRATION_TABLES)){
  onProgress(table);
  const {count,error}=await client.from(table).select("*",{head:true,count:"exact"}).eq(column,uid);
  if(error||count===null||count===undefined){errors.push({table,message:"La tabla no se pudo consultar con tu sesión."});continue;}
  counts[table]=count;
 }
 return {counts,errors,complete:errors.length===0};
}
async function allRows(client,table,column,uid){
 const records=[];
 for(let start=0;start<1000000;start+=BATCH){
  const {data,error}=await client.from(table).select("*").eq(column,uid)
   .order(SINGLETON_TABLES.has(table)?column:"id",{ascending:true}).range(start,start+BATCH-1);
  if(error)throw Error("No se pudieron exportar todos los registros de "+table);
  const next=data||[];
  records.push(...next);
  if(next.length<BATCH)return records;
 }
 throw Error("El volumen de "+table+" supera el límite verificado de exportación");
}
async function base64(blob){
 const bytes=new Uint8Array(await blob.arrayBuffer());let out="";
 for(let at=0;at<bytes.length;at+=8192)out+=String.fromCharCode(...bytes.subarray(at,at+8192));
 return btoa(out);
}
async function allPrivateFiles(client,uid,onProgress){
 const files=[];let total=0;
 for(const bucket of MIGRATION_BUCKETS){
  const paths=[uid];const seen=new Set();
  while(paths.length){
   const prefix=paths.pop();
   if(seen.has(prefix))continue;seen.add(prefix);
   onProgress(bucket+" / "+prefix.slice(0,100));
   const {data,error}=await client.storage.from(bucket).list(prefix,{limit:1000});
   if(error)throw Error("No se pudo leer el almacén privado "+bucket);
   if((data||[]).length>=1000)throw Error("Demasiados archivos en una carpeta de "+bucket+"; exportación bloqueada para evitar omisiones.");
   for(const item of data||[]){
    if(!item?.name||item.name==="."||item.name===".."||item.name.includes("/")||item.name.includes("\\")||/[\x00-\x1f]/.test(item.name))throw Error("Ruta de archivo no verificada");
    const path=prefix+"/"+item.name;
    if(!item.id){if(path.split("/").length>12)throw Error("Jerarquía de carpetas demasiado profunda");paths.push(path);continue;}
    const {data:blob,error:downloadError}=await client.storage.from(bucket).download(path);
    if(downloadError||!blob)throw Error("No se pudo descargar un archivo privado de "+bucket);
    total+=blob.size;
    if(total>MAX_BYTES)throw Error("Archivos privados superan 60 MB; no se creará una copia incompleta.");
    files.push({bucket,path,size:blob.size,content_type:blob.type||"application/octet-stream",base64:await base64(blob)});
   }
  }
 }
 return files;
}
export async function buildMigrationBackup(client,uid,{verifyOwner=verifyMigrationOwner,onProgress=()=>{},now=()=>new Date()}={}){
 await verifyOwner(client,uid);
 const result={format:"renzo-hub-export",version:1,taken_at:now().toISOString(),
  user_id:uid,project:"RISE HUB Nocturne",release:"migration-preflight",tables:{},files:[],counts:{},errors:[]};
 // The legacy snapshot_to_sql.py / extract_files.py expect this exact format.
 for(const [table,column] of Object.entries(MIGRATION_TABLES)){
  onProgress("Exportando "+table);
  const rows=await allRows(client,table,column,uid);
  result.tables[table]=rows;result.counts[table]=rows.length;
 }
 result.files=await allPrivateFiles(client,uid,onProgress);
 result.counts.files=result.files.length;
 return result;
}
export function legacyLocalKeys(uid,storage){
 uidCheck(uid);
 const keys=[`renzo-world-v2:${uid}`,`renzo-world-preview-v1:${uid}`];
 return keys.map(key=>{
  try{const raw=storage?.getItem(key);if(!raw)return{key,present:false};
   const data=JSON.parse(raw);
   if(!data||typeof data!=="object"||Array.isArray(data))return{key,present:true,valid:false};
   const fields=["projects","ideas","entries","money","tasks","feedback","inbox","vocabulary"];
   const counts=Object.fromEntries(fields.map(f=>[f,Array.isArray(data[f])?data[f].length:0]));
   return{key,present:true,valid:true,modifiedAt:typeof data._modifiedAt==="string"?data._modifiedAt:null,counts};
  }catch{return{key,present:true,valid:false};}
 });
}
export function comparisonAgainstExport(backup,audit,uid){
 uidCheck(uid);
 if(!backup||backup.format!=="renzo-hub-export"||backup.user_id!==uid||backup.version!==1||!backup.tables||typeof backup.tables!=="object")throw Error("La copia no corresponde a esta cuenta o formato.");
 const comparisons=Object.keys(MIGRATION_TABLES).map(table=>{
  const backupRows=backup.tables[table];
  const oldCount=Array.isArray(backupRows)?backupRows.length:null;
  const currentCount=audit?.counts?.[table];
  return{table,backupCount:oldCount,currentCount:typeof currentCount==="number"?currentCount:null,
   match:oldCount!==null&&oldCount===currentCount};
 });
 return{comparisons,equal:audit?.complete===true&&comparisons.every(r=>r.match),warning:"La igualdad de recuentos no garantiza igualdad de contenido ni ausencia de conflictos."};
}

/**
 * Owner-scoped comparison of actual rows, not just table counts.
 * Private data stays in the authenticated browser: only per-table totals leave this function.
 * Does not migrate, upload, mutate, print, or silently resolve conflicts.
 */
function canonicalRow(value){
 if(Array.isArray(value))return "["+value.map(canonicalRow).join(",")+"]";
 if(value!==null&&typeof value==="object")return "{"+Object.keys(value).sort()
  .filter(k=>value[k]!==undefined).map(k=>JSON.stringify(k)+":"+canonicalRow(value[k])).join(",")+"}";
 return JSON.stringify(value);
}
async function rowFingerprint(row){
 if(!globalThis.crypto?.subtle)throw Error("Se necesita un navegador seguro para comprobar huellas SHA-256.");
 const digest=await globalThis.crypto.subtle.digest("SHA-256",new TextEncoder().encode(canonicalRow(row)));
 return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");
}
async function fingerprintRows(rows,column,uid,source){
 const index=new Map();
 for(const row of rows){
  if(!row||typeof row!=="object"||Array.isArray(row)||row[column]!==uid)
   throw Error("Los registros de "+source+" no corresponden al usuario autorizado.");
  const key=String(row.id??row[column]??"");
  if(!key||index.has(key))throw Error("Identificador vacío o duplicado en "+source+".");
  index.set(key,await rowFingerprint(row));
 }
 return index;
}
export async function compareMigrationRows(client,uid,backup,{verifyOwner=verifyMigrationOwner,onProgress=()=>{}}={}){
 await verifyOwner(client,uid);
 if(!backup||backup.format!=="renzo-hub-export"||backup.version!==1||
    backup.user_id!==uid||!backup.tables||typeof backup.tables!=="object"||
    Array.isArray(backup.tables))throw Error("La copia no corresponde a esta cuenta o formato.");
 const comparisons=[];
 for(const [table,column] of Object.entries(MIGRATION_TABLES)){
  onProgress("Comparando contenido de "+table);
  const historic=backup.tables[table];
  if(!Array.isArray(historic)){
   comparisons.push({table,backupCount:null,currentCount:null,missing:0,added:0,changed:0,match:false});
   continue;
  }
  const current=await allRows(client,table,column,uid);
  const before=await fingerprintRows(historic,column,uid,"la copia de "+table);
  const after=await fingerprintRows(current,column,uid,"Supabase "+table);
  let missing=0,added=0,changed=0;
  for(const [key,hash]of before){
   if(!after.has(key))missing++;
   else if(hash!==after.get(key))changed++;
  }
  for(const key of after.keys())if(!before.has(key))added++;
  comparisons.push({table,backupCount:historic.length,currentCount:current.length,
   missing,added,changed,match:missing===0&&added===0&&changed===0});
 }
 return{comparisons,equal:comparisons.every(x=>x.match),
  warning:"Compara filas e identificadores SHA-256 en este navegador. No compara archivos Storage ni cambios locales no exportados."};
}

/**
 * Verify actual private Storage file bytes against a local legacy backup.
 * Downloads are authenticated by Supabase Storage policies; no external upload
 * or metadata leak. Abort (rather than announce equality) on partial backups.
 */
async function fingerprintFileBase64(encoded){
 if(typeof encoded!=="string"||!globalThis.crypto?.subtle)throw Error("No se puede verificar la huella de un archivo privado.");
 const binary=atob(encoded),buffer=new Uint8Array(binary.length);
 for(let i=0;i<binary.length;i++)buffer[i]=binary.charCodeAt(i);
 const hash=await globalThis.crypto.subtle.digest("SHA-256",buffer);
 return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,"0")).join("");
}
async function indexPrivateFiles(files,uid,source){
 const index=new Map();
 for(const file of files){
  if(!file||typeof file!=="object"||!MIGRATION_BUCKETS.includes(file.bucket)||
     typeof file.path!=="string"||!file.path.startsWith(uid+"/")||
     typeof file.size!=="number"||!Number.isSafeInteger(file.size)||file.size<0)
   throw Error("La lista privada de archivos de "+source+" no es válida para esta cuenta.");
  const key=file.bucket+"/"+file.path;
  if(index.has(key))throw Error("Hay una ruta duplicada en "+source+".");
  const checksum=await fingerprintFileBase64(file.base64);
  index.set(key,{checksum,size:file.size});
 }
 return index;
}
export async function compareMigrationFiles(client,uid,backup,{verifyOwner=verifyMigrationOwner,onProgress=()=>{}}={}){
 await verifyOwner(client,uid);
 if(!backup||backup.format!=="renzo-hub-export"||backup.version!==1||
    backup.user_id!==uid||!Array.isArray(backup.files)||!Array.isArray(backup.errors)||
    backup.errors.length>0)
  throw Error("La copia no contiene un inventario completo y verificable de archivos privados.");
 onProgress("Comprobando documentos y fotografías privados");
 const cloudFiles=await allPrivateFiles(client,uid,onProgress);
 const old=await indexPrivateFiles(backup.files,uid,"la copia");
 const cloud=await indexPrivateFiles(cloudFiles,uid,"Supabase Storage");
 let missing=0,added=0,changed=0;
 for(const [path,data]of old){
  const newer=cloud.get(path);
  if(!newer)missing++;
  else if(newer.size!==data.size||newer.checksum!==data.checksum)changed++;
 }
 for(const path of cloud.keys())if(!old.has(path))added++;
 return{backupCount:old.size,currentCount:cloud.size,missing,added,changed,
  equal:missing===0&&added===0&&changed===0};
}
