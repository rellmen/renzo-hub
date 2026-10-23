// Conservative subset of the Classic review fields. No mutation occurs here.
export const PAYROLL_REVIEW_FIELDS=Object.freeze({
 worked_hours:"Horas trabajadas",
 gross_salary:"Bruto",
 net_salary:"Neto",
 net_payment:"A pagar",
 loonheffing:"Retención",
 shift_allowance:"Plus de turnos",
 payment_date:"Fecha de pago",
 payslip_number:"Número de nómina"
});
const TEXT=new Set(["payment_date","payslip_number"]);
export function payrollReviewChanges(original,input){
 if(!original||!input||typeof input!=="object")throw Error("Falta la nómina o el formulario.");
 const changes={};
 for(const key of Object.keys(PAYROLL_REVIEW_FIELDS)){
  const raw=String(input[key]??"").trim();
  let value=raw===""?null:TEXT.has(key)?raw:Number(raw.replace(",","."));
  if(value!==null&&!TEXT.has(key)&&(!Number.isFinite(value)||Math.abs(value)>1e9))
   throw Error("Valor numérico no válido: "+PAYROLL_REVIEW_FIELDS[key]);
  if(key==="payment_date"&&value){
   const date=/^\d{4}-\d{2}-\d{2}$/.test(value)?new Date(value+"T00:00:00Z"):null;
   if(!date||Number.isNaN(date.valueOf())||date.toISOString().slice(0,10)!==value)throw Error("Fecha de pago no válida.");
  }
  const old=original[key]===null||original[key]===undefined||original[key]===""?null:TEXT.has(key)?String(original[key]):Number(original[key]);
  if(value!==old)changes[key]=value;
 }
 return changes;
}
export async function applyPayrollReview(client,uid,payslip,form,decision,note=""){
 if(!client?.auth?.getUser||!client?.from||!client?.rpc||!uid||payslip?.user_id!==uid||payslip.review_status!=="pending"||!payslip.updated_at)
  throw Error("No se puede revisar esta nómina sin una sesión y versión válidas.");
 if(!["approved","rejected"].includes(decision))throw Error("Decisión no permitida.");
 if(String(note).length>4000)throw Error("Nota demasiado larga.");
 const changes=payrollReviewChanges(payslip,form);
 if(decision==="rejected"&&Object.keys(changes).length)throw Error("Rechazar no permite modificar importes.");
 const {data:user,error:authError}=await client.auth.getUser();
 if(authError||user?.user?.id!==uid)throw Error("La sesión ha cambiado.");
 const {data:current,error:readError}=await client.from("payroll_payslips").select("id,user_id,review_status,updated_at")
  .eq("id",payslip.id).eq("user_id",uid).maybeSingle();
 if(readError||!current||current.review_status!=="pending"||current.updated_at!==payslip.updated_at)
  throw Error("La nómina cambió en otra sesión. Actualiza antes de revisar.");
 // No fallback to Classic: the server must compare the version while locked.
 const {data,error}=await client.rpc("payroll_apply_review_cas",{
  p_payslip_id:payslip.id,p_expected_updated_at:payslip.updated_at,p_changes:decision==="approved"?changes:{},
  p_decision:decision,p_error_types:{},p_note:String(note||"")||null
 });
 if(error?.code==="40001")throw Error("La nómina cambió en otra sesión. Actualiza antes de revisar.");
 if(error||!data?.ok)throw Error("No se pudo guardar la revisión de la nómina.");
 return data;
}
