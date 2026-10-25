import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useEffect,useState,type FormEvent} from "react";
import {Archive,Lightbulb,Rocket,Save,Target} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {SectionCard} from "@/components/rise/primitives";
import {archiveIdea,captureIdea,freeSlot,ideaState,loadIdeas,loadSprint,promoteIdea,promotionPending,saveSprint,sprintAlerts,type Idea} from "@/lib/work-planning.mjs";

const field="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground";
const lab="block text-xs text-muted-foreground";
const LABEL={cooling:"Enfriando",review:"Lista para revisar",promoted:"Promovida",archived:"Archivada"} as const;
const msg=(e:unknown)=>e instanceof Error?e.message:"No se pudo completar.";

export function WorkPlanning({projects}:{projects:any[]}){
 const {client,user}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const ideas=useQuery({queryKey:["work-ideas",uid],enabled:!!client&&!!uid,queryFn:()=>loadIdeas(client!,uid),staleTime:20000,refetchOnWindowFocus:true});
 const sprint=useQuery({queryKey:["work-sprint",uid],enabled:!!client&&!!uid,queryFn:()=>loadSprint(client!,uid),staleTime:0,refetchOnWindowFocus:true});
 const [override,setOverride]=useState<Idea|null>(null);
 const [showClosed,setShowClosed]=useState(false);
 useEffect(()=>{setOverride(null);},[uid]);
 const run=useMutation({mutationFn:(op:()=>Promise<unknown>)=>op(),onSuccess:async()=>{setOverride(null);
  await Promise.all([qc.invalidateQueries({queryKey:["work-ideas",uid]}),qc.invalidateQueries({queryKey:["work-records",uid]}),qc.invalidateQueries({queryKey:["work-sprint",uid]}),qc.invalidateQueries({queryKey:["shift-state",uid]})]);}});
 const submitIdea=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();const f=e.currentTarget;const v=Object.fromEntries(new FormData(f)) as Record<string,string>;
  run.mutate(async()=>{await captureIdea(client,uid,{title:v["title"]||"",note:v["note"]||"",coolingHours:v["coolingHours"]||"48"});f.reset();});};
 const submitSprint=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.currentTarget));
  run.mutate(async()=>{if(!sprint.data)throw Error("Carga el sprint antes de guardarlo.");await saveSprint(client,uid,sprint.data.snap,v);});};
 const s=sprint.data?.sprint||{};const alerts=sprintAlerts(s);
 const list=(ideas.data||[]).filter(i=>showClosed||!["promoted","archived"].includes(i.status)||promotionPending(i,projects));
 const slot=freeSlot(projects);
 return <div className="grid gap-5 lg:grid-cols-2">
  <SectionCard eyebrow="Weekly Sprint" title={s.objective||"Sin sprint definido"} accent="var(--gold)">
   {sprint.error&&<p role="alert" className="text-sm text-gym">No se pudo cargar el sprint.</p>}
   {alerts.length>0&&<ul className="mb-3 space-y-2">{alerts.map(a=><li key={a.signal} className="rounded-xl border border-gold/40 p-3 text-xs"><strong className="text-gold">{a.signal}</strong> · {a.text}</li>)}</ul>}
   {sprint.data&&<form key={sprint.data.snap.updated_at||"new"} className="space-y-3" onSubmit={submitSprint}>
    <label className={lab}>Objetivo<input name="objective" required maxLength={220} defaultValue={s.objective||""} className={field}/></label>
    <label className={lab}>Entregable observable<input name="deliverable" maxLength={220} defaultValue={s.deliverable||""} className={field}/></label>
    <div className="grid gap-3 sm:grid-cols-2">
     <label className={lab}>Fecha límite<input name="deadline" type="date" defaultValue={s.deadline||""} className={field}/></label>
     <label className={lab}>Siguiente acción<input name="nextAction" maxLength={180} defaultValue={s.nextAction||""} className={field}/></label>
    </div>
    <label className={lab}>Bloqueo<input name="blocker" maxLength={180} defaultValue={s.blocker||""} className={field}/></label>
    <button type="submit" className="btn-gold min-h-11" disabled={run.isPending}><Target className="h-4 w-4"/>Guardar sprint</button>
    {s.week&&<p className="text-xs text-muted-foreground">Semana del {s.week}. Se guarda junto a tu estado de Rise con control de versión.</p>}
   </form>}
  </SectionCard>
  <SectionCard eyebrow="Idea Vault" title={`${list.length} ideas`} accent="var(--projects)">
   <form className="space-y-3" onSubmit={submitIdea}>
    <label className={lab}>Idea<input name="title" required maxLength={140} className={field}/></label>
    <label className={lab}>Nota<textarea name="note" rows={2} maxLength={1500} className={field+" py-2"}/></label>
    <div className="flex flex-wrap items-end gap-3">
     <label className={lab}>Enfriamiento<select name="coolingHours" defaultValue="48" className={field}><option value="48">48 horas</option><option value="72">72 horas</option></select></label>
     <button type="submit" className="btn-ghost min-h-11" disabled={run.isPending}><Lightbulb className="h-4 w-4"/>Guardar en Vault</button>
    </div>
    <p className="text-xs text-muted-foreground">Una idea no es un compromiso: pasa por enfriamiento antes de convertirse en proyecto. {slot?`Slot libre: ${slot}.`:"Sin slots libres (máx. 2 activos)."}</p>
   </form>
   {ideas.error&&<p role="alert" className="mt-3 text-sm text-gym">No se pudo cargar Idea Vault.</p>}
   <ul className="mt-3 divide-y divide-hairline">{list.map(i=>{const st=ideaState(i);const pending=promotionPending(i,projects);return <li key={i.id} className="space-y-1 py-3 text-sm">
    <div className="flex flex-wrap items-center justify-between gap-2"><strong className="break-words">{i.title}</strong><span className="text-xs text-gold">{LABEL[st]}</span></div>
    <p className="text-xs text-muted-foreground">Capturada {i.date||"—"}{st==="cooling"&&i.coolingUntil?` · revisión desde ${new Date(i.coolingUntil).toLocaleString("es-ES",{dateStyle:"medium",timeStyle:"short"})}`:""}</p>
    {i.note&&<p className="whitespace-pre-wrap text-xs text-platinum/80">{i.note}</p>}
    {pending&&<button type="button" className="btn-gold min-h-9 px-3 text-xs" disabled={run.isPending} onClick={()=>run.mutate(()=>promoteIdea(client,uid,i,projects))}>Completar promoción</button>}
    {!["promoted","archived"].includes(st)&&<div className="flex gap-2 pt-1">
     <button type="button" className="btn-ghost min-h-9 px-3 text-xs" disabled={run.isPending||!slot} onClick={()=>{run.reset();if(st==="cooling")setOverride(i);else run.mutate(()=>promoteIdea(client,uid,i,projects));}}><Rocket className="h-3.5 w-3.5"/>Promover{st==="cooling"?" · override":""}</button>
     <button type="button" className="btn-ghost min-h-9 px-3 text-xs" disabled={run.isPending} onClick={()=>run.mutate(()=>archiveIdea(client,uid,i))}><Archive className="h-3.5 w-3.5"/>Archivar</button>
    </div>}
    {override?.id===i.id&&<div role="group" aria-label="Confirmar override" className="mt-2 rounded-xl border border-gold/40 p-3 text-xs">
     <p>La idea sigue en enfriamiento. ¿Promoverla ahora a proyecto activo ({slot})?</p>
     <div className="mt-2 flex gap-2"><button type="button" className="btn-gold min-h-9 px-3" disabled={run.isPending} onClick={()=>run.mutate(()=>promoteIdea(client,uid,i,projects,{override:true}))}>Promover ahora</button><button type="button" className="btn-ghost min-h-9 px-3" onClick={()=>setOverride(null)}>Esperar</button></div>
    </div>}
   </li>;})}</ul>
   {(ideas.data||[]).some(i=>["promoted","archived"].includes(i.status))&&<label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={showClosed} onChange={e=>setShowClosed(e.target.checked)}/>Mostrar promovidas y archivadas</label>}
   {run.error&&<p role="alert" className="mt-3 text-sm text-gym">{msg(run.error)}</p>}
  </SectionCard>
 </div>;
}
