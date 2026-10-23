// React adapter around the existing Classic ING/Revolut parsers and stable transaction IDs.
// PDF text stays on the user's device. No transaction is written before confirmation.
import {parseIngCsv,toRecord} from "../../../../microapps/bank/ing-csv.js";
import {parseRevolutCsv,parseRevolutRows} from "../../../../microapps/bank/revolut.js";
import {extractRows} from "./payroll-pdf-parser.mjs";
export const MAX_BANK_FILE_BYTES=5*1024*1024;
const CHUNK=200;
const euro=n=>Math.round(n*100)/100;
export async function previewBankStatement(db,uid,file){
 if(!db?.from||!uid||!file)throw Error("Inicia sesión y selecciona un extracto.");
 if(file.size<1||file.size>MAX_BANK_FILE_BYTES)throw Error("El archivo está vacío o supera 5 MB.");
 const pdf=/\.pdf$/i.test(file.name)||file.type==="application/pdf";
 const csv=/\.csv$/i.test(file.name)||/csv|text/.test(file.type);
 if(!pdf&&!csv)throw Error("Elige un CSV de ING o Revolut o un extracto PDF de Revolut.");
 let parsed;
 if(pdf)parsed=parseRevolutRows(await extractRows(new Uint8Array(await file.arrayBuffer()),undefined,80));
 else{
  const text=await file.text();
  parsed=/completed date/i.test(text.split(/\r?\n/,1)[0])?parseRevolutCsv(text):parseIngCsv(text);
 }
 if(parsed.transactions.length>5000)throw Error("Demasiados movimientos. Descarga un periodo más corto.");
 const records=await Promise.all(parsed.transactions.map(tx=>toRecord(tx,uid)));
 const existing=new Set();
 for(let i=0;i<records.length;i+=CHUNK){
  const ids=records.slice(i,i+CHUNK).map(row=>row.id);
  const {data,error}=await db.from("hub_records").select("id").eq("owner_id",uid).in("id",ids);
  if(error)throw Error("No se pudo comprobar si este extracto ya estaba importado.");
  for(const r of data||[])existing.add(r.id);
 }
 const income=euro(parsed.transactions.filter(tx=>tx.amount>0).reduce((s,tx)=>s+tx.amount,0));
 const expenses=euro(parsed.transactions.filter(tx=>tx.amount<0).reduce((s,tx)=>s+tx.amount,0));
 return{ownerId:uid,fileName:file.name,bank:parsed.bank,from:parsed.from,to:parsed.to,
  records,total:records.length,alreadyImported:records.filter(r=>existing.has(r.id)).length,
  newCount:records.filter(r=>!existing.has(r.id)).length,
  income,expenses,accounts:parsed.accounts.map(a=>a?("…"+a.slice(-4)):""),
  skippedLines:parsed.skippedLines||[],balanceBreaks:parsed.balanceBreaks||[],
  salaryMentions:parsed.transactions.filter(tx=>(tx.payslipNumbers||[]).length>0).length
 };
}
export async function saveBankStatement(db,uid,preview){
 if(!db?.auth?.getUser||!db?.from||!uid||preview?.ownerId!==uid||!Array.isArray(preview.records))
  throw Error("Este extracto no pertenece a tu sesión.");
 const {data,error:authError}=await db.auth.getUser();
 if(authError||data?.user?.id!==uid)throw Error("La sesión cambió. No se guardó nada.");
 for(const r of preview.records){
  if(r.owner_id!==uid||r.domain!=="money"||r.record_type!=="bank_tx"||r.source!=="import")
   throw Error("Se bloqueó un movimiento con identidad o formato incorrecto.");
 }
 for(let i=0;i<preview.records.length;i+=CHUNK){
  const {error}=await db.from("hub_records").upsert(preview.records.slice(i,i+CHUNK),{
   onConflict:"id",ignoreDuplicates:true
  });
  if(error)throw Error("No se pudo guardar todo el extracto. Reimporta el mismo archivo: los duplicados no se sobrescribirán.");
 }
 return{ok:true,recordsAttempted:preview.records.length,duplicatesPrechecked:preview.alreadyImported};
}
