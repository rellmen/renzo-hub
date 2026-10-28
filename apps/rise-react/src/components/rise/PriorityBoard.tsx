import {useRef,useState,type FormEvent} from "react";
import {Link} from "@tanstack/react-router";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {AlertTriangle,Check,CheckCircle2,ChevronDown,Clock3,Plus,RefreshCw,Upload,X} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {loadWorkRecords} from "@/lib/work-records.mjs";
import {
 createPriorityTask,patchPriorityTask,persistProposal,sortPriorityTasks,normalizePriority,validatePriorityInput,
 reviewPriorityProposals,proposalBlockers,reopenStatusFor,riseToday,PriorityConflictError,WORK_LOAD_LIMIT,
 type PriorityInput,type PriorityTask,type ProposalReview,type Urgency,type DeadlineType,type Origin
} from "@/lib/priority-records.mjs";

const LEVELS:{id:Urgency;label:string;className:string}[]=[
 {id:"P0",label:"Emergencia",className:"text-red-300 border-red-500/40"},
 {id:"P1",label:"Alta",className:"text-amber-300 border-amber-500/40"},
 {id:"P2",label:"Media",className:"text-sky-300 border-sky-500/40"},
 {id:"P3",label:"Baja",className:"text-muted-foreground border-hairline"}
];
const STATUS_LABEL:Record<string,string>={Today:"Hoy","This Week":"Esta semana",Blocked:"Bloqueada",Waiting:"En espera",Backlog:"Pendiente",Completed:"Completada"};
const ORIGIN_LABEL:Record<Origin,string>={manual:"Manual",chatgpt:"ChatGPT",claude:"Claude"};
const fresh=():PriorityInput=>({title:"",urgency:"P2",dueDate:"",deadlineType:"interna",why:"",origin:"manual",
 sourceRef:"",evidenceSummary:"",evidenceCheckedAt:""});
const errorText=(e:unknown)=>e instanceof Error?e.message:"No se pudo guardar el cambio.";
const levelOf=(u:Urgency)=>LEVELS.find(x=>x.id===u)!;
const shortDate=(iso:string)=>iso?iso.slice(0,10):"";
function ensureOnline(){
 if(typeof navigator!=="undefined"&&navigator.onLine===false)throw Error("Sin conexión: no se ha guardado nada. Reintenta cuando vuelvas a tener red.");
}
function dateCaption(date:string,today:string){
 if(!date)return "Sin fecha";
 if(date<today)return "Vencida · "+date;
 if(date===today)return "Vence hoy";
 return date;
}
const input="h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground";
const label="grid gap-1 text-xs text-muted-foreground";

