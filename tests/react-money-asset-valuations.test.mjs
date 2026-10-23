import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {cleanAssetValuation,saveAssetValuation} from "../apps/rise-react/src/lib/asset-valuations.mjs";
const uid="22222222-2222-4222-8222-222222222222";
test("Assets use Classic values and reject negative, invalid or future amounts",()=>{
 const today=new Date(2026,9,23);
 assert.deepEqual(cleanAssetValuation({kind:"debt",name:"  préstamo  ",value:"1.234,56",date:"2026-10-20"},{today}),
  {kind:"debt",name:"préstamo",value:1234.56,date:"2026-10-20"});
 for(const invalid of [{kind:"loan",name:"X",value:"10",date:"2026-10-20"},
 {kind:"debt",name:"X",value:"-10",date:"2026-10-20"},
 {kind:"debt",name:"X",value:"10",date:"2026-11-20"}]){
  assert.throws(()=>cleanAssetValuation(invalid,{today}));
 }
});
test("Saving creates one owner-scoped money_asset record without rewriting prior valuations",async()=>{
 let sent;
 const client={auth:{getUser:async()=>({data:{user:{id:uid}},error:null})},
  from:()=>({insert:record=>{sent=record;return{select:()=>({single:async()=>({data:{id:record.id,owner_id:uid,domain:record.domain,record_type:record.record_type,payload:record.payload},error:null})})};}})};
 const result=await saveAssetValuation(client,uid,{kind:"investment",name:"ETF",value:"500,50",date:"2026-10-20"},{today:new Date(2026,9,23)});
 assert.equal(result.owner_id,uid);assert.equal(sent.record_type,"money_asset");
 assert.equal(sent.payload.value,500.5);assert.equal(sent.source,"manual");
});
test("React Money displays the native valuation editor",()=>{
 const view=readFileSync(new URL("../apps/rise-react/src/routes/dinero.tsx",import.meta.url),"utf8");
 assert.match(view,/<AssetValuationEditor\/>/);
});
