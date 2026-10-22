import test from "node:test";
import assert from "node:assert/strict";
import {cleanWeeklyLimits,VARIABLE_BUDGET_CATEGORIES,loadWeeklyBudget,saveWeeklyBudget} from "../apps/rise-react/src/lib/money-budget-editor.mjs";
const uid="11111111-1111-4111-8111-111111111111";
const old={id:"12345678-1234-4123-8123-123456789abc",owner_id:uid,domain:"money",
 record_type:"money_budget",payload:{weekly:{supermercado:45,alquiler:1000},week_starts:"wednesday",note:"preserve"},
 updated_at:"2026-10-22T15:00:00.000Z"};
function fake(row=old,{stale=false,duplicate=false}={}){
 const predicates=[],writes=[];
 return {predicates,writes,from(table){
  assert.equal(table,"hub_records");
  return {
   select(columns){return{eq(k,v){predicates.push([k,v]);return this;},
     order(){return this;},limit(){return Promise.resolve({data:duplicate?[row,row]:row?[row]:[],error:null});}};},
   update(fields){writes.push(fields);return{eq(k,v){predicates.push([k,v]);return this;},
    select(){return{maybeSingle:async()=>({data:stale?null:{...row,...fields},error:null})};}};},
   insert(fields){writes.push(fields);return{select(){return{single:async()=>({data:fields,error:null})};}};}
  };
 }};
}
test("Money budget preserves classic categories, weekly semantics and private data",async()=>{
 assert(VARIABLE_BUDGET_CATEGORIES.some(x=>x.id==="supermercado"));
 assert(!VARIABLE_BUDGET_CATEGORIES.some(x=>x.id==="alquiler"));
 assert.deepEqual(cleanWeeklyLimits({supermercado:"23.29",restaurantes:""} ,{restaurantes:50,alquiler:1000}),{supermercado:23.29,alquiler:1000});
 const db=fake(),found=await loadWeeklyBudget(db,uid);
 assert.equal(found.id,old.id);
 const saved=await saveWeeklyBudget(db,uid,found,{supermercado:"65.50",restaurantes:""});
 assert.equal(saved.payload.weekly.supermercado,65.5);
 assert.equal(saved.payload.weekly.alquiler,1000);
 assert.equal(saved.payload.note,"preserve");
 assert(db.predicates.some(([k,v])=>k==="updated_at"&&v===old.updated_at));
 assert(db.predicates.every(([key])=>key!=="bank_tx"));
});
test("Budget refuses concurrent overwrite, wrong owner and duplicate legacy records",async()=>{
 await assert.rejects(saveWeeklyBudget(fake(old,{stale:true}),uid,old,{supermercado:10}),/otro dispositivo/);
 await assert.rejects(saveWeeklyBudget(fake(),uid,{...old,owner_id:"other"},{supermercado:10}),/no es válido/);
 await assert.rejects(loadWeeklyBudget(fake(old,{duplicate:true}),uid),/más de un presupuesto/);
 assert.throws(()=>cleanWeeklyLimits({alquiler:"10"}),/desconocida/);
 assert.throws(()=>cleanWeeklyLimits({supermercado:"-2"}),/inválido/);
 assert.throws(()=>cleanWeeklyLimits({supermercado:"1.231"}),/inválido/);
});
test("Budget creation uses one owner-stable ID, never a bank transaction",async()=>{
 const db=fake(null);
 const created=await saveWeeklyBudget(db,uid,null,{supermercado:"25"});
 assert.equal(created.domain,"money");
 assert.equal(created.record_type,"money_budget");
 assert.equal(created.owner_id,uid);
 assert.match(created.id,/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
 assert.equal(created.payload.week_starts,"wednesday");
});
