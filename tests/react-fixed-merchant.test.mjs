import test from "node:test";
import assert from "node:assert/strict";
import {setFixedMerchant} from "../apps/rise-react/src/lib/fixed-merchant.mjs";
const uid="22222222-2222-4222-8222-222222222222";
test("Fixed merchant edit preserves original category and locks by updated_at",async()=>{
 let payload,filters=[];
 const old={id:"old",owner_id:uid,updated_at:"2026-10-23T01:00:00Z",payload:{merchant:"rent",category:"alquiler",fixed:false}};
 const q={eq(k,v){filters.push([k,v]);return this;},contains(){return this;},limit:async()=>({data:[old],error:null})};
 const up={eq(k,v){filters.push([k,v]);return this;},select(){return{maybeSingle:async()=>({data:{id:"old",payload},error:null})}}};
 const db={auth:{getUser:async()=>({data:{user:{id:uid}},error:null})},
  from:()=>({select:()=>q,update:r=>{payload=r.payload;return up;}})};
 const result=await setFixedMerchant(db,uid,"Rent",true);
 assert.equal(result.payload.fixed,true);
 assert.equal(result.payload.category,"alquiler");
 assert(filters.some(([key,v])=>key==="updated_at"&&v===old.updated_at));
 await assert.rejects(()=>setFixedMerchant(db,"wrong","Rent",true),/sesión/);
});
test("Duplicate merchant rules fail closed without overwriting",async()=>{
 const q={eq(){return this;},contains(){return this;},limit:async()=>({data:[{id:"a"},{id:"b"}],error:null})};
 const db={auth:{getUser:async()=>({data:{user:{id:uid}},error:null})},from:()=>({select:()=>q})};
 await assert.rejects(()=>setFixedMerchant(db,uid,"rent",true),/duplicadas/);
});
test("Invalid merchant and nonboolean flags reject before database access",async()=>{
 await assert.rejects(()=>setFixedMerchant(null,uid,"rent",true),/no válidos/);
 await assert.rejects(()=>setFixedMerchant({},uid,"r",true),/no válidos/);
});
