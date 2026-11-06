import {createFileRoute,Link} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {ArrowRight,CheckCircle2,ClipboardList,GraduationCap,ShieldCheck} from "lucide-react";
import hero from "@/assets/hero-eclipse.jpg";
import learn from "@/assets/learn.jpg";
import gym from "@/assets/gym.jpg";
import money from "@/assets/money.jpg";
import skin from "@/assets/skin.jpg";
import projects from "@/assets/projects.jpg";
import {pageHead} from "@/lib/seo";
import {PhotoModuleCard} from "@/components/rise/PhotoModuleCard";
import {useAuth} from "@/lib/auth/AuthProvider";
import {loadAresRecords} from "@/lib/ares-records.mjs";
import {loadWorkRecords} from "@/lib/work-records.mjs";
import {loadLearningSnapshot} from "@/lib/selflearn-snapshot.mjs";
import {RoadmapToday} from "@/components/rise/roadmap/RoadmapToday";
import {PriorityBoard} from "@/components/rise/PriorityBoard";

export const Route=createFileRoute("/")({
  head:()=>pageHead("Centro de mando","Tu próxima evolución: tus datos reales y las disciplinas de Rise."),
  component:Home
});

/**
 * Inicio limpio (6-11-2026, opción C): cabecera compacta → 4 cifras → prioridades → roadmap de hoy → accesos.
 * El Pomodoro vive ahora en Trabajo > Proyectos; el estado de tareas y la actividad reciente, en Proyectos;
 * Ares tiene su propio hub. Nada se ha borrado, solo se ha movido a su sitio.
 */
const MODULES=[
  {to:"/academy" as const,image:learn,eyebrow:"ACADEMY",title:"Aprende sin límites",meta:"Idiomas · UOC +25 · Data",color:"var(--learn)"},
  {to:"/gym" as const,image:gym,eyebrow:"BODY",title:"Más fuerte cada día",meta:"Gym, comida, piel y medidas",color:"var(--gym)"},
  {to:"/dinero" as const,image:money,eyebrow:"MONEY",title:"Capital con intención",meta:"Resumen, gastos y nóminas",color:"var(--money)"},
  {to:"/piel" as const,image:skin,eyebrow:"PIEL",title:"Ritual consciente",meta:"Rutina de mañana y noche",color:"var(--skin)"},
  {to:"/proyectos" as const,image:projects,eyebrow:"TRABAJO",title:"Trabajo profundo",meta:"Turnos, proyectos y notas",color:"var(--projects)"}
];
const today=()=>new Intl.DateTimeFormat("es-ES",{weekday:"long",day:"numeric",month:"long"}).format(new Date());

function Home(){
  const {user,client}=useAuth();
  const uid=user?.id||"";
  const ares=useQuery({queryKey:["ares-records",uid],enabled:!!client&&!!uid,
    queryFn:()=>loadAresRecords(client!,uid),staleTime:20_000});
  const work=useQuery({queryKey:["work-records",uid],enabled:!!client&&!!uid,
    queryFn:()=>loadWorkRecords(client!,uid),staleTime:20_000});
  const learnQ=useQuery({queryKey:["selflearn-snapshot",uid],enabled:!!client&&!!uid,
    queryFn:()=>loadLearningSnapshot(client!,uid),staleTime:60_000});
  const tasks=work.data?.tasks||[];
  const done=tasks.filter(x=>x.status==="Completed").length;
  const percent=tasks.length?Math.round(100*done/tasks.length):0;
  const stats=[
    {label:"Tareas abiertas",value:ares.data?String(ares.data.tasks.length):"—",icon:ClipboardList,color:"var(--projects)",to:"/proyectos" as const},
    {label:"Completadas",value:work.data?percent+"%":"—",icon:CheckCircle2,color:"var(--gym)",to:"/proyectos" as const},
    {label:"Por revisar",value:ares.data?String(ares.data.approvals.length):"—",icon:ShieldCheck,color:"var(--gold)",to:"/inbox" as const},
    {label:"Unidades Academy",value:learnQ.data?String(learnQ.data.completed.nl.length+learnQ.data.completed.en.length):"—",icon:GraduationCap,color:"var(--learn)",to:"/academy" as const}
  ];
  return <div className="space-y-5 lg:space-y-7">
    <section className="surface rim relative min-h-[210px] overflow-hidden sm:min-h-[240px]" style={{background:"var(--gradient-wine)"}}>
      <img src={hero} alt="" width={1920} height={832} className="absolute inset-0 h-full w-full object-cover object-[60%_center] animate-pan"/>
      <div className="absolute inset-0 bg-hero-side"/>
      <div className="absolute inset-0 bg-photo-fade opacity-70 lg:opacity-30"/>
      <div className="relative flex min-h-[inherit] flex-col justify-end gap-3 p-5 sm:p-8 lg:p-10">
        <div className="flex items-center gap-3"><span className="h-px w-10 bg-gold"/><span className="eyebrow first-letter:uppercase">{today()}</span></div>
        <h1 className="max-w-xl font-display text-[2.6rem] font-medium leading-[0.95] text-foreground sm:text-6xl animate-rise">
          Tu próxima <em className="text-gold-gradient">evolución.</em>
        </h1>
        <p className="max-w-sm text-sm text-platinum/80">Disciplina hoy. Libertad mañana.</p>
      </div>
    </section>

    {(ares.error||work.error||learnQ.error)&&<p role="alert" className="surface border border-gym/40 p-3 text-sm text-gym">
      Algunas cifras no se han podido cargar y aparecen como «—».
    </p>}
    <section aria-label="Resumen del día" className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      {stats.map(k=><Link key={k.label} to={k.to} className="surface rim flex min-w-0 items-center gap-3 p-3 transition-colors hover:border-gold/30 sm:p-4">
        <k.icon className="h-5 w-5 shrink-0" style={{color:k.color}}/>
        <span className="min-w-0">
          <span className="block font-display text-2xl leading-none text-foreground sm:text-3xl" aria-live="polite">{k.value}</span>
          <span className="mt-1 block truncate text-xs text-muted-foreground">{k.label}</span>
        </span>
      </Link>)}
    </section>

    <PriorityBoard/>
    <RoadmapToday compact/>

    <section>
      <div className="mb-3 flex items-end justify-between">
        <div><div className="eyebrow mb-1">Tus hubs</div><h2 className="font-display text-2xl text-foreground sm:text-3xl">Un sistema. Un propósito.</h2></div>
        <Link to="/apps" className="flex items-center gap-1 text-xs text-gold">Todas las apps <ArrowRight className="h-3.5 w-3.5"/></Link>
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 xl:grid-cols-5">
        {MODULES.map(m=><div key={m.to} className="w-[58%] shrink-0 snap-start sm:w-auto">
          <PhotoModuleCard {...m} progress={m.to==="/proyectos"&&work.data?percent:undefined}/>
        </div>)}
      </div>
    </section>
  </div>;
}
