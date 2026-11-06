import {createFileRoute,useNavigate} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {useState} from "react";
import {UocEnglishPanel} from "@/components/rise/UocEnglishPanel";
import {BookOpen,Check,ChevronDown,LockKeyhole,RefreshCw} from "lucide-react";
import {SubTabs,useSubTab} from "@/components/rise/SubTabs";
import img from "@/assets/learn.jpg";
import {pageHead} from "@/lib/seo";
import {useAuth} from "@/lib/auth/AuthProvider";
import {useSelfLearnCapabilities} from "@/lib/use-selflearn-capabilities";
import {officialSelfLearnAwardsEnabled} from "@/lib/nocturne-environment.mjs";
import {PageHero} from "@/components/rise/PageHero";
import {SectionCard,EmptyState,Bar} from "@/components/rise/primitives";
import {ProgressRing} from "@/components/rise/ProgressRing";
import {SelfLearnVocabularyReview} from "@/components/rise/SelfLearnVocabularyReview";
import {SelfLearnCheckpointPractice} from "@/components/rise/SelfLearnCheckpointPractice";
import {SelfLearnTutor} from "@/components/rise/SelfLearnTutor";
import {loadLearningSnapshot} from "@/lib/selflearn-snapshot.mjs";
import {COURSES,completedUnitIds,levelProgress,nextUnit} from "@/lib/legacy-selflearn/engine.js";

