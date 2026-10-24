import {createFileRoute,Link} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {useMemo} from "react";
import {ArrowRight,BookOpen,CalendarClock,ChevronRight,Clock,GraduationCap,Languages,LineChart,Newspaper,Repeat} from "lucide-react";
import {pageHead} from "@/lib/seo";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PageHeader,SectionCard,Bar} from "@/components/rise/primitives";
import {loadLearningSnapshot} from "@/lib/selflearn-snapshot.mjs";
import {loadShiftState,shiftPreview} from "@/lib/shift-state.mjs";
import {backendEnvironmentForHost} from "@/lib/nocturne-environment.mjs";
import {CATALOG,courseTitle,lessonMeta} from "@/lib/academy/content";
import {academyEnvironmentAllowed,courseProgress,todayPlan} from "@/lib/academy/engine.mjs";
import {AcademyBackendMissing,loadAcademyState} from "@/lib/academy/records.mjs";
import {academyToday,localDay,nextStep,reviewQueue,studySlot,weeklyMinutes} from "@/lib/academy-today.mjs";

export const Route=createFileRoute("/academy")({
  head:()=>pageHead("Academy","Todo lo que estudias en un sitio: UOC +25, idiomas, data y lecturas."),
  component:Academy,
});

const shortDay=(d:string)=>new Date(d+"T12:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short"});
const SHIFT_LABEL:Record<string,string>={"Morning Shift":"Turno de mañana","Evening Shift":"Turno de tarde","Vacation":"Libre / vacaciones"};
const lessonInfo=(id:string)=>{const m=lessonMeta(id);return m?{title:m.title,course_title:m.course_title}:null;};
const lessonMinutes=(id:string)=>Number(lessonMeta(id)?.estimated_minutes)||0;

