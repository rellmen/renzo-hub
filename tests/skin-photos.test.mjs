import test from 'node:test';import assert from 'node:assert/strict';
import {validateSkinPhoto,skinPhotoFolder,skinPhotoPath} from '../microapps/skin/photos.js';
const uid='11111111-2222-4333-8444-555555555555',photo='aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
test('photo paths stay inside account folder',()=>{
 assert.equal(skinPhotoFolder(uid),uid+'/skin');
 assert.equal(skinPhotoPath(uid,photo,'image/jpeg'),uid+'/skin/'+photo+'.jpg');
 assert.throws(()=>skinPhotoFolder('../../etc'));
});
test('photo upload requires compatible type and file under 10MB',()=>{
 assert.equal(validateSkinPhoto({type:'image/webp',size:1024}),true);
 assert.throws(()=>validateSkinPhoto({type:'image/svg+xml',size:1024}));
 assert.throws(()=>validateSkinPhoto({type:'image/png',size:11*1024*1024}));
});
