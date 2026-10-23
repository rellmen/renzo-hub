import {useEffect,useMemo,useState} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {BookOpen,CalendarDays,CheckCircle2,ChevronLeft,ChevronRight,Clock3,Flag,LockKeyhole,RefreshCw,ShieldCheck,Target} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {SectionCard} from "@/components/rise/primitives";
import {BOSSES,CHAPTERS,FUTURE_STAGES,PATH_VERSION,localDate,pathMetrics,loadPathProgress,setPathTask,tasksForWeek,weekForDate,weekStart,type PathMission,type PathRow} from "@/lib/career-path.mjs";

function readableDate(day:string){
 return new Date(day+"T12:00:00Z").toLocaleDateString("es-ES",{timeZone:"UTC",weekday:"long",day:"numeric",month:"short"});
}
function errorText(e:unknown){return e instanceof Error?e.message:"No se pudo guardar. Inténtalo de nuevo.";}
function isChecked(rows:PathRow[],id:string){return rows.some(r=>r.payload?.taskId===id&&r.status==="completed");}
const phaseColor="var(--projects)";

export function CareerRoadmap(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const key=["career-path-progress",uid];
 const [today,setToday]=useState(()=>localDate());
 const [selectedWeek,setSelectedWeek]=useState(()=>weekForDate(localDate()));
 useEffect(()=>{
  const next=localDate();setToday(next);setSelectedWeek(weekForDate(next));
 },[uid]);
 const q=useQuery({queryKey:key,enabled:!!client&&!!uid,queryFn:()=>loadPathProgress(client!,uid),
  staleTime:15000,refetchOnWindowFocus:true});
 const rows=q.data||[];
 const currentWeek=weekForDate(today);
 const missions=useMemo(()=>tasksForWeek(selectedWeek),[selectedWeek]);
 const stats=pathMetrics(rows);
 const mutation=useMutation({mutationFn:({task,done}:{task:PathMission;done:boolean})=>{
  const oldRow=rows.find(r=>r.payload?.taskId===task.id);
  return setPathTask(client!,uid,task,done,oldRow);
 },onSuccess:()=>qc.invalidateQueries({queryKey:key})});
 const distinctDays=useMemo(()=>Array.from(new Set(missions.map(m=>m.day))),[missions]);
 const dayOfToday=missions.filter(m=>m.day===today);
 const chapterCompleted=(chapter:number)=>Array.from({length:4},(_,i)=>{
  const tasks=tasksForWeek(chapter*4+i);
  return tasks.every(t=>isChecked(rows,t.id));
 }).filter(Boolean).length;
 const isBeforeStart=today<"2026-10-26";
 const isAfterExams=today>"2027-04-17";
 const title="Semana "+String(selectedWeek+1).padStart(2,"0")+" / 24";
 const renderTask=(task:PathMission)=>{
  const done=isChecked(rows,task.id),future=task.day>today;
  return <li key={task.id} className="flex items-start gap-3 py-3">
   <input type="checkbox" checked={done} disabled={future||mutation.isPending||!q.data}
    aria-label={"Completar "+task.subject+": "+task.title+" ("+task.day+")"}
    onChange={e=>mutation.mutate({task,done:e.target.checked})}
    className="mt-1 h-4 w-4 shrink-0 accent-[var(--gold)]"/>
   <div className="min-w-0 flex-1">
    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
     <span className={"text-sm font-medium "+(done?"text-gold":"text-foreground")}>{task.subject} · {task.title}</span>
     {task.minutes>0&&<span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5"/>{task.minutes} min</span>}
    </div>
    <p className="mt-1 text-xs text-muted-foreground">{task.detail}</p>
    {future&&<span className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground"><LockKeyhole className="h-3 w-3"/>Disponible ese día</span>}
    {done&&<span className="mt-1 inline-flex items-center gap-1 text-[11px] text-gold"><CheckCircle2 className="h-3 w-3"/>Guardado en tu cuenta</span>}
   </div>
  </li>;
 };
 return <div className="space-y-5">
  <SectionCard eyebrow="DATA LAB · RUTA DEFINITIVA" title="Tu camino: operaciones → datos → IA" accent={phaseColor}>
   <p className="max-w-3xl text-sm text-platinum/80">Roadmap 2026–2032 · Una ruta profesional. Misiones concretas para preparar la prueba UOC +25, crear portfolio, llegar a Logistics Data Analyst y desarrollar sistemas de IA en Nodalys.</p>
   <div className="mt-4 grid gap-3 sm:grid-cols-3">
    <div className="rounded-xl border border-hairline bg-obsidian/40 p-4">
     <p className="text-xs text-muted-foreground">Misiones confirmadas</p>
     <strong className="mt-1 block font-display text-2xl text-foreground">{q.data?stats.done:"—"} <span className="text-sm text-muted-foreground">/ {stats.total}</span></strong>
    </div>
    <div className="rounded-xl border border-hairline bg-obsidian/40 p-4">
     <p className="text-xs text-muted-foreground">Semanas completadas</p>
     <strong className="mt-1 block font-display text-2xl text-foreground">{q.data?stats.completeWeeks:"—"} <span className="text-sm text-muted-foreground">/ 24</span></strong>
    </div>
    <div className="rounded-xl border border-hairline bg-obsidian/40 p-4">
     <p className="text-xs text-muted-foreground">Progreso de preparación</p>
     <strong className="mt-1 block font-display text-2xl text-gold">{q.data?stats.percent+"%":"—"}</strong>
    </div>
   </div>
   {q.data&&<div className="mt-4 h-2 overflow-hidden rounded-full bg-foreground/10" role="progressbar" aria-label="Progreso de la preparación UOC" aria-valuenow={stats.percent} aria-valuemin={0} aria-valuemax={100}>
    <div className="h-full rounded-full bg-gold transition-[width]" style={{width:stats.percent+"%"}}/>
   </div>}
   <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold"/>Progreso basado únicamente en casillas guardadas; no se inventan cursos aprobados, XP de Quest ni resultados de exámenes. Sin conexión entre datos de Nodalys y RISE HUB.</p>
  </SectionCard>

  <SectionCard eyebrow="MAPA DE AVENTURA · 24 SEMANAS" title="Seis capítulos hasta abril de 2027" accent="var(--gold)">
   <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
    {CHAPTERS.map((chapter,i)=>{
     const complete=chapterCompleted(i);
     const active=Math.floor(selectedWeek/4)===i;
     const future=i*4>currentWeek;
     return <button type="button" key={i} onClick={()=>{setSelectedWeek(i*4);mutation.reset();}}
      aria-current={active?"step":undefined} aria-label={"Capítulo "+(i+1)+": "+chapter.name+", "+complete+" de 4 semanas completadas"}
      className={"group rounded-xl border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold "+(active?"border-gold/60 bg-gold/10":"border-hairline bg-obsidian/30 hover:border-gold/30")}>
      <div className="flex items-center justify-between gap-2">
       <span className="text-xs font-semibold tracking-widest text-gold">CAP. {String(i+1).padStart(2,"0")}</span>
       {complete===4?<CheckCircle2 className="h-4 w-4 text-gold"/>:future?<LockKeyhole className="h-4 w-4 text-muted-foreground"/>:<Flag className="h-4 w-4 text-muted-foreground"/>}
      </div>
      <h3 className="mt-2 text-sm font-semibold">{chapter.name}</h3>
      <p className="mt-1 text-[11px] text-muted-foreground">{chapter.subtitle}</p>
      <p className="mt-2 text-xs text-platinum/75">{chapter.detail}</p>
      <div className="mt-3 flex gap-1.5" aria-label={complete+" de 4 semanas completas"}>
       {Array.from({length:4},(_,w)=>{
        const done=tasksForWeek(i*4+w).every(t=>isChecked(rows,t.id));
        return <span key={w} className={"h-1.5 flex-1 rounded-full "+(done?"bg-gold":"bg-foreground/15")}/>;
       })}
      </div>
     </button>;
    })}
   </div>
  </SectionCard>

  <SectionCard eyebrow="CHECKLIST DIARIO · PROGRESO PRIVADO" title={title} accent="var(--learn)"
   action={<div className="flex gap-1">
    <button type="button" disabled={selectedWeek===0} onClick={()=>{setSelectedWeek(w=>Math.max(0,w-1));mutation.reset();}} className="btn-ghost min-h-10 min-w-10 px-2" aria-label="Semana anterior"><ChevronLeft className="h-4 w-4"/></button>
    <button type="button" disabled={selectedWeek===23} onClick={()=>{setSelectedWeek(w=>Math.min(23,w+1));mutation.reset();}} className="btn-ghost min-h-10 min-w-10 px-2" aria-label="Semana siguiente"><ChevronRight className="h-4 w-4"/></button>
   </div>}>
   <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
    <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4"/>{readableDate(weekStart(selectedWeek))} – {readableDate(missions[missions.length-1].day)}</span>
    <span className="font-medium text-gold">{missions.filter(m=>isChecked(rows,m.id)).length}/{missions.length} misiones</span>
   </div>
   <p className="text-xs text-muted-foreground">Plan semanal: Matemáticas 4 h, Economía 3 h, Castellano 2 h, Comentario 1,5 h, Inglés 1,5 h, más 30 min de revisión dominical. Viernes libre; prioriza descanso con turnos.</p>
   {q.isLoading&&<p role="status" className="mt-3 text-sm">Recuperando el progreso privado…</p>}
   {q.error&&<p role="alert" className="mt-3 text-sm text-gym">No se pudo leer el progreso. No se permite marcar tareas sin cargar los datos.</p>}
   {mutation.error&&<p role="alert" className="mt-3 text-sm text-gym">{errorText(mutation.error)}</p>}
   {isBeforeStart&&<p className="mt-3 text-xs text-gold">Inicio de la preparación: lunes 26 de octubre de 2026. Puedes consultar todas las misiones sin marcarlas antes de su fecha.</p>}
   {isAfterExams&&<p className="mt-3 text-xs text-gold">El bloque de 24 semanas terminó. Conservamos su historial; el siguiente objetivo es el portfolio y la vía universitaria confirmada.</p>}
   {q.data&&<>
    {dayOfToday.length>0&&selectedWeek===currentWeek&&<div className="mt-4 rounded-xl border border-gold/40 bg-gold/5 px-3">
     <div className="flex items-center gap-2 border-b border-hairline py-3 text-xs font-semibold uppercase tracking-widest text-gold"><Target className="h-4 w-4"/>Misión de hoy · {readableDate(today)}</div>
     <ul className="divide-y divide-hairline">{dayOfToday.map(renderTask)}</ul>
    </div>}
    <div className="mt-3 space-y-2">
     {distinctDays.map(day=><div key={day} className="rounded-xl border border-hairline px-3">
      <h3 className="border-b border-hairline py-3 text-xs font-semibold capitalize text-platinum/80">{readableDate(day)} {day===today?"· Hoy":""}</h3>
      <ul className="divide-y divide-hairline">{missions.filter(m=>m.day===day).map(renderTask)}</ul>
     </div>)}
    </div>
    <p className="mt-3 text-xs text-muted-foreground">Las misiones duplicadas en «hoy» y en la semana representan una sola tarea; ambas leen el mismo registro. Puedes desmarcar una misión y el progreso se recalcula.</p>
    <button type="button" className="btn-ghost mt-3 min-h-10" disabled={q.isFetching} onClick={()=>void q.refetch()}><RefreshCw className={"h-4 w-4 "+(q.isFetching?"animate-spin":"")}/>Sincronizar progreso</button>
   </>}
  </SectionCard>

  <SectionCard eyebrow="BOSS LEVELS · EXÁMENES OFICIALES" title="Dos hitos que debes superar" accent="var(--gold)">
   <p className="text-xs text-muted-foreground">Estas misiones se marcan solo después de realizar realmente los exámenes. No significan que hayas aprobado.</p>
   <ul className="mt-3 divide-y divide-hairline">{BOSSES.map(renderTask)}</ul>
  </SectionCard>

  <SectionCard eyebrow="SIGUIENTE NIVEL · 2026–2032" title="Camino profesional completo" accent="var(--projects)">
   <ol className="space-y-0">
    {FUTURE_STAGES.map((stage,i)=><li key={stage.year} className="relative flex gap-4 pb-5 last:pb-0">
     {i<FUTURE_STAGES.length-1&&<div aria-hidden className="absolute bottom-0 left-4 top-8 w-px bg-hairline"/>}
     <div className={"relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs "+(i===0?"border-gold/60 bg-gold/10 text-gold":"border-hairline bg-raised text-muted-foreground")}>{i+1}</div>
     <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-baseline gap-2"><span className="text-xs font-semibold text-gold">{stage.year}</span><h3 className="text-sm font-semibold">{stage.name}</h3></div>
      <p className="mt-1 text-xs text-muted-foreground">{stage.detail}</p>
     </div>
    </li>)}
   </ol>
   <div className="mt-4 rounded-xl border border-hairline p-3 text-xs text-platinum/75">
    <p className="inline-flex items-center gap-2 font-medium"><BookOpen className="h-4 w-4 text-gold"/>Hitos decisivos</p>
    <p className="mt-2">10/04/2027: fase general · 17/04/2027: fase específica. Si apruebas, primera vía UOC Ingeniería Informática; si no, continuidad Open University Computer Science with AI (R88), verificando matrícula y costes.</p>
    <p className="mt-2">Diciembre 2026: confirmar por escrito el scope ASML. No tratar un salario comunicado ni una contratación futura como garantizados.</p>
   </div>
   <p className="mt-3 text-[11px] text-muted-foreground">Fuente interna: Roadmap definitivo, edición {PATH_VERSION}. Los hitos de 2028–2032 son objetivos, no logros acreditados ni fechas contractuales.</p>
  </SectionCard>
 </div>;
}
