import {createFileRoute,Link} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {ArrowRight,Briefcase,CheckCircle2,ClipboardList,ShieldCheck,Sparkles,Activity} from "lucide-react";
import hero from "@/assets/hero-eclipse.jpg";
import learn from "@/assets/learn.jpg";
import gym from "@/assets/gym.jpg";
import money from "@/assets/money.jpg";
import skin from "@/assets/skin.jpg";
import projects from "@/assets/projects.jpg";
import {pageHead} from "@/lib/seo";
import {PhotoModuleCard} from "@/components/rise/PhotoModuleCard";
import {FocusTimer} from "@/components/rise/FocusTimer";
import {SectionCard,EmptyState} from "@/components/rise/primitives";
import {ProgressRing} from "@/components/rise/ProgressRing";
import {useAuth} from "@/lib/auth/AuthProvider";
import {loadAresRecords} from "@/lib/ares-records.mjs";
import {loadWorkRecords,WORK_STATUSES} from "@/lib/work-records.mjs";

export const Route=createFileRoute("/")({
  head:()=>pageHead("Centro de mando","Tu próxima evolución: tus datos reales y las disciplinas de RISE HUB."),
  component:Home
});

const MODULES=[
  {to:"/aprender" as const,image:learn,eyebrow:"SELFLEARN",title:"Aprende sin límites",meta:"Neerlandés B2 · Inglés C1",color:"var(--learn)"},
  {to:"/gym" as const,image:gym,eyebrow:"GYM",title:"Más fuerte cada día",meta:"Rutinas, sesiones y progreso",color:"var(--gym)"},
  {to:"/dinero" as const,image:money,eyebrow:"MONEY",title:"Capital con intención",meta:"Tus registros financieros privados",color:"var(--money)"},
  {to:"/piel" as const,image:skin,eyebrow:"SKIN ROUTINE",title:"Ritual consciente",meta:"Cuidado personal",color:"var(--skin)"},
  {to:"/proyectos" as const,image:projects,eyebrow:"PROYECTOS",title:"Trabajo profundo",meta:"Tareas y proyectos sincronizados",color:"var(--projects)"}
];
const STATUSES=[...WORK_STATUSES];

