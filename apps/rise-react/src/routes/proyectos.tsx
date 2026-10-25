import {createFileRoute} from "@tanstack/react-router";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useState,type DragEvent,type FormEvent} from "react";
import {GripVertical,Plus,RefreshCw} from "lucide-react";
import img from "@/assets/projects.jpg";
import {pageHead} from "@/lib/seo";
import {PageHero} from "@/components/rise/PageHero";
import {SectionCard} from "@/components/rise/primitives";
import {ProgressRing} from "@/components/rise/ProgressRing";
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from "@/components/ui/dialog";
import {useAuth} from "@/lib/auth/AuthProvider";
import {WorkPlanning} from "@/components/rise/WorkPlanning";
import {
  WORK_STATUSES,WORK_PRIORITIES,loadWorkRecords,createWorkTask,
  updateWorkTaskStatus,statusColumn,columnTargetStatus,
  type WorkTask,type WorkStatus,type WorkPriority,type WorkColumn
} from "@/lib/work-records.mjs";

export const Route=createFileRoute("/proyectos")({
  head:()=>pageHead("Proyectos","Tus proyectos y tareas reales, sincronizados con tu espacio privado de Rise."),
  component:Projects
});

const COLUMNS:{id:WorkColumn;label:string;help:string}[]=[
  {id:"todo",label:"Por planificar",help:"Backlog, esta semana y en espera"},
  {id:"doing",label:"En curso",help:"Hoy y tareas bloqueadas"},
  {id:"done",label:"Completado",help:"Tareas terminadas"}
];
function humanError(error:unknown){return error instanceof Error?error.message:"La operación no se pudo completar."; }

