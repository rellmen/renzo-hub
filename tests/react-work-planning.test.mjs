import test from "node:test";
import assert from "node:assert/strict";
import * as w from "../apps/rise-react/src/lib/work-planning.mjs";
const U="22222222-2222-4222-8222-222222222222";
const T0=Date.parse("2026-10-23T10:00:00Z");
function client(results={},calls=[]){
 const ch={from(t){calls.push(["from",t]);return ch;},insert(r){calls.push(["insert",r]);return ch;},update(r){calls.push(["update",r]);return ch;},
  upsert(r,o){calls.push(["upsert",r,o]);return Promise.resolve(results.upsert||{data:null,error:null});},
  eq(k,v){calls.push(["eq",k,v]);return ch;},select(){return ch;},order(){return ch;},limit:async()=>results.list||{data:[],error:null},
  single:async()=>results.single||{data:null,error:null},maybeSingle:async()=>results.maybe||{data:null,error:null}};
 return ch;
}
test("Idea state and Classic-compatible capture payload with cooling period",async()=>{
 const calls=[];const row={id:"i1",owner_id:U,title:"App",status:"cooling",updated_at:"v1",payload:{title:"App",status:"cooling"}};
 await w.captureIdea(client({single:{data:row,error:null}},calls),U,{title:" App ",note:"n",coolingHours:"72"},{now:T0,id:"i1"});
 const ins=calls.find(c=>c[0]==="insert")[1];
 assert.equal(ins.record_type,"renzo_idea");assert.equal(ins.domain,"work");assert.equal(ins.payload.coolingUntil,T0+72*3600000);
 assert.equal(w.ideaState({status:"cooling",coolingUntil:T0+1},T0),"cooling");
 assert.equal(w.ideaState({status:"cooling",coolingUntil:T0},T0),"review");
 await assert.rejects(w.captureIdea(client(),U,{title:" "}),/título/);
});
test("Slots: max two active, primary first",()=>{
 assert.equal(w.freeSlot([]),"primary");
 assert.equal(w.freeSlot([{slot:"primary",status:"active"}]),"secondary");
 assert.equal(w.freeSlot([{slot:"primary"},{slot:"secondary"}]),null);
 assert.equal(w.freeSlot([{slot:"primary",status:"completed"},{slot:"secondary"}]),"primary");
});
test("Promotion: cooling needs override, reserves ids with CAS then upserts project+event idempotently",async()=>{
 const idea={id:"i1",title:"App",status:"cooling",coolingUntil:T0+1000,_cloudUpdatedAt:"v1"};
 await assert.rejects(w.promoteIdea(client(),U,idea,[],{now:T0}),/override/);
 await assert.rejects(w.promoteIdea(client(),U,idea,[{slot:"primary"},{slot:"secondary"}],{now:T0,override:true}),/slot/);
 const calls=[];let reserved;
 const c=client({},calls);c.maybeSingle=async()=>{reserved=calls.find(x=>x[0]==="update")[1].payload;return {data:{id:"i1",owner_id:U,updated_at:"v2",payload:reserved},error:null};};
 const pid=await w.promoteIdea(c,U,idea,[],{now:T0,override:true});
 assert.equal(reserved.status,"promoted");assert.equal(reserved.promotedSlot,"primary");assert.equal(pid,reserved.promotedProjectId);
 assert.ok(calls.some(x=>x[0]==="eq"&&x[1]==="updated_at"&&x[2]==="v1"));
 const ups=calls.filter(x=>x[0]==="upsert");
 assert.equal(ups.length,2);for(const u of ups)assert.deepEqual(u[2],{onConflict:"id",ignoreDuplicates:true});
 assert.equal(ups[0][1].record_type,"renzo_project");assert.equal(ups[1][1].payload.kind,"project");
 // Retry after a lost response: no new CAS, same ids.
 const again=[];const pid2=await w.promoteIdea(client({},again),U,{...reserved,_cloudUpdatedAt:"v2"},[]);
 assert.equal(pid2,pid);assert.ok(!again.some(x=>x[0]==="update"));
 assert.equal(w.promotionPending({...reserved},[]),true);assert.equal(w.promotionPending({...reserved},[{id:pid}]),false);
});
test("Archive uses CAS and refuses closed ideas",async()=>{
 await assert.rejects(w.archiveIdea(client(),U,{id:"i",status:"promoted",_cloudUpdatedAt:"v"}),/cerrada/);
 await assert.rejects(w.archiveIdea(client({maybe:{data:null,error:null}}),U,{id:"i",status:"cooling",_cloudUpdatedAt:"v"}),/otro dispositivo/);
});
test("Sprint validation and Classic alerts",()=>{
 assert.throws(()=>w.sprintFrom({objective:""}),/objetivo/);
 const s=w.sprintFrom({objective:"Cerrar Turnos",deadline:"2026-10-24",blocker:"QA"});
 assert.equal(s.deliverable,"");
 const a=w.sprintAlerts(s,"2026-10-23",T0).map(x=>x.signal);
 assert.deepEqual(a,["Sin entregable","Bloqueo sin resolver","Sprint en riesgo"]);
 assert.deepEqual(w.sprintAlerts({objective:"x",deliverable:"y",deadline:"2026-10-01"},"2026-10-23",T0).map(x=>x.signal),["Fecha vencida"]);
 assert.deepEqual(w.sprintAlerts({},"2026-10-23"),[]);
});
