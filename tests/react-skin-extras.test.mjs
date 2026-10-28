import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as sx from '../apps/rise-react/src/lib/skin-extras.mjs';
const U='22222222-2222-4222-8222-222222222222';
test('Skin photo helpers are byte-identical to Classic',()=>{
 assert.equal(readFileSync(new URL('../apps/rise-react/src/lib/legacy-skin/photos.js',import.meta.url),'utf8'),readFileSync(new URL('../microapps/skin/photos.js',import.meta.url),'utf8'));
});
test('Compatibility uses only available products and catalog notes',()=>{
 assert.deepEqual(sx.skinCompatibility({},true),[]);
 const w=sx.skinCompatibility({p12:'available',p17:'available',p5:'paused'},false);
 assert.equal(w.length,1);assert.equal(w[0].level,'conflict');assert.match(w[0].text,/Differin/);
 const b=sx.skinCompatibility({p6:'available'},true);
 assert.equal(b.length,1);assert.match(b[0].text,/Pausar hasta recuperar barrera/);
 assert.equal(sx.skinCompatibility({p6:'available'},false).length,0);
 assert.equal(sx.skinCompatibility({p10:'available',p11:'available'},false)[0].level,'info');
});
test('History merges logs and notes per day, newest first',async()=>{
 const res={skin_routine_logs:{data:[{routine_date:'2026-10-22',session:'am',completed_steps:[0,1,1]},{routine_date:'2026-10-23',session:'pm',completed_steps:[0]}],error:null},
  skin_notes:{data:[{note_date:'2026-10-22',note:'irritación leve'}],error:null}};
 const client={from:t=>{const q={select(){return q;},eq(){return q;},gte(){return q;},lte:async()=>res[t]};return q;}};
 const h=await sx.loadSkinHistory(client,U,{at:new Date('2026-10-23T12:00:00')});
 assert.deepEqual(h.map(d=>[d.day,d.am,d.pm,d.note]),[['2026-10-23',0,1,''],['2026-10-22',2,0,'irritación leve']]);
});
test('Skin photos stay in the owner skin folder with signed URLs',async()=>{
 const calls=[];const b={upload:async(p,f,o)=>{calls.push(['up',p,o]);return {error:null};},createSignedUrls:async(p)=>({data:p.map(x=>({path:x,signedUrl:'s:'+x})),error:null}),remove:async(p)=>{calls.push(['rm',p]);return {error:null};}};
 const client={storage:{from:n=>{assert.equal(n,'progress-photos');return b;}}};
 const path=await sx.uploadSkinPhoto(client,U,new File(['x'],'a.jpg',{type:'image/jpeg'}),'33333333-3333-4333-8333-333333333333');
 assert.equal(path,`${U}/skin/33333333-3333-4333-8333-333333333333.jpg`);assert.equal(calls[0][2].upsert,false);
 await assert.rejects(sx.skinPhotoUrls(client,U,['x/skin/33333333-3333-4333-8333-333333333333.jpg']),/Ruta privada/);
 await assert.rejects(sx.deleteSkinPhoto(client,U,`${U}/gym/33333333-3333-4333-8333-333333333333.jpg`),/Ruta privada/);
 await assert.rejects(sx.uploadSkinPhoto(client,U,new File(['x'],'a.gif',{type:'image/gif'})),/JPEG/);
});
test('Numbuzin duplicates are informational and preserve availability filtering',()=>{
 const available={p19:'available',p4:'available',p6:'available',p7:'available',p9:'available'};
 const warnings=sx.skinCompatibility(available,false);
 assert.equal(warnings.length,5);
 assert.equal(warnings.filter(w=>w.products.includes(19)).length,4);
 assert(warnings.filter(w=>w.products.includes(19)).every(w=>w.level==='info'));
 assert.equal(sx.skinCompatibility({p19:'available'},true).length,1);
 assert.equal(sx.skinCompatibility({p19:'paused',p7:'available'},false).length,0);
});