/** Edits a draft locally. Nothing is written until the parent's onSave succeeds; the draft survives errors. */
function Editor({initial,onSave,onCancel,busy,submitLabel="Guardar",conflict,onDiscardDraft}:{
 initial:PriorityInput;onSave:(v:PriorityInput)=>void;onCancel:()=>void;busy:boolean;submitLabel?:string;
 conflict?:PriorityTask|null;onDiscardDraft?:()=>void}){
 const [form,setForm]=useState<PriorityInput>({...fresh(),...initial});
 const [problem,setProblem]=useState("");
 const change=<K extends keyof PriorityInput>(key:K,value:PriorityInput[K])=>{setProblem("");setForm(v=>({...v,[key]:value,
  ...(["dueDate","deadlineType","sourceRef","evidenceSummary"].includes(key)&&value!==v[key]?{evidenceCheckedAt:""}:{})}));};
 const submit=(event:FormEvent)=>{
  event.preventDefault();
  try{validatePriorityInput(form);}catch(e){setProblem(errorText(e));return;}
  onSave(form);
 };
 const remote=conflict?{title:conflict.title,...normalizePriority(conflict)}:null;
 return <form onSubmit={submit} className="mt-3 grid gap-3 rounded-2xl border border-hairline bg-ink/40 p-3">
   {remote&&<div role="alert" className="space-y-2 rounded-xl border border-amber-500/40 p-3 text-xs text-amber-200">
     <p className="font-semibold">Esta tarea cambió en otro dispositivo. Tu borrador sigue aquí y no se ha guardado.</p>
     <p>Versión guardada ahora: «{remote.title}» · {remote.urgency} · {remote.dueDate||"sin fecha"} · {STATUS_LABEL[conflict!.status]||conflict!.status}
      {remote.why?" · "+remote.why:""}</p>
     <p>Puedes guardar tu borrador sobre esa versión o descartarlo.</p>
     {onDiscardDraft&&<button type="button" className="btn-ghost" onClick={onDiscardDraft}>Descartar mi borrador</button>}
   </div>}
   <label className={label}>Tarea
     <input autoFocus required maxLength={180} className={input} value={form.title} onChange={e=>change("title",e.target.value)}/>
   </label>
   <div className="grid gap-3 sm:grid-cols-2">
    <label className={label}>Prioridad
      <select className={input} value={form.urgency} onChange={e=>change("urgency",e.target.value as Urgency)}>
        {LEVELS.map(x=><option key={x.id} value={x.id}>{x.id} · {x.label}</option>)}
      </select>
    </label>
    <label className={label}>Fecha límite
      <input type="date" className={input} value={form.dueDate||""} onChange={e=>change("dueDate",e.target.value)}/>
    </label>
    <label className={label}>Tipo de fecha
      <select className={input} value={form.deadlineType} onChange={e=>change("deadlineType",e.target.value as DeadlineType)}>
        <option value="interna">Objetivo personal (interno)</option><option value="real">Plazo externo confirmado</option>
      </select>
    </label>
    <label className={label}>Origen declarado
      <select className={input} value={form.origin} onChange={e=>change("origin",e.target.value as Origin)}>
        <option value="manual">Manual</option><option value="chatgpt">ChatGPT</option><option value="claude">Claude</option>
      </select>
    </label>
   </div>
   <label className={label}>¿Por qué es importante? (obligatorio)
    <textarea required maxLength={400} rows={2} className="w-full rounded-xl border border-hairline bg-obsidian px-3 py-2 text-sm text-foreground"
      value={form.why||""} onChange={e=>change("why",e.target.value)}/>
   </label>
   {form.deadlineType==="real"&&<fieldset className="grid gap-2 rounded-xl border border-hairline p-3">
     <legend className="px-1 text-xs text-muted-foreground">Evidencia del plazo externo</legend>
     <label className={label}>Qué lo demuestra
      <textarea maxLength={500} rows={2} className="w-full rounded-xl border border-hairline bg-obsidian px-3 py-2 text-sm text-foreground"
        value={form.evidenceSummary||""} onChange={e=>change("evidenceSummary",e.target.value)}/>
     </label>
     <label className={label}>Referencia (texto o enlace https, opcional)
      <input maxLength={300} className={input} value={form.sourceRef||""} onChange={e=>change("sourceRef",e.target.value)}/>
     </label>
     <label className="flex items-center gap-2 text-xs text-platinum/85">
      <input type="checkbox" className="h-5 w-5" checked={!!form.evidenceCheckedAt}
        onChange={e=>change("evidenceCheckedAt",e.target.checked?new Date().toISOString():"")}/>
      He comprobado este plazo en la fuente{form.evidenceCheckedAt?" ("+shortDate(form.evidenceCheckedAt)+")":""}
     </label>
   </fieldset>}
   {problem&&<p role="alert" className="text-xs text-red-300">{problem}</p>}
   <div className="flex flex-wrap gap-2"><button className="btn-gold" type="submit" disabled={busy}>{conflict?"Guardar mi borrador sobre la versión nueva":submitLabel}</button>
      <button className="btn-ghost" type="button" onClick={onCancel}>Cancelar</button></div>
 </form>;
}

