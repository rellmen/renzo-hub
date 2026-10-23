import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {summarizeMoney} from "../apps/rise-react/src/lib/money-records.mjs";
test("Recurring spending uses Classic categorisation and known amounts only",()=>{
 const fin={txs:[],rules:[],budget:null,items:[
  {id:"1",date:"2026-10-02",amount:-900,category:"alquiler",merchant:"Landlord",name:"Landlord",bank:"ING"},
  {id:"2",date:"2026-09-02",amount:-900,category:"alquiler",merchant:"Landlord",name:"Landlord",bank:"ING"}]};
 const summary=summarizeMoney(fin,[],[],{at:new Date(2026,9,23)});
 assert.equal(summary.fixedExpenses?.total,900);
 assert.equal(summary.fixedExpenses?.items[0].monthly,900);
});
test("The recurring costs panel is attached to Money but remains read-only",()=>{
 const money=readFileSync(new URL("../apps/rise-react/src/routes/dinero.tsx",import.meta.url),"utf8");
 const component=readFileSync(new URL("../apps/rise-react/src/components/rise/RecurringExpenses.tsx",import.meta.url),"utf8");
 assert.match(money,/<RecurringExpenses data=\{data\}\/>/);
 assert.doesNotMatch(component,/\.insert\(|\.upsert\(|\.delete\(/);
});
