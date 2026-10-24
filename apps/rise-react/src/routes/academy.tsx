import {createFileRoute,Link} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {useMemo} from "react";
import {BookOpen,ChevronRight,GraduationCap,Languages,LineChart,Newspaper,Repeat} from "lucide-react";
import {pageHead} from "@/lib/seo";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PageHeader,SectionCard,Bar} from "@/components/rise/primitives";
import {loadLearningSnapshot} from "@/lib/selflearn-snapshot.mjs";
import {backendEnvironmentForHost} from "@/lib/nocturne-environment.mjs";
import {CATALOG,courseTitle} from "@/lib/academy/content";
import {academyEnvironmentAllowed,courseProgress,todayPlan} from "@/lib/academy/engine.mjs";
import {AcademyBackendMissing,loadAcademyState} from "@/lib/academy/records.mjs";
import {academyToday} from "@/lib/academy-today.mjs";

export const Route=createFileRoute("/academy")({
  head:()=>pageHead("Academy","Todo lo que estudias en un sitio: idiomas, UOC +25, data y lecturas."),
  component:Academy,
});

/** Academy · Hoy. Lee Idiomas y UOC +25 sin mover sus datos: cada uno sigue en sus tablas. */
function Academy(){
  const {client,user}=useAuth();
  const uid=user?.id||"";
  const hostEnv=typeof window==="undefined"?null:backendEnvironmentForHost(window.location.hostname);
  const uocAllowed=academyEnvironmentAllowed({hostEnvironment:hostEnv,releaseTarget:import.meta.env["VITE_NOCTURNE_RELEASE_TARGET"]||"",flag:import.meta.env["VITE_ENABLE_ACADEMY"]==="true"});
  // Mismas claves de caché que Inicio e UOC +25: abrir Academy no duplica consultas.
  const learning=useQuery({queryKey:["selflearn-snapshot",uid],enabled:!!client&&!!uid,
    queryFn:()=>loadLearningSnapshot(client!,uid),staleTime:60_000});
  const uoc=useQuery({queryKey:["academy-state",uid],enabled:uocAllowed&&!!client&&!!uid,queryFn:()=>loadAcademyState(client!,uid),
    staleTime:15_000,retry:(n,e)=>!(e instanceof AcademyBackendMissing)&&n<2});
  const plan=useMemo(()=>uoc.data?todayPlan(CATALOG,{progressRows:uoc.data.progress,reviews:uoc.data.reviews,attempts:uoc.data.attempts,prefs:uoc.data.prefs}):null,[uoc.data]);
  const progress=useMemo(()=>uoc.data?courseProgress(CATALOG,uoc.data.progress):[],[uoc.data]);
  const today=academyToday({learning:learning.data??null,uoc:plan});
  const loading=learning.isLoading||(uocAllowed&&uoc.isLoading);

  return <div className="space-y-6">
    <PageHeader eyebrow="ACADEMY · HOY" title="Lo que toca estudiar"
      subtitle="Idiomas, UOC +25, data y lecturas en un solo sitio. Cada curso guarda su progreso donde siempre."/>

    <SectionCard eyebrow="Repasos pendientes" title={today.totalDue===null?(loading?"Consultando…":"Datos incompletos"):today.totalDue===0?"Al día":`${today.totalDue} por repasar`} accent="var(--learn)">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <DueTile label="Neerlandés" value={today.languages?.nlDue} to="/aprender"/>
        <DueTile label="Inglés" value={today.languages?.enDue} to="/aprender"/>
        <DueTile label="UOC +25" value={uocAllowed?today.exam?.due:undefined} to="/academia" off={!uocAllowed}/>
      </div>
      {(learning.error||uoc.error)&&<p role="alert" className="mt-3 text-xs text-gym">Una de las fuentes no respondió: su contador se muestra como «—», no como cero.</p>}
    </SectionCard>

    <SectionCard eyebrow="UOC +25" title="Siguiente lección" accent="var(--learn)"
      action={<Link to="/academia" className="btn-ghost min-h-11">Abrir</Link>}>
      {!uocAllowed&&<p className="text-sm text-muted-foreground">UOC +25 no está activo en este entorno.</p>}
      {uocAllowed&&!today.exam&&<p role="status" className="text-sm text-muted-foreground">{uoc.isLoading?"Cargando tu plan…":"Sin plan disponible ahora mismo."}</p>}
      {today.exam&&today.exam.next.length===0&&<p className="text-sm text-muted-foreground">No hay lecciones nuevas listas para hoy.</p>}
      {today.exam&&today.exam.next.length>0&&<ul className="space-y-2">{today.exam.next.map(n=><li key={n.course}>
        <Link to="/academia" search={{leccion:n.lesson.id}} className="flex min-h-11 items-center gap-3 rounded-2xl border border-hairline bg-foreground/[0.025] p-3">
          <BookOpen className="h-5 w-5 shrink-0 text-learn"/>
          <span className="min-w-0 flex-1"><span className="block text-xs text-muted-foreground">{courseTitle(n.course)} · {n.inProgress?"continúa":"empieza"}{n.lesson.estimated_minutes?` · ${n.lesson.estimated_minutes} min`:""}</span>
            <span className="block truncate text-sm font-semibold text-foreground">{n.lesson.title}</span></span>
          <ChevronRight className="h-4 w-4 shrink-0"/>
        </Link></li>)}</ul>}
    </SectionCard>

    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard eyebrow="Progreso" title="Cursos" accent="var(--learn)">
        <ul className="space-y-4">
          <ProgressRow label="Neerlandés · lecciones completadas" text={today.languages?String(today.languages.nlDone):"—"}/>
          <ProgressRow label="Inglés · lecciones completadas" text={today.languages?String(today.languages.enDone):"—"}/>
          {progress.map(c=><li key={c.slug} className="space-y-2">
            <div className="flex items-baseline justify-between gap-2 text-sm"><span className="min-w-0 truncate">{c.title}</span><span className="tabular-nums text-muted-foreground">{c.done}/{c.total}</span></div>
            <Bar value={c.pct} color="var(--learn)"/>
          </li>)}
          {uocAllowed&&!progress.length&&!uoc.isLoading&&<li className="text-xs text-muted-foreground">Sin progreso de UOC +25 todavía.</li>}
        </ul>
      </SectionCard>
      <SectionCard eyebrow="Apartados" title="Todo lo que estudias" accent="var(--learn)">
        <ul className="grid gap-2">
          <Shortcut to="/aprender" icon={<Languages className="h-5 w-5 text-learn"/>} title="Idiomas" text="Neerlandés A0→B2 · Inglés B1→C2"/>
          <Shortcut to="/academia" icon={<GraduationCap className="h-5 w-5 text-learn"/>} title="UOC +25" text="Matemáticas, Física, Lengua, Comentario, Inglés"/>
          <Shortcut to="/career" icon={<LineChart className="h-5 w-5 text-learn"/>} title="Data & Carrera" text="Power BI, SQL, Python y certificados"/>
          <Shortcut to="/news" icon={<Newspaper className="h-5 w-5 text-learn"/>} title="Biblioteca" text="News y lecturas guardadas"/>
        </ul>
      </SectionCard>
    </div>
    <p className="text-xs text-muted-foreground"><Repeat className="mr-1 inline h-3 w-3"/>Los contadores salen de tus registros reales. Si una fuente falla se muestra «—».</p>
  </div>;
}

function DueTile({label,value,to,off}:{label:string;value:number|undefined;to:"/aprender"|"/academia";off?:boolean}){
  return <Link to={to} className="flex min-h-16 min-w-0 flex-col justify-between gap-1 rounded-xl border border-hairline p-3 hover:border-learn/40">
    <span className="truncate text-xs text-muted-foreground">{label}</span>
    <span className="font-display text-3xl tabular-nums text-foreground">{off?"off":value===undefined?"—":value}</span>
  </Link>;
}
function ProgressRow({label,text}:{label:string;text:string}){
  return <li className="flex items-baseline justify-between gap-2 text-sm"><span className="min-w-0 truncate">{label}</span><span className="tabular-nums text-muted-foreground">{text}</span></li>;
}
function Shortcut({to,icon,title,text}:{to:"/aprender"|"/academia"|"/career"|"/news";icon:React.ReactNode;title:string;text:string}){
  return <li><Link to={to} className="flex min-h-14 items-center gap-3 rounded-2xl border border-hairline p-3 hover:border-learn/40">
    {icon}<span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-foreground">{title}</span><span className="block truncate text-xs text-muted-foreground">{text}</span></span><ChevronRight className="h-4 w-4 shrink-0"/>
  </Link></li>;
}
