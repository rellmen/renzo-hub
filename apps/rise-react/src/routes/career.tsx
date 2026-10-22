import {createFileRoute,Link} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {Briefcase,BookOpen,RefreshCw,ShieldCheck} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PageHeader,SectionCard} from "@/components/rise/primitives";
import {pageHead} from "@/lib/seo";

export const Route=createFileRoute("/career")({
 head:()=>pageHead("Career y Data Lab","Trayectoria, habilidades y objetivos profesionales confirmados."),
 component:Career
});
type ConfirmedFact={label:string;value:string;asOf?:string;provenance?:string};
type SettingFact={value:string;confirmed?:boolean;confirmedAt?:string;source?:string};
const KEY_LABELS:Record<string,string>={career:"Dirección profesional",dutchGoal:"Objetivo neerlandés",englishGoal:"Objetivo inglés",workShifts:"Turnos confirmados",nativeLanguages:"Idiomas nativos"};
function Career(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const q=useQuery({queryKey:["career-confirmed",uid],enabled:!!uid&&!!client,
  queryFn:async()=>{
   const [r,s]=await Promise.all([
    client!.from("hub_records").select("payload,updated_at")
      .eq("owner_id",uid).eq("record_type","personal_fact").in("domain",["work","learning"]).limit(100),
    client!.from("user_settings").select("settings").eq("user_id",uid).maybeSingle()
   ]);
   if(r.error||s.error)throw Error("No se pudo consultar el contexto profesional confirmado.");
   const facts:ConfirmedFact[]=[];
   for(const row of r.data||[]){
    const p=row.payload as {confirmed?:boolean;facts?:ConfirmedFact[]}|null;
    if(p?.confirmed!==true||!Array.isArray(p.facts))continue;
    for(const f of p.facts){
     if(typeof f?.label==="string"&&typeof f?.value==="string"&&f.value.trim()){
      facts.push({label:f.label.slice(0,120),value:f.value.slice(0,600),
       asOf:typeof f.asOf==="string"?f.asOf:undefined,
       provenance:typeof f.provenance==="string"?f.provenance:undefined});
     }
    }
   }
   const settings=(s.data?.settings as {personalContext?:Record<string,SettingFact>}|null)?.personalContext||{};
   const context=Object.entries(settings)
    .filter(([key,f])=>key in KEY_LABELS&&f?.confirmed===true&&typeof f.value==="string"&&f.value.trim())
    .map(([key,f])=>({label:KEY_LABELS[key],value:f.value,asOf:f.confirmedAt||"",provenance:f.source||"Confirmado en RISE HUB"}));
   return{facts,context};
  },staleTime:60000,refetchOnWindowFocus:true});
 return <div className="space-y-6">
  <PageHeader eyebrow="CARRERA · DATOS PROFESIONALES" title="Career / Data Lab"
   subtitle="Un espacio independiente de SelfLearn para carrera, SQL, Python y analítica logística. No añade conocimientos ni certificados sin confirmación."/>
  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-platinum/75">
   <p><ShieldCheck className="mr-2 inline h-4 w-4 text-gold"/>Solo datos confirmados del perfil privado</p>
   <button type="button" className="btn-ghost" disabled={q.isFetching} onClick={()=>void q.refetch()}>
    <RefreshCw className={"h-4 w-4 "+(q.isFetching?"animate-spin":"")}/>Actualizar</button>
  </div>
  {q.isLoading&&<p role="status" className="surface p-4">Consultando trayectoria confirmada…</p>}
  {q.error&&<p role="alert" className="surface border border-gym/40 p-4 text-sm text-gym">No se pudo recuperar Career; no se han generado datos de demostración.</p>}
  {q.data&&<>
   <SectionCard eyebrow="Perfil verificado" title="Dirección profesional" accent="var(--projects)">
    {!q.data.context.length?<p className="text-sm text-muted-foreground">No hay datos de carrera confirmados en los ajustes de esta cuenta.</p>:
     <dl className="space-y-3">{q.data.context.map((f,i)=><div key={i} className="rounded-xl border border-hairline p-3">
      <dt className="text-xs text-muted-foreground">{f.label}</dt>
      <dd className="mt-1 text-sm font-medium">{f.value}</dd>
      <p className="mt-2 text-xs text-muted-foreground">{f.provenance} {f.asOf?"· "+f.asOf.slice(0,10):""}</p>
     </div>)}</dl>}
   </SectionCard>
   <SectionCard eyebrow="Histórico" title="Habilidades y experiencia" accent="var(--gold)">
    {!q.data.facts.length?<p className="text-sm text-muted-foreground">No hay hechos profesionales confirmados en el historial guardado.</p>:
     <dl className="space-y-3">{q.data.facts.map((f,i)=><div key={i} className="rounded-xl border border-hairline p-3">
      <dt className="text-xs text-muted-foreground">{f.label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm">{f.value}</dd>
      <p className="mt-2 text-xs text-muted-foreground">{[f.asOf?.slice(0,10),f.provenance].filter(Boolean).join(" · ")}</p>
     </div>)}</dl>}
   </SectionCard>
  </>}
  <SectionCard eyebrow="Aprendizaje separado" title="Career frente a SelfLearn" accent="var(--learn)">
   <p className="text-sm text-platinum/80">Career es para herramientas de datos, trabajo y portafolio. SelfLearn es exclusivamente para neerlandés e inglés. Los cursos técnicos todavía requieren un seguimiento específico para completar el portafolio.</p>
   <div className="mt-4 flex flex-wrap gap-2">
    <Link to="/proyectos" className="btn-gold inline-flex min-h-11 items-center"><Briefcase className="h-4 w-4"/>Proyectos</Link>
    <Link to="/aprender" className="btn-ghost inline-flex min-h-11 items-center"><BookOpen className="h-4 w-4"/>Idiomas</Link>
   </div>
  </SectionCard>
 </div>;
}
