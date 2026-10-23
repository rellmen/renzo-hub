import test from "node:test";
import assert from "node:assert/strict";
import {setSkinInventoryStatus} from "../apps/rise-react/src/lib/skin-records.mjs";

const uid="11111111-1111-4111-8111-111111111111";
const baseline={updated_at:"2026-10-20T10:00:00.000Z",settings:{
 personalContext:{goal:"keep"},skinPhase:"recovery",skinInventory:{p0:"available",p1:"paused"}
}};
function fake(row=baseline,{stale=false}={}){
 const predicates=[],writes=[];
 return {predicates,writes,from(table){
  assert.equal(table,"user_settings");
  return {
   select(cols){
    assert.equal(cols,"settings,updated_at");
    return {eq(col,value){predicates.push([col,value]);return {maybeSingle:async()=>({data:row,error:null})};}};
   },
   update(data){
    writes.push(data);
    return {eq(col,value){predicates.push([col,value]);return this;},
      select(cols){assert.equal(cols,"settings,updated_at");return {maybeSingle:async()=>({
       data:stale?null:{settings:data.settings,updated_at:data.updated_at},error:null
      })};}};
   }
  };
 }};
}
test("Skin status update preserves unrelated settings and every inventory item",async()=>{
 const db=fake();
 const next=await setSkinInventoryStatus(db,uid,"p1","finished");
 assert.equal(next.p0,"available");
 assert.equal(next.p1,"finished");
 assert.deepEqual(db.writes[0].settings.personalContext,{goal:"keep"});
 assert.equal(db.writes[0].settings.skinPhase,"recovery");
 assert.deepEqual(db.predicates,[["user_id",uid],["user_id",uid],["updated_at",baseline.updated_at]]);
});
test("Skin inventory edit rejects concurrent writes, invalid state and missing version",async()=>{
 await assert.rejects(setSkinInventoryStatus(fake(baseline,{stale:true}),uid,"p0","finished"),/otro dispositivo/);
 await assert.rejects(setSkinInventoryStatus(fake(),uid,"p0","lost"),/inválido/);
 await assert.rejects(setSkinInventoryStatus(fake(),uid,"foo","paused"),/inválido/);
 await assert.rejects(setSkinInventoryStatus(fake({...baseline,updated_at:null}),uid,"p1","paused"),/versión/);
});
