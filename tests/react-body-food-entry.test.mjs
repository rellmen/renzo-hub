import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
import {saveBodyWeight,saveFoodMeal} from '../apps/rise-react/src/lib/body-food-entry.mjs';

const uid='22222222-2222-4222-8222-222222222222';
function stub({error=null}={}){
 const inserts=[];
 const db={from(table){
   assert.equal(table,'hub_records');
   return {insert(row){inserts.push(row);return {
     select(){return this},
     single(){return Promise.resolve({data:error?null:{id:'saved-record',...row},error:error?{message:error}:null})}
   }}};
 }};
 return {db,inserts};
}
test('New weigh-in is appended to canonical body_weight record with authenticated owner',async()=>{
 const {db,inserts}=stub(),at=new Date();
 const saved=await saveBodyWeight(db,uid,'82.4',{at});
 assert.equal(saved.payload.value,82.4);
 assert.equal(saved.payload.date,[
   at.getFullYear(),String(at.getMonth()+1).padStart(2,'0'),String(at.getDate()).padStart(2,'0')
 ].join('-'));
 assert.equal(inserts.length,1);
 const r=inserts[0];
 assert.equal(r.owner_id,uid);
 assert.equal(r.domain,'body');
 assert.equal(r.record_type,'body_weight');
 assert.equal(r.source,'manual');
 assert.equal(r.title,'Peso corporal');
 assert.equal(r.occurred_at.slice(11),'12:00:00.000Z');
});
test('Food records preserve missing metrics as null and never seed extra rows',async()=>{
 const {db,inserts}=stub();
 const r=await saveFoodMeal(db,uid,{meal:'  Almuerzo  ',kcal:'465',protein:''});
 assert.equal(inserts.length,1);
 assert.equal(r.payload.meal,'Almuerzo');
 assert.equal(r.payload.kcal,465);
 assert.equal(r.payload.protein,null);
 assert.equal(r.domain,'body');
 assert.equal(r.record_type,'food_log');
});
test('Forms reject unauthenticated, invalid, implausible and unmeasured values',async()=>{
 const {db,inserts}=stub();
 await assert.rejects(saveBodyWeight(db,'','80'),/sesión/);
 await assert.rejects(saveBodyWeight(db,uid,''),/obligatorio/);
 await assert.rejects(saveBodyWeight(db,uid,0),/rango/);
 await assert.rejects(saveBodyWeight(db,uid,'Infinity'),/rango/);
 await assert.rejects(saveFoodMeal(db,uid,{meal:'',kcal:'500',protein:'45'}),/nombre/);
 await assert.rejects(saveFoodMeal(db,uid,{meal:'Almuerzo',kcal:'',protein:''}),/al menos/);
 await assert.rejects(saveFoodMeal(db,uid,{meal:'Almuerzo',kcal:'-5',protein:''}),/rango/);
 await assert.rejects(saveFoodMeal(db,uid,{meal:'Almuerzo',kcal:'123',protein:'nan'}),/rango/);
 assert.equal(inserts.length,0);
});
test('Never insert a historical or future date or hide RLS errors',async()=>{
 const {db,inserts}=stub({error:'RLS denied'});
 await assert.rejects(saveBodyWeight(db,uid,'80',{at:new Date('2020-01-02T12:00:00.000Z')}),/hoy/);
 await assert.rejects(saveFoodMeal(db,uid,{meal:'Comida',kcal:'400'},{at:new Date('2035-01-02T12:00:00.000Z')}),/hoy/);
 assert.equal(inserts.length,0);
 await assert.rejects(saveBodyWeight(db,uid,'80'),/RLS denied/);
});
test('React Body/Food forms parse without demo state and call cloud services',()=>{
 for(const name of ['body','food']){
   const source=readFileSync(new URL('../apps/rise-react/src/routes/'+name+'.tsx',import.meta.url),'utf8');
   const output=transformSync(source,{loader:'tsx',format:'esm',jsx:'automatic',target:'es2022'});
   assert(output.code.length>500);
   assert.match(source,name==='body'?/saveBodyWeight\(/:/saveFoodMeal\(/);
   assert.match(source,/invalidateQueries/);
   assert.doesNotMatch(source,/DemoDataBadge|useLocalStorage|fakeWeight/);
 }
});
