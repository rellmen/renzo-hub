import test from 'node:test';
import assert from 'node:assert/strict';
import {AM,PM,PRODUCTS,stepsFor,dateKeyLocal} from '../apps/rise-react/src/lib/skin-catalog.mjs';
import {loadSkinState,setSkinSteps,setSkinNote,weekSkinProgress} from '../apps/rise-react/src/lib/skin-records.mjs';

const uid="22222222-2222-4222-8222-222222222222";
function clientFactory({logs=[],note="",settings={skinPhase:"recovery",skinInventory:{p0:"available"}},fail=false}={}){
 const queries=[];
 const client={from(table){
   const q={table,where:{},op:"select",inserted:null,
     select(fields){q.fields=fields;return q;},
     eq(k,v){q.where[k]=v;return q;},
     gte(k,v){q.where[k+">="]=v;return q;},
     lte(k,v){q.where[k+"<="]=v;return Promise.resolve({data:logs,error:fail?{message:"RLS blocked"}:null});},
     maybeSingle(){queries.push(q);
       return Promise.resolve({data:table==="skin_notes"?{note}:{settings},error:fail?{message:"RLS blocked"}:null});},
     upsert(value,options){q.op="upsert";q.inserted=value;q.options=options;return q;},
     single(){queries.push(q);return Promise.resolve({data:q.inserted,error:fail?{message:"RLS blocked"}:null});}
   };
   queries.push(q);return q;
 }};
 return {client,queries};
}
test('Original 19 skincare products and numbered AM/PM steps retain historical order',()=>{
 assert.equal(PRODUCTS.length,19);
 assert.match(PRODUCTS[0][0],/Arencia/);
 assert.match(PRODUCTS[10][0],/Heliocare/);
 assert.match(PRODUCTS[12][0],/celimax/);
 assert.equal(AM.length,5);
 const friday=new Date(2026,9,23,12);
 assert.equal(friday.getDay(),5);
 assert.match(stepsFor(friday,"pm",false)[1][0],/Retinal/);
 assert.match(stepsFor(friday,"pm",true)[1][0],/Pausar/);
 assert.equal(dateKeyLocal(friday),"2026-10-23");
});
test('Reads actual user-scoped Skin steps, notes, settings and inventory without mock seed',async()=>{
 const day=new Date(2026,9,22,12);
 const {client,queries}=clientFactory({logs:[{routine_date:"2026-10-22",session:"am",completed_steps:[0,2,2,400]}],note:"Piel sensible"});
 const s=await loadSkinState(client,uid,day);
 assert.deepEqual(s.current.am,[0,2]);
 assert.deepEqual(s.current.pm,[]);
 assert.equal(s.note,"Piel sensible");
 assert.equal(s.inventory.p0,"available");
 assert.equal(s.barrierFirst,true);
 for(const q of queries)assert.equal(q.where.user_id,uid);
 assert(queries.some(q=>q.table==="skin_routine_logs"&&q.where["routine_date>="]));
});
test('Saves integer positions only, into the original unique cloud row, not localStorage',async()=>{
 const {client,queries}=clientFactory();
 const out=await setSkinSteps(client,uid,"2026-10-22","am",[4,0,4,-1,12,1.7],5);
 assert.deepEqual(out.completed_steps,[0,4]);
 const q=queries.find(q=>q.op==="upsert");
 assert.equal(q.options.onConflict,"user_id,routine_date,session");
 assert.equal(q.inserted.user_id,uid);
 assert.equal(q.inserted.routine_date,"2026-10-22");
 assert.deepEqual(q.inserted.completed_steps,[0,4]);
});
test('Saves real Skin notes and fails closed on missing user/RLS error',async()=>{
 const {client}=clientFactory();
 const n=await setSkinNote(client,uid,"2026-10-22","Sin descamación");
 assert.equal(n.note,"Sin descamación");
 await assert.rejects(setSkinSteps(client,"","2026-10-22","am",[0],5),/iniciar sesión/);
 await assert.rejects(loadSkinState(clientFactory({fail:true}).client,uid,new Date(2026,9,22,12)),/RLS blocked/);
});
test('Weekly progress comes solely from recorded numeric indexes',()=>{
 const days=weekSkinProgress([],new Date(2026,9,22,12));
 assert.equal(days.length,7);
 assert(days.every(x=>x.done===0&&x.pct===0));
 const withLog=weekSkinProgress([{routine_date:"2026-10-22",session:"am",completed_steps:[0,1]}],new Date(2026,9,22,12));
 assert.equal(withLog[6].done,2);
 assert.equal(withLog[6].total,AM.length+PM[4].length);
});
