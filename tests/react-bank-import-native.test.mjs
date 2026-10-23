import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {previewBankStatement,saveBankStatement} from "../apps/rise-react/src/lib/bank-import-client.mjs";
const UID="22222222-2222-4222-8222-222222222222";
const csv='Date;Name / Description;Account;Debit/credit;Amount (EUR);Resulting balance\n20261020;Employer;NL00TEST1234;Credit;100,00;200,00\n';
const file={name:"ing.csv",size:Buffer.byteLength(csv),type:"text/csv",text:async()=>csv};
test("Preview bank CSV reads classic data and writes nothing",async()=>{
 let readCount=0;
 const db={from:table=>{assert.equal(table,"hub_records");return{
  select:()=>({eq:()=>({in:async()=>{readCount++;return{data:[],error:null};}})})
 }}};
 const preview=await previewBankStatement(db,UID,file);
 assert.equal(preview.bank,"ING");assert.equal(preview.total,1);
 assert.equal(preview.newCount,1);assert.equal(preview.income,100);
 assert.equal(preview.records[0].record_type,"bank_tx");
 assert.equal(preview.records[0].owner_id,UID);
 assert(readCount>0);
});
test("Save is JWT-owner gated and idempotently ignores duplicate bank records",async()=>{
 const db={auth:{getUser:async()=>({data:{user:{id:UID}},error:null})},
  from:()=>({upsert:async(rows,opt)=>{assert.equal(rows[0].owner_id,UID);assert.equal(opt.ignoreDuplicates,true);return{error:null};}})};
 const fake={ownerId:UID,records:[{id:"a",owner_id:UID,domain:"money",record_type:"bank_tx",source:"import"}],alreadyImported:0};
 const res=await saveBankStatement(db,UID,fake);assert.equal(res.ok,true);
 await assert.rejects(()=>saveBankStatement(db,"wrong",fake),/sesión/);
});
test("Money UI keeps bank importer behind explicit confirmation and refreshes real data",()=>{
 const src=readFileSync(new URL("../apps/rise-react/src/components/rise/BankStatementImport.tsx",import.meta.url),"utf8");
 const money=readFileSync(new URL("../apps/rise-react/src/routes/dinero.tsx",import.meta.url),"utf8");
 assert.match(src,/onClick=\{\(\)=>void confirm\(\)\}/);
 assert.match(src,/previewBankStatement\(client,uid,file\)/);
 assert.match(src,/saveBankStatement\(client,uid,preview\)/);
 assert.match(money,/<BankStatementImport\/>/);
});