type CourseId="nl"|"en";
/** Idiomas = un solo apartado: Neerlandés B2 · Inglés C1 (SelfLearn) · Inglés del examen UOC (Academia). Solo UI. */
type Tab=CourseId|"uoc";
const TABS:readonly {id:Tab;label:string}[]=[{id:"nl",label:"Neerlandés · B2"},{id:"en",label:"Inglés · C1"},{id:"uoc",label:"Inglés · examen UOC"}];
export const Route=createFileRoute("/aprender")({
  head:()=>pageHead("Idiomas","Neerlandés B2, inglés C1 e inglés del examen UOC +25 en un solo apartado."),
  validateSearch:(s:Record<string,unknown>):{idioma?:Tab|undefined}=>({idioma:TABS.some(t=>t.id===s["idioma"])?s["idioma"] as Tab:undefined}),
  component:SelfLearn,
});
/** Dentro de cada idioma (6-11-2026): practicar primero; tutor y ruta del curso en su propia pestaña. */
const MODES=[{id:"practicar",label:"Practicar"},{id:"tutor",label:"Tutor"},{id:"ruta",label:"Ruta y progreso"}] as const;
const err=(e:unknown)=>e instanceof Error?e.message:"No se pudo recuperar tu progreso.";
function SelfLearn(){
  const {client,user}=useAuth();
  const tab:Tab=Route.useSearch().idioma||"nl";
  const navigate=useNavigate({from:"/aprender"});
  const course:CourseId=tab==="uoc"?"en":tab;
  const [showAll,setShowAll]=useState(false);
  const [mode,setMode]=useSubTab(MODES,"practicar");
  const uid=user?.id||"";
  const backendReady=useSelfLearnCapabilities(client,uid);
  const awardsAvailable=officialSelfLearnAwardsEnabled(import.meta.env["VITE_ENABLE_SELFLEARN_AWARDS"]==="true",{
    hostname:typeof window==="undefined"?"":window.location.hostname,
    releaseTarget:import.meta.env['VITE_NOCTURNE_RELEASE_TARGET']||"",backendReady
  });
  const key=["selflearn-snapshot",uid];
  const snapshot=useQuery({queryKey:key,enabled:!!client&&!!uid,
    queryFn:()=>loadLearningSnapshot(client!,uid),staleTime:20000,refetchOnWindowFocus:true});
  const data=snapshot.data;
  const selected=COURSES[course];
  const lessons=selected.units;
  const done=data?completedUnitIds(data.entries,course):new Set<string>();
  const pct=data&&lessons.length?Math.round(done.size/lessons.length*100):null;
  const levels=data?levelProgress(course,data.entries):[];
  const due=data?.reviewDue[course];
  const next=data?nextUnit(course,data.entries,data.learningSettings):null;
  return <div className="space-y-6">
    <PageHero image={img} eyebrow="IDIOMAS"
      title="Aprende sin límites."
      subtitle="Neerlandés B2, inglés C1 e inglés del examen UOC +25."
      color="var(--learn)" priority/>
    {tab!=="uoc"&&snapshot.error&&<p role="alert" className="surface border border-gym/40 p-4 text-sm text-gym">
      {err(snapshot.error)}.
    </p>}
    {tab!=="uoc"&&snapshot.isLoading&&<p role="status" className="surface p-5">Cargando tu historial de idiomas…</p>}
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1"><SubTabs tabs={TABS} value={tab} label="Idioma" accent="var(--learn)"
        onChange={t=>{void navigate({search:{idioma:t},replace:true});setShowAll(false);}}/></div>
      {tab!=="uoc"&&<button type="button" className="btn-ghost shrink-0" aria-label="Actualizar progreso" onClick={()=>void snapshot.refetch()} disabled={snapshot.isFetching}>
        <RefreshCw className={"h-4 w-4 "+(snapshot.isFetching?"animate-spin":"")}/>
      </button>}
    </div>
    {tab==="uoc"&&<UocEnglishPanel/>}
    {data&&tab!=="uoc"&&<SubTabs tabs={MODES} value={mode} onChange={setMode} label="Apartados del curso" accent="var(--learn)"/>}
    {data&&tab!=="uoc"&&mode==="practicar"&&<>
      {data&&<SelfLearnVocabularyReview key={uid+course} client={client} uid={uid} course={course}
        cards={data.vocabulary} legacyActive={!!data.learningRuns[course]}/>}
      <SelfLearnCheckpointPractice key={uid+course} client={client} uid={uid} course={course}
        nextUnitId={next?.id||null}
        legacyRun={data.learningRuns[course]}/>
    </>}
    {data&&tab!=="uoc"&&mode==="tutor"&&<SelfLearnTutor key={uid+"-"+course} course={course}/>}
    {data&&tab!=="uoc"&&mode==="ruta"&&<>
      <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
        <SectionCard eyebrow={selected.name+" · nivel objetivo "+data.goals[course]}
          title="Ruta de aprendizaje" accent="var(--learn)">
          <p className="mb-5 text-sm text-muted-foreground">{selected.tagline}</p>
          {next&&<div className="mb-5 flex items-start gap-4 rounded-2xl border border-learn/40 bg-learn/[0.08] p-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-learn/20 text-learn"><BookOpen className="h-5 w-5"/></div>
            <div className="min-w-0 flex-1">
              <p className="eyebrow text-learn">Siguiente unidad</p>
              <p className="mt-1 font-display text-xl">{next.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{next.level} · {next.topic}</p>
              <p className="mt-2 text-xs text-muted-foreground">{awardsAvailable?"Puedes guardar checkpoints y solicitar la acreditación tras completar una lección. Función de pruebas: se confirmará únicamente con Supabase.":"Ahora puedes practicar ejercicios reales y guardar checkpoints; el progreso oficial continúa en el reproductor clásico."}</p>
            </div>
          </div>}
          <ul className="grid gap-3 sm:grid-cols-2">
            {lessons.slice(0,showAll?lessons.length:12).map(unit=>{
              const completed=done.has(unit.id);
              return <li key={unit.id} className="rounded-2xl border border-hairline bg-foreground/[0.025] p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[.12em] text-learn">{unit.level} · {unit.topic}</span>
                  {completed?<span className="grid h-7 w-7 place-items-center rounded-full bg-learn text-ink"><Check className="h-4 w-4"/></span>
                    :<LockKeyhole className="h-4 w-4 text-muted-foreground" aria-label="Lectura sin edición"/>}
                </div>
                <h3 className="mt-3 font-display text-lg leading-tight">{unit.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{unit.goal}</p>
                <p className="mt-3 text-[11px] text-platinum/70">{completed?"Completada en tu historial":"Pendiente de completar"}</p>
              </li>;
            })}
          </ul>
          {lessons.length>12&&<button type="button" className="btn-ghost mt-5" onClick={()=>setShowAll(x=>!x)}>
            {showAll?"Mostrar menos":"Ver todas las unidades"} ({lessons.length})
          </button>}
        </SectionCard>
        <div className="space-y-6">
          <SectionCard eyebrow="Progreso registrado" title="Visión general" accent="var(--learn)">
            <div className="flex flex-wrap items-center gap-5">
              <ProgressRing value={pct??0} size={100} stroke={6} color="var(--learn)">
                <div><div className="font-display text-3xl">{pct===null?"—":pct+"%"}</div><p className="text-[11px] text-muted-foreground">{course.toUpperCase()}</p></div>
              </ProgressRing>
              <div className="flex-1 space-y-2">
                <p className="text-sm">{done.size} de {lessons.length} unidades completadas</p>
                <p className="text-xs text-muted-foreground">El porcentaje representa unidades registradas, no certifica un nivel MCER.</p>
                <p className="text-xs text-platinum/80">{due===undefined?"—":due} tarjetas de vocabulario con repaso pendiente</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {levels.map(level=><div key={level.id}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span>{level.label||level.name||level.id}</span>
                  <span className="text-muted-foreground">{level.done}/{level.total}</span>
                </div>
                <Bar value={level.total?Math.round(level.done/level.total*100):0} color="var(--learn)"/>
              </div>)}
            </div>
          </SectionCard>
          <details className="surface rim group p-5 sm:p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">Registros guardados
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180"/></summary>
            <div className="mt-4">
            <dl className="space-y-4">
              <div className="flex justify-between gap-2"><dt className="text-xs text-muted-foreground">Eventos registrados</dt><dd className="text-sm font-semibold">{data.entries.length}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-xs text-muted-foreground">Fichas de vocabulario</dt><dd className="text-sm font-semibold">{data.vocabulary.length}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-xs text-muted-foreground">Sesión guardada</dt><dd className="text-sm font-semibold">{data.learningRuns[course]?"Sí":"No"}</dd></div>
            </dl>
            {data.learningRuns[course]&&<p className="mt-3 rounded-xl border border-learn/30 bg-learn/[0.06] p-3 text-xs text-platinum/80">
              Existe una sesión interrumpida guardada en la nube. Su reanudación permanecerá en el reproductor original hasta portar las reglas de fusión.
            </p>}
            <p className="mt-3 text-xs text-muted-foreground">{data.note}</p>
            </div>
          </details>
        </div>
      </div>
    </>}
  </div>;
}
