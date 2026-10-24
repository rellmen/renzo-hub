import {createFileRoute,useNavigate} from "@tanstack/react-router";
import {useQuery,useQueryClient} from "@tanstack/react-query";
import {useMemo,useState} from "react";
import {BookOpen,CalendarClock,ChevronRight,Lock,RefreshCw,Repeat,ShieldCheck} from "lucide-react";
import img from "@/assets/learn.jpg";
import {pageHead} from "@/lib/seo";
import {useAuth} from "@/lib/auth/AuthProvider";
import {backendEnvironmentForHost} from "@/lib/nocturne-environment.mjs";
import {PageHero} from "@/components/rise/PageHero";
import {SectionCard,Bar,EmptyState} from "@/components/rise/primitives";
import {AcademyLessonReader} from "@/components/rise/academy/AcademyLessonReader";
import {AcademyExams} from "@/components/rise/academy/AcademyExams";
import {AcademyPractice} from "@/components/rise/academy/AcademyPractice";
import {CATALOG,courseTitle,lessonMeta} from "@/lib/academy/content";
import {academyEnvironmentAllowed,courseProgress,daysUntil,progressMap,skillMastery,todayPlan,weeklyPlan,SESSION_OPTIONS,type Prefs} from "@/lib/academy/engine.mjs";
import {AcademyBackendMissing,loadAcademyState,savePreferences} from "@/lib/academy/records.mjs";

type View="plan"|"cursos"|"practicar"|"examenes"|"resultados";
const VIEWS:{id:View;label:string}[]=[{id:"plan",label:"Mi plan"},{id:"cursos",label:"Cursos"},{id:"practicar",label:"Practicar"},{id:"examenes",label:"Exámenes"},{id:"resultados",label:"Resultados"}];
type Search={v?:View|undefined;leccion?:string|undefined;curso?:string|undefined};

export const Route=createFileRoute("/academia")({
  head:()=>pageHead("Academia +25","Preparación privada para la prueba de acceso +25 (UOC, castellano): plan, lecciones, práctica y simulacros."),
  validateSearch:(s:Record<string,unknown>):Search=>({
    v:VIEWS.some(x=>x.id===s["v"])?s["v"] as View:undefined,
    leccion:typeof s["leccion"]==="string"&&/^[a-z0-9-]{3,64}$/.test(s["leccion"])?s["leccion"]:undefined,
    curso:typeof s["curso"]==="string"&&CATALOG.courses.some(c=>c.slug===s["curso"])?s["curso"]:undefined,
  }),
  component:Academia,
});

const STATUS_CHIP:Record<string,string>={planned:"Sin redactar",draft:"Borrador",reviewed:"Revisada",ready:"Lista",published:"Publicada"};