/** Academy · Hoy. Lee UOC +25, Idiomas y Turnos sin mover sus datos: cada uno sigue en sus tablas. */
function Academy(){
  const {client,user}=useAuth();
  const uid=user?.id||"";
  const hostEnv=typeof window==="undefined"?null:backendEnvironmentForHost(window.location.hostname);
  const uocAllowed=academyEnvironmentAllowed({hostEnvironment:hostEnv,releaseTarget:import.meta.env["VITE_NOCTURNE_RELEASE_TARGET"]||"",flag:import.meta.env["VITE_ENABLE_ACADEMY"]==="true"});
  // Mismas claves de caché que Inicio, Idiomas, UOC +25 y Turnos: abrir Academy no duplica consultas.
  const learning=useQuery({queryKey:["selflearn-snapshot",uid],enabled:!!client&&!!uid,
    queryFn:()=>loadLearningSnapshot(client!,uid),staleTime:60_000});
  const uoc=useQuery({queryKey:["academy-state",uid],enabled:uocAllowed&&!!client&&!!uid,queryFn:()=>loadAcademyState(client!,uid),
    staleTime:15_000,retry:(n,e)=>!(e instanceof AcademyBackendMissing)&&n<2});
  const shifts=useQuery({queryKey:["shift-state",uid],enabled:!!client&&!!uid,queryFn:()=>loadShiftState(client!,uid),staleTime:60_000});
  const plan=useMemo(()=>uoc.data?todayPlan(CATALOG,{progressRows:uoc.data.progress,reviews:uoc.data.reviews,attempts:uoc.data.attempts,prefs:uoc.data.prefs}):null,[uoc.data]);
  const progress=useMemo(()=>uoc.data?courseProgress(CATALOG,uoc.data.progress):[],[uoc.data]);
  const today=academyToday({learning:learning.data??null,uoc:plan});
  const uocDue=!uocAllowed?undefined:plan?plan.due:null;
  const queue=reviewQueue({learning:learning.data??null,uocDue,lessonInfo});
  const weekly=weeklyMinutes({entries:learning.data?.entries??null,mocks:uoc.data?.mocks??null,exams:uoc.data?.exams??null,
    progress:uoc.data?.progress??null,lessonMinutes,goal:uoc.data?.prefs?.weekly_minutes??null});
  const shift=shifts.data?shiftPreview(shifts.data,localDay()):undefined;
  const slot=studySlot(shift,uoc.data?.prefs?.session_minutes??null);
  const step=nextStep({queue,uocNext:plan?plan.next.map(n=>({...n,courseTitle:courseTitle(n.course)})):null,slot,weekly,uocOn:uocAllowed});
  const loading=learning.isLoading||(uocAllowed&&uoc.isLoading);

  return <div className="space-y-6">
    <PageHeader eyebrow="ACADEMY · HOY" title="Lo que toca estudiar"
      subtitle="UOC +25 primero hasta el examen de abril; idiomas, data y lecturas alrededor. Cada curso guarda su progreso donde siempre."/>

    <SectionCard eyebrow="Siguiente paso" title={loading?"Preparando tu día…":step.title} accent="var(--learn)">
      {!loading&&<>
        <p className="text-sm text-muted-foreground">{step.detail}{step.minutes?` · ≈${step.minutes} min`:""}</p>
        <p className="mt-2 text-sm">{step.reason}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link to={step.to} search={step.search} className="btn-gold min-h-11 px-5">Empezar <ArrowRight className="h-4 w-4"/></Link>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarClock className="h-4 w-4"/>
            {shift?SHIFT_LABEL[shift]||shift:"Turno"} · {slot.moment}{slot.work!==null?` · hueco ≈${slot.budget} min`:""}</span>
        </div>
        {shifts.error&&<p className="mt-2 text-xs text-muted-foreground">No se pudo leer Turnos: el paso no tiene en cuenta tu turno de hoy.</p>}
      </>}
    </SectionCard>

    <SectionCard eyebrow="Repasos de hoy" title={queue.total===null?(loading?"Consultando…":queue.items.length?`${queue.items.reduce((a,i)=>a+i.count,0)}+ por repasar`:"Datos incompletos"):queue.total===0?"Al día":`${queue.total} por repasar`} accent="var(--learn)">
      {!queue.items.length&&!loading&&<p className="text-sm text-muted-foreground">{queue.partial?"Sin repasos en las fuentes que respondieron.":"Nada pendiente en idiomas ni en UOC +25."}</p>}
      {queue.items.length>0&&<ul className="space-y-2">{queue.items.slice(0,8).map(i=><li key={i.id}>
        <Link to={i.to} search={i.search} className="flex min-h-11 items-center gap-3 rounded-2xl border border-hairline bg-foreground/[0.025] p-3 hover:border-learn/40">
          {i.source==="uoc"?<GraduationCap className="h-5 w-5 shrink-0 text-learn"/>:<Languages className="h-5 w-5 shrink-0 text-learn"/>}
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-foreground">{i.label}</span><span className="block truncate text-xs text-muted-foreground">{i.detail} · ≈{i.minutes} min</span></span>
          <ChevronRight className="h-4 w-4 shrink-0"/>
        </Link></li>)}</ul>}
      {queue.items.length>8&&<p className="mt-2 text-xs text-muted-foreground">Y {queue.items.length-8} más en UOC +25.</p>}
      {(learning.error||uoc.error)&&<p role="alert" className="mt-3 text-xs text-gym">Una de las fuentes no respondió: el total se muestra incompleto, no como cero.</p>}
    </SectionCard>

    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard eyebrow={`Esta semana · ${shortDay(weekly.start)} a ${shortDay(weekly.end)}`} title={weekly.total===null?"—":`${weekly.total} min${weekly.goal?` de ${weekly.goal}`:""}`} accent="var(--learn)">
        {weekly.pct!==null&&<Bar value={weekly.pct} color="var(--learn)"/>}
        <ul className="mt-4 space-y-2 text-sm">
          <MinRow label="Idiomas (tiempo real)" value={weekly.selflearn}/>
          {uocAllowed&&<MinRow label="Simulacros UOC (tiempo real)" value={weekly.uocTimed}/>}
          {uocAllowed&&<MinRow label="Lecciones UOC (estimado)" value={weekly.uocLessonsEstimate}/>}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground"><Clock className="mr-1 inline h-3 w-3"/>Las lecciones UOC cuentan su duración prevista porque la app no mide el tiempo de lectura.{!weekly.goal&&uocAllowed?" Fija tu objetivo semanal en UOC +25 → Mi plan.":""}</p>
      </SectionCard>
      <SectionCard eyebrow="Progreso" title="Cursos" accent="var(--learn)">
        <ul className="space-y-4">
          {progress.map(c=><li key={c.slug} className="space-y-2">
            <div className="flex items-baseline justify-between gap-2 text-sm"><span className="min-w-0 truncate">{c.title}</span><span className="tabular-nums text-muted-foreground">{c.done}/{c.total}</span></div>
            <Bar value={c.pct} color="var(--learn)"/>
          </li>)}
          {uocAllowed&&!progress.length&&!uoc.isLoading&&<li className="text-xs text-muted-foreground">Sin progreso de UOC +25 todavía.</li>}
          <ProgressRow label="Neerlandés · lecciones completadas" text={today.languages?String(today.languages.nlDone):"—"}/>
          <ProgressRow label="Inglés · lecciones completadas" text={today.languages?String(today.languages.enDone):"—"}/>
        </ul>
      </SectionCard>
    </div>

    <SectionCard eyebrow="Apartados" title="Todo lo que estudias" accent="var(--learn)">
      <ul className="grid gap-2 sm:grid-cols-2">
        <Shortcut to="/academia" icon={<GraduationCap className="h-5 w-5 text-learn"/>} title="UOC +25" text="Matemáticas, Física, Lengua, Comentario, Inglés"/>
        <Shortcut to="/aprender" icon={<Languages className="h-5 w-5 text-learn"/>} title="Idiomas" text="Neerlandés B2 · Inglés C1 · Inglés del examen UOC"/>
        <Shortcut to="/career" icon={<LineChart className="h-5 w-5 text-learn"/>} title="Data & Carrera" text="Power BI, SQL, Python y certificados"/>
        <Shortcut to="/news" icon={<Newspaper className="h-5 w-5 text-learn"/>} title="Biblioteca" text="News y lecturas guardadas"/>
      </ul>
    </SectionCard>
    <p className="text-xs text-muted-foreground"><Repeat className="mr-1 inline h-3 w-3"/>Los contadores salen de tus registros reales. Si una fuente falla se muestra «—». <BookOpen className="ml-1 inline h-3 w-3"/> El turno sale de Turnos.</p>
  </div>;
}

function MinRow({label,value}:{label:string;value:number|null}){
  return <li className="flex items-baseline justify-between gap-2"><span className="min-w-0 truncate text-muted-foreground">{label}</span><span className="shrink-0 tabular-nums">{value===null?"—":`${value} min`}</span></li>;
}
function ProgressRow({label,text}:{label:string;text:string}){
  return <li className="flex items-baseline justify-between gap-2 text-sm"><span className="min-w-0 truncate">{label}</span><span className="tabular-nums text-muted-foreground">{text}</span></li>;
}
function Shortcut({to,icon,title,text}:{to:"/aprender"|"/academia"|"/career"|"/news";icon:React.ReactNode;title:string;text:string}){
  return <li className="min-w-0"><Link to={to} className="flex min-h-14 min-w-0 items-center gap-3 rounded-2xl border border-hairline p-3 hover:border-learn/40">
    {icon}<span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-foreground">{title}</span><span className="block truncate text-xs text-muted-foreground">{text}</span></span><ChevronRight className="h-4 w-4 shrink-0"/>
  </Link></li>;
}
