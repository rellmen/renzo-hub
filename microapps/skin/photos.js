// Images are optional and remain in the authenticated user's private progress-photos bucket.
export const SKIN_PHOTO_TYPES=Object.freeze(['image/jpeg','image/png','image/webp']);
export function validateSkinPhoto(file){
 if(!file||!SKIN_PHOTO_TYPES.includes(file.type))throw Error('Usa una imagen JPEG, PNG o WebP');
 if(!Number.isFinite(file.size)||file.size<=0||file.size>10*1024*1024)throw Error('Imagen demasiado grande (máximo 10 MB)');
 return true;
}
export function skinPhotoFolder(userId){
 if(!/^[0-9a-f-]{36}$/i.test(String(userId)))throw Error('Cuenta inválida');
 return userId+'/skin';
}
export function skinPhotoPath(userId,uuid,mime){
 if(!/^[0-9a-f-]{36}$/i.test(String(uuid)))throw Error('Identificador de foto inválido');
 const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[mime];
 if(!ext)throw Error('Tipo de imagen inválido');
 return skinPhotoFolder(userId)+'/'+uuid+'.'+ext;
}
