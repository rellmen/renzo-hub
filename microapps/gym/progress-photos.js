// Fotos de progreso privadas (base de ChatGPT, ampliada por Claude en 2.37.0).
// Nunca se usan URLs públicas ni se guardan imágenes en localStorage. Todo vive en el bucket privado
// `progress-photos`, dentro de la carpeta del usuario: `<userId>/gym/<fecha>_<pose>_<uuid>.jpg`.
// El RLS del bucket (migración 20261011120000) solo permite leer y escribir en la carpeta propia;
// estas comprobaciones de cliente son una capa más, no la frontera de seguridad.
// La fecha y la pose van en el nombre del archivo: sin tablas nuevas ni migraciones.
export const PHOTO_BUCKET='progress-photos';
export const PHOTO_POSES={front:'Frontal',side:'Lateral',back:'Espalda'};
const TYPES=new Set(['image/jpeg','image/png','image/webp']);
const MAX_BYTES=8*1024*1024;
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const NAME=/^(\d{4}-\d{2}-\d{2})_(front|side|back)_([a-f0-9-]{36})\.(jpg|png|webp)$/i;
const DATE=/^\d{4}-\d{2}-\d{2}$/;

const folder=userId=>{if(!UUID.test(userId))throw Error('Usuario no válido');return `${userId}/gym`;};

export function progressPhotoPath(userId,photoId,{date,pose='front',extension='jpg'}={}){
 if(!UUID.test(photoId))throw Error('Identificador de foto no válido');
 if(!DATE.test(String(date))||Number.isNaN(Date.parse(date+'T12:00:00Z')))throw Error('Fecha no válida');
 if(!PHOTO_POSES[pose])throw Error('Pose no válida');
 if(!['jpg','png','webp'].includes(extension))throw Error('Formato de imagen no válido');
 return `${folder(userId)}/${date}_${pose}_${photoId}.${extension}`;
}
export function parsePhotoName(name){
 const m=NAME.exec(String(name||''));
 if(!m||!UUID.test(m[3]))return null;
 return {date:m[1],pose:m[2].toLowerCase(),id:m[3]};
}
export function assertProgressPhoto(file){
 if(!file||!TYPES.has(file.type))throw Error('Usa una imagen JPG, PNG o WebP');
 if(!Number.isFinite(file.size)||file.size<=0||file.size>MAX_BYTES)throw Error('Máximo 8 MB por foto');
 return file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
}
function storage(db){if(!db?.storage?.from)throw Error('Storage no disponible');return db.storage.from(PHOTO_BUCKET);}
function checkPath(path,userId){
 const base=folder(userId)+'/';
 if(typeof path!=='string'||!path.startsWith(base)||path.includes('..')||path.includes('\\')||!parsePhotoName(path.slice(base.length)))throw Error('Ruta privada no válida');
 return path;
}

// Reduce la foto a 1600 px de lado mayor y la vuelve a codificar en JPEG en el navegador.
// Además de ahorrar espacio, elimina los metadatos EXIF (incluida la ubicación GPS del móvil).
export async function preparePhoto(file,{maxSide=1600,quality=0.85}={}){
 if(!file||!/^image\//.test(file.type||''))throw Error('Elige una imagen');
 let bitmap;
 try{bitmap=await createImageBitmap(file);}catch{throw Error('No se pudo leer la imagen. Prueba con una foto JPG o PNG.');}
 const scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
 const canvas=document.createElement('canvas');
 canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
 canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
 bitmap.close?.();
 const blob=await new Promise(r=>canvas.toBlob(r,'image/jpeg',quality));
 if(!blob)throw Error('No se pudo preparar la foto');
 return new File([blob],'progress.jpg',{type:'image/jpeg'});
}

export async function uploadProgressPhoto(db,userId,file,{date,pose='front'}={}){
 const ext=assertProgressPhoto(file);
 const id=crypto.randomUUID();
 const path=progressPhotoPath(userId,id,{date,pose,extension:ext});
 const {data,error}=await storage(db).upload(path,file,{contentType:file.type,upsert:false,cacheControl:'0'});
 if(error)throw error;
 return {id,path:data?.path||path,date,pose};
}
// Lista ordenada de la más reciente a la más antigua (por fecha de la foto, no de subida).
export async function listProgressPhotos(db,userId){
 const dir=folder(userId);
 const {data,error}=await storage(db).list(dir,{limit:500,sortBy:{column:'name',order:'desc'}});
 if(error)throw error;
 return (data||[]).map(item=>{const meta=parsePhotoName(item.name);return meta?{...meta,name:item.name,path:`${dir}/${item.name}`}:null;})
  .filter(Boolean).sort((a,b)=>b.date.localeCompare(a.date)||b.name.localeCompare(a.name));
}
// Enlaces firmados de corta duración (5 min por defecto). Se piden en bloque cuando el cliente lo permite.
export async function signedProgressPhotoUrls(db,userId,paths,expiresIn=300){
 if(!paths.length)return {};
 paths.forEach(p=>checkPath(p,userId));
 const bucket=storage(db);
 if(typeof bucket.createSignedUrls==='function'){
  const {data,error}=await bucket.createSignedUrls(paths,expiresIn);
  if(error)throw error;
  return Object.fromEntries((data||[]).filter(x=>x?.signedUrl&&!x.error).map(x=>[x.path,x.signedUrl]));
 }
 const pairs=await Promise.all(paths.map(async p=>{const {data,error}=await bucket.createSignedUrl(p,expiresIn);return error||!data?.signedUrl?null:[p,data.signedUrl];}));
 return Object.fromEntries(pairs.filter(Boolean));
}
export async function signedProgressPhotoUrl(db,userId,path,expiresIn=60){
 checkPath(path,userId);
 const {data,error}=await storage(db).createSignedUrl(path,expiresIn);
 if(error)throw error;
 if(!data?.signedUrl)throw Error('No se pudo obtener la foto');
 return data.signedUrl;
}
export async function deleteProgressPhoto(db,userId,path){
 checkPath(path,userId);
 const {error}=await storage(db).remove([path]);
 if(error)throw error;
}
export async function progressPhotoComparison(db,userId,before,after){
 if(before===after)throw Error('Selecciona dos fotos diferentes');
 const urls=await signedProgressPhotoUrls(db,userId,[before,after],60);
 if(!urls[before]||!urls[after])throw Error('No se pudo obtener la foto');
 return {beforeUrl:urls[before],afterUrl:urls[after],expiresInSeconds:60};
}
// Días entre dos fechas AAAA-MM-DD (para "12 semanas de diferencia").
export function daysBetween(a,b){return Math.round(Math.abs(Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/86400000);}
