import {createFileRoute,Link} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {RefreshCw,ShieldCheck,UtensilsCrossed} from "lucide-react";
import {pageHead} from "@/lib/seo";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PageHeader,SectionCard,EmptyState,Bar} from "@/components/rise/primitives";
import {loadBodyFoodSnapshot,type NutritionProgress} from "@/lib/body-food-snapshot.mjs";
export const Route=createFileRoute("/food")({head:()=>pageHead("Food","Alimentación registrada sin datos ficticios."),component:Food});
function FoodMetric({title,value,unit,progress}:{title:string;value:number;unit:string;progress:NutritionProgress}){
 return <SectionCard eyebrow="Registro de hoy" title={title} accent="var(--gold)">
 <p className="font-display text-4xl">{Math.round(value).toLocaleString("es-ES")} <span className="text-lg text-muted-foreground">{unit}</span></p>
 {progress.pct!==null?<div className="mt-4 space-y-2"><Bar value={progress.pct} color="var(--gold)"/><p className="text-xs text-muted-foreground">{progress.target?"Objetivo registrado: "+progress.target+" "+unit:"Progreso"}</p></div>:<p className="mt-4 text-sm text-muted-foreground">Sin objetivo configurado. No se asignan metas automáticamente.</p>}
 </SectionCard>;
}
function Food(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const q=useQuery({queryKey:["body-food",uid],enabled:!!client&&!!user,queryFn:()=>loadBodyFoodSnapshot(client!,user!),staleTime:30000});
 const d=q.data;
 return <div className="space-y-6">
 <PageHeader eyebrow="FOOD · NUTRICIÓN PRIVADA" title="Alimentación consciente."
  subtitle="Tus comidas y objetivos reales, sin generar cantidades de demostración."
  action={<button type="button" className="btn-ghost" disabled={q.isFetching} onClick={()=>void q.refetch()}><RefreshCw className="h-4 w-4"/> Actualizar</button>}/>
 <p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-gold"/> Consulta privada Supabase con RLS.</p>
 {q.isLoading&&<p role="status" className="surface p-5">Cargando comidas registradas…</p>}
 {q.error&&<p role="alert" className="surface border border-gym/40 p-4 text-sm text-gym">Error: {q.error instanceof Error?q.error.message:"No se pudieron recuperar tus comidas"}</p>}
 {d&&<><div className="grid gap-6 md:grid-cols-2">
 <FoodMetric title="Calorías" value={d.nutrition.kcal} unit="kcal" progress={d.kcalProgress}/>
 <FoodMetric title="Proteína" value={d.nutrition.protein} unit="g" progress={d.proteinProgress}/>
 </div><SectionCard eyebrow={d.today} title="Comidas registradas" accent="var(--gold)">
 {d.meals.length?<ul className="space-y-3">{d.meals.map((m,i)=><li key={m.id||i} className="flex items-start justify-between gap-4 rounded-2xl border border-hairline bg-raised p-4">
 <p className="min-w-0 break-words text-sm font-semibold">{m.title}</p>
 <p className="shrink-0 text-right text-xs text-platinum/80">{m.kcal===null?"Calorías sin dato":m.kcal+" kcal"}<span className="block mt-1">{m.protein===null?"Proteína sin dato":m.protein+" g proteína"}</span></p>
 </li>)}</ul>:<EmptyState icon={<UtensilsCrossed className="h-5 w-5"/>} title="Sin comidas registradas" text="Todavía no constan comidas para la fecha actual."/>}
 </SectionCard>
 <p className="text-xs text-muted-foreground">La edición de comidas y las compras siguen en la aplicación anterior hasta verificar su sincronización. <Link to="/body" className="text-gold underline">Volver a Body</Link></p>
 </>}
 </div>;
}