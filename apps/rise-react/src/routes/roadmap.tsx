import {createFileRoute} from "@tanstack/react-router";
import {useState} from "react";
import {CalendarDays,CheckCircle2,ChevronLeft,ChevronRight,Info} from "lucide-react";
import {pageHead} from "@/lib/seo";
import {PageHeader,SectionCard,Bar} from "@/components/rise/primitives";
import {RoadmapToday} from "@/components/rise/roadmap/RoadmapToday";
import {RoadmapItem} from "@/components/rise/roadmap/RoadmapItem";
import {useRoadmap} from "@/components/rise/roadmap/useRoadmap";
import {BOSSES,CHAPTERS,DIRECTION,FUTURE_STAGES,MILESTONES,PATH_VERSION,ROUTE_SWITCH_WEEK,autoSteps,itemState,tasksForWeek,weekStart,type PathItem} from "@/lib/career-path.mjs";

export const Route=createFileRoute("/roadmap")({
  head:()=>pageHead("Roadmap","Roadmap 2026–2032 en tareas y subtareas: de operaciones a datos e IA."),
  component:Roadmap,
});
const fmt=(d:string)=>new Date(d+"T12:00:00Z").toLocaleDateString("es-ES",{timeZone:"UTC",weekday:"long",day:"numeric",month:"short"});

