// Private progress photos: never use public URLs or store image bytes in localStorage.
// Access is scoped to the signed-in user's own folder. Server-side bucket RLS
// must also enforce ownership; client-side checks alone are not a security boundary.
export const PHOTO_BUCKET='progress-photos';
const TYPES=new Set(['image/jpeg','image/png','image/webp']);
const MAX_BYTES=8*1024*1024;
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

export function progressPhotoPath(userId,photoId,extension='jpg'){
 if(!UUID.test(userId)||!UUID.test(photoId))throw Error('Identificador de foto no válido');
 if(!['jpg','png','webp'].includes(extension))throw Error('Formato de imagen no válido');
 return `${userId}/${photoId}.${extension}`;
}
export function assertProgressPhoto(file){
 if(!file||!TYPES.has(file.type))throw Error('Usa una imagen JPG, PNG o WebP');
 if(!Number.isFinite(file.size)||file.size<=0||file.size>MAX_BYTES)throw Error('Máximo 8 MB por foto');
 return file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
}
function storage(db){if(!db?.storage?.from)throw Error('Storage no disponible');return db.storage.from(PHOTO_BUCKET);}
function checkPath(path,userId){
 if(typeof path!=='string'||!path.startsWith(userId+'/')||path.includes('..')||path.includes('\\'))throw Error('Ruta privada no válida');
 return path;
}
export async function uploadProgressPhoto(db,userId,file){
 const ext=assertProgressPhoto(file);
 if(!UUID.test(userId))throw Error('Usuario no válido');
 const id=crypto.randomUUID();
 const path=progressPhotoPath(userId,id,ext);
 const {data,error}=await storage(db).upload(path,file,{contentType:file.type,upsert:false,cacheControl:'0'});
 if(error)throw error;
 return {id,path:data?.path||path,createdAt:new Date().toISOString()};
}
export async function listProgressPhotos(db,userId){
 if(!UUID.test(userId))throw Error('Usuario no válido');
 const {data,error}=await storage(db).list(userId,{limit:100,sortBy:{column:'name',order:'desc'}});
 if(error)throw error;
 return (data||[]).filter(item=>UUID.test(item.name.split('.')[0])&&/\.(jpg|png|webp)$/.test(item.name))
   .map(item=>({name:item.name,path:userId+'/'+item.name,createdAt:item.created_at||null}));
}
export async function signedProgressPhotoUrl(db,userId,path){
 checkPath(path,userId);
 const {data,error}=await storage(db).createSignedUrl(path,60);
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
 const [beforeUrl,afterUrl]=await Promise.all([signedProgressPhotoUrl(db,userId,before),signedProgressPhotoUrl(db,userId,after)]);
 return {beforeUrl,afterUrl,expiresInSeconds:60};
}
