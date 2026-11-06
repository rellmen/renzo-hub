import {createFileRoute} from "@tanstack/react-router";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useState,type FormEvent} from "react";
import {Activity,HeartPulse,RefreshCw,Scale,UtensilsCrossed} from "lucide-react";
import {pageHead} from "@/lib/seo";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PageHeader,SectionCard,EmptyState,Bar} from "@/components/rise/primitives";
import {loadBodyFoodSnapshot} from "@/lib/body-food-snapshot.mjs";
import {saveBodyWeight} from "@/lib/body-food-entry.mjs";
import {BodyGoals} from "@/components/rise/BodyGoals";
import {SubTabs,useSubTab} from "@/components/rise/SubTabs";
/** Medidas (6-11-2026): resumen y peso; objetivos en su pestaña. */
const TABS=[{id:"resumen",label:"Resumen"},{id:"objetivos",label:"Objetivos"}] as const;
export const Route=createFileRoute("/body")({head:()=>pageHead("Body","Tu cuerpo y progreso privado a partir de registros reales."),component:Body});
const kg=(x:number)=>new Intl.NumberFormat("es-ES",{maximumFractionDigits:1}).format(x)+" kg";
function Body(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const [weight,setWeight]=useState("");
 const [tab,go]=useSubTab(TABS,"resumen");
 const save=useMutation({mutationFn:()=>saveBodyWeight(client!,uid,weight),
   onSuccess:async()=>{setWeight("");await qc.invalidateQueries({queryKey:["body-food",uid]});}});
 function submitWeight(e:FormEvent<HTMLFormElement>){e.preventDefault();save.mutate();}
 const query=useQuery({queryKey:["body-food",uid],enabled:!!client&&!!user,queryFn:()=>loadBodyFoodSnapshot(client!,user!),staleTime:30000});
 const data=query.data?.body;
 return <div className="space-y-6">
 <PageHeader eyebrow="BODY · MEDIDAS" title="Medidas"
   action={<button type="button" className="btn-ghost" aria-label="Actualizar" disabled={query.isFetching} onClick={()=>void query.refetch()}><RefreshCw className={"h-4 w-4 "+(query.isFetching?"animate-spin":"")}/></button>}/>
 <SubTabs tabs={TABS} value={tab} onChange={go} label="Apartados de Medidas" accent="var(--gym)"/>
 {query.isLoading&&<p role="status" className="surface p-5">Cargando registros de Body…</p>}
 {query.error&&<p role="alert" className="surface border border-gym/40 p-4 text-sm text-gym">Error al recuperar datos: {query.error instanceof Error?query.error.message:"Error de conexión"}</p>}
 {data&&tab==="resumen"&&<>
 <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
 {[
  {label:"Último peso",value:data.weight.current?kg(data.weight.current.value):"Sin registro",icon:Scale},
  {label:"Sesiones esta semana",value:String(data.gym.week),icon:Activity},
  {label:"Comidas hoy",value:data.food?String(data.food.meals):"Sin registro",icon:UtensilsCrossed},
  {label:"Pasos Skin hoy",value:data.skin.am+" AM · "+data.skin.pm+" PM",icon:HeartPulse}
 ].map(x=><article key={x.label} className="surface rim p-4"><x.icon className="mb-3 h-5 w-5 text-gold"/><p className="text-xs text-muted-foreground">{x.label}</p><p className="mt-2 break-words font-display text-2xl">{x.value}</p></article>)}
 </div>
 <div className="grid gap-6">
 <SectionCard eyebrow="Evolución" title="Peso corporal" accent="var(--gym)">
 {data.weight.current?<div className="space-y-3">
 <p className="font-display text-5xl text-gold-gradient">{kg(data.weight.current.value)}</p>
 {data.weight.change===null?<p className="text-xs text-muted-foreground">Se necesitan al menos dos registros para calcular la tendencia.</p>:<p className="text-sm text-muted-foreground">Cambio observado: {data.weight.change>0?"+":""}{kg(data.weight.change)}</p>}
 {data.weight.goal?<div><p className="mb-2 text-xs">Meta registrada: {kg(data.weight.goal.target)}</p><Bar value={data.weight.goal.pct} color="var(--gym)"/></div>:<p className="text-xs text-muted-foreground">No tienes una meta de peso registrada; no calcularé una por defecto.</p>}
 {data.weight.points.length>1&&<ul className="space-y-1">{data.weight.points.slice(-6).reverse().map(w=><li key={w.date} className="flex justify-between border-b border-hairline py-2 text-xs"><span>{w.date}</span><span>{kg(w.value)}</span></li>)}</ul>}
 </div>:<EmptyState icon={<Scale className="h-5 w-5"/>} title="Sin registros de peso" text="No se ha encontrado un peso registrado en tu cuenta."/>}
 </SectionCard>
 </div>
 <SectionCard eyebrow="Nuevo registro" title="Guardar peso de hoy" accent="var(--gym)">
   <form onSubmit={submitWeight} className="flex flex-wrap items-end gap-3">
     <label className="min-w-48 flex-1 space-y-2 text-xs text-muted-foreground">
       Peso medido (kg)
       <input type="number" min={20} max={500} step="0.1" required inputMode="decimal"
         value={weight} onChange={e=>setWeight(e.target.value)}
         className="min-h-12 w-full rounded-xl border border-input bg-obsidian px-3 text-sm text-foreground"
         placeholder="Ej. 72,5"/>
     </label>
     <button type="submit" disabled={save.isPending||!weight.trim()} className="btn-gold min-h-12">
       {save.isPending?"Guardando…":"Guardar medición"}
     </button>
   </form>
   {save.error&&<p role="alert" className="mt-3 text-sm text-gym">
     {save.error instanceof Error?save.error.message:"No se guardó la medición."}
   </p>}
   {save.isSuccess&&<p role="status" className="mt-3 text-xs text-muted-foreground">Registro confirmado en tu cuenta.</p>}
 </SectionCard>
 </>}
 {tab==="objetivos"&&<BodyGoals/>}
 </div>;
}