function ProposalCard({item,today,busy,blockers,onChange,onDiscard,onOpenExisting}:{item:ProposalReview;today:string;busy:boolean;blockers:string[];
 onChange:(next:ProposalReview)=>void;onDiscard:()=>void;onOpenExisting:(id:string)=>void}){
 const [editing,setEditing]=useState(false);
 const v=item.input,level=levelOf(v.urgency),saved=item.state==="saved";
 const locked=busy||saved;
 return <li className="space-y-2 rounded-xl border border-hairline p-3 text-xs">
   <div className="flex items-start gap-2">
    <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0" aria-label={"Incluir propuesta: "+v.title} checked={item.selected}
      disabled={locked} onChange={e=>onChange({...item,selected:e.target.checked})}/>
    <div className="min-w-0 flex-1 space-y-1">
     <p className="break-words text-sm font-semibold text-foreground">{v.title}</p>
     <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-platinum/80">
      <dt>Prioridad</dt><dd>{v.urgency} · {level.label}</dd>
      <dt>Fecha</dt><dd>{dateCaption(v.dueDate,today)}</dd>
      <dt>Tipo</dt><dd>{v.deadlineType==="real"?"Plazo externo":"Objetivo interno"}</dd>
      <dt>Motivo</dt><dd className="break-words">{v.why||<em className="text-red-300">Falta</em>}</dd>
      <dt>Origen</dt><dd>{ORIGIN_LABEL[v.origin]} (declarado, no verificado)</dd>
      {v.proposalId&&<><dt>ID</dt><dd className="break-all">{v.proposalId}</dd></>}
      {v.sourceRef&&<><dt>Referencia</dt><dd className="break-all">{v.sourceRef}</dd></>}
      {v.evidenceSummary&&<><dt>Evidencia</dt><dd className="break-words">{v.evidenceSummary}</dd></>}
      <dt>Comprobado</dt><dd>{v.evidenceCheckedAt?"Sí, por ti ("+shortDate(v.evidenceCheckedAt)+")":"No"}</dd>
     </dl>
    </div>
   </div>
   {item.duplicateOf&&<p className="text-amber-300">
     {item.duplicateOf==="batch"?"Repetida dentro de esta propuesta.":<>Posible duplicado de «{item.duplicateOf.title}». La importación no la modifica.{" "}
      <button type="button" className="underline" onClick={()=>onOpenExisting((item.duplicateOf as PriorityTask).id)}>Abrir la existente</button></>}
   </p>}
   {item.warnings.map((w,i)=><p key={i} className="text-amber-300/90">⚠ {w}</p>)}
   {item.selected&&!saved&&blockers.map((b,i)=><p key={i} className="text-red-300">✕ {b}</p>)}
   {!v.dueDate&&!saved&&<label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" disabled={locked}
      checked={item.noDateConfirmed} onChange={e=>onChange({...item,noDateConfirmed:e.target.checked})}/>Guardar sin fecha</label>}
   {v.deadlineType==="real"&&!saved&&<button type="button" className="btn-ghost" disabled={locked}
      onClick={()=>onChange({...item,input:{...v,deadlineType:"interna",evidenceCheckedAt:""}})}>Convertir en objetivo interno</button>}
   {item.state==="saving"&&<p role="status">Guardando…</p>}
   {saved&&<p role="status" className="text-emerald-300">✓ Guardada y confirmada por el servidor.</p>}
   {item.state==="failed"&&<p role="alert" className="text-red-300">No guardada: {item.error}</p>}
   {!saved&&<div className="flex flex-wrap gap-2">
     <button type="button" className="btn-ghost" disabled={locked} onClick={()=>setEditing(x=>!x)}>Editar</button>
     <button type="button" className="btn-ghost" disabled={locked} onClick={onDiscard}><X className="h-3.5 w-3.5"/> Descartar</button>
   </div>}
   {editing&&<Editor initial={v} busy={busy} submitLabel="Aplicar a la propuesta" onCancel={()=>setEditing(false)}
     onSave={data=>{const next=validatePriorityInput(data,{requireWhy:false,allowUnverifiedReal:true});onChange({...item,input:next});setEditing(false);}}/>}
 </li>;
}