function Academia(){
  const {client,user}=useAuth();
  const uid=user?.id||"";
  const search=Route.useSearch();
  const navigate=useNavigate({from:"/academia"});
  const qc=useQueryClient();
  const view:View=search.v||"plan";
  const hostEnv=typeof window==="undefined"?null:backendEnvironmentForHost(window.location.hostname);
  const allowed=academyEnvironmentAllowed({hostEnvironment:hostEnv,releaseTarget:import.meta.env["VITE_NOCTURNE_RELEASE_TARGET"]||"",flag:import.meta.env["VITE_ENABLE_ACADEMY"]==="true"});
  const key=["academy-state",uid];
  const state=useQuery({queryKey:key,enabled:allowed&&!!client&&!!uid,queryFn:()=>loadAcademyState(client!,uid),staleTime:15000,refetchOnWindowFocus:true,
    retry:(n,e)=>!(e instanceof AcademyBackendMissing)&&n<2});
  const refresh=()=>void qc.invalidateQueries({queryKey:key});
  const go=(s:Search)=>void navigate({search:s});
  const data=state.data;
  const prefs=data?.prefs||null;
  const elective=prefs?.elective||"economia";
  const general=daysUntil(CATALOG.exam_dates.general);const especifica=daysUntil(CATALOG.exam_dates.especifica);

  if(!allowed)return <EmptyState icon={<Lock className="h-5 w-5"/>} title="Academia en pruebas" text="Disponible en staging hasta que apruebes su paso a producción."/>;
  return <div className="space-y-6">
    {!search.leccion&&<PageHero image={img} eyebrow="ACADEMIA +25" title="De cero al examen." color="var(--learn)" priority
      subtitle="Matemáticas, Economía de la Empresa, Lengua castellana, Comentario e Inglés. Progreso real, corrección en servidor y simulacros con exámenes oficiales enlazados.">
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-learn/35 bg-ink/70 px-4 py-2 text-xs text-platinum/90"><CalendarClock className="h-4 w-4 text-learn"/>
          {general!==null&&general>=0?`Fase general en ${general} días · específica en ${especifica}`:"Fechas de 2027 por confirmar"}</span>
        <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-ink/60 px-4 py-2 text-xs text-platinum/75"><ShieldCheck className="h-4 w-4 text-learn"/> Contenido en borrador: {CATALOG.stats.meets_standard} de {CATALOG.stats.lessons_total} lecciones al estándar</span>
      </div>
    </PageHero>}
    {state.error instanceof AcademyBackendMissing&&<p role="alert" className="surface border border-gold/40 p-4 text-sm">El backend de Academia no está instalado en este entorno. Puedes leer el catálogo, pero no se guardará progreso.</p>}
    {state.error&&!(state.error instanceof AcademyBackendMissing)&&<p role="alert" className="surface border border-gym/40 p-4 text-sm text-gym">{state.error instanceof Error?state.error.message:"Error"}. No mostraré progreso ficticio.</p>}
    {search.leccion?(
      state.isLoading?<p role="status" className="surface p-5">Cargando tu progreso…</p>:
      <AcademyLessonReader key={search.leccion} client={data?client:null} uid={uid} lessonId={search.leccion}
        progress={data?.progress.find(p=>p.lesson_id===search.leccion)} review={data?.reviews.find(r=>r.lesson_id===search.leccion)}
        editorial={data?.editorial||[]} onBack={()=>go({v:"cursos",curso:lessonMeta(search.leccion!)?.course})} onChanged={refresh}/>
    ):<>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Secciones de Academia" className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-hairline bg-obsidian p-1">
          {VIEWS.map(v=><button key={v.id} type="button" role="tab" aria-selected={view===v.id} onClick={()=>go({v:v.id})}
            className={"min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold "+(view===v.id?"bg-learn/20 text-foreground ring-1 ring-learn/50":"text-muted-foreground")}>{v.label}</button>)}
        </div>
        <button type="button" className="btn-ghost" onClick={refresh} disabled={state.isFetching}><RefreshCw className={"h-4 w-4 "+(state.isFetching?"animate-spin":"")}/> Actualizar</button>
      </div>
      {state.isLoading&&<p role="status" className="surface p-5">Cargando tu progreso…</p>}
      {view==="plan"&&<PlanView data={data} prefs={prefs} onOpen={id=>go({leccion:id})} onSaved={refresh} client={client} uid={uid}/>}
      {view==="cursos"&&<CoursesView data={data} curso={search.curso||"matematicas"} onCourse={c=>go({v:"cursos",curso:c})} onOpen={id=>go({leccion:id})}/>}
      {view==="practicar"&&<AcademyPractice client={data?client:null} elective={elective} onChanged={refresh}/>}
      {view==="examenes"&&<AcademyExams client={data?client:null} uid={uid} exams={data?.exams||[]} elective={elective} onChanged={refresh}/>}
      {view==="resultados"&&<ResultsView data={data}/>}
    </>}
  </div>;
}

type Data=Awaited<ReturnType<typeof loadAcademyState>>|undefined;

