import {createFileRoute,Link} from "@tanstack/react-router";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useState,type FormEvent} from "react";
import {RefreshCw,ShieldCheck,UtensilsCrossed} from "lucide-react";
import {pageHead} from "@/lib/seo";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PageHeader,SectionCard,EmptyState,Bar} from "@/components/rise/primitives";
import {loadBodyFoodSnapshot,type NutritionProgress} from "@/lib/body-food-snapshot.mjs";
import {saveFoodMeal} from "@/lib/body-food-entry.mjs";
export const Route=createFileRoute("/food")({head:()=>pageHead("Food","Alimentación registrada sin datos ficticios."),component:Food});
function FoodMetric({title,value,unit,progress}:{title:string;value:number;unit:string;progress:NutritionProgress}){
 return <SectionCard eyebrow="Registro de hoy" title={title} accent="var(--gold)">
 <p className="font-display text-4xl">{Math.round(value).toLocaleString("es-ES")} <span className="text-lg text-muted-foreground">{unit}</span></p>
 {progress.pct!==null?<div className="mt-4 space-y-2"><Bar value={progress.pct} color="var(--gold)"/><p className="text-xs text-muted-foreground">{progress.target?"Objetivo registrado: "+progress.target+" "+unit:"Progreso"}</p></div>:<p className="mt-4 text-sm text-muted-foreground">Sin objetivo configurado. No se asignan metas automáticamente.</p>}
 </SectionCard>;
}
function Food(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const [meal,setMeal]=useState("");
 const [kcal,setKcal]=useState("");
 const [protein,setProtein]=useState("");
 const saving=useMutation({mutationFn:()=>saveFoodMeal(client!,uid,{meal,kcal,protein}),
   onSuccess:async()=>{setMeal("");setKcal("");setProtein("");await qc.invalidateQueries({queryKey:["body-food",uid]});}});
 function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();saving.mutate();}
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
 <SectionCard eyebrow="Nueva entrada" title="Registrar una comida real" accent="var(--gold)">
   <form onSubmit={submit} className="grid gap-3 sm:grid-cols-3">
     <label className="space-y-2 text-xs text-muted-foreground sm:col-span-3">Comida o alimento
       <input type="text" required maxLength={140} value={meal}
         onChange={e=>setMeal(e.target.value)}
         placeholder="Nombre real del alimento o plato"
         className="min-h-12 w-full rounded-xl border border-input bg-obsidian px-3 text-sm text-foreground"/>
     </label>
     <label className="space-y-2 text-xs text-muted-foreground">Calorías registradas (opcional)
       <input type="number" inputMode="decimal" min={0} max={15000} step="1" value={kcal}
         onChange={e=>setKcal(e.target.value)}
         className="min-h-12 w-full rounded-xl border border-input bg-obsidian px-3 text-sm text-foreground"/>
     </label>
     <label className="space-y-2 text-xs text-muted-foreground">Proteína registrada (g, opcional)
       <input type="number" inputMode="decimal" min={0} max={1000} step="0.1" value={protein}
         onChange={e=>setProtein(e.target.value)}
         className="min-h-12 w-full rounded-xl border border-input bg-obsidian px-3 text-sm text-foreground"/>
     </label>
     <button type="submit" className="btn-gold min-h-12 self-end"
       disabled={saving.isPending||!meal.trim()||(!kcal.trim()&&!protein.trim())}>
       {saving.isPending?"Guardando…":"Guardar comida"}
     </button>
   </form>
   {saving.error&&<p role="alert" className="mt-3 text-sm text-gym">
     {saving.error instanceof Error?saving.error.message:"No se pudo guardar la comida."}
   </p>}
   {saving.isSuccess&&<p role="status" className="mt-3 text-xs text-muted-foreground">Comida guardada en Supabase.</p>}
   <p className="mt-3 text-xs text-muted-foreground">Solo utiliza valores nutricionales que conozcas; los campos vacíos no se convierten en mediciones ficticias. No se modifican entradas anteriores.</p>
 </SectionCard>
 <p className="text-xs text-muted-foreground">La edición de comidas y las compras siguen en la aplicación anterior hasta verificar su sincronización. <Link to="/body" className="text-gold underline">Volver a Body</Link></p>
 </>}
 </div>;
}