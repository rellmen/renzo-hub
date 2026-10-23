import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {normalizeGoal as classic} from "../microapps/finance/goals.js";
import {GOAL_TYPES,buildFinancialGoal,saveFinancialGoal,archiveFinancialGoal} from "../apps/rise-react/src/lib/money-goals.mjs";
import {summarizeMoney} from "../apps/rise-react/src/lib/money-records.mjs";
const uid="22222222-2222-4222-8222-222222222222";
test("Nocturne financial goal normalization matches Classic",()=>{
 for(const input of [{type:"emergency",name:"Fondo",months:"3"},{type:"target",amount:"1500,00",date:"2026-12-30",start:"2026-10"},{type:"invest",monthly:120}]){
  assert.deepEqual(buildFinancialGoal(input),classic(input).goal);
 }
 assert.equal(GOAL_TYPES.emergency,"Fondo de emergencia");
 assert.throws(()=>buildFinancialGoal({type:"unknown"}),/tipo/);
});
test("Goal create uses owner-scoped money_goal row and does not create bank_tx",async()=>{
 let written;
 const client={auth:{getUser:async()=>({data:{user:{id:uid}},error:null})},from:()=>({
  insert:r=>{written=r;return{select:()=>({single:async()=>({data:r,error:null})})};}
 })};
 const row=await saveFinancialGoal(client,uid,{type:"emergency",months:3});
 assert.equal(row.owner_id,uid);assert.equal(row.record_type,"money_goal");
 assert.equal(written.status,"active");
 await assert.rejects(()=>saveFinancialGoal(client,"wrong",{type:"emergency",months:2}),/sesión/);
});
test("Archive marks record inactive via optimistic lock without deleting it",async()=>{
 let filters=[];
 const client={auth:{getUser:async()=>({data:{user:{id:uid}},error:null})},from:()=>({
  update:r=>({eq(k,v){filters.push([k,v]);return this;},select(){return{maybeSingle:async()=>({data:{id:"one",status:r.status},error:null})}}})
 })};
 const r=await archiveFinancialGoal(client,uid,{id:"one",status:"active",updated_at:"2026-10-22T10:00:00Z"});
 assert.equal(r.status,"archived");
 assert(filters.some(([k,v])=>k==="updated_at"&&v==="2026-10-22T10:00:00Z"));
});
test("Archived goals excluded, goals with no verified history have no fabricated progress",()=>{
 const row=(id,status)=>({id,status,payload:{type:"emergency",name:id,months:3},updated_at:"now"});
 const fin={items:[],txs:[],rules:[],budget:null};
 const report=summarizeMoney(fin,[],[row("a","active"),row("b","archived")],{at:new Date(2026,9,23)});
 assert.equal(report.goals.length,1);
 assert.equal(report.goals[0].progress,null);
});
test("Goals are displayed in Money with edit and archive access only behind session",()=>{
 const money=readFileSync(new URL("../apps/rise-react/src/routes/dinero.tsx",import.meta.url),"utf8");
 const component=readFileSync(new URL("../apps/rise-react/src/components/rise/FinancialGoals.tsx",import.meta.url),"utf8");
 assert.match(money,/<FinancialGoals data=\{data\}\/>/);
 assert.match(component,/archiveFinancialGoal\(client,uid,goal\)/);
 assert.match(component,/saveFinancialGoal\(client,uid,/);
});