function PlanView({data,prefs,onOpen,onSaved,client,uid}:{data:Data;prefs:Prefs|null;onOpen:(id:string)=>void;onSaved:()=>void;client:ReturnType<typeof useAuth>["client"];uid:string}){
  const plan=useMemo(()=>todayPlan(CATALOG,{progressRows:data?.progress,reviews:data?.reviews,attempts:data?.attempts,prefs}),[data,prefs]);
  const [draft,setDraft]=useState<Omit<Prefs,"revision">>({weekly_minutes:prefs?.weekly_minutes??600,session_minutes:prefs?.session_minutes??25,elective:prefs?.elective??"economia",show_drafts:prefs?.show_drafts??true});
  const [msg,setMsg]=useState<string|null>(null);
  const weekly=weeklyPlan(draft.weekly_minutes,draft.elective);
  async function save(){
    if(!client||!data)return;
    try{await savePreferences(client,uid,prefs,draft);setMsg("Preferencias guardadas.");onSaved();}
    catch(e){setMsg(e instanceof Error?e.message:"No se pudo guardar.");}
  }
  return <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
    <div className="space-y-6">
      <SectionCard eyebrow="Hoy" title="Qué estudiar ahora" accent="var(--learn)">
        {!data&&<p className="text-sm text-muted-foreground">Inicia sesión en un entorno con Academia instalada para ver tu plan.</p>}
        {data&&plan.due.length>0&&<div className="mb-4 space-y-2">
          <p className="eyebrow text-learn">Repasos vencidos ({plan.due.length})</p>
          {plan.due.map(r=>{const m=lessonMeta(r.lesson_id);return <button key={r.lesson_id} type="button" onClick={()=>onOpen(r.lesson_id)}
            className="flex min-h-11 w-full items-center gap-3 rounded-2xl border border-learn/40 bg-learn/[0.08] p-3 text-left">
            <Repeat className="h-5 w-5 shrink-0 text-learn"/><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-foreground">{m?.title}</span>
            <span className="text-xs text-muted-foreground">{m?.course_title} · repaso {r.step+1}</span></span><ChevronRight className="h-4 w-4"/></button>;})}
        </div>}
        {data&&<ul className="space-y-2">{plan.next.map(n=><li key={n.course}>
          <button type="button" onClick={()=>onOpen(n.lesson.id)} className="flex min-h-11 w-full items-center gap-3 rounded-2xl border border-hairline bg-foreground/[0.025] p-3 text-left">
            <BookOpen className="h-5 w-5 shrink-0 text-learn"/>
            <span className="min-w-0 flex-1"><span className="block text-xs text-muted-foreground">{courseTitle(n.course)} · {n.inProgress?"continúa":"empieza"} · {n.lesson.estimated_minutes} min · {STATUS_CHIP[n.lesson.status]}</span>
              <span className="block text-sm font-semibold text-foreground">{n.lesson.title}</span>
              {n.missingPrereqs.length>0&&<span className="block text-xs text-gold">Antes conviene: {n.missingPrereqs.map(id=>lessonMeta(id)?.title||id).join(", ")}</span>}</span>
            <ChevronRight className="h-4 w-4"/></button></li>)}</ul>}
        {data&&plan.blocked.length>0&&<ul className="mt-3 space-y-1 text-xs text-muted-foreground">{plan.blocked.map(b=><li key={b.course}>{courseTitle(b.course)}: {b.reason}</li>)}</ul>}
        <p className="mt-4 text-xs text-muted-foreground">Sin rachas ni castigos: si un turno te come la semana, el plan sigue donde lo dejaste.</p>
      </SectionCard>
      <SectionCard eyebrow="Calendario oficial publicado" title="Prueba +25 · 2027" accent="var(--gold)">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-hairline p-3"><dt className="text-xs text-muted-foreground">Fase general (Castellano, Comentario, Inglés)</dt><dd className="font-display text-2xl">10 abril 2027</dd><dd className="text-xs">{daysUntil(CATALOG.exam_dates.general)} días</dd></div>
          <div className="rounded-2xl border border-hairline p-3"><dt className="text-xs text-muted-foreground">Fase específica (Matemáticas + Economía)</dt><dd className="font-display text-2xl">17 abril 2027</dd><dd className="text-xs">{daysUntil(CATALOG.exam_dates.especifica)} días</dd></div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">{CATALOG.exam_dates.note} <a className="underline" href={CATALOG.exam_dates.source} target="_blank" rel="noopener noreferrer">Fuente</a></p>
      </SectionCard>
    </div>
    <SectionCard eyebrow="Tu semana" title="Ritmo y preferencias" accent="var(--learn)">
      <label className="block text-sm">Minutos por semana
        <input type="number" min={30} max={4000} step={15} className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-base" value={draft.weekly_minutes}
          onChange={e=>setDraft(d=>({...d,weekly_minutes:Number(e.target.value)||0}))}/></label>
      <fieldset className="mt-3"><legend className="text-sm">Duración de sesión</legend><div className="mt-1 flex flex-wrap gap-2">
        {SESSION_OPTIONS.map(m=><button key={m} type="button" aria-pressed={draft.session_minutes===m} onClick={()=>setDraft(d=>({...d,session_minutes:m}))}
          className={"min-h-11 rounded-full border px-4 text-sm "+(draft.session_minutes===m?"border-learn bg-learn/15":"border-hairline")}>{m} min</button>)}</div></fieldset>
      <fieldset className="mt-3"><legend className="text-sm">Segunda específica (provisional hasta la matrícula)</legend><div className="mt-1 flex flex-wrap gap-2">
        {(["economia","fisica"] as const).map(c=><button key={c} type="button" aria-pressed={draft.elective===c} onClick={()=>setDraft(d=>({...d,elective:c}))}
          className={"min-h-11 rounded-full border px-4 text-sm "+(draft.elective===c?"border-learn bg-learn/15":"border-hairline")}>{courseTitle(c)}</button>)}</div></fieldset>
      <label className="mt-3 flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5" checked={draft.show_drafts} onChange={e=>setDraft(d=>({...d,show_drafts:e.target.checked}))}/> Mostrar lecciones en borrador (modo revisión)</label>
      <ul className="mt-4 space-y-2 text-sm">{weekly.map(w=><li key={w.id} className="flex justify-between gap-2"><span>{w.label}</span><span className="text-muted-foreground">{w.minutes} min</span></li>)}</ul>
      <p className="mt-2 text-xs text-muted-foreground">Reparto de referencia del plan de 24 semanas; ajústalo a tus turnos.</p>
      <button type="button" className="btn-gold mt-4" disabled={!data} onClick={()=>void save()}>Guardar</button>
      {msg&&<p role="status" className="mt-2 text-sm">{msg}</p>}
    </SectionCard>
  </div>;
}

