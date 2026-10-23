import {useEffect,useState} from "react";
import {useMutation,useQueryClient} from "@tanstack/react-query";
import {Archive,Target} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {SectionCard} from "@/components/rise/primitives";
import {saveFinancialGoal,archiveFinancialGoal,GOAL_TYPES,type GoalRecord} from "@/lib/money-goals.mjs";
import type {MoneySummary} from "@/lib/money-records.mjs";

function iso(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
function explain(goal:MoneySummary["goals"][number]){
 const p=goal.progress;
 if(!p)return "No se puede calcular progreso sin extractos del periodo.";
 if(p.status==="nodata")return p.reason||"Faltan saldos o gastos fijos verificados.";
 const eur=(n?:number)=>typeof n==="number"?new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(n):"—";
 return "Avance "+eur(p.current)+" · faltante "+eur(p.missing)+(p.perWeek!=null?" · aporte semanal sugerido "+eur(p.perWeek):"");
}
export function FinancialGoals({data}:{data:MoneySummary|null|undefined}){
 const {client,user}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const [type,setType]=useState<"emergency"|"target"|"invest">("emergency");
 const [name,setName]=useState("");
 const [months,setMonths]=useState("3"),[amount,setAmount]=useState(""),[date,setDate]=useState(""),[start,setStart]=useState(iso().slice(0,7));
 const [monthly,setMonthly]=useState("");
 const [notice,setNotice]=useState("");
 useEffect(()=>{setType("emergency");setName("");setMonths("3");setAmount("");setDate("");setStart(iso().slice(0,7));setMonthly("");setNotice("");},[uid]);
 const create=useMutation({
  mutationFn:async()=>{
   if(!client||!uid)throw Error("Sesión no disponible.");
   return saveFinancialGoal(client,uid,{type,name,months,amount,date,start,monthly});
  },
  onSuccess:async()=>{setNotice("Objetivo guardado sin crear movimientos bancarios.");setName("");setAmount("");setMonthly("");await qc.invalidateQueries({queryKey:["money-real",uid]});}
 });
 const archive=useMutation({
  mutationFn:async(goal:GoalRecord)=>{
   if(!client||!uid)throw Error("Sesión no disponible.");
   return archiveFinancialGoal(client,uid,goal);
  },
  onSuccess:async()=>{setNotice("Objetivo archivado; no se han borrado datos.");await qc.invalidateQueries({queryKey:["money-real",uid]});}
 });
 return <SectionCard eyebrow="MY FINANCE · OBJETIVOS" title="Metas financieras" accent="var(--gold)">
  <p className="text-sm text-platinum/80">Las metas usan tus extractos, saldos y gastos registrados. No crean ahorros ni rendimientos ficticios.</p>
  {data?.goals.length?<ul className="mt-4 space-y-3">{data.goals.map(goal=>
   <li key={goal.id} className="rounded-xl border border-hairline bg-raised p-4">
    <div className="flex items-start justify-between gap-3">
     <div><strong className="text-sm">{goal.title}</strong><p className="text-xs text-muted-foreground">{GOAL_TYPES[goal.type as keyof typeof GOAL_TYPES]||"Tipo desconocido"}</p></div>
     <button type="button" className="btn-ghost min-h-11" title="Archivar objetivo sin borrar el historial" disabled={archive.isPending||!uid}
      onClick={()=>{setNotice("");archive.mutate(goal);}}><Archive className="h-4 w-4"/> Archivar</button>
    </div>
    <p className="mt-2 text-xs text-platinum/80">{explain(goal)}</p>
    {goal.progress?.pct!=null&&<div role="progressbar" aria-label={"Progreso "+goal.title} aria-valuemin={0} aria-valuemax={100} aria-valuenow={goal.progress.pct}
     className="mt-2 h-1.5 overflow-hidden rounded-full bg-hairline"><div style={{width:Math.min(100,Math.max(0,goal.progress.pct))+"%"}} className="h-full rounded-full bg-gold"/></div>}
    {goal.progress?.status==="late"&&<p className="mt-2 text-xs text-gym">Meta fuera de plazo.</p>}
   </li>
  )}</ul>:<p className="mt-3 text-sm text-muted-foreground">No hay objetivos financieros activos.</p>}
  <form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={e=>{e.preventDefault();setNotice("");create.mutate();}}>
   <div className="sm:col-span-2 flex items-center gap-2"><Target className="h-4 w-4 text-gold"/><strong className="text-sm">Crear objetivo</strong></div>
   <label className="text-xs text-muted-foreground">Tipo
    <select className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-foreground" value={type}
      onChange={e=>setType(e.target.value as typeof type)}>
     {Object.entries(GOAL_TYPES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
    </select>
   </label>
   <label className="text-xs text-muted-foreground">Nombre
    <input className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-foreground" maxLength={60}
     value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre opcional"/>
   </label>
   {type==="emergency"&&<label className="text-xs text-muted-foreground sm:col-span-2">Meses de gastos fijos (1–24)
    <input className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-foreground" inputMode="decimal"
     value={months} onChange={e=>setMonths(e.target.value)} required/>
   </label>}
   {type==="target"&&<>
    <label className="text-xs text-muted-foreground">Objetivo (€)
     <input className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-foreground" inputMode="decimal" required
      value={amount} onChange={e=>setAmount(e.target.value)}/>
    </label>
    <label className="text-xs text-muted-foreground">Fecha límite
     <input type="date" className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-foreground" required
      value={date} onChange={e=>setDate(e.target.value)}/>
    </label>
    <label className="text-xs text-muted-foreground sm:col-span-2">Mes de comienzo
     <input type="month" className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-foreground" required
      value={start} onChange={e=>setStart(e.target.value)}/>
    </label>
   </>}
   {type==="invest"&&<label className="text-xs text-muted-foreground sm:col-span-2">Aportación mensual (€)
    <input className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-foreground" inputMode="decimal" required
     value={monthly} onChange={e=>setMonthly(e.target.value)}/>
   </label>}
   <div className="sm:col-span-2 flex flex-col gap-2">
    <button type="submit" className="btn-gold min-h-11 self-start" disabled={!uid||create.isPending||archive.isPending}>
     {create.isPending?"Guardando…":"Guardar objetivo"}</button>
    {create.error&&<p role="alert" className="text-sm text-gym">{String((create.error as Error).message)}</p>}
    {archive.error&&<p role="alert" className="text-sm text-gym">{String((archive.error as Error).message)}</p>}
    {notice&&<p role="status" className="text-sm text-money">{notice}</p>}
   </div>
  </form>
 </SectionCard>;
}
