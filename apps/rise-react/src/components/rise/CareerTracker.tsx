import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useEffect,useState,type FormEvent} from "react";
import {Archive,ArchiveRestore,Download,Paperclip,Pencil,Plus,Save} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {SectionCard} from "@/components/rise/primitives";
import {CAREER_KINDS,SKILL_AREAS,STATUS_LABEL,addCareerItem,archiveCareerItem,attachEvidence,careerSummary,downloadEvidence,loadCareer,updateCareerItem,type CareerKind,type CareerRow} from "@/lib/career-records.mjs";

const field="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground";
const lab="block text-xs text-muted-foreground";
const msg=(e:unknown,f:string)=>e instanceof Error?e.message:f;

function ItemForm({kind,row,busy,onSubmit,onCancel}:{kind:CareerKind;row?:CareerRow|null;busy:boolean;onSubmit:(v:Record<string,string>)=>void;onCancel:()=>void}){
 const p=row?.payload||{};
 const submit=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();onSubmit(Object.fromEntries(new FormData(e.currentTarget)) as Record<string,string>);};
 return <form className="mt-3 space-y-3 rounded-xl border border-hairline p-3" onSubmit={submit}>
  <label className={lab}>Título<input name="title" required maxLength={160} defaultValue={p.title||""} className={field}/></label>
  <div className="grid gap-3 sm:grid-cols-2">
   <label className={lab}>Estado<select name="status" defaultValue={p.status||CAREER_KINDS[kind].statuses[0]} className={field}>{CAREER_KINDS[kind].statuses.map(s=><option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></label>
   {kind==="skill"?<label className={lab}>Área<select name="area" defaultValue={p.area||"SQL"} className={field}>{SKILL_AREAS.map(a=><option key={a}>{a}</option>)}</select></label>
    :<label className={lab}>Área<input name="area" maxLength={40} defaultValue={p.area||""} placeholder="SQL, Power BI, Logística…" className={field}/></label>}
   {kind==="course"&&<label className={lab}>Proveedor<input name="provider" maxLength={120} defaultValue={p.provider||""} className={field}/></label>}
   {kind==="course"&&<label className={lab}>Completado el<input name="completedOn" type="date" defaultValue={p.completedOn||""} className={field}/></label>}
   {kind==="skill"&&<label className={lab}>Nivel (1-5, autoevaluado)<input name="level" type="number" min={1} max={5} step={1} required defaultValue={p.level||1} className={field}/></label>}
  </div>
  {kind==="project"&&<label className={lab}>Resultado / impacto medible<textarea name="outcome" maxLength={600} rows={2} defaultValue={p.outcome||""} className={field+" py-2"}/></label>}
  {kind==="project"&&<label className={lab}>Skills demostradas<input name="skills" maxLength={300} defaultValue={p.skills||""} className={field}/></label>}
  <label className={lab}>Enlace (https, opcional)<input name="url" type="url" defaultValue={p.url||""} className={field}/></label>
  <label className={lab}>Notas<textarea name="notes" maxLength={2000} rows={2} defaultValue={p.notes||""} className={field+" py-2"}/></label>
  <div className="flex gap-2"><button type="submit" className="btn-gold min-h-11" disabled={busy}><Save className="h-4 w-4"/>Guardar</button><button type="button" className="btn-ghost min-h-11" onClick={onCancel}>Cancelar</button></div>
 </form>;
}

export function CareerTracker(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const key=["career-items",uid];
 const q=useQuery({queryKey:key,enabled:!!client&&!!uid,queryFn:()=>loadCareer(client!,uid),staleTime:30000,refetchOnWindowFocus:true});
 const [adding,setAdding]=useState<CareerKind|null>(null);
 const [editing,setEditing]=useState<string|null>(null);
 const [showArchived,setShowArchived]=useState(false);
 useEffect(()=>{setAdding(null);setEditing(null);},[uid]);
 const run=useMutation({mutationFn:(op:()=>Promise<unknown>)=>op(),onSuccess:async()=>{setAdding(null);setEditing(null);await qc.invalidateQueries({queryKey:key});}});
 const save=async(blob:Blob,name:string)=>{const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 const rows=q.data||[];const s=careerSummary(rows);
 const visible=(kind:CareerKind)=>rows.filter(r=>r.payload?.kind===kind&&(showArchived||r.status!=="archived"));
 const section=(kind:CareerKind,title:string,accent:string)=><SectionCard key={kind} eyebrow={CAREER_KINDS[kind].label} title={title} accent={accent}
  action={<button type="button" className="btn-ghost min-h-9 px-3 text-xs" onClick={()=>{run.reset();setEditing(null);setAdding(adding===kind?null:kind);}}><Plus className="h-4 w-4"/>Añadir</button>}>
  {adding===kind&&<ItemForm kind={kind} busy={run.isPending} onCancel={()=>setAdding(null)} onSubmit={v=>run.mutate(()=>addCareerItem(client,uid,kind,v))}/>}
  {!visible(kind).length&&adding!==kind&&<p className="text-sm text-muted-foreground">Sin elementos registrados. Solo se muestra lo que añadas tú.</p>}
  <ul className="divide-y divide-hairline">{visible(kind).map(r=>{const p=r.payload||{};return <li key={r.id} className="space-y-1 py-3 text-sm">
   <div className="flex flex-wrap items-center justify-between gap-2"><strong className="break-words">{p.title}</strong><span className="text-xs text-gold">{STATUS_LABEL[r.status||""]||r.status}</span></div>
   <p className="text-xs text-muted-foreground">{[p.area,p.provider,p.level?"Nivel "+p.level+"/5":"",p.completedOn?"Completado "+p.completedOn:""].filter(Boolean).join(" · ")||"Sin detalles"}</p>
   {p.outcome&&<p className="whitespace-pre-wrap text-xs">{p.outcome}</p>}
   {p.url&&<a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold underline">Abrir enlace</a>}
   {Array.isArray(p.evidence)&&p.evidence.length>0&&<ul className="flex flex-wrap gap-2 pt-1">{p.evidence.map((e:any)=><li key={e.path}><button type="button" className="btn-ghost min-h-9 px-3 text-xs" onClick={()=>run.mutate(async()=>{const f=await downloadEvidence(client,uid,e);await save(f.blob,f.name);})}><Download className="h-3.5 w-3.5"/>{String(e.name).slice(0,40)}</button></li>)}</ul>}
   <div className="flex flex-wrap gap-2 pt-1">
    {r.status!=="archived"&&<button type="button" className="btn-ghost min-h-9 px-3 text-xs" onClick={()=>{run.reset();setAdding(null);setEditing(editing===r.id?null:r.id);}}><Pencil className="h-3.5 w-3.5"/>Editar</button>}
    {r.status!=="archived"&&<label className="btn-ghost min-h-9 cursor-pointer px-3 text-xs"><Paperclip className="h-3.5 w-3.5"/>Evidencia
     <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="sr-only" disabled={run.isPending}
      onChange={e=>{const file=e.target.files?.[0];e.target.value="";if(file)run.mutate(()=>attachEvidence(client,uid,r,file));}}/></label>}
    <button type="button" className="btn-ghost min-h-9 px-3 text-xs" disabled={run.isPending} onClick={()=>run.mutate(()=>archiveCareerItem(client,uid,r,r.status!=="archived"))}>
     {r.status==="archived"?<><ArchiveRestore className="h-3.5 w-3.5"/>Restaurar</>:<><Archive className="h-3.5 w-3.5"/>Archivar</>}</button>
   </div>
   {editing===r.id&&<ItemForm kind={kind} row={r} busy={run.isPending} onCancel={()=>setEditing(null)} onSubmit={v=>run.mutate(()=>updateCareerItem(client,uid,r,v))}/>}
  </li>;})}</ul>
 </SectionCard>;
 return <div className="space-y-5">
  {q.isLoading&&<p role="status" className="surface p-4 text-sm">Cargando formación, skills y portfolio…</p>}
  {q.error&&<p role="alert" className="surface border border-gym/40 p-4 text-sm text-gym">{msg(q.error,"No se pudo cargar Career.")}</p>}
  {run.error&&<p role="alert" className="surface border border-gym/40 p-4 text-sm text-gym">{msg(run.error,"No se pudo guardar.")}</p>}
  {q.data&&<>
   <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-platinum/75">
    <span>{s.courses.length} formaciones ({s.completed} completadas) · {s.skills.length} skills · {s.projects.length} casos de portfolio</span>
    {s.archived>0&&<label className="flex items-center gap-2"><input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)}/>Mostrar archivados ({s.archived})</label>}
   </div>
   <div className="grid gap-5 lg:grid-cols-2">
    {section("course","Formación y certificados","var(--learn)")}
    {section("skill","Skills de datos y operaciones","var(--gold)")}
   </div>
   {section("project","Portfolio con evidencias","var(--projects)")}
   <p className="text-xs text-muted-foreground">Las evidencias se guardan en tu carpeta privada (PDF o imagen, máx. 10 MB). Nada se publica ni se comparte automáticamente.</p>
  </>}
 </div>;
}
