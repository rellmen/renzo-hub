import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useEffect,useState,type FormEvent} from "react";
import {Pencil,Save,Target,Trash2} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {SectionCard} from "@/components/rise/primitives";
import {correctWeight,deleteWeight,loadSettings,loadWeightHistory,saveBodyProfile,saveGymGoals} from "@/lib/body-goals.mjs";
import {getGymGoals} from "@/lib/legacy-gym/goals.js";

const field="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground";
const lab="block text-xs text-muted-foreground";
const msg=(e:unknown)=>e instanceof Error?e.message:"No se pudo guardar.";
const PROFILE=[["startWeight","Peso inicial (kg)"],["height","Altura (m)"],["kcalMin","Kcal mín."],["kcalMax","Kcal máx."],["proteinMin","Proteína mín. (g)"],["proteinMax","Proteína máx. (g)"],["budgetMin","Presupuesto comida mín. (€)"],["budgetMax","Presupuesto comida máx. (€)"]] as const;

export function BodyGoals(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const settings=useQuery({queryKey:["user-settings",uid],enabled:!!client&&!!uid,queryFn:()=>loadSettings(client,uid),staleTime:0});
 const weights=useQuery({queryKey:["weight-history",uid],enabled:!!client&&!!uid,queryFn:()=>loadWeightHistory(client,uid),staleTime:30000});
 const [edit,setEdit]=useState<string|null>(null);const [value,setValue]=useState("");const [confirm,setConfirm]=useState<string|null>(null);
 const [notice,setNotice]=useState("");
 useEffect(()=>{setEdit(null);setConfirm(null);setNotice("");},[uid]);
 const run=useMutation({mutationFn:(op:()=>Promise<string>)=>op(),onSuccess:async(t)=>{setNotice(t);setEdit(null);setConfirm(null);
  await Promise.all(["user-settings","weight-history","body-food"].map(k=>qc.invalidateQueries({queryKey:[k,uid]})));}});
 const goals=getGymGoals(uid,user?.user_metadata);
 const p=settings.data?.settings?.["bodyProfile"]||{};
 const submitProfile=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.currentTarget));
  run.mutate(async()=>{if(!settings.data)throw Error("Carga tus ajustes primero.");await saveBodyProfile(client,uid,settings.data,v);return "Perfil corporal guardado.";});};
 const submitGoals=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();const f=new FormData(e.currentTarget);
  run.mutate(async()=>{await saveGymGoals(client,{priority:f.get("priority"),sessionsPerWeek:Number(f.get("sessionsPerWeek")),targetWeight:f.get("targetWeight")});
   await client?.auth.refreshSession();return "Objetivos guardados en tu cuenta.";});};
 return <div className="space-y-5">
  {notice&&<p role="status" className="surface p-4 text-sm">{notice}</p>}
  {run.error&&<p role="alert" className="surface border border-gym/40 p-4 text-sm text-gym">{msg(run.error)}</p>}
  <div className="grid gap-5 lg:grid-cols-2">
   <SectionCard eyebrow="Objetivos" title="Metas de entrenamiento" accent="var(--gym)">
    <form key={JSON.stringify(goals)} className="space-y-3" onSubmit={submitGoals}>
     <label className={lab}>Prioridad<input name="priority" required maxLength={120} defaultValue={goals.priority} className={field}/></label>
     <div className="grid gap-3 sm:grid-cols-2">
      <label className={lab}>Sesiones por semana (2-5)<input name="sessionsPerWeek" type="number" min={2} max={5} step={1} required defaultValue={goals.sessionsPerWeek} className={field}/></label>
      <label className={lab}>Meta de peso (kg, opcional)<input name="targetWeight" type="number" min={30} max={300} step={0.1} defaultValue={goals.targetWeight??""} className={field}/></label>
     </div>
     <button type="submit" className="btn-gold min-h-11" disabled={run.isPending}><Target className="h-4 w-4"/>Guardar objetivos</button>
     <p className="text-xs text-muted-foreground">Se guardan en tu cuenta (mismo lugar que Gym clásico). Sin meta, no se calcula progreso hacia un peso.</p>
    </form>
   </SectionCard>
   <SectionCard eyebrow="Perfil corporal" title="Rangos personales" accent="var(--skin)">
    {settings.error&&<p role="alert" className="text-sm text-gym">No se pudieron leer tus ajustes.</p>}
    {settings.data&&<form key={settings.data.updated_at||"new"} className="space-y-3" onSubmit={submitProfile}>
     <div className="grid gap-3 sm:grid-cols-2">{PROFILE.map(([k,l])=><label key={k} className={lab}>{l}<input name={k} inputMode="decimal" defaultValue={p[k]??""} className={field}/></label>)}</div>
     <label className={lab}>Fases de peso (kg, separadas por comas)<input name="phases" defaultValue={(p.phases||[]).join(", ")} className={field} placeholder="78, 74.5"/></label>
     <button type="submit" className="btn-gold min-h-11" disabled={run.isPending}><Save className="h-4 w-4"/>Guardar perfil</button>
     <p className="text-xs text-muted-foreground">Vacío = sin dato. Food usa estos rangos para kcal y proteína; no se rellenan por defecto.</p>
    </form>}
   </SectionCard>
  </div>
  <SectionCard eyebrow="Historial editable" title="Registros de peso" accent="var(--gym)">
   {weights.error&&<p role="alert" className="text-sm text-gym">No se pudo cargar el historial.</p>}
   {weights.data&&!weights.data.length&&<p className="text-sm text-muted-foreground">Sin registros de peso.</p>}
   <ul className="divide-y divide-hairline">{(weights.data||[]).map(r=><li key={r.id} className="py-2 text-sm">
    <div className="flex flex-wrap items-center justify-between gap-2"><span>{r.payload?.date||r.occurred_at?.slice(0,10)}</span>
     <span className="flex items-center gap-2"><strong>{r.payload?.value??"—"} kg</strong>
      {Array.isArray(r.payload?.corrections)&&r.payload.corrections.length>0&&<span className="text-[11px] text-muted-foreground">corregido</span>}
      <button type="button" aria-label="Corregir" className="btn-ghost min-h-8 px-2" onClick={()=>{run.reset();setConfirm(null);setEdit(r.id);setValue(String(r.payload?.value??""));}}><Pencil className="h-3.5 w-3.5"/></button>
      <button type="button" aria-label="Eliminar" className="btn-ghost min-h-8 px-2" onClick={()=>{run.reset();setEdit(null);setConfirm(r.id);}}><Trash2 className="h-3.5 w-3.5"/></button></span></div>
    {edit===r.id&&<div className="mt-2 flex flex-wrap items-end gap-2"><label className={lab}>Valor corregido (kg)<input value={value} onChange={e=>setValue(e.target.value)} inputMode="decimal" className={field}/></label>
     <button type="button" className="btn-gold min-h-11" disabled={run.isPending} onClick={()=>run.mutate(async()=>{await correctWeight(client,uid,r,value);return "Peso corregido; el valor anterior queda en el historial del registro.";})}>Guardar</button>
     <button type="button" className="btn-ghost min-h-11" onClick={()=>setEdit(null)}>Cancelar</button></div>}
    {confirm===r.id&&<div role="group" aria-label="Confirmar eliminación" className="mt-2 rounded-xl border border-gym/40 p-3 text-xs"><p>¿Eliminar este registro de peso? No se puede deshacer.</p>
     <div className="mt-2 flex gap-2"><button type="button" className="btn-gold min-h-9 px-3" disabled={run.isPending} onClick={()=>run.mutate(async()=>{await deleteWeight(client,uid,r);return "Registro eliminado.";})}>Eliminar</button><button type="button" className="btn-ghost min-h-9 px-3" onClick={()=>setConfirm(null)}>Cancelar</button></div></div>}
   </li>)}</ul>
  </SectionCard>
 </div>;
}
