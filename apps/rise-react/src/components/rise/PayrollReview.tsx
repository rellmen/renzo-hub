import {useEffect,useState} from "react";
import {useMutation,useQueryClient} from "@tanstack/react-query";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PAYROLL_REVIEW_FIELDS,payrollReviewChanges,applyPayrollReview} from "@/lib/payroll-review.mjs";
import type {PayrollRow} from "@/lib/payroll-overview.mjs";
const enabled=import.meta.env["VITE_PAYROLL_REVIEW_ENABLED"]==="true";
const keys=Object.keys(PAYROLL_REVIEW_FIELDS);
export function PayrollReview({row}:{row:PayrollRow}){
 const {client,user}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const [form,setForm]=useState<Record<string,string>>({});
 const [note,setNote]=useState(""),[message,setMessage]=useState("");
 useEffect(()=>{setForm(Object.fromEntries(keys.map(k=>[k,String((row as Record<string,unknown>)[k]??"")])));setNote("");setMessage("");},[row.id,row.updated_at]);
 const changes=(()=>{try{return payrollReviewChanges(row,form);}catch{return {};}})();
 const edited=Object.keys(changes).length>0;
 const action=useMutation({
  mutationFn:async(decision:"approved"|"rejected")=>{
   if(!enabled||!client||!uid)throw Error("Revisión todavía no habilitada en este entorno.");
   if(decision==="rejected"&&edited)throw Error("Descarta los cambios antes de rechazar.");
   return applyPayrollReview(client,uid,row,form,decision,note);
  },
  onSuccess:async()=>{setMessage("Decisión registrada; vuelve a comprobar el historial.");
   await qc.invalidateQueries({queryKey:["payroll-overview",uid]});
  }
 });
 if(row.review_status!=="pending")return null;
 return <details className="mt-3 rounded-xl border border-hairline p-3">
  <summary className="cursor-pointer text-xs font-medium">Revisar / corregir nómina</summary>
  {!enabled?<p className="mt-2 text-xs text-muted-foreground">El formulario está preparado pero inhabilitado hasta superar la prueba de seguridad y revisión autenticada en QA. Usa Classic para correcciones.</p>:
   <form className="mt-3 space-y-3" onSubmit={e=>e.preventDefault()}>
    <p className="text-xs text-platinum/80">Comprueba cada campo con el PDF original. Las correcciones y decisiones quedan registradas por Supabase.</p>
    <div className="grid gap-2 sm:grid-cols-2">{keys.map(key=><label key={key} className="text-xs text-muted-foreground">
     {PAYROLL_REVIEW_FIELDS[key]}
     <input type={key==="payment_date"?"date":key==="payslip_number"?"text":"number"} step={key==="payment_date"||key==="payslip_number"?undefined:"any"}
      value={form[key]||""} onChange={e=>setForm(state=>({...state,[key]:e.target.value}))}
      className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-foreground"/>
    </label>)}</div>
    <label className="block text-xs text-muted-foreground">Nota de revisión (opcional)
     <textarea maxLength={4000} rows={2} value={note} onChange={e=>setNote(e.target.value)}
      className="mt-1 w-full rounded-xl border border-hairline bg-obsidian p-3 text-foreground"/>
    </label>
    <p className="text-xs text-muted-foreground">{edited?Object.keys(changes).length+" campo(s) modificado(s). Al aprobar se registrarán en el historial.":"No has cambiado ningún campo."}</p>
    <div className="flex flex-wrap gap-2">
     <button type="button" className="btn-gold min-h-11" disabled={action.isPending} onClick={()=>{setMessage("");action.mutate("approved");}}>
      {edited?"Guardar correcciones y aprobar":"Aprobar sin cambios"}
     </button>
     <button type="button" className="btn-ghost min-h-11" disabled={action.isPending||edited} onClick={()=>{setMessage("");action.mutate("rejected");}}>Rechazar</button>
    </div>
    {action.error&&<p role="alert" className="text-xs text-gym">{(action.error as Error).message}</p>}
    {message&&<p role="status" className="text-xs text-money">{message}</p>}
   </form>}
 </details>;
}
