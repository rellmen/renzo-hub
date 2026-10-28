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
test('Numbuzin is appended while all 19 original product IDs and step counts remain stable',()=>{
 assert.equal(PRODUCTS.length,20);
 assert.deepEqual(PRODUCTS.slice(0,19).map(p=>p[0]),["Arencia Fresh Green Rice Mochi Cleanser","CeraVe Foaming Cleanser","Eucerin DermoPure Clinical Correcting Cleanser 2%","COSRX Advanced Snail 96 Mucin Power Essence","SKIN1004 Madagascar Centella Tone Brightening Capsule Ampoule","Paula’s Choice Skin Perfecting 2% BHA Liquid","Dr. Althea Vitamin C Boosting Serum","Anua Niacinamide 10% + TXA 4%","ILLIYOON Ceramide Ato Concentrate Cream","AXIS-Y Dark Spot Correcting Glow Serum","Heliocare 360 Pigment Solution Fluid SPF50+","Avène Sunsimed Pigment","celimax Retinal Shot Tightening Booster","NUXE Zinc Power","Isntree Hyaluronic Acid Toner Plus","AXIS-Y Vegan Collagen Eye Serum","Ondo Beauty 36.5 Dark Spot Treatment","Differin 0.1% (adapaleno)","Aceite de ricino Deliplus"]);
 assert.equal(PRODUCTS[19][0],"Numbuzin No.5+ Glutathione Vitamin Concentrated Serum");
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

test("Barrier phase pauses Numbuzin throughout the week and keeps SPF",()=>{
 for(let d=0;d<7;d++){
  const date=new Date(2026,10,1+d,12);
  assert.match(stepsFor(date,"am",false)[1][1],/Numbuzin/);
  assert.equal(stepsFor(date,"am",true)[1][0],"Pausar este activo");
  assert.match(stepsFor(date,"am",true)[4][1],/SPF50/);
 }
});
