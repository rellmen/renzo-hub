import {createFileRoute,Link} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {RefreshCw,ShieldCheck,BookOpen,Briefcase,Dumbbell,CheckCircle2,Circle} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PageHeader,SectionCard} from "@/components/rise/primitives";
import {pageHead} from "@/lib/seo";
import {loadVerifiedXP} from "@/lib/xp-overview.mjs";
import {loadLanguageXP} from "@/lib/language-xp.mjs";
import {loadDailyQuests} from "@/lib/quest-missions.mjs";

export const Route=createFileRoute("/quest")({
 head:()=>pageHead("RISE Quest","Historial verificado de puntos de experiencia del sistema clásico."),
 component:Quest
});
function Quest(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const q=useQuery({queryKey:["quest-xp",uid],enabled:!!client&&!!uid,
  queryFn:()=>loadVerifiedXP(client!,uid),staleTime:30000,refetchOnWindowFocus:true});
 const learning=useQuery({queryKey:["quest-language-xp",uid],enabled:!!client&&!!uid,
  queryFn:()=>loadLanguageXP(client!,uid),staleTime:30000,refetchOnWindowFocus:true});
 const daily=useQuery({queryKey:["quest-daily",uid],enabled:!!client&&!!uid,
  queryFn:()=>loadDailyQuests(client!,uid),staleTime:30000,refetchOnWindowFocus:true});
 return <div className="space-y-6">
  <PageHeader eyebrow="RISE HUB · EXPERIENCIA" title="Quest"
   subtitle="Tu progreso se fundamenta en eventos guardados, sin misiones completadas de demostración."/>
  <SectionCard eyebrow="XP histórico confirmado" title={q.data?String(q.data.points)+" XP":"Calculando…"} accent="var(--gold)">
   <p className="text-sm text-platinum/75">Suma de eventos de XP únicos del sistema clásico. No incluye lecciones contabilizadas de otro modo hasta verificar que no haya duplicidad.</p>
   {q.data&&<div className="mt-4 space-y-2 rounded-xl border border-hairline p-4">
    <div className="flex flex-wrap items-baseline justify-between gap-3 text-sm"><strong>Nivel {q.data.progress.level} · Rango {q.data.progress.rank}</strong>
     <span className="text-muted-foreground">{q.data.progress.toNext} XP para el nivel {q.data.progress.level+1}</span></div>
    <div className="h-2 overflow-hidden rounded-full bg-foreground/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={q.data.progress.percent} aria-label="Progreso hacia el siguiente nivel">
     <div className="h-full rounded-full bg-gold" style={{width:q.data.progress.percent+"%"}}/>
    </div>
    <p className="text-xs text-muted-foreground">Misma fórmula de nivel y rangos de la aplicación clásica, calculada únicamente a partir de eventos existentes.</p>
   </div>}
   <button type="button" className="btn-ghost mt-3 min-h-11" disabled={q.isFetching} onClick={()=>void q.refetch()}>
    <RefreshCw className={"h-4 w-4 "+(q.isFetching?"animate-spin":"")}/> Actualizar</button>
  </SectionCard>
  <SectionCard eyebrow="Daily Quests" title={daily.data?`${daily.data.today.done}/${daily.data.today.total} hoy`:"Comprobando…"} accent="var(--projects)">
   <p className="text-sm text-platinum/75">Misiones del sistema clásico, cumplidas solo con actividad registrada en esta cuenta hoy. No suman XP automáticamente.</p>
   {daily.error&&<p role="alert" className="mt-3 text-sm text-gym">No se pudo comprobar la actividad de hoy.</p>}
   {daily.data&&<>
    <ul className="mt-3 divide-y divide-hairline">{daily.data.today.items.map(item=><li key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
     <span className="flex items-center gap-2">{item.done?<CheckCircle2 className="h-4 w-4 text-gold" aria-hidden/>:<Circle className="h-4 w-4 text-muted-foreground" aria-hidden/>}{item.title}</span>
     {item.done?<span className="text-xs text-gold">Registrado</span>:<Link to={item.route} className="text-xs text-gold underline">Ir</Link>}
    </li>)}</ul>
    <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Últimos 7 días">{daily.data.week.map(d=><span key={d.day} title={d.day+": "+d.done+"/"+d.total}
     className={"rounded-md border border-hairline px-2 py-1 text-[11px] "+(d.done===d.total?"bg-gold/20 text-gold":"text-muted-foreground")}>{d.day.slice(8)} · {d.done}/{d.total}</span>)}</div>
    <p className="mt-2 text-xs text-muted-foreground">Racha de días completos: {daily.data.streak}.</p>
   </>}
  </SectionCard>
  {q.error&&<p role="alert" className="rounded-xl border border-gym/40 p-4 text-sm text-gym">No fue posible validar el historial XP.</p>}
  {q.data&&<SectionCard eyebrow="Actividad" title="Eventos registrados" accent="var(--learn)">
   {!q.data.events.length?<p className="text-sm text-muted-foreground">Todavía no existen eventos de experiencia.</p>:
    <ul className="divide-y divide-hairline">{q.data.events.slice(0,50).map(e=><li key={e.id} className="flex items-center justify-between gap-3 py-3 text-sm">
      <div><p className="font-medium">{e.kind}</p><p className="text-xs text-muted-foreground">{e.date.slice(0,10)||"Fecha desconocida"}</p></div>
      <strong className="text-gold">{e.points>0?"+":""}{e.points} XP</strong>
     </li>)}</ul>}
   {!!q.data.duplicates&&<p className="mt-3 text-xs text-muted-foreground">Se omitieron {q.data.duplicates} eventos con ID de origen repetido.</p>}
  </SectionCard>}
  <SectionCard eyebrow="SELFLEARN · NO SUMADO" title="XP de idiomas verificado" accent="var(--learn)">
   <p className="text-sm text-platinum/80">XP documentado de lecciones de idiomas, separado del total global para evitar duplicados.</p>
   {learning.isLoading&&<p role="status" className="mt-3 text-sm">Comprobando lecciones acreditadas…</p>}
   {learning.error&&<p role="alert" className="mt-3 text-sm text-gym">No se pudo comprobar el historial de idiomas.</p>}
   {learning.data&&<div className="mt-3 space-y-2">
    <p className="font-display text-3xl text-gold-gradient">{learning.data.points} XP</p>
    <p className="text-xs text-muted-foreground">{learning.data.lessonCount} lecciones únicas con evento persistido
     {learning.data.duplicates>0?" · "+learning.data.duplicates+" duplicados omitidos":""}</p>
    <ul className="divide-y divide-hairline">{learning.data.events.slice(0,12).map(e=><li key={e.id} className="flex justify-between gap-3 py-2 text-xs">
     <span>{e.course==="nl"?"Neerlandés":"Inglés"} · {e.lesson} · {e.date.slice(0,10)}</span>
     <strong>+{e.xp} XP</strong>
    </li>)}</ul>
   </div>}
  </SectionCard>
  <SectionCard eyebrow="Continúa avanzando" title="Áreas de desarrollo" accent="var(--projects)">
   <div className="flex flex-wrap gap-2">
    <Link to="/aprender" className="btn-ghost inline-flex min-h-11 items-center"><BookOpen className="h-4 w-4"/> Idiomas</Link>
    <Link to="/proyectos" className="btn-ghost inline-flex min-h-11 items-center"><Briefcase className="h-4 w-4"/> Proyectos</Link>
    <Link to="/gym" className="btn-ghost inline-flex min-h-11 items-center"><Dumbbell className="h-4 w-4"/> Gym</Link>
   </div>
   <p className="mt-3 flex gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0"/>Los niveles y recompensas globales permanecen pendientes de validación. Esta vista no modifica tu XP.</p>
  </SectionCard>
 </div>;
}
