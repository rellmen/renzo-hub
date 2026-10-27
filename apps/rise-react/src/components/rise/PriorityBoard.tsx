import {useState,type FormEvent} from "react";
import {Link} from "@tanstack/react-router";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {AlertTriangle,Check,CheckCircle2,ChevronDown,Clock3,Plus,RefreshCw,Upload} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {loadWorkRecords} from "@/lib/work-records.mjs";
import {
 createPriorityTask,patchPriorityTask,sortPriorityTasks,normalizePriority,
 parsePriorityProposal,uniquePriorityProposals,
 type PriorityInput,type PriorityTask,type Urgency
} from "@/lib/priority-records.mjs";

const LEVELS:{id:Urgency;label:string;className:string}[]=[
 {id:"P0",label:"Emergencia",className:"text-red-300 border-red-500/40"},
 {id:"P1",label:"Alta",className:"text-amber-300 border-amber-500/40"},
 {id:"P2",label:"Media",className:"text-sky-300 border-sky-500/40"},
 {id:"P3",label:"Baja",className:"text-muted-foreground border-hairline"}
];
const fresh=():PriorityInput=>({title:"",urgency:"P2",dueDate:"",deadlineType:"interna",why:"",origin:"manual"});
const errorText=(e:unknown)=>e instanceof Error?e.message:"No se pudo guardar el cambio.";
function dateCaption(date:string,today:string){
 if(!date)return "Sin fecha";
 if(date<today)return "Vencida · "+date;
 if(date===today)return "Vence hoy";
 return date;
}
function Editor({initial,onSave,onCancel,busy}:{initial:PriorityInput;onSave:(v:PriorityInput)=>void;onCancel:()=>void;busy:boolean}){
 const [form,setForm]=useState<PriorityInput>(initial);
 const change=<K extends keyof PriorityInput>(key:K,value:PriorityInput[K])=>setForm(v=>({...v,[key]:value}));
 const submit=(event:FormEvent)=>{event.preventDefault();onSave(form);};
 return <form onSubmit={submit} className="mt-3 grid gap-3 rounded-2xl border border-hairline bg-ink/40 p-3">
   <label className="grid gap-1 text-xs text-muted-foreground">Tarea
     <input required maxLength={180} className="h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground"
       value={form.title} onChange={e=>change("title",e.target.value)}/>
   </label>
   <div className="grid gap-3 sm:grid-cols-2">
    <label className="grid gap-1 text-xs text-muted-foreground">Prioridad
      <select className="h-11 rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground"
        value={form.urgency} onChange={e=>change("urgency",e.target.value as Urgency)}>
        {LEVELS.map(x=><option key={x.id} value={x.id}>{x.id} · {x.label}</option>)}
      </select>
    </label>
    <label className="grid gap-1 text-xs text-muted-foreground">Fecha límite
      <input type="date" className="h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground"
        value={form.dueDate||""} onChange={e=>change("dueDate",e.target.value)}/>
    </label>
    <label className="grid gap-1 text-xs text-muted-foreground">Tipo de fecha
      <select className="h-11 rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground"
        value={form.deadlineType} onChange={e=>change("deadlineType",e.target.value as "real"|"interna")}>
        <option value="interna">Objetivo personal</option><option value="real">Plazo externo confirmado</option>
      </select>
    </label>
    <label className="grid gap-1 text-xs text-muted-foreground">Origen
      <select className="h-11 rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground"
        value={form.origin} onChange={e=>change("origin",e.target.value as "manual"|"chatgpt"|"claude")}>
        <option value="manual">Manual</option><option value="chatgpt">ChatGPT</option><option value="claude">Claude</option>
      </select>
    </label>
   </div>
   <label className="grid gap-1 text-xs text-muted-foreground">¿Por qué es importante?
    <textarea maxLength={400} rows={2} className="w-full rounded-xl border border-hairline bg-obsidian px-3 py-2 text-sm text-foreground"
      value={form.why||""} onChange={e=>change("why",e.target.value)}/>
   </label>
   <div className="flex gap-2"><button className="btn-gold" type="submit" disabled={busy}>Guardar</button>
      <button className="btn-ghost" type="button" onClick={onCancel}>Cancelar</button></div>
 </form>;
}
export function PriorityBoard(){
 const {user,client}=useAuth(),uid=user?.id||"",qc=useQueryClient();
 const key=["work-records",uid];
 const records=useQuery({queryKey:key,enabled:!!client&&!!uid,queryFn:()=>loadWorkRecords(client!,uid),staleTime:20_000,refetchOnWindowFocus:true});
 const [adding,setAdding]=useState(false);
 const [editing,setEditing]=useState<string|null>(null);
 const [showAll,setShowAll]=useState(false);
 const [proposal,setProposal]=useState("");
 const [proposalError,setProposalError]=useState("");
 const [suggestions,setSuggestions]=useState<PriorityInput[]|null>(null);
 const [showImport,setShowImport]=useState(false);
 const invalidate=()=>qc.invalidateQueries({queryKey:key});
 const write=useMutation({mutationFn:async ({task,changes}:{task:PriorityTask;changes:Partial<PriorityInput>&{status?:string}})=>
    patchPriorityTask(client!,uid,task,changes),onSuccess:async()=>{await invalidate();setEditing(null);}});
 const add=useMutation({mutationFn:(input:PriorityInput)=>createPriorityTask(client!,uid,input),
   onSuccess:async()=>{await invalidate();setAdding(false);}});
 const accept=useMutation({mutationFn:async(proposed:PriorityInput[])=>{
   // Each suggestion is explicitly approved; no background assistant writes.
   for(const task of proposed)await createPriorityTask(client!,uid,task);
 },onSuccess:async()=>{await invalidate();setSuggestions(null);setProposal("");setShowImport(false);},onError:()=>void invalidate()});
 const all=sortPriorityTasks((records.data?.tasks||[]) as PriorityTask[]);
 const active=all.filter(t=>t.status!=="Completed"),completed=all.length-active.length;
 const now=new Date();
 const today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,"0"),String(now.getDate()).padStart(2,"0")].join("-");
 const overdue=active.filter(t=>normalizePriority(t).dueDate&&normalizePriority(t).dueDate<today);
 const shown=showAll?all:active.slice(0,5);
 const busy=write.isPending||add.isPending||accept.isPending;
 const preview=()=>{try{
    const parsed=parsePriorityProposal(proposal),unique=uniquePriorityProposals(parsed,all);
    setSuggestions(unique);setProposalError(unique.length?"": "Estas tareas ya figuran en RISE.");
  }catch(e){setSuggestions(null);setProposalError(errorText(e));}};
 return <section aria-label="RISE PRIORITY · tareas prioritarias" className="surface rim space-y-4 p-4 sm:p-6">
   <header className="flex flex-wrap items-start justify-between gap-3">
    <div><div className="eyebrow mb-1">RISE PRIORITY · EJECUCIÓN</div>
      <h2 className="font-display text-3xl text-foreground">Mis prioridades</h2>
      <p className="mt-1 text-sm text-platinum/75">Una lista. Fechas claras. Progreso guardado en tu cuenta.</p>
    </div>
    <button type="button" className="btn-ghost" aria-label="Actualizar prioridades"
      disabled={records.isFetching} onClick={()=>void records.refetch()}><RefreshCw className={"h-4 w-4 "+(records.isFetching?"animate-spin":"")}/> Actualizar</button>
   </header>
   <div className="flex flex-wrap gap-2 text-xs">
     <span className="rounded-xl border border-hairline bg-raised px-3 py-2">{active.length} pendientes</span>
     <span className="rounded-xl border border-hairline bg-raised px-3 py-2">{completed} completadas</span>
     {overdue.length>0&&<span className="flex items-center gap-1 rounded-xl border border-red-500/40 px-3 py-2 text-red-300"><AlertTriangle className="h-3.5 w-3.5"/>{overdue.length} vencidas</span>}
   </div>
   {!user&&<p className="text-sm text-muted-foreground">Inicia sesión para administrar tus tareas.</p>}
   {records.isLoading&&<p role="status" className="text-sm text-muted-foreground">Cargando tareas guardadas…</p>}
   {records.error&&<p role="alert" className="text-sm text-red-300">No se pudieron recuperar las tareas: {errorText(records.error)}</p>}
   {write.error&&<p role="alert" className="text-sm text-red-300">{errorText(write.error)}</p>}
   {add.error&&<p role="alert" className="text-sm text-red-300">{errorText(add.error)}</p>}
   {accept.error&&<p role="alert" className="text-sm text-red-300">Algunas propuestas podrían haberse guardado: actualiza antes de reintentar. {errorText(accept.error)}</p>}
   {!records.isLoading&&!records.error&&active.length===0&&<p className="rounded-xl border border-dashed border-hairline p-4 text-sm text-muted-foreground">
     No hay tareas pendientes. Añade una o usa las que ya tienes en Proyectos.</p>}
   <ul className="space-y-2">
    {shown.map(t=>{
      const p=normalizePriority(t),level=LEVELS.find(x=>x.id===p.urgency)!;
      const isDone=t.status==="Completed";
      return <li key={t.id} className="rounded-2xl border border-hairline bg-raised/50 p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <input type="checkbox" aria-label={"Marcar como "+(isDone?"pendiente":"completada")+": "+t.title} checked={isDone}
            disabled={busy} onChange={e=>write.mutate({task:t,changes:{status:e.target.checked?"Completed":"Today"}})}
            className="mt-1 h-6 w-6 shrink-0 accent-emerald-500"/>
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap gap-2">
              <span className={"rounded-lg border px-2 py-0.5 text-[11px] font-bold "+level.className}>{p.urgency} · {level.label}</span>
              {p.dueDate&&<span className={"inline-flex items-center gap-1 text-xs "+(p.dueDate<today&&!isDone?"text-red-300":"text-muted-foreground")}>
                <Clock3 className="h-3 w-3"/>{dateCaption(p.dueDate,today)} · {p.deadlineType==="real"?"externa":"interna"}</span>}
            </div>
            <p className={"break-words text-sm font-semibold "+(isDone?"line-through text-muted-foreground":"text-foreground")}>{t.title}</p>
            {p.why&&<p className="mt-1 text-xs text-platinum/70">{p.why}</p>}
            {p.origin!=="manual"&&<p className="mt-1 text-[11px] text-muted-foreground">Propuesta de {p.origin==="chatgpt"?"ChatGPT":"Claude"}</p>}
          </div>
          <button type="button" disabled={busy} onClick={()=>setEditing(editing===t.id?null:t.id)}
           className="rounded-xl border border-hairline px-3 py-2 text-xs text-platinum/80">Editar</button>
        </div>
        {editing===t.id&&<Editor key={t.id} busy={busy}
          initial={{title:t.title,...p}} onCancel={()=>setEditing(null)}
          onSave={data=>write.mutate({task:t,changes:data})}/>}
      </li>;
    })}
   </ul>
   {(completed>0||active.length>5)&&<button type="button" className="btn-ghost" onClick={()=>setShowAll(x=>!x)}>
    <ChevronDown className="h-4 w-4"/>{showAll?"Mostrar solo pendientes principales":"Ver todas, incluidas completadas"}</button>}
   <div className="flex flex-wrap gap-2">
     <button type="button" className="btn-gold" disabled={busy} onClick={()=>setAdding(v=>!v)}><Plus className="h-4 w-4"/> Nueva tarea</button>
     <button type="button" className="btn-ghost" disabled={busy} onClick={()=>setShowImport(v=>!v)}><Upload className="h-4 w-4"/> Importar propuesta</button>
     <Link to="/proyectos" className="btn-ghost">Abrir proyectos</Link>
   </div>
   {adding&&<Editor initial={fresh()} busy={busy} onCancel={()=>setAdding(false)} onSave={data=>add.mutate(data)}/>}
   {showImport&&<div className="space-y-3 rounded-2xl border border-hairline bg-raised p-4">
     <p className="text-sm font-semibold">Propuestas de ChatGPT o Claude</p>
     <p className="text-xs leading-relaxed text-muted-foreground">Pega JSON con una propiedad tasks (máximo 10). Nada se guarda hasta que revises y confirmes. No pegues conversaciones privadas completas ni contraseñas.</p>
     <textarea aria-label="JSON de tareas sugeridas" rows={4} maxLength={15000} value={proposal}
       onChange={e=>{setProposal(e.target.value);setSuggestions(null);setProposalError("");}}
       placeholder='{"tasks":[{"title":"Practicar JOIN en SQL","urgency":"P2","dueDate":"2026-11-08","deadlineType":"interna","why":"Preparar entrevistas","origin":"chatgpt"}]}'
       className="w-full rounded-xl border border-hairline bg-obsidian p-3 font-mono text-xs text-foreground"/>
     <button type="button" className="btn-ghost" disabled={!proposal.trim()||busy} onClick={preview}>Revisar propuestas</button>
     {proposalError&&<p role="alert" className="text-xs text-amber-300">{proposalError}</p>}
     {suggestions&&suggestions.length>0&&<div className="space-y-3">
       <p className="text-xs text-platinum/75">{suggestions.length} tareas nuevas para aprobar:</p>
       <ul className="space-y-1">{suggestions.map((s,i)=><li key={i} className="rounded-xl border border-hairline p-2 text-xs">
          <b>{s.urgency} · {s.title}</b>{s.dueDate?" · "+s.dueDate:""}{s.why&&<p className="mt-1 text-muted-foreground">{s.why}</p>}
       </li>)}</ul>
       <button type="button" className="btn-gold" disabled={busy} onClick={()=>accept.mutate(suggestions)}><Check className="h-4 w-4"/> Aprobar y guardar</button>
     </div>}
   </div>}
   <footer className="flex items-start gap-2 border-t border-hairline pt-3 text-xs text-muted-foreground">
     <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0"/> Los cambios hechos aquí se guardan en los mismos registros privados de Work.
     ChatGPT y Claude no leen ni escriben esta lista automáticamente; pueden proponerte cambios para revisar.
   </footer>
 </section>;
}