function Roadmap(){
  const r=useRoadmap();
  const [week,setWeek]=useState(r.view.week);
  const withState=<T extends PathItem>(t:T)=>({...t,...itemState(t,r.by.get(t.id),autoSteps(t,r.academyProgress))});
  const missions=tasksForWeek(week).map(withState);
  const days=[...new Set(missions.map(m=>m.day))];
  const groups=[...new Set(MILESTONES.map(m=>m.group))];
  const busy=r.save.isPending;
  const item=(t:ReturnType<typeof withState>,extra:{showDay?:boolean}={})=><RoadmapItem key={t.id} item={t} busy={busy} disabled={!r.ready} {...extra}
    onStep={(s,d)=>r.toggleStep(t,s,d)} onAll={d=>r.toggleAll(t,d)}/>;
  const m=r.metrics;

  return <div className="space-y-6">
    <PageHeader eyebrow="ROADMAP 2026–2032" title="Tu camino al puesto que quieres"
      subtitle="El roadmap maestro dividido en etapas, fases, semanas, tareas y subtareas. Solo cuenta lo que marcas tú o lo que Academia ya registró."/>
    <ol aria-label="Dirección única" className="flex flex-wrap items-center gap-2 text-xs">
      {DIRECTION.map((d,i)=><li key={d} className="flex items-center gap-2"><span className={"rounded-full border px-3 py-1.5 "+(i===0?"border-gold/50 bg-gold/10 text-gold":"border-hairline text-platinum/80")}>{d}</span>{i<DIRECTION.length-1&&<ChevronRight className="h-3.5 w-3.5 text-muted-foreground"/>}</li>)}
    </ol>

    <RoadmapToday/>

    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <SectionCard eyebrow={`Semana ${week+1} de 24 · Fase ${Math.floor(week/4)+1}`} title={CHAPTERS[Math.floor(week/4)]!.name} accent="var(--learn)"
        action={<div className="flex gap-1">
          <button type="button" disabled={week===0} onClick={()=>setWeek(w=>Math.max(0,w-1))} className="btn-ghost min-h-11 min-w-11 px-2" aria-label="Semana anterior"><ChevronLeft className="h-4 w-4"/></button>
          <button type="button" disabled={week===23} onClick={()=>setWeek(w=>Math.min(23,w+1))} className="btn-ghost min-h-11 min-w-11 px-2" aria-label="Semana siguiente"><ChevronRight className="h-4 w-4"/></button>
        </div>}>
        <p className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4"/>{fmt(weekStart(week))} a {fmt(days[days.length-1]!)}</span>
          <span className="text-gold">{missions.filter(t=>t.done).length}/{missions.length} tareas</span></p>
        <p className="mt-2 text-xs text-muted-foreground">{week<ROUTE_SWITCH_WEEK?"12 h: Matemáticas 4 h · Física 3 h · Castellano 2 h · Comentario 1,5 h · Inglés 1,5 h, más 30 min de test el domingo. Viernes libre.":"13 h: Matemáticas 3 h 30 · Economía 3 h · Catalán, Castellano, Comentario e Inglés 1 h 30 cada uno, más 30 min de test el domingo. Viernes libre."}</p>
        <div className="mt-3 space-y-2">{days.map(d=><div key={d} className="rounded-xl border border-hairline px-3">
          <h3 className="border-b border-hairline py-2.5 text-xs font-semibold capitalize text-platinum/80">{fmt(d)}{d===r.view.today?" · hoy":""}</h3>
          <ul className="divide-y divide-hairline">{missions.filter(t=>t.day===d).map(t=>item(t))}</ul>
        </div>)}</div>
      </SectionCard>

      <div className="space-y-6">
        <SectionCard eyebrow="Preparación PAU +25 · 24 semanas" title={`${m.percent}% del plan`} accent="var(--gold)">
          <Bar value={m.percent} color="var(--gold)"/>
          <p className="mt-2 text-xs text-muted-foreground">{m.done}/{m.total} tareas · {m.completeWeeks}/24 semanas completas · sesiones cumplidas {m.sessionRate===null?"—":m.sessionRate+"%"} (objetivo ≥80 %)</p>
          <ul className="mt-4 space-y-3">{CHAPTERS.map((c,i)=><li key={c.name}>
            <button type="button" onClick={()=>setWeek(i*4)} className="w-full text-left">
              <span className="flex items-baseline justify-between gap-2 text-sm"><span className={i===r.view.chapter?"font-semibold text-gold":""}>{i+1}. {c.name}</span><span className="tabular-nums text-xs text-muted-foreground">{m.chapters[i]!.done}/{m.chapters[i]!.total}</span></span>
              <span className="block text-[11px] text-muted-foreground">{c.subtitle} · {c.detail}</span>
              <span className="mt-1.5 block"><Bar value={m.chapters[i]!.pct} color="var(--gold)"/></span>
            </button></li>)}</ul>
        </SectionCard>
        <SectionCard eyebrow="Exámenes oficiales" title="10 y 17 de abril de 2027" accent="var(--gold)">
          <p className="text-xs text-muted-foreground">Se marcan solo después de presentarte. No significan aprobado.</p>
          <ul className="divide-y divide-hairline">{BOSSES.map(b=>item(withState(b),{showDay:true}))}</ul>
        </SectionCard>
      </div>
    </div>

    <section id="hitos" className="scroll-mt-24">
      <SectionCard eyebrow="Hitos con fecha límite" title={`${m.milestonesDone}/${m.milestonesTotal} hitos cumplidos`} accent="var(--projects)">
        <div className="grid gap-4 lg:grid-cols-2">{groups.map(g=><div key={g}>
          <h3 className="text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">{g}</h3>
          <ul className="divide-y divide-hairline">{MILESTONES.filter(x=>x.group===g).map(x=>item(withState(x)))}</ul>
        </div>)}</div>
      </SectionCard>
    </section>

    <SectionCard eyebrow="Escalera 2026–2032" title="Etapas y entregables" accent="var(--projects)">
      <ol>{FUTURE_STAGES.map((s,i)=><li key={s.year} className="relative flex gap-4 pb-5 last:pb-0">
        {i<FUTURE_STAGES.length-1&&<div aria-hidden className="absolute bottom-0 left-4 top-8 w-px bg-hairline"/>}
        <div className={"relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs "+(i===0?"border-gold/60 bg-gold/10 text-gold":"border-hairline bg-raised text-muted-foreground")}>{i===0?<CheckCircle2 className="h-4 w-4"/>:i+1}</div>
        <div className="min-w-0 flex-1"><p className="flex flex-wrap items-baseline gap-2"><span className="text-xs font-semibold text-gold">{s.year}</span><span className="text-sm font-semibold">{s.name}</span>{i===0&&<span className="text-[11px] text-gold">· etapa actual</span>}</p>
          <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p><p className="mt-1 text-xs text-platinum/80">Entregable: {s.deliverable}</p></div>
      </li>)}</ol>
      <p className="mt-3 text-[11px] text-muted-foreground">Fechas 2028–2032 = metas, no garantías. Revisión mensual: ajustar fechas ante hechos nuevos sin cambiar la dirección. Roadmap v1.0 · {PATH_VERSION}.</p>
    </SectionCard>

    <p className="flex items-start gap-2 text-xs text-muted-foreground"><Info className="mt-0.5 h-4 w-4 shrink-0"/>
      Ruta desde el 1 de noviembre de 2026: PAU +25 común de Cataluña, presencial, opción Ingeniería y Arquitectura con Matemáticas + Economía de la Empresa; la fase general incluye catalán. La prueba en español de la UOC no admite Economía para Ingeniería. La semana del 26 de octubre conserva el plan anterior con Física.</p>
  </div>;
}
