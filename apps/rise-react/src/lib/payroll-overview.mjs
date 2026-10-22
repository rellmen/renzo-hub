// Nocturne payroll adapter: preserves normalized legacy records and RLS.
// NO re-extraction, rewriting, AI inference or hidden mutation.
const PAYSLIP_COLS="id,user_id,document_id,employer_id,period_start,period_end,period_label,payment_date,period_year,period_number,worked_hours,gross_salary,net_salary,net_payment,validation_status,review_status,currency";
const DOC_COLS="id,user_id,original_file_name,status,storage_path_raw,storage_path_archive,doc_class";
async function all(client,table,cols,uid,max=5000){
 const rows=[];
 for(let i=0;i<max;i+=400){
  const {data,error}=await client.from(table).select(cols).eq("user_id",uid).range(i,i+399);
  if(error)throw Error("Error consultando "+table+": "+error.message);
  rows.push(...(data||[]));
  if((data||[]).length<400)return rows;
 }
 throw Error("Tabla "+table+" con demasiados registros para una lectura completa; se ha bloqueado el resumen parcial.");
}
const number=x=>typeof x==="number"&&Number.isFinite(x)?x:null;
export function summarizePayroll(payslips=[],documents=[],anomalies=[],validations=[]){
 const docMap=new Map(documents.map(d=>[d.id,d]));
 const issues=new Map();
 for(const a of anomalies)if(a.status!=="resolved"&&a.status!=="dismissed")issues.set(a.payslip_id,(issues.get(a.payslip_id)||0)+1);
 const invalid=new Map();
 for(const v of validations)if(v.passed===false)invalid.set(v.payslip_id,(invalid.get(v.payslip_id)||0)+1);
 const rows=payslips.map(p=>({
  ...p,document:docMap.get(p.document_id)||null,
  unresolved:issues.get(p.id)||0,failedValidations:invalid.get(p.id)||0
 })).sort((a,b)=>String(b.period_end||b.payment_date||"").localeCompare(String(a.period_end||a.payment_date||"")));
 const verified=rows.filter(r=>r.review_status==="approved"||r.review_status==="reviewed");
 return{rows,documentCount:documents.length,anomalyCount:anomalies.length,
  unresolvedAnomalies:anomalies.filter(a=>a.status!=="resolved"&&a.status!=="dismissed").length,
  failedValidations:validations.filter(v=>v.passed===false).length,
  approvedCount:verified.length,
  // Display per-slip values, NEVER sum 27 historical net amounts as current income.
  latestNet:rows.length?number(rows[0].net_payment??rows[0].net_salary):null
 };
}
export async function loadPayrollOverview(client,uid){
 if(!client||typeof uid!=="string"||!uid)throw Error("Sesión requerida para Nóminas");
 const [s,d,a,v]=await Promise.all([
  all(client,"payroll_payslips",PAYSLIP_COLS,uid),
  all(client,"payroll_documents",DOC_COLS,uid),
  all(client,"payroll_anomalies","id,user_id,payslip_id,status,severity,anomaly_type",uid),
  all(client,"payroll_validations","id,user_id,payslip_id,passed,severity,rule_code",uid)
 ]);
 return summarizePayroll(s,d,a,v);
}
export async function downloadPayrollDocument(client,uid,doc){
 if(!client||!uid||!doc||doc.user_id!==uid)throw Error("Documento no autorizado.");
 const path=doc.storage_path_archive||doc.storage_path_raw;
 if(typeof path!=="string"||!path||path.startsWith("/")||path.includes(".."))
  throw Error("El documento no tiene una ruta privada válida.");
 const {data,error}=await client.storage.from("payroll").download(path);
 if(error||!data)throw Error("No se pudo acceder al archivo original de Nóminas.");
 return{blob:data,name:String(doc.original_file_name||"nomina.pdf").replace(/[\\/]/g,"_").slice(0,150)};
}
