// React adapter around the existing Classic ING/Revolut parsers and stable transaction IDs.
// PDF text stays on the user's device. No transaction is written before confirmation.
import {parseIngCsv,toRecord} from "../../../../microapps/bank/ing-csv.js";
import {parseRevolutCsv,parseRevolutRows} from "../../../../microapps/bank/revolut.js";
import {extractRows} from "./payroll-pdf-parser.mjs";
export const MAX_BANK_FILE_BYTES=5*1024*1024;
const CHUNK=200;
export const ING_PDF_HELP="Este PDF es un extracto de ING. ING solo se puede importar en CSV: en Mijn ING (web) o en la app, abre la cuenta, «Af- en bijschrijvingen downloaden», elige el mes y el formato CSV (puntkomma). Sube ese archivo .csv.";
export const EXCEL_HELP="Es un archivo de Excel. Revolut: al generar el extracto elige formato PDF (o CSV). ING: descarga «Af- en bijschrijvingen» en CSV.";
// Tipo de archivo por extensión o MIME. iPhone a veces no manda MIME: manda la extensión.
export function bankFileKind(file){
 const n=String(file?.name||"").toLowerCase(),t=String(file?.type||"").toLowerCase();
 if(/\.(xlsx|xls|numbers)$/.test(n)||/spreadsheetml|ms-excel/.test(t))return "excel";
 if(/\.pdf$/.test(n)||t==="application/pdf")return "pdf";
 if(/\.(csv|txt)$/.test(n)||/csv|text\//.test(t))return "csv";
 return "unknown";
}
export function looksLikeIngPdf(rows){
 const all=rows.slice(0,80).map(r=>r.items.map(i=>i.s).join(" ")).join("\n");
 if(/Revolut\s+(Bank\s+UAB|Ltd|Payments)/i.test(all))return false;
 return /\bING\s+Bank\b|\bNL\d{2}\s?INGB\b|\bmijn\.?ing\b|\bING\.nl\b|Rekeningoverzicht|Af-? en bijschrijvingen/i.test(all);
}
const euro=n=>Math.round(n*100)/100;
export async function previewBankStatement(db,uid,file){
 if(!db?.from||!uid||!file)throw Error("Inicia sesión y selecciona un extracto.");
 if(file.size<1||file.size>MAX_BANK_FILE_BYTES)throw Error("El archivo está vacío o supera 5 MB.");
 const kind=bankFileKind(file);
 if(kind==="excel")throw Error(EXCEL_HELP);
 if(kind==="unknown")throw Error("Formato no reconocido. ING: CSV. Revolut: PDF o CSV.");
 let parsed;
 if(kind==="pdf"){
  let rows;
  try{rows=await extractRows(new Uint8Array(await file.arrayBuffer()),undefined,80);}
  catch{throw Error("No se pudo abrir el PDF. Si tiene contraseña o es una foto escaneada, descarga de nuevo el extracto desde la app del banco.");}
  if(!rows.length)throw Error("El PDF no tiene texto legible (parece una imagen escaneada). Descarga el extracto original desde la app del banco.");
  // Un PDF de ING puede mencionar "Revolut" en sus recargas: si no salen movimientos de Revolut, se comprueba si es de ING.
  try{parsed=parseRevolutRows(rows);}
  catch(e){if(looksLikeIngPdf(rows))throw Error(ING_PDF_HELP);throw e;}
  if(!parsed.transactions.length&&looksLikeIngPdf(rows))throw Error(ING_PDF_HELP);
 }else{
  const text=await file.text();
  parsed=/completed date/i.test(text.split(/\r?\n/,1)[0])?parseRevolutCsv(text):parseIngCsv(text);
 }
 if(!parsed.transactions.length)throw Error("No se encontró ningún movimiento en este archivo. Comprueba que el periodo descargado tenga movimientos.");
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
