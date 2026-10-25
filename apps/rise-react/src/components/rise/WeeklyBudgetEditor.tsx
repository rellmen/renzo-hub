import {useEffect,useState} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {RefreshCw,ShieldCheck} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {SectionCard} from "@/components/rise/primitives";
import {VARIABLE_BUDGET_CATEGORIES,loadWeeklyBudget,saveWeeklyBudget} from "@/lib/money-budget-editor.mjs";

export function WeeklyBudgetEditor(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const [editing,setEditing]=useState(false);
 const [limits,setLimits]=useState<Record<string,string>>({});
 const q=useQuery({queryKey:["weekly-budget",uid],enabled:!!client&&!!uid,
  queryFn:()=>loadWeeklyBudget(client!,uid),refetchOnWindowFocus:true,staleTime:0});
 useEffect(()=>{
  if(editing)return;
  setLimits(Object.fromEntries(VARIABLE_BUDGET_CATEGORIES.map(cat=>
   [cat.id,q.data?.payload?.weekly?.[cat.id]==null?"":String(q.data.payload.weekly[cat.id])])));
 },[q.data,editing]);
 const save=useMutation({mutationFn:()=>saveWeeklyBudget(client!,uid,q.data||null,limits),
  onSuccess:async()=>{setEditing(false);await Promise.all([
   qc.invalidateQueries({queryKey:["weekly-budget",uid]}),
   qc.invalidateQueries({queryKey:["money-real",uid]})
  ]);}});
 return <SectionCard eyebrow="MY FINANCE · PRESUPUESTO" title="Límites por semana" accent="var(--money)">
  <p className="text-sm text-platinum/75">Mismo registro original de Rise, semana de miércoles a martes. Los límites no se cuentan como gastos y nunca crean movimientos bancarios.</p>
  {q.error&&<p role="alert" className="mt-3 text-sm text-gym">{q.error instanceof Error?q.error.message:"No se pudo comprobar el presupuesto."}</p>}
  {q.isLoading&&<p role="status" className="mt-3 text-sm">Consultando presupuesto…</p>}
  {!editing&&q.isSuccess&&<>
   {q.data?.payload?.weekly&&Object.entries(q.data.payload.weekly).length>0?
    <ul className="mt-3 grid grid-cols-2 gap-2 text-xs">{Object.entries(q.data.payload.weekly).map(([id,value])=>
     <li key={id} className="rounded-lg border border-hairline p-3">
      <span className="block text-muted-foreground">{VARIABLE_BUDGET_CATEGORIES.find(c=>c.id===id)?.name||id}</span>
      <strong>{new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(Number(value))}</strong>
     </li>)}</ul>:
    <p className="mt-3 text-sm text-muted-foreground">Todavía no hay límites semanales registrados.</p>}
   <button type="button" className="btn-gold mt-4" onClick={()=>setEditing(true)}>Editar límites</button>
   <button type="button" className="btn-ghost ml-2 mt-4" onClick={()=>void q.refetch()} disabled={q.isFetching}>
    <RefreshCw className="h-4 w-4"/> Actualizar</button>
  </>}
  {editing&&<form className="mt-4 space-y-4" onSubmit={e=>{e.preventDefault();save.mutate();}}>
   <div className="grid gap-3 sm:grid-cols-2">
    {VARIABLE_BUDGET_CATEGORIES.map(cat=><label key={cat.id} className="block text-xs text-muted-foreground">
     {cat.name} · €/semana
     <input type="number" min="0" max="50000" step="0.01" inputMode="decimal"
      value={limits[cat.id]||""} onChange={e=>setLimits(p=>({...p,[cat.id]:e.target.value}))}
      className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground"/>
    </label>)}
   </div>
   <div className="flex flex-wrap gap-2">
    <button type="submit" className="btn-gold" disabled={save.isPending||!!q.error}>{save.isPending?"Guardando…":"Guardar presupuesto"}</button>
    <button type="button" className="btn-ghost" disabled={save.isPending} onClick={()=>setEditing(false)}>Cancelar</button>
   </div>
   {save.error&&<p role="alert" className="text-sm text-gym">{save.error instanceof Error?save.error.message:"Error guardando el presupuesto."}</p>}
  </form>}
  <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
   <ShieldCheck className="h-4 w-4 shrink-0"/>Preserva otras categorías y rechaza cambios simultáneos entre dispositivos. No importa extractos ni inventa ingresos.</p>
 </SectionCard>;
}
