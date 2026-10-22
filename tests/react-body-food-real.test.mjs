import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
import {loadBodyFoodSnapshot} from '../apps/rise-react/src/lib/body-food-snapshot.mjs';
const uid='22222222-2222-4222-8222-222222222222';
const user={id:uid,user_metadata:{gym_goals:{sessionsPerWeek:4}}};
function mock({weights=[],sessions=[],food=[],skin=[],settings={},failure=null}={}){
 const calls=[];
 const lists={hub_records:{body_weight:weights,food_log:food},gym_sessions:sessions,skin_routine_logs:skin};
 const client={from(table){
  let type='',filters=[];
  const q={
    select(){return q},
    eq(field,value){filters.push([field,value]);if(field==='record_type')type=value;return q},
    gte(){return q},not(){return q},order(){return q},
    limit(){
      calls.push({table,type,filters});
      return Promise.resolve({data:table==='hub_records'?(lists.hub_records[type]||[]):lists[table]||[],error:failure?{message:failure}:null});
    },
    maybeSingle(){calls.push({table,type,filters});return Promise.resolve({data:{settings},error:failure?{message:failure}:null});},
    then(onFulfilled,onRejected){calls.push({table,type,filters});return Promise.resolve({data:table==='hub_records'?(lists.hub_records[type]||[]):lists[table]||[],error:failure?{message:failure}:null}).then(onFulfilled,onRejected);}
  };return q;
 }};
 return {client,calls};
}
test('Body and Food routes compile, are registered, and use verified cloud data',()=>{
 const root=new URL('../apps/rise-react/src/',import.meta.url);
 const tree=readFileSync(new URL('routeTree.gen.ts',root),'utf8');
 const nav=readFileSync(new URL('lib/nav.ts',root),'utf8');
 for(const name of ['body','food']){
   const src=readFileSync(new URL('routes/'+name+'.tsx',root),'utf8');
   const output=transformSync(src,{loader:'tsx',format:'esm',jsx:'automatic',target:'es2022'});
   assert(output.code.length>200);
   assert.match(src,/loadBodyFoodSnapshot/);
   assert.doesNotMatch(src,/DemoDataBadge|useLocalStorage|mockKcal|fakeProgress/);
   assert(tree.includes("/"+name));
   assert(nav.includes('to: "/'+name+'"'));
 }
});
test('All five input sources are scoped to the authenticated user, no demo data',async()=>{
 const db=mock();
 const result=await loadBodyFoodSnapshot(db.client,user,{at:new Date(2026,9,22,12)});
 assert.equal(db.calls.length,5);
 for(const c of db.calls){assert(c.filters.some(([key,value])=>(key==='user_id'||key==='owner_id')&&value===uid));}
 assert.equal(result.body.weight.current,null);
 assert.equal(result.body.food,null);
 assert.equal(result.nutrition.kcal,0);
 assert.equal(result.kcalProgress.pct,null);
 assert.equal(result.proteinProgress.pct,null);
});
test('Read-only nutritional metrics use only stored meals and user-defined goals',async()=>{
 const food=[{id:'f1',payload:{date:'2026-10-22',meal:'Lunch',kcal:450,protein:36},occurred_at:'2026-10-22T10:00:00Z'}];
 const db=mock({food,settings:{bodyProfile:{kcalMin:1800,kcalMax:2200,proteinMin:110,proteinMax:140}}});
 const v=await loadBodyFoodSnapshot(db.client,user,{at:new Date(2026,9,22,12)});
 assert.equal(v.nutrition.meals,1);
 assert.equal(v.nutrition.kcal,450);
 assert.equal(v.nutrition.protein,36);
 assert.equal(v.meals[0].title,'Lunch');
 assert.equal(v.kcalProgress.target,'1800–2200');
 assert.equal(v.proteinProgress.target,'110–140');
});
test('Unauthenticated requests and blocked RLS fail closed',async()=>{
 await assert.rejects(loadBodyFoodSnapshot(mock().client,null),/Inicia sesión/);
 await assert.rejects(loadBodyFoodSnapshot(mock({failure:'RLS denied'}).client,user),/RLS denied/);
});

test('Incomplete measurements never masquerade as zero weight or zero nutrition',async()=>{
 const weights=[
   {payload:{date:'2026-10-20',value:null},occurred_at:'2026-10-20T12:00:00Z'},
   {payload:{date:'2026-10-21',value:''},occurred_at:'2026-10-21T12:00:00Z'},
   {payload:{date:'2026-10-22',value:82.5},occurred_at:'2026-10-22T12:00:00Z'}
 ];
 const food=[{id:'m1',payload:{date:'2026-10-22',meal:'Meal',kcal:null,protein:''},occurred_at:'2026-10-22T10:00:00Z'}];
 const s=await loadBodyFoodSnapshot(mock({weights,food}).client,user,{at:new Date(2026,9,22,12)});
 assert.equal(s.body.weight.current.value,82.5);
 assert.equal(s.body.weight.count,1);
 assert.equal(s.meals[0].kcal,null);
 assert.equal(s.meals[0].protein,null);
});