function CoursesView({data,curso,onCourse,onOpen}:{data:Data;curso:string;onCourse:(c:string)=>void;onOpen:(id:string)=>void}){
  const progress=progressMap(data?.progress);
  const course=CATALOG.courses.find(c=>c.slug===curso)||CATALOG.courses[0]!;
  const showDrafts=data?.prefs?.show_drafts!==false;
  return <div className="space-y-5">
    <div role="tablist" aria-label="Materia" className="flex flex-wrap gap-2">
      {CATALOG.courses.map(c=><button key={c.slug} type="button" role="tab" aria-selected={c.slug===course.slug} onClick={()=>onCourse(c.slug)}
        className={"min-h-11 rounded-full border px-4 text-sm font-semibold "+(c.slug===course.slug?"border-learn/60 bg-learn/15 text-foreground":"border-hairline text-muted-foreground")}>{c.title}</button>)}
    </div>
    <SectionCard eyebrow={course.role_label} title={course.title} accent="var(--learn)"
      action={<a className="text-xs underline" href={course.official_syllabus_url} target="_blank" rel="noopener noreferrer">Temario oficial</a>}>
      <p className="text-xs text-muted-foreground">Estados editoriales reales: «Sin redactar» = solo título del temario; «Borrador» = redactada sin revisión humana. Nada se presenta como curso terminado.</p>
      <div className="mt-4 space-y-5">{course.modules.map(m=><div key={m.id}>
        <p className="eyebrow">{m.id} · {m.level} · {m.title}</p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">{m.lessons.map(l=>{
          const p=progress.get(l.id);const open=l.has_content&&(l.status==="published"||showDrafts);
          return <li key={l.id}><button type="button" disabled={!open} onClick={()=>onOpen(l.id)}
            className={"flex min-h-11 w-full items-start gap-3 rounded-2xl border p-3 text-left "+(open?"border-hairline bg-foreground/[0.025]":"border-dashed border-hairline opacity-60")}>
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-foreground">{l.title}</span>
              <span className="mt-1 flex flex-wrap gap-1 text-[11px]">
                <span className={"rounded-full border px-2 py-0.5 "+(l.status==="planned"?"border-hairline":"border-gold/40 text-gold")}>{STATUS_CHIP[l.status]}{l.has_content&&!l.meets_standard?" · bajo estándar":""}</span>
                {p&&<span className="rounded-full border border-learn/40 px-2 py-0.5 text-learn">{p.status==="mastered"?"Dominada":p.status==="completed"?"Completada":"En curso"}</span>}
                <span className="text-muted-foreground">{l.estimated_minutes} min</span></span></span>
            {open?<ChevronRight className="h-4 w-4 shrink-0"/>:<Lock className="h-4 w-4 shrink-0" aria-label="Sin contenido"/>}</button></li>;})}</ul>
      </div>)}</div>
    </SectionCard>
  </div>;
}