function Home(){
  const {user,client}=useAuth();
  const uid=user?.id||"";
  const ares=useQuery({queryKey:["ares-records",uid],enabled:!!client&&!!uid,
    queryFn:()=>loadAresRecords(client!,uid),staleTime:20_000});
  const work=useQuery({queryKey:["work-records",uid],enabled:!!client&&!!uid,
    queryFn:()=>loadWorkRecords(client!,uid),staleTime:20_000});
  const tasks=work.data?.tasks||[];
  const done=tasks.filter(x=>x.status==="Completed").length;
  const total=tasks.length;
  const percent=total?Math.round(100*done/total):0;
  const stats=[
    {label:"Proyectos abiertos",value:ares.data?String(ares.data.projects.length):"—",caption:"Registros actuales",icon:Briefcase,color:"var(--projects)"},
    {label:"Tareas abiertas",value:ares.data?String(ares.data.tasks.length):"—",caption:"En RISE HUB",icon:ClipboardList,color:"var(--learn)"},
    {label:"Tareas completadas",value:work.data?String(done):"—",caption:work.data?done+" de "+total:"Sin consultar",icon:CheckCircle2,color:"var(--gym)"},
    {label:"Revisiones",value:ares.data?String(ares.data.approvals.length):"—",caption:"Pendientes de aprobación",icon:ShieldCheck,color:"var(--gold)"},
    {label:"Eventos de agentes",value:ares.data?String(ares.data.agents.length):"—",caption:"Históricos, no en directo",icon:Activity,color:"var(--ares)"}
  ];
  return <div className="space-y-6 lg:space-y-8">
    <section className="surface rim relative min-h-[460px] overflow-hidden lg:min-h-[420px]" style={{background:"var(--gradient-wine)"}}>
      <img src={hero} alt="" width={1920} height={832} className="absolute inset-0 h-full w-full object-cover object-[60%_center] animate-pan"/>
      <div className="absolute inset-0 bg-hero-side"/>
      <div className="absolute inset-0 bg-photo-fade opacity-80 lg:opacity-30"/>
      <div className="relative flex min-h-[inherit] flex-col justify-end gap-5 p-6 sm:p-10 lg:justify-center lg:p-14">
        <div className="flex items-center gap-3"><span className="h-px w-10 bg-gold"/><span className="eyebrow">Centro de mando privado</span></div>
        <h1 className="max-w-xl font-display text-[3.4rem] font-medium leading-[0.92] text-foreground sm:text-7xl lg:text-[5.5rem] animate-rise">
          Tu próxima <em className="text-gold-gradient">evolución.</em>
        </h1>
        <p className="max-w-sm text-base text-platinum/80">Disciplina hoy. Libertad mañana.</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/ares" className="btn-gold">Abrir Ares <ArrowRight className="h-4 w-4"/></Link>
          <Link to="/proyectos" className="btn-ghost">Ver proyectos</Link>
        </div>
      </div>
      <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-gold/30 bg-ink/60 px-4 py-2 text-xs text-gold backdrop-blur-md">
        <ShieldCheck className="h-4 w-4"/> Datos privados
      </div>
    </section>

    {(ares.error||work.error)&&<p role="alert" className="surface border border-gym/40 p-4 text-sm text-gym">
      No se pudieron cargar todos los datos reales. Las estadísticas sin verificar se muestran como «—», nunca con cifras de ejemplo.
    </p>}
    <section aria-label="Indicadores de tus registros reales" className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
      {stats.map((k,i)=><div key={k.label} className={(i===4?"col-span-2 md:col-span-1":"")+" surface rim flex min-w-0 flex-col gap-3 p-4"}>
        <div className="flex items-center gap-2"><k.icon className="h-4 w-4 shrink-0" style={{color:k.color}}/><span className="truncate text-xs text-muted-foreground">{k.label}</span></div>
        <p className="font-display text-4xl text-foreground" aria-live="polite">{k.value}</p>
        <p className="text-xs text-platinum/75">{k.caption}</p>
      </div>)}
    </section>

    <section>
      <div className="mb-4 flex items-end justify-between">
        <div><div className="eyebrow mb-1">Tus disciplinas</div><h2 className="font-display text-3xl text-foreground">Un sistema. Un propósito.</h2></div>
        <span className="hidden text-xs text-muted-foreground sm:block">Progreso solo cuando exista un registro real</span>
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 xl:grid-cols-5">
        {MODULES.map(m=><div key={m.to} className="w-[72%] shrink-0 snap-start sm:w-auto">
          <PhotoModuleCard {...m} progress={m.to==="/proyectos"&&work.data?percent:undefined}/>
        </div>)}
      </div>
    </section>

    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <SectionCard eyebrow={<span className="text-ares">Ares Center · Consulta real</span>} title="¿En qué avanzamos hoy?" accent="var(--ares)" className="min-h-[370px]">
        <p className="text-sm leading-relaxed text-platinum/75">Ares tiene acceso de solo lectura a tus proyectos, tareas y revisiones registradas. Sus respuestas son verificables, sin inventar acciones realizadas.</p>
        {ares.data?<div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[["Proyectos abiertos",ares.data.projects.length],["Tareas abiertas",ares.data.tasks.length],["Revisiones pendientes",ares.data.approvals.length],["Eventos de agentes",ares.data.agents.length]].map(([label,value])=>
            <div key={label} className="rounded-2xl border border-hairline bg-raised p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-2 font-display text-4xl">{value}</p>
            </div>
          )}
        </div>:<p role="status" className="mt-5 text-sm text-muted-foreground">{ares.isLoading?"Consultando registros…":"Sin datos disponibles"}</p>}
        <Link to="/ares" className="btn-gold mt-5 inline-flex">Consultar Ares <ArrowRight className="h-4 w-4"/></Link>
      </SectionCard>
      <SectionCard eyebrow="Foco" title="Temporizador Pomodoro" accent="var(--ares)" className="flex flex-col">
        <div className="flex flex-1 items-center justify-center py-4"><FocusTimer/></div>
        <p className="text-center text-xs text-muted-foreground">25 minutos de atención plena.</p>
      </SectionCard>
    </div>

    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <SectionCard eyebrow="Trabajo real" title="Estado de tus tareas" accent="var(--gold)">
        {work.isLoading&&<p role="status">Cargando…</p>}
        {work.data&&tasks.length===0&&<EmptyState icon={<ClipboardList className="h-5 w-5"/>} title="Sin tareas" text="Tus tareas aparecerán aquí cuando las registres."/>}
        {work.data&&tasks.length>0&&<>
          <div className="mb-5 flex items-center gap-5">
            <ProgressRing value={percent} color="var(--gold)" size={74} stroke={5}/>
            <div><p className="font-display text-4xl">{percent}%</p><p className="text-xs text-muted-foreground">{done} de {total} tareas completadas</p></div>
          </div>
          <ul className="space-y-3">
            {STATUSES.map(status=>{
              const count=tasks.filter(t=>t.status===status).length;
              return <li key={status} className="flex items-center gap-3 text-xs">
                <span className="w-20 shrink-0 text-muted-foreground">{status}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-foreground/10">
                  <div className="h-full rounded-full bg-gold" style={{width:(count/total*100)+"%"}}/>
                </div>
                <span className="w-6 text-right tabular-nums">{count}</span>
              </li>;
            })}
          </ul>
        </>}
      </SectionCard>
      <SectionCard eyebrow="Actividad" title="Compromisos recientes" accent="var(--projects)">
        {!work.data&&<p role="status" className="text-sm text-muted-foreground">Consultando tus tareas…</p>}
        {work.data&&tasks.length===0&&<p className="text-sm text-muted-foreground">No hay compromisos registrados.</p>}
        {work.data&&tasks.length>0&&<ul className="divide-y divide-hairline">
          {tasks.slice(0,7).map(t=><li key={t.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0"><p className="truncate text-sm font-medium">{t.title}</p><p className="text-xs text-muted-foreground">{t.project||"Sin proyecto"}</p></div>
            <span className="shrink-0 rounded-full border border-hairline px-2.5 py-1 text-[11px] text-platinum/75">{t.status}</span>
          </li>)}
        </ul>}
        <Link to="/proyectos" className="btn-ghost mt-4 inline-flex"><Sparkles className="h-4 w-4"/> Abrir tablero</Link>
      </SectionCard>
    </div>
  </div>;
}
