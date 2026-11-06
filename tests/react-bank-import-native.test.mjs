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
 // 6-11-2026: el importador vive solo en Gastos › Importar; Resumen enlaza ahí en vez de duplicarlo.
 const gastos=readFileSync(new URL("../apps/rise-react/src/routes/gastos.tsx",import.meta.url),"utf8");
 assert.match(gastos,/<BankStatementImport\/>/);
 assert.doesNotMatch(money,/<BankStatementImport\/>/);
 assert.match(money,/to="\/gastos" hash="importar"/);
});
test("Import explains wrong formats instead of failing silently (ING PDF, Excel, empty)",async()=>{
 const {bankFileKind,looksLikeIngPdf,ING_PDF_HELP,EXCEL_HELP}=await import("../apps/rise-react/src/lib/bank-import-client.mjs");
 const db={from:()=>({select:()=>({eq:()=>({in:async()=>({data:[],error:null})})})})};
 assert.equal(bankFileKind({name:"Statement.XLSX",type:""}),"excel");
 assert.equal(bankFileKind({name:"afschrift.pdf",type:""}),"pdf");
 assert.equal(bankFileKind({name:"NL04INGB.csv",type:""}),"csv");
 assert.equal(bankFileKind({name:"x.heic",type:"image/heic"}),"unknown");
 await assert.rejects(previewBankStatement(db,UID,{name:"revolut.xlsx",size:10,type:""}),e=>e.message===EXCEL_HELP);
 const row=s=>({items:[{s,x:10}]});
 assert.equal(looksLikeIngPdf([row("ING Bank N.V."),row("Rekeningoverzicht oktober"),row("Revolut**1591* Dublin")]),true);
 assert.equal(looksLikeIngPdf([row("Revolut Bank UAB (Netherlands Branch)"),row("IBAN: NL93INGB0116834846")]),false);
 assert.match(ING_PDF_HELP,/CSV/);
 const empty='Date;Name / Description;Account;Debit/credit;Amount (EUR)\n';
 await assert.rejects(previewBankStatement(db,UID,{name:"ing.csv",size:empty.length,type:"text/csv",text:async()=>empty}),/movimiento/);
});
test("Gastos: categories collapse, tabs keep #coche and the importer is reachable",()=>{
 const src=readFileSync(new URL("../apps/rise-react/src/routes/gastos.tsx",import.meta.url),"utf8");
 assert.match(src,/<details key=\{g\.id\+month\} open=\{g\.id==="sin_categoria"\}/);
 assert.match(src,/id:"coche"/);assert.match(src,/<BankStatementImport\/>/);
 assert.doesNotMatch(src,/slice\(0,200\)/);
});