function Projects(){
  const {user,client}=useAuth();
  const uid=user?.id||"";
  const qc=useQueryClient();
  const [createOpen,setCreateOpen]=useState(false);
  const [over,setOver]=useState<WorkColumn|null>(null);
  const [form,setForm]=useState<{title:string;status:WorkStatus;priority:WorkPriority;project:string}>({
    title:"",status:"Backlog",priority:"Normal",project:""
  });
  const key=["work-records",uid];
  const records=useQuery({
    queryKey:key,enabled:!!client&&!!uid,
    queryFn:()=>loadWorkRecords(client!,uid),
    staleTime:20_000,refetchOnWindowFocus:true
  });
  const saveStatus=useMutation({
    mutationFn:({task,status}:{task:WorkTask;status:WorkStatus})=>updateWorkTaskStatus(client!,uid,task,status),
    onSuccess:()=>qc.invalidateQueries({queryKey:key})
  });
  const add=useMutation({
    mutationFn:()=>createWorkTask(client!,uid,form),
    onSuccess:async()=>{
      await qc.invalidateQueries({queryKey:key});
      setForm({title:"",status:"Backlog",priority:"Normal",project:""});
      setCreateOpen(false);
    }
  });
  const tasks=records.data?.tasks||[];
  const projects=records.data?.projects||[];
  const done=tasks.filter(t=>t.status==="Completed").length;
  const percent=tasks.length?Math.round(done/tasks.length*100):0;
  const onDrop=(e:DragEvent<HTMLElement>,column:WorkColumn)=>{
    e.preventDefault();
    setOver(null);
    const id=e.dataTransfer.getData("text/plain");
    const task=tasks.find(t=>t.id===id);
    if(task)saveStatus.mutate({task,status:columnTargetStatus(column)});
  };
  const submit=(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    if(!form.title.trim()||add.isPending)return;
    add.mutate();
  };
  return <div className="space-y-6">
    <PageHero image={img} eyebrow="PROYECTOS / ESPACIO PRIVADO"
      title="Trabajo profundo." subtitle="Tus compromisos reales, sin cifras inventadas."
      color="var(--projects)" priority>
      <button type="button" className="btn-gold" disabled={add.isPending} onClick={()=>setCreateOpen(true)}>
        <Plus className="h-4 w-4"/> Nueva tarea
      </button>
    </PageHero>

    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-platinum/75">Conectado a los registros de tu cuenta. Los cambios se guardan en Supabase.</p>
      <button type="button" className="btn-ghost" onClick={()=>void records.refetch()} disabled={records.isFetching}>
        <RefreshCw className={"h-4 w-4 "+(records.isFetching?"animate-spin":"")}/>
        Actualizar
      </button>
    </div>
    {records.isLoading&&<p role="status" className="surface p-6">Cargando tus tareas y proyectos…</p>}
    {records.error&&<p role="alert" className="surface border border-gym/40 p-5 text-sm text-gym">No se pudieron cargar tus tareas: {humanError(records.error)}. No se mostrará información de ejemplo.</p>}
    {saveStatus.error&&<p role="alert" className="surface border border-gym/40 p-4 text-gym">{humanError(saveStatus.error)}. Recarga antes de volver a intentarlo.</p>}

    {!records.isLoading&&!records.error&&<>
      <section aria-label="Resumen de tareas" className="grid gap-3 sm:grid-cols-[auto_repeat(3,minmax(0,1fr))]">
        <div className="surface rim flex items-center gap-4 p-5">
          <ProgressRing value={percent} size={65} stroke={5} color="var(--projects)"/>
          <div><p className="text-sm font-semibold">Progreso</p><p className="text-xs text-muted-foreground">{done} de {tasks.length}</p></div>
        </div>
        {COLUMNS.map(c=><div key={c.id} className="surface rim flex items-center justify-between gap-4 p-5">
          <span className="text-xs text-muted-foreground">{c.label}</span>
          <span className="font-display text-4xl">{tasks.filter(t=>statusColumn(t.status)===c.id).length}</span>
        </div>)}
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map(c=><section key={c.id} aria-label={c.label}
          onDragOver={e=>{e.preventDefault();setOver(c.id);}}
          onDragLeave={()=>setOver(null)}
          onDrop={e=>onDrop(e,c.id)}
          className={"surface min-h-64 p-4 transition "+(over===c.id?"ring-1 ring-projects/60":"")}>
          <header className="mb-4 space-y-1 px-1">
            <div className="flex items-center justify-between"><h2 className="eyebrow text-projects">{c.label}</h2>
              <span className="text-sm">{tasks.filter(t=>statusColumn(t.status)===c.id).length}</span></div>
            <p className="text-xs text-muted-foreground">{c.help}</p>
          </header>
          <ul className="space-y-3">
            {tasks.filter(t=>statusColumn(t.status)===c.id).map(t=><li key={t.id} draggable
              onDragStart={e=>e.dataTransfer.setData("text/plain",t.id)}
              className="rounded-2xl border border-hairline bg-raised p-4">
              <div className="flex gap-2"><GripVertical aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"/>
                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-sm font-semibold">{t.title}</h3>
                  <p className="mt-2 truncate text-xs text-muted-foreground">{t.project||"Sin proyecto"} · {t.priority}</p>
                  {t.blocker&&<p className="mt-2 text-xs text-gym">Bloqueo: {String(t.blocker)}</p>}
                  <label className="mt-3 block space-y-1 text-xs text-muted-foreground">Estado
                    <select aria-label={"Estado de "+t.title} className="h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground"
                      disabled={saveStatus.isPending}
                      value={t.status}
                      onChange={e=>saveStatus.mutate({task:t,status:e.target.value as WorkStatus})}>
                      {WORK_STATUSES.map(status=><option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            </li>)}
          </ul>
          {!tasks.some(t=>statusColumn(t.status)===c.id)&&<p className="rounded-xl border border-dashed border-hairline p-5 text-center text-sm text-muted-foreground">Sin tareas registradas</p>}
        </section>)}
      </div>
      <SectionCard eyebrow="Proyectos reales" title="Tus iniciativas">
        {projects.length?<ul className="grid gap-3 md:grid-cols-2">
          {projects.map(p=><li key={p.id} className="rounded-xl border border-hairline bg-raised p-4">
            <h3 className="font-medium">{p.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Estado: {String(p.status||"Sin indicar")} · {String(p.slot||"Sin slot")}</p>
          </li>)}
        </ul>:<p className="text-sm text-muted-foreground">Todavía no hay proyectos registrados en tu cuenta.</p>}
      </SectionCard>
    </>}

    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
      <DialogContent className="border-hairline bg-raised">
        <DialogHeader><DialogTitle className="font-display text-3xl">Nueva tarea</DialogTitle>
          {records.data&&<WorkPlanning projects={projects}/>}
    <DialogDescription>Se guardará en tus tareas reales de Rise.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <label className="block space-y-2 text-sm">Título
            <input required maxLength={180} autoFocus value={form.title}
              onChange={e=>setForm(f=>({...f,title:e.target.value}))}
              className="h-12 w-full rounded-xl border border-input bg-obsidian px-3"/>
          </label>
          <label className="block space-y-2 text-sm">Proyecto o relación
            <input maxLength={120} value={form.project}
              onChange={e=>setForm(f=>({...f,project:e.target.value}))}
              className="h-12 w-full rounded-xl border border-input bg-obsidian px-3"/>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-2 text-sm">Prioridad
              <select className="h-12 w-full rounded-xl border border-input bg-obsidian px-3"
                value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value as WorkPriority}))}>
                {WORK_PRIORITIES.map(p=><option key={p}>{p}</option>)}
              </select>
            </label>
            <label className="block space-y-2 text-sm">Estado
              <select className="h-12 w-full rounded-xl border border-input bg-obsidian px-3"
                value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value as WorkStatus}))}>
                {WORK_STATUSES.map(s=><option key={s}>{s}</option>)}
              </select>
            </label>
          </div>
          {add.error&&<p role="alert" className="text-sm text-gym">{humanError(add.error)}</p>}
          <button type="submit" disabled={add.isPending} className="btn-gold w-full">{add.isPending?"Guardando…":"Guardar tarea"}</button>
        </form>
      </DialogContent>
    </Dialog>
  </div>;
}