function ResultsView({data}:{data:Data}){
  const courses=courseProgress(CATALOG,data?.progress);
  const skills=[...skillMastery(data?.attempts).values()].sort((a,b)=>a.pct-b.pct);
  const s=CATALOG.stats;
  return <div className="grid gap-6 lg:grid-cols-2">
    <SectionCard eyebrow="Tu progreso" title="Lecciones completadas por materia" accent="var(--learn)">
      {!data?<p className="text-sm text-muted-foreground">Sin datos.</p>:<ul className="space-y-4">{courses.map(c=><li key={c.slug}>
        <div className="mb-1 flex justify-between text-xs"><span>{c.title}</span><span className="text-muted-foreground">{c.done}/{c.total} · {c.mastered} dominadas</span></div>
        <Bar value={c.pct} color="var(--learn)"/></li>)}</ul>}
    </SectionCard>
    <SectionCard eyebrow="Por habilidad" title="Dominio (últimos 10 intentos)" accent="var(--learn)">
      {!skills.length?<p className="text-sm text-muted-foreground">Sin intentos todavía. Haz un diagnóstico en Practicar.</p>:
      <ul className="space-y-2 text-sm">{skills.slice(0,30).map(k=><li key={k.skill} className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate">{k.skill.replace(/_/g," ")} <span className="text-xs text-muted-foreground">· {courseTitle(k.course)}</span></span>
        <span className={k.pct>=80?"text-learn":k.pct>=60?"text-gold":"text-gym"}>{k.pct} % <span className="text-xs text-muted-foreground">({k.correct}/{k.n})</span></span></li>)}</ul>}
      {data?.attemptsPartial&&<p className="mt-2 text-xs text-muted-foreground">Se muestran los 1 500 intentos más recientes.</p>}
    </SectionCard>
    <SectionCard eyebrow="Cobertura real del contenido" title={`${s.meets_standard} de ${s.lessons_total} lecciones al estándar`} accent="var(--gold)" className="lg:col-span-2">
      <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm">
        <thead><tr className="text-xs text-muted-foreground"><th className="py-2">Materia</th><th>Lecciones</th><th>Con texto</th><th>Al estándar</th><th>Sin redactar</th><th>Borrador</th><th>Publicadas</th></tr></thead>
        <tbody>{CATALOG.courses.map(c=>{const x=s.courses[c.slug]!;return <tr key={c.slug} className="border-t border-hairline">
          <td className="py-2">{c.title}</td><td>{x.total}</td><td>{x.with_content}</td><td>{x.meets_standard}</td><td>{x.by_status["planned"]}</td><td>{x.by_status["draft"]}</td><td>{x.by_status["published"]}</td></tr>;})}</tbody>
      </table></div>
      <p className="mt-2 text-xs text-muted-foreground">{s.questions_total} preguntas ({s.exit_questions} de salida con clave en servidor, {s.bank_questions} del banco inicial). Ninguna lección está publicada: todas requieren revisión humana.</p>
    </SectionCard>
  </div>;
}

