import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as ph from '../apps/rise-react/src/lib/legacy-gym/progress-photos.js';
const U='22222222-2222-4222-8222-222222222222';
test('Progress photo module is byte-identical to Classic and confined to the private owner folder',async()=>{
 assert.equal(readFileSync(new URL('../apps/rise-react/src/lib/legacy-gym/progress-photos.js',import.meta.url),'utf8'),
  readFileSync(new URL('../microapps/gym/progress-photos.js',import.meta.url),'utf8'));
 assert.equal(ph.PHOTO_BUCKET,'progress-photos');
 const db={storage:{from:()=>({createSignedUrls:async()=>({data:[],error:null}),createSignedUrl:async()=>({data:{signedUrl:'x'},error:null}),remove:async()=>({error:null})})}};
 await assert.rejects(ph.signedProgressPhotoUrls(db,U,['other/gym/2026-10-01_front_33333333-3333-4333-8333-333333333333.jpg']),/Ruta privada/);
 await assert.rejects(ph.deleteProgressPhoto(db,U,`${U}/gym/../x.jpg`),/Ruta privada/);
 assert.throws(()=>ph.assertProgressPhoto({type:'image/gif',size:10}),/JPG/);
});
test('Gym page renders the private photo gallery with signed URLs only',()=>{
 const ui=readFileSync(new URL('../apps/rise-react/src/components/rise/GymProgressPhotos.tsx',import.meta.url),'utf8');
 assert.match(ui,/signedProgressPhotoUrls/);assert.doesNotMatch(ui,/getPublicUrl/);assert.match(ui,/preparePhoto/);
 assert.match(readFileSync(new URL('../apps/rise-react/src/routes/gym.tsx',import.meta.url),'utf8'),/<GymProgressPhotos\/>/);
});