/** Remounts per account: drafts, proposals and editors never leak between users. */
export function PriorityBoard(){
 const {user}=useAuth();
 return <Board key={user?.id||"anon"}/>;
}
function Board(){
 const {user,client}=useAuth(),uid=user?.id||"",qc=useQueryClient();
 const canWrite=!!client&&!!uid;
 const key=["work-records",uid];
 const records=useQuery({queryKey:key,enabled:canWrite,queryFn:()=>loadWorkRecords(client!,uid),staleTime:20_000,refetchOnWindowFocus:true});
 const [adding,setAdding]=useState(false);
 const [editing,setEditing]=useState<string|null>(null);
 const [conflicts,setConflicts]=useState<Record<string,PriorityTask>>({});
 const [showAll,setShowAll]=useState(false);
 const [proposal,setProposal]=useState("");
 const [proposalError,setProposalError]=useState("");
 const [review,setReview]=useState<ProposalReview[]|null>(null);
 const [showImport,setShowImport]=useState(false);
 const [importing,setImporting]=useState(false);
 const importLock=useRef(false);
 const invalidate=()=>qc.invalidateQueries({queryKey:key});
 // networkMode "always": offline, TanStack would otherwise PAUSE the write silently and replay it later
 // without the user confirming again. Here it fails visibly and the draft stays for an explicit retry.
 const write=useMutation({networkMode:"always",mutationFn:async ({task,changes}:{task:PriorityTask;changes:Partial<PriorityInput>&{status?:string}})=>{
    if(!canWrite)throw Error("Inicia sesión para guardar cambios.");
    ensureOnline();return patchPriorityTask(client,uid,task,changes);},
   onSuccess:async(_saved,{task})=>{setConflicts(c=>{const n={...c};delete n[task.id];return n;});setEditing(null);await invalidate();},
   onError:async(e,{task})=>{if(e instanceof PriorityConflictError){setConflicts(c=>({...c,[task.id]:e.remote}));await invalidate();}}});
 const add=useMutation({networkMode:"always",mutationFn:(input:PriorityInput)=>{if(!canWrite)throw Error("Inicia sesión para guardar cambios.");
    ensureOnline();return createPriorityTask(client,uid,input);},
   onSuccess:async()=>{setAdding(false);await invalidate();}});
 const tasks=(records.data?.tasks||[]) as PriorityTask[];
 const truncated=tasks.length>=WORK_LOAD_LIMIT;
 const today=riseToday();
 const all=sortPriorityTasks(tasks,today);
 const active=all.filter(t=>t.status!=="Completed"),completed=all.length-active.length;
 const overdue=active.filter(t=>{const d=normalizePriority(t).dueDate;return d&&d<today;});
 const shown=showAll?all:active.slice(0,5);
 const progressPercent=all.length?Math.round(completed/all.length*100):0;
 const focus=active[0]||null;
 const focusPriority=focus?normalizePriority(focus):null;
 const busy=write.isPending||add.isPending||importing;
 const preview=()=>{try{
    const items=reviewPriorityProposals(proposal,all);
    setReview(items);setProposalError("");
  }catch(e){setReview(null);setProposalError(errorText(e));}};
 const updateItem=(id:string,next:ProposalReview)=>setReview(r=>r&&r.map(x=>x.id===id?next:x));
 const pending=(review||[]).filter(x=>x.selected&&x.state!=="saved");
 const blockersFor=(item:ProposalReview)=>proposalBlockers(item,{current:tasks,proposals:review||[]});
 const blocked=pending.filter(x=>blockersFor(x).length>0);
 const saveSelected=async()=>{
  // One run at a time (double click / double tap); each proposal keeps its UUID across retries.
  if(importLock.current||!canWrite||!review)return;
  importLock.current=true;setImporting(true);
  try{
   ensureOnline();
   for(const item of review.filter(x=>x.selected&&x.state!=="saved"&&blockersFor(x).length===0)){
    const attempted=item.attempted;
    setReview(r=>r&&r.map(x=>x.id===item.id?{...x,attempted:true,state:"saving",error:""}:x));
    try{
     await persistProposal(client,uid,{id:item.id,input:item.input,attempted});
     setReview(r=>r&&r.map(x=>x.id===item.id?{...x,state:"saved"}:x));
    }catch(e){
     setReview(r=>r&&r.map(x=>x.id===item.id?{...x,state:"failed",error:errorText(e)}:x));
    }
   }
  }catch(e){setProposalError(errorText(e));}
  finally{importLock.current=false;setImporting(false);await invalidate();}
 };
 const openExisting=(id:string)=>{setShowAll(true);setEditing(id);};
 const savedCount=(review||[]).filter(x=>x.state==="saved").length;
 const retrying=(review||[]).some(x=>x.state==="failed");
 return <section aria-label="RISE PRIORITY · tareas prioritarias" className="surface rim relative space-y-5 overflow-hidden p-4 sm:p-6">
   <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-48 w-64 rounded-full bg-gold/[0.055] blur-3xl"/>
   <header className="relative flex flex-wrap items-start justify-between gap-3">
     <div className="min-w-0">
       <p className="eyebrow mb-2 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold"/>RISE PRIORITY · TU ENFOQUE</p>
       <h2 className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">Mis prioridades<span className="text-gold">.</span></h2>
       <p className="mt-2 max-w-xl text-sm leading-relaxed text-platinum/75">Lo importante primero. Cada tarea completada te acerca a un objetivo.</p>
     </div>
     <button type="button" className="btn-ghost min-h-11" aria-label="Actualizar prioridades"
       disabled={records.isFetching||!canWrite} onClick={()=>void records.refetch()}><RefreshCw className={"h-4 w-4 "+(records.isFetching?"animate-spin":"")}/> Actualizar</button>
   </header>
   {records.data&&<div className="relative rounded-2xl border border-hairline bg-raised/60 p-4 sm:p-5" aria-label="Resumen de progreso de tareas">
     <div className="flex flex-wrap items-end justify-between gap-3">
       <div>
         <p className="eyebrow mb-1">Tu progreso</p>
         <p className="font-display text-3xl tabular-nums text-foreground">{completed}<span className="px-1 text-xl text-muted-foreground">/</span>{all.length}<span className="ml-2 text-sm font-sans font-normal text-muted-foreground">completadas</span></p>
       </div>
       <p className="font-display text-3xl tabular-nums text-gold" aria-label={progressPercent+" por ciento completado"}>{progressPercent}%</p>
     </div>
     <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-foreground/10" role="progressbar" aria-label="Progreso de prioridades"
       aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}>
       <div className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold transition-[width] duration-300" style={{width:progressPercent+"%"}}/>
     </div>
     <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
       <span>{active.length} pendientes</span>
       <span>{completed} completadas</span>
       {overdue.length>0&&<span className="inline-flex items-center gap-1 font-medium text-red-300"><AlertTriangle className="h-3.5 w-3.5"/>{overdue.length} vencidas</span>}
     </div>
   </div>}
   {records.data&&focus&&focusPriority&&<div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/[0.085] via-raised/65 to-transparent p-4 sm:p-5">
     <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gold/70"/>
     <div className="flex flex-wrap items-start justify-between gap-3">
       <div className="min-w-0 flex-1">
         <p className="eyebrow mb-2 text-gold">Tu siguiente acción</p>
         <p className="break-words font-display text-xl text-foreground sm:text-2xl">{focus.title}</p>
         {focusPriority.why&&<p className="mt-2 max-w-2xl text-sm leading-relaxed text-platinum/75">{focusPriority.why}</p>}
       </div>
       <div className="shrink-0 space-y-2 text-right">
         <span className={"inline-block rounded-lg border px-2.5 py-1 text-xs font-semibold "+levelOf(focusPriority.urgency).className}>
           {focusPriority.urgency} · {levelOf(focusPriority.urgency).label}
         </span>
         <p className={"flex items-center justify-end gap-1 text-xs "+(focusPriority.dueDate&&focusPriority.dueDate<today?"text-red-300":"text-muted-foreground")}>
           <Clock3 className="h-3.5 w-3.5"/>{dateCaption(focusPriority.dueDate,today)}
         </p>
       </div>
     </div>
     <p className="mt-4 text-[11px] text-muted-foreground">Primera de la lista según prioridad y vencimiento. Márcala abajo cuando realmente la termines.</p>
   </div>}
   {truncated&&<p role="note" className="rounded-xl border border-amber-500/40 p-3 text-xs text-amber-200">
     Se muestran las {WORK_LOAD_LIMIT} tareas modificadas más recientemente. Los contadores se refieren solo a ellas; las más antiguas siguen en Work.</p>}
   {!canWrite&&<p className="text-sm text-muted-foreground">Inicia sesión para administrar tus tareas.</p>}
   {records.isLoading&&<p role="status" className="text-sm text-muted-foreground">Cargando tareas guardadas…</p>}
   {records.error&&<p role="alert" className="text-sm text-red-300">No se pudieron recuperar las tareas: {errorText(records.error)}</p>}
   {write.error&&!(write.error instanceof PriorityConflictError&&editing)&&<p role="alert" className="text-sm text-red-300">{errorText(write.error)}</p>}
   {records.data&&active.length===0&&<p className="rounded-xl border border-dashed border-hairline p-4 text-sm text-muted-foreground">
     No hay tareas pendientes. Añade una o usa las que ya tienes en Proyectos.</p>}
   {records.data&&active.length>0&&<div className="flex flex-wrap items-center justify-between gap-2 pt-1">
     <div><p className="eyebrow mb-1">ORDEN DE EJECUCIÓN</p><h3 className="text-sm font-semibold text-foreground">Tu checklist</h3></div>
     <span className="text-xs text-muted-foreground">Mostrando {shown.length} de {all.length}</span>
   </div>}
   <ul className="space-y-2">
    {shown.map(t=>{
      const p=normalizePriority(t),level=levelOf(p.urgency);
      const isDone=t.status==="Completed";
      return <li key={t.id} className={"group relative overflow-hidden rounded-2xl border border-hairline bg-raised/45 p-3 transition-colors hover:border-gold/30 sm:p-4 "+(isDone?"opacity-70":"")}>
        <span aria-hidden="true" className={"absolute inset-y-0 left-0 w-[3px] "+(isDone?"bg-emerald-400/60":p.urgency==="P0"?"bg-red-400":p.urgency==="P1"?"bg-amber-400":p.urgency==="P2"?"bg-sky-400":"bg-muted-foreground/50")}/>
        <div className="flex items-start gap-3">
          <input type="checkbox" aria-label={(isDone?"Reabrir: ":"Completar: ")+t.title} checked={isDone}
            disabled={busy||!canWrite} onChange={e=>write.mutate({task:t,changes:{status:e.target.checked?"Completed":reopenStatusFor(t)}})}
            className="mt-1 h-6 w-6 shrink-0 accent-emerald-500"/>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={"rounded-lg border px-2 py-0.5 text-[11px] font-bold "+level.className}>{p.urgency} · {level.label}</span>
              <span className={"inline-flex items-center gap-1 text-xs "+(p.dueDate&&p.dueDate<today&&!isDone?"text-red-300":"text-muted-foreground")}>
                <Clock3 className="h-3 w-3"/>{dateCaption(p.dueDate,today)}{p.dueDate?" · "+(p.deadlineType==="real"?"externa":"interna"):""}</span>
              {!isDone&&<span className="text-xs text-muted-foreground">{STATUS_LABEL[t.status]||t.status}</span>}
            </div>
            <p className={"break-words text-sm font-semibold "+(isDone?"line-through text-muted-foreground":"text-foreground")}>{t.title}</p>
            {p.why?<p className="mt-1 break-words text-xs text-platinum/70">{p.why}</p>
              :<p className="mt-1 text-xs italic text-muted-foreground">Motivo pendiente de definir</p>}
            {p.deadlineType==="real"&&<p className={"mt-1 text-[11px] "+(p.evidenceCheckedAt?"text-muted-foreground":"text-amber-300")}>
              {p.evidenceCheckedAt?"Plazo externo comprobado el "+shortDate(p.evidenceCheckedAt)+(p.evidenceSummary?" · "+p.evidenceSummary:""):"Plazo externo sin evidencia comprobada"}</p>}
            {p.origin!=="manual"&&<p className="mt-1 text-[11px] text-muted-foreground">Propuesta de {ORIGIN_LABEL[p.origin]} (origen declarado)</p>}
            {isDone&&<p className="mt-1 text-[11px] text-muted-foreground">Al reabrirla vuelve a «{STATUS_LABEL[reopenStatusFor(t)]}».</p>}
          </div>
          <button type="button" disabled={busy||!canWrite} onClick={()=>setEditing(editing===t.id?null:t.id)}
           className="min-h-11 shrink-0 rounded-xl border border-hairline px-3 py-2 text-xs text-platinum/80 hover:border-gold/40 hover:text-foreground">Editar</button>
        </div>
        {editing===t.id&&<Editor key={t.id} busy={busy} conflict={conflicts[t.id]||null}
          initial={{title:t.title,...p}}
          onCancel={()=>{setEditing(null);setConflicts(c=>{const n={...c};delete n[t.id];return n;});}}
          onDiscardDraft={()=>{setEditing(null);setConflicts(c=>{const n={...c};delete n[t.id];return n;});}}
          onSave={data=>write.mutate({task:conflicts[t.id]||t,changes:data})}/>}
      </li>;
    })}
   </ul>
   {(completed>0||active.length>5)&&<button type="button" className="btn-ghost" onClick={()=>setShowAll(x=>!x)}>
    <ChevronDown className="h-4 w-4"/>{showAll?"Mostrar solo pendientes principales":"Ver todas, incluidas completadas"}</button>}
   <div className="flex flex-wrap gap-2">
     <button type="button" className="btn-gold" disabled={busy||!canWrite} onClick={()=>setAdding(v=>!v)}><Plus className="h-4 w-4"/> Nueva tarea</button>
     <button type="button" className="btn-ghost" disabled={busy||!canWrite} onClick={()=>setShowImport(v=>!v)}><Upload className="h-4 w-4"/> Importar propuesta</button>
     <Link to="/proyectos" className="btn-ghost">Abrir proyectos</Link>
   </div>
   {add.error&&<p role="alert" className="text-sm text-red-300">{errorText(add.error)} Tu borrador sigue abierto.</p>}
   {adding&&<Editor initial={fresh()} busy={busy} onCancel={()=>setAdding(false)} onSave={data=>add.mutate(data)}/>}
   {showImport&&<div className="space-y-3 rounded-2xl border border-hairline bg-raised p-4">
     <p className="text-sm font-semibold">Propuestas de ChatGPT o Claude</p>
     <p className="text-xs leading-relaxed text-muted-foreground">Pega JSON con una propiedad tasks (máximo 10). Revisarlo no guarda nada:
      eliges, editas o descartas cada tarea y solo se guardan las que confirmes. Una coincidencia con una tarea existente nunca la modifica.
      No pegues conversaciones privadas completas ni contraseñas.</p>
     <textarea aria-label="JSON de tareas sugeridas" rows={4} maxLength={15000} value={proposal} disabled={importing}
       onChange={e=>{setProposal(e.target.value);setReview(null);setProposalError("");}}
       placeholder='{"tasks":[{"title":"Practicar JOIN en SQL","urgency":"P2","dueDate":"2026-11-08","deadlineType":"interna","why":"Preparar entrevistas","origin":"chatgpt"}]}'
       className="w-full rounded-xl border border-hairline bg-obsidian p-3 font-mono text-xs text-foreground"/>
     <button type="button" className="btn-ghost" disabled={!proposal.trim()||busy} onClick={preview}>Revisar propuestas</button>
     {proposalError&&<p role="alert" className="text-xs text-amber-300">{proposalError}</p>}
     {review&&review.length>0&&<div className="space-y-3">
       <p className="text-xs text-platinum/75">{review.length} propuestas · {pending.length} seleccionadas pendientes · {savedCount} guardadas</p>
       <ul className="space-y-2">{review.map(item=><ProposalCard key={item.id} item={item} today={today} busy={busy} blockers={blockersFor(item)}
          onChange={next=>updateItem(item.id,next)} onDiscard={()=>setReview(r=>r&&r.filter(x=>x.id!==item.id))}
          onOpenExisting={openExisting}/>)}</ul>
       {blocked.length>0&&<p role="alert" className="text-xs text-red-300">Resuelve los avisos marcados con ✕ o desmarca esas propuestas para continuar.</p>}
       <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-gold" disabled={busy||!canWrite||pending.length===0||blocked.length>0} onClick={()=>void saveSelected()}>
          <Check className="h-4 w-4"/> {retrying?`Reintentar pendientes (${pending.length})`:`Aprobar y guardar ${pending.length}`}</button>
        <button type="button" className="btn-ghost" disabled={importing} onClick={()=>{setReview(null);setProposal("");setShowImport(false);}}>
          {savedCount>0?"Cerrar":"Cancelar sin guardar"}</button>
       </div>
     </div>}
     {review&&review.length===0&&<p className="text-xs text-muted-foreground">Has descartado todas las propuestas. No se ha guardado nada.</p>}
   </div>}
   <footer className="flex items-start gap-2 border-t border-hairline pt-3 text-xs text-muted-foreground">
     <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0"/> Los cambios hechos aquí se guardan en los mismos registros privados de Work.
     ChatGPT y Claude no leen ni escriben esta lista automáticamente; pueden proponerte cambios para revisar.
   </footer>
 </section>;
}
