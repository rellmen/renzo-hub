import {Link} from "@tanstack/react-router";
import {AlertTriangle,ArrowRight,CalendarClock,Flag,Map as MapIcon,RefreshCw} from "lucide-react";
import {SectionCard,Bar} from "@/components/rise/primitives";
import {CHAPTERS} from "@/lib/career-path.mjs";
import {RoadmapItem} from "./RoadmapItem";
import {useRoadmap} from "./useRoadmap";

const fmt=(d:string,o:Intl.DateTimeFormatOptions={weekday:"long",day:"numeric",month:"long"})=>new Date(d+"T12:00:00Z").toLocaleDateString("es-ES",{timeZone:"UTC",...o});
const daysTo=(d:string,today:string)=>Math.round((Date.parse(d+"T12:00:00Z")-Date.parse(today+"T12:00:00Z"))/864e5);

/** «Roadmap · hoy»: lo que toca hoy con subtareas. En Inicio por defecto (compact) y arriba de /roadmap. */
export function RoadmapToday({compact=false}:{compact?:boolean}){
  const r=useRoadmap();
  const v=r.view;
  const chapter=CHAPTERS[v.chapter]!;
  const items=v.todayItems.length?v.todayItems:v.nextItems;
  const busy=r.save.isPending;
  const title=v.beforeStart?"Empiezas el lunes 26 de octubre":v.afterExams?"Exámenes hechos: toca portfolio y matrícula":v.todayItems.length?`Hoy: ${v.todayItems.length} tarea${v.todayItems.length===1?"":"s"}`:"Hoy no hay sesión del plan";
  return <SectionCard eyebrow={`Roadmap · Fase ${v.chapter+1}/6${v.beforeStart?"":` · Semana ${v.week+1}/24`}`} title={title} accent="var(--gold)"
    action={<Link to="/roadmap" className="btn-ghost min-h-11" aria-label="Abrir roadmap completo"><MapIcon className="h-4 w-4"/>{compact?"Roadmap":"Ver todo"}</Link>}>
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"><CalendarClock className="h-4 w-4"/>
      <span>{fmt(v.today)}</span><span>· {r.window.label}{r.window.deep?`: estudio profundo ${r.window.deep}${r.window.review?`, repaso ${r.window.review}`:""}`:""}</span>{!r.window.deep&&<Link to="/turnos" className="text-gold underline">Registrar turno</Link>}</p>
    {r.loading&&<p role="status" className="mt-3 text-sm">Cargando tu progreso…</p>}
    {r.error&&<p role="alert" className="mt-3 text-sm text-gym">No se pudo leer tu progreso. No se puede marcar nada hasta cargarlo.</p>}
    {r.save.error&&<p role="alert" className="mt-3 text-sm text-gym">{r.save.error instanceof Error?r.save.error.message:"No se pudo guardar."}</p>}
    {r.ready&&<>
      {!v.todayItems.length&&v.nextDay&&<p className="mt-3 text-sm">Lo siguiente es el <strong>{fmt(v.nextDay)}</strong>:</p>}
      <ul className="mt-1 divide-y divide-hairline">{items.map(t=><RoadmapItem key={t.id} item={t} busy={busy} disabled={!r.ready}
        open={!compact||v.todayItems.length<=2} onStep={(s,d)=>r.toggleStep(t,s,d)} onAll={d=>r.toggleAll(t,d)}/>)}</ul>
      {v.overdue.length>0&&<div className="mt-3 rounded-xl border border-gym/30 bg-gym/[0.05] p-3">
        <p className="flex items-center gap-2 text-xs font-semibold text-gym"><AlertTriangle className="h-4 w-4"/>{v.overdue.length} pendiente{v.overdue.length===1?"":"s"} de esta semana</p>
        {compact?<p className="mt-1 text-xs text-muted-foreground">El roadmap pide no acumular deuda: recupera una si te sobra energía o déjala y sigue.</p>
          :<ul className="divide-y divide-hairline">{v.overdue.map(t=><RoadmapItem key={t.id} item={t} busy={busy} disabled={!r.ready} showDay onStep={(s,d)=>r.toggleStep(t,s,d)} onAll={d=>r.toggleAll(t,d)}/>)}</ul>}
      </div>}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Kpi label="Esta semana" value={v.weekTotal?`${v.weekDone}/${v.weekTotal}`:"—"} sub="tareas"/>
        <Kpi label="Sesiones cumplidas" value={r.metrics.sessionRate===null?"—":r.metrics.sessionRate+"%"} sub="objetivo ≥80 %"/>
        <Kpi label={`Fase ${v.chapter+1} · ${chapter.name}`} value={r.metrics.chapters[v.chapter]?.pct+"%"} sub={chapter.subtitle}/>
      </div>
      <div className="mt-3"><Bar value={r.metrics.chapters[v.chapter]?.pct??0} color="var(--gold)"/></div>
      {v.nextMilestone&&<Link to="/roadmap" hash="hitos" className="mt-4 flex min-h-11 items-center gap-3 rounded-xl border border-hairline p-3 hover:border-gold/40">
        <Flag className="h-4 w-4 shrink-0 text-gold"/>
        <span className="min-w-0 flex-1 text-sm"><span className="block truncate font-medium">{v.nextMilestone.title}</span>
          <span className="block text-xs text-muted-foreground">Próximo hito · {fmt(v.nextMilestone.due,{day:"numeric",month:"short"})} · faltan {daysTo(v.nextMilestone.due,v.today)} días · {v.nextMilestone.doneSteps}/{v.nextMilestone.totalSteps}</span></span>
        <ArrowRight className="h-4 w-4 shrink-0"/></Link>}
      {!compact&&<button type="button" className="btn-ghost mt-3 min-h-11" disabled={r.fetching} onClick={()=>void r.refetch()}><RefreshCw className={"h-4 w-4 "+(r.fetching?"animate-spin":"")}/>Sincronizar</button>}
    </>}
  </SectionCard>;
}
function Kpi({label,value,sub}:{label:string;value:string;sub:string}){
  return <div className="rounded-xl border border-hairline p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-2xl tabular-nums">{value}</p><p className="truncate text-[11px] text-muted-foreground">{sub}</p></div>;
}
