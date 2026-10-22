import {createFileRoute,Link} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {RefreshCw,ShieldCheck,BookOpen,Briefcase,Dumbbell} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PageHeader,SectionCard} from "@/components/rise/primitives";
import {pageHead} from "@/lib/seo";
import {loadVerifiedXP} from "@/lib/xp-overview.mjs";

export const Route=createFileRoute("/quest")({
 head:()=>pageHead("RISE Quest","Historial verificado de puntos de experiencia del sistema clásico."),
 component:Quest
});
function Quest(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const q=useQuery({queryKey:["quest-xp",uid],enabled:!!client&&!!uid,
  queryFn:()=>loadVerifiedXP(client!,uid),staleTime:30000,refetchOnWindowFocus:true});
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
  {q.error&&<p role="alert" className="rounded-xl border border-gym/40 p-4 text-sm text-gym">No fue posible validar el historial XP.</p>}
  {q.data&&<SectionCard eyebrow="Actividad" title="Eventos registrados" accent="var(--learn)">
   {!q.data.events.length?<p className="text-sm text-muted-foreground">Todavía no existen eventos de experiencia.</p>:
    <ul className="divide-y divide-hairline">{q.data.events.slice(0,50).map(e=><li key={e.id} className="flex items-center justify-between gap-3 py-3 text-sm">
      <div><p className="font-medium">{e.kind}</p><p className="text-xs text-muted-foreground">{e.date.slice(0,10)||"Fecha desconocida"}</p></div>
      <strong className="text-gold">{e.points>0?"+":""}{e.points} XP</strong>
     </li>)}</ul>}
   {!!q.data.duplicates&&<p className="mt-3 text-xs text-muted-foreground">Se omitieron {q.data.duplicates} eventos con ID de origen repetido.</p>}
  </SectionCard>}
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
