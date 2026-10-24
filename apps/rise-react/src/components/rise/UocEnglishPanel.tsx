import {useMemo} from "react";
import {Link} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {BookOpen,ChevronRight,GraduationCap,Repeat,Timer} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {SectionCard,Bar} from "@/components/rise/primitives";
import {backendEnvironmentForHost} from "@/lib/nocturne-environment.mjs";
import {CATALOG,lessonMeta} from "@/lib/academy/content";
import {academyEnvironmentAllowed,courseProgress,dueReviews,todayPlan} from "@/lib/academy/engine.mjs";
import {AcademyBackendMissing,loadAcademyState} from "@/lib/academy/records.mjs";

/**
 * Idiomas · «Inglés · examen UOC». Solo presenta el curso de Inglés de UOC +25 junto a los otros idiomas;
 * los datos siguen en Academia (mismas tablas, misma caché ["academy-state",uid]).
 */
export function UocEnglishPanel(){
  const {client,user}=useAuth();
  const uid=user?.id||"";
  const hostEnv=typeof window==="undefined"?null:backendEnvironmentForHost(window.location.hostname);
  const allowed=academyEnvironmentAllowed({hostEnvironment:hostEnv,releaseTarget:import.meta.env["VITE_NOCTURNE_RELEASE_TARGET"]||"",flag:import.meta.env["VITE_ENABLE_ACADEMY"]==="true"});
  const q=useQuery({queryKey:["academy-state",uid],enabled:allowed&&!!client&&!!uid,queryFn:()=>loadAcademyState(client!,uid),
    staleTime:15_000,retry:(n,e)=>!(e instanceof AcademyBackendMissing)&&n<2});
  const plan=useMemo(()=>q.data?todayPlan(CATALOG,{progressRows:q.data.progress,reviews:q.data.reviews,attempts:q.data.attempts,prefs:q.data.prefs}):null,[q.data]);
  const progress=useMemo(()=>q.data?courseProgress(CATALOG,q.data.progress).find(c=>c.slug==="ingles")??null:null,[q.data]);
  const next=plan?.next.find(n=>n.course==="ingles")??null;
  const due=useMemo(()=>q.data?dueReviews(q.data.reviews).filter(r=>lessonMeta(r.lesson_id)?.course==="ingles"):[],[q.data]);
  const mocks=(q.data?.mocks||[]).filter(m=>m.course==="ingles");
  if(!allowed)return <SectionCard eyebrow="Inglés · examen UOC" title="No activo en este entorno" accent="var(--learn)">
    <p className="text-sm text-muted-foreground">UOC +25 no está activo aquí.</p></SectionCard>;
  return <div className="space-y-6">
    <SectionCard eyebrow="Inglés · examen UOC +25" title="Comprensión, gramática y redacción" accent="var(--learn)"
      action={<Link to="/academia" search={{v:"cursos",curso:"ingles"}} className="btn-ghost min-h-11">Curso completo</Link>}>
      <p className="text-sm text-muted-foreground">Es el mismo curso de Inglés de UOC +25: aquí lo ves junto a tus idiomas, pero su progreso, repasos y simulacros siguen guardados en Academia.</p>
      {q.isLoading&&<p role="status" className="mt-3 text-sm">Cargando tu progreso…</p>}
      {q.error&&<p role="alert" className="mt-3 text-sm text-gym">No se pudo cargar el progreso de UOC +25. No mostraré cifras inventadas.</p>}
      {q.data&&<div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Stat icon={<GraduationCap className="h-4 w-4"/>} label="Lecciones completadas" value={progress?`${progress.done}/${progress.total}`:"—"}/>
        <Stat icon={<Repeat className="h-4 w-4"/>} label="Repasos para hoy" value={String(due.length)}/>
        <Stat icon={<Timer className="h-4 w-4"/>} label="Simulacros hechos" value={String(mocks.filter(m=>m.status!=="in_progress").length)}/>
      </div>}
      {progress&&<div className="mt-4"><Bar value={progress.pct} color="var(--learn)"/></div>}
    </SectionCard>
    {q.data&&<SectionCard eyebrow="Siguiente paso" title={next?next.lesson.title:"Sin lección nueva lista"} accent="var(--learn)">
      {next?<Link to="/academia" search={{leccion:next.lesson.id}} className="flex min-h-11 items-center gap-3 rounded-2xl border border-hairline bg-foreground/[0.025] p-3">
        <BookOpen className="h-5 w-5 shrink-0 text-learn"/>
        <span className="min-w-0 flex-1 text-sm">{next.inProgress?"Continúa":"Empieza"} esta lección{next.lesson.estimated_minutes?` · ${next.lesson.estimated_minutes} min`:""}</span>
        <ChevronRight className="h-4 w-4 shrink-0"/></Link>
        :<p className="text-sm text-muted-foreground">El contenido de Inglés pendiente aún no está redactado o publicado.</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {due.length>0&&<Link to="/academia" search={{leccion:due[0]!.lesson_id}} className="btn-ghost min-h-11">Repasar ({due.length})</Link>}
        <Link to="/academia" search={{v:"examenes"}} className="btn-ghost min-h-11">Simulacro de Inglés</Link>
      </div>
    </SectionCard>}
  </div>;
}
function Stat({icon,label,value}:{icon:React.ReactNode;label:string;value:string}){
  return <div className="rounded-xl border border-hairline p-3"><p className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</p><p className="mt-1 font-display text-2xl tabular-nums">{value}</p></div>;
}
