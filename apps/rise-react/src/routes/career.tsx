import {createFileRoute,Link} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {ArrowRight,Map,RefreshCw} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PageHeader,SectionCard} from "@/components/rise/primitives";
import {pageHead} from "@/lib/seo";
import {CareerTracker} from "@/components/rise/CareerTracker";
import {SubTabs,useSubTab} from "@/components/rise/SubTabs";

/** Dos pestañas (6-11-2026): la ruta y el tracker primero; el perfil confirmado, aparte. */
const TABS=[{id:"ruta",label:"Ruta y skills"},{id:"perfil",label:"Perfil"}] as const;

export const Route=createFileRoute("/career")({
 head:()=>pageHead("Career y Data Lab","Trayectoria, habilidades y objetivos profesionales confirmados."),
 component:Career
});
type ConfirmedFact={label:string;value:string;asOf?:string|undefined;provenance?:string|undefined};
type SettingFact={value:string;confirmed?:boolean;confirmedAt?:string;source?:string};
const KEY_LABELS:Record<string,string>={career:"Dirección profesional",dutchGoal:"Objetivo neerlandés",englishGoal:"Objetivo inglés",workShifts:"Turnos confirmados",nativeLanguages:"Idiomas nativos"};
function Career(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const [tab,go]=useSubTab(TABS,"ruta");
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
    .map(([key,f])=>({label:KEY_LABELS[key],value:f.value,asOf:f.confirmedAt||"",provenance:f.source||"Confirmado en Rise"}));
   return{facts,context};
  },staleTime:60000,refetchOnWindowFocus:true});
 return <div className="space-y-5">
  <PageHeader eyebrow="ACADEMY · DATA & CARRERA" title="Data Lab"
   subtitle="SQL, Python, Power BI, certificados y portfolio."
   action={<button type="button" className="btn-ghost" disabled={q.isFetching} aria-label="Actualizar" onClick={()=>void q.refetch()}>
    <RefreshCw className={"h-4 w-4 "+(q.isFetching?"animate-spin":"")}/></button>}/>
  <SubTabs tabs={TABS} value={tab} onChange={go} label="Apartados de Data & Carrera" accent="var(--learn)"/>
  {tab==="ruta"&&<>
   <Link to="/roadmap" className="surface rim flex min-h-11 items-center gap-3 p-4 hover:border-gold/40">
    <Map className="h-5 w-5 shrink-0 text-gold"/>
    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Roadmap 2026–2032</span>
     <span className="block truncate text-xs text-muted-foreground">Operaciones → Data Analyst → Data Engineer → AI Systems</span></span>
    <ArrowRight className="h-4 w-4 shrink-0"/></Link>
   <CareerTracker/>
  </>}
  {tab==="perfil"&&<>
  {q.isLoading&&<p role="status" className="surface p-4">Consultando trayectoria confirmada…</p>}
  {q.error&&<p role="alert" className="surface border border-gym/40 p-4 text-sm text-gym">No se pudo cargar Data & Carrera.</p>}
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
  </>}
 </div>;
}
