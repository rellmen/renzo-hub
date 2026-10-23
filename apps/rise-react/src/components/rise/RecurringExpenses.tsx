import {CalendarClock} from "lucide-react";
import {useMemo,useState} from "react";
import {useMutation,useQueryClient} from "@tanstack/react-query";
import {useAuth} from "@/lib/auth/AuthProvider";
import {setFixedMerchant} from "@/lib/fixed-merchant.mjs";
import {SectionCard} from "@/components/rise/primitives";
import type {MoneySummary} from "@/lib/money-records.mjs";
const fmt=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"});
export function RecurringExpenses({data}:{data:MoneySummary}){
 const fixed=data.fixedExpenses;
 const {client,user}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const [merchant,setMerchant]=useState(""),[notice,setNotice]=useState("");
 const candidates=useMemo(()=>{
  const names=new Map<string,string>();
  for(const item of data.items){
   if(item.amount<0&&!["traspaso","inversion","prestamos","nomina"].includes(item.category)&&item.merchant)
    names.set(item.merchant.toLowerCase(),item.merchant);
  }
  return [...names.entries()].sort((a,b)=>a[1].localeCompare(b[1],"es")).slice(0,150);
 },[data.items]);
 const update=useMutation({
  mutationFn:async({key,fixed}:{key:string;fixed:boolean})=>{
   if(!client||!uid)throw Error("Sesión necesaria.");
   return setFixedMerchant(client,uid,key,fixed);
  },
  onSuccess:async()=>{setNotice("Regla actualizada sin modificar movimientos bancarios.");
   await qc.invalidateQueries({queryKey:["money-real",uid]});}
 });
 function change(key:string,value:boolean){setNotice("");update.mutate({key,fixed:value});}
 return <SectionCard eyebrow="MY FINANCE · GASTOS RECURRENTES" title="Fijos y suscripciones" accent="var(--money)">
  <p className="text-xs text-muted-foreground">Estimación calculada desde el historial bancario y reglas de Classic. No son cargos futuros confirmados.</p>
  {fixed?.items.length?<div className="mt-4 space-y-3">
   <div className="grid grid-cols-2 gap-3 text-xs">
    <div className="rounded-xl border border-hairline p-3"><p className="text-muted-foreground">Fijos netos estimados</p>
     <strong className="mt-1 text-lg">{fmt.format(fixed.total)}</strong></div>
    <div className="rounded-xl border border-hairline p-3"><p className="text-muted-foreground">Suscripciones estimadas</p>
     <strong className="mt-1 text-lg">{fmt.format(fixed.subscriptions)}</strong></div>
   </div>
   <ul className="divide-y divide-hairline">{fixed.items.map(entry=><li key={entry.key} className="flex items-center justify-between gap-2 py-3 text-xs">
    <div><strong className="text-sm">{entry.name}</strong>
     <p className="text-muted-foreground">{entry.contribution?"Aporte que reduce el alquiler":entry.subscription?"Suscripción":"Gasto periódico"} · {entry.source==="manual"?"marcado manualmente":"detección automática"}</p>
     {entry.nextDate&&<p className="mt-1 flex items-center gap-1 text-muted-foreground"><CalendarClock className="h-3 w-3"/> Próxima fecha aproximada: {entry.nextDate}</p>}
    </div>
    <div className="flex shrink-0 flex-col items-end gap-1"><strong className="tabular-nums">{fmt.format(entry.monthly)}</strong>
     <button type="button" className="text-xs text-gold underline" disabled={!uid||update.isPending}
      onClick={()=>change(entry.key,false)}>No es fijo</button>
    </div>
   </li>)}</ul>
  </div>:<p className="mt-3 text-sm text-muted-foreground">Todavía no hay suficientes gastos recurrentes verificados para este periodo.</p>}
  {candidates.length>0&&<div className="mt-4 border-t border-hairline pt-3">
   <label className="block text-xs text-muted-foreground">Marcar un comercio como gasto fijo
    <select value={merchant} onChange={e=>setMerchant(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-foreground">
     <option value="">Seleccionar comercio…</option>
     {candidates.map(([key,label])=><option key={key} value={key}>{label}</option>)}
    </select>
   </label>
   <button type="button" className="btn-ghost mt-2 min-h-11" disabled={!uid||update.isPending||!merchant}
    onClick={()=>change(merchant,true)}>Añadir gasto fijo</button>
  </div>}
  {update.error&&<p role="alert" className="mt-2 text-xs text-gym">{(update.error as Error).message}</p>}
  {notice&&<p role="status" className="mt-2 text-xs text-money">{notice}</p>}
 </SectionCard>;
}
