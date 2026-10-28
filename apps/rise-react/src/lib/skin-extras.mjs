// Rise Nocturne · Skin: compatibilidades, historial y fotos privadas.
// Las reglas de compatibilidad se derivan LITERALMENTE de las notas del catálogo original
// (skin-catalog.mjs); no se añaden consejos dermatológicos nuevos.
import {PRODUCTS,dateKeyLocal} from "./skin-catalog.mjs";
import {skinPhotoFolder,skinPhotoPath,validateSkinPhoto} from "./legacy-skin/photos.js";
const name=i=>PRODUCTS[i]?.[0]||"Producto "+i;
const BARRIER_PAUSE=[2,5,6,7,12,13,19];
const PAIRS=[
 ...[4,6,7,9].map(i=>({a:19,b:i,level:"info",text:()=>`${name(19)} y ${name(i)}: elegir un sérum de tono por sesión; evitar capas duplicadas al introducirlo.`})),
 {a:2,b:12,level:"caution",text:()=>`${name(2)}: pausar al introducir ${name(12)}.`},
 {a:2,b:17,level:"caution",text:()=>`${name(2)}: pausar al introducir ${name(17)}.`},
 {a:12,b:17,level:"conflict",text:()=>`${name(17)}: no combinar con ${name(12)}.`},
 {a:5,b:12,level:"conflict",text:()=>`${name(5)}: no usar en noches de retinal (${name(12)}).`},
 {a:5,b:17,level:"conflict",text:()=>`${name(5)}: no usar en noches de retinoide (${name(17)}).`},
 {a:2,b:5,level:"conflict",text:()=>`${name(2)}: no combinar con otros exfoliantes (${name(5)}).`},
 {a:7,b:12,level:"caution",text:()=>`${name(7)}: no combinar activos al iniciar el retinal.`},
 {a:7,b:9,level:"info",text:()=>`${name(9)} es alternativa a ${name(7)}: elige uno.`},
 {a:10,b:11,level:"info",text:()=>`${name(11)} es alternativa a ${name(10)}: elige uno.`},
 {a:12,b:16,level:"caution",text:()=>`${name(16)}: no combinar múltiples activos inicialmente.`},
 {a:7,b:16,level:"caution",text:()=>`${name(16)}: no combinar múltiples activos inicialmente.`}
];
export function skinCompatibility(inventory={},barrierFirst=true){
 const on=i=>inventory["p"+i]==="available";
 const out=PAIRS.filter(p=>on(p.a)&&on(p.b)).map(p=>({level:p.level,text:p.text(),products:[p.a,p.b]}));
 if(barrierFirst)for(const i of BARRIER_PAUSE)if(on(i))out.push({level:"caution",text:`Fase de recuperación de barrera · ${name(i)}: ${PRODUCTS[i][2]}.`,products:[i]});
 return out;
}
export async function loadSkinHistory(client,uid,{days=30,at=new Date()}={}){
 if(!client||!uid)throw Error("Inicia sesión.");
 const from=dateKeyLocal(new Date(at.getFullYear(),at.getMonth(),at.getDate()-(days-1),12)),to=dateKeyLocal(at);
 const [l,n]=await Promise.all([
  client.from("skin_routine_logs").select("routine_date,session,completed_steps").eq("user_id",uid).gte("routine_date",from).lte("routine_date",to),
  client.from("skin_notes").select("note_date,note").eq("user_id",uid).gte("note_date",from).lte("note_date",to)
 ]);
 if(l.error||n.error)throw Error("No se pudo cargar el historial de Skin.");
 const map=new Map();
 const row=d=>{if(!map.has(d))map.set(d,{day:d,am:0,pm:0,note:""});return map.get(d);};
 for(const x of l.data||[])if(["am","pm"].includes(x.session))row(x.routine_date)[x.session]=Array.isArray(x.completed_steps)?new Set(x.completed_steps.filter(Number.isInteger)).size:0;
 for(const x of n.data||[])if(String(x.note||"").trim())row(x.note_date).note=String(x.note).slice(0,600);
 return [...map.values()].sort((a,b)=>b.day.localeCompare(a.day));
}
const PHOTO=/^[0-9a-f-]{36}\.(jpg|png|webp)$/i;
function bucket(client){return client.storage.from("progress-photos");}
function ownPath(uid,path){const base=skinPhotoFolder(uid)+"/";if(typeof path!=="string"||!path.startsWith(base)||!PHOTO.test(path.slice(base.length)))throw Error("Ruta privada no válida");return path;}
export async function listSkinPhotos(client,uid){
 const folder=skinPhotoFolder(uid);
 const {data,error}=await bucket(client).list(folder,{limit:200,sortBy:{column:"created_at",order:"desc"}});
 if(error)throw Error("No se pudieron listar las fotos de Skin.");
 return (data||[]).filter(f=>PHOTO.test(f.name)).map(f=>({path:folder+"/"+f.name,created:String(f.created_at||"").slice(0,10)}));
}
export async function uploadSkinPhoto(client,uid,file,id=globalThis.crypto.randomUUID()){
 validateSkinPhoto(file);
 const path=skinPhotoPath(uid,id,file.type);
 const {error}=await bucket(client).upload(path,file,{contentType:file.type,upsert:false,cacheControl:"0"});
 if(error)throw Error("No se pudo subir la foto.");
 return path;
}
export async function skinPhotoUrls(client,uid,paths,expiresIn=300){
 if(!paths.length)return {};
 paths.forEach(p=>ownPath(uid,p));
 const {data,error}=await bucket(client).createSignedUrls(paths,expiresIn);
 if(error)throw Error("No se pudieron abrir las fotos.");
 return Object.fromEntries((data||[]).filter(x=>x?.signedUrl&&!x.error).map(x=>[x.path,x.signedUrl]));
}
export async function deleteSkinPhoto(client,uid,path){
 const {error}=await bucket(client).remove([ownPath(uid,path)]);
 if(error)throw Error("No se pudo borrar la foto.");
}
