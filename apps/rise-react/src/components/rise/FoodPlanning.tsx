import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useEffect,useState} from "react";
import {Pencil,Trash2} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {SectionCard} from "@/components/rise/primitives";
import {SHOPPING_BASE,deleteMeal,loadTodayMeals,readShop,toggleShop,updateMeal} from "@/lib/food-planning.mjs";

const field="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground";
export function FoodMealEditor({day}:{day:string}){
 const {client,user}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const meals=useQuery({queryKey:["food-meals-edit",uid,day],enabled:!!client&&!!uid,queryFn:()=>loadTodayMeals(client,uid,day),staleTime:0});
 const [edit,setEdit]=useState<string|null>(null);const [form,setForm]=useState({meal:"",kcal:"",protein:""});const [confirm,setConfirm]=useState<string|null>(null);
 useEffect(()=>{setEdit(null);setConfirm(null);},[uid,day]);
 const run=useMutation({mutationFn:(op:()=>Promise<unknown>)=>op(),onSuccess:async()=>{setEdit(null);setConfirm(null);
  await Promise.all([qc.invalidateQueries({queryKey:["food-meals-edit",uid]}),qc.invalidateQueries({queryKey:["body-food",uid]})]);}});
 if(!meals.data?.length)return null;
 return <SectionCard eyebrow="Corregir" title="Editar comidas de hoy" accent="var(--gold)">
  <ul className="divide-y divide-hairline">{meals.data.map(r=>{const p=r.payload||{};return <li key={r.id} className="py-2 text-sm">
   <div className="flex flex-wrap items-center justify-between gap-2"><span className="break-words">{p.meal||"Comida"}</span>
    <span className="flex gap-2"><button type="button" aria-label="Editar comida" className="btn-ghost min-h-8 px-2" onClick={()=>{run.reset();setConfirm(null);setEdit(r.id);setForm({meal:p.meal||"",kcal:p.kcal??"",protein:p.protein??""});}}><Pencil className="h-3.5 w-3.5"/></button>
     <button type="button" aria-label="Eliminar comida" className="btn-ghost min-h-8 px-2" onClick={()=>{run.reset();setEdit(null);setConfirm(r.id);}}><Trash2 className="h-3.5 w-3.5"/></button></span></div>
   {edit===r.id&&<div className="mt-2 grid gap-2 sm:grid-cols-4 sm:items-end">
    <label className="block text-xs text-muted-foreground sm:col-span-2">Comida<input value={form.meal} maxLength={140} onChange={e=>setForm(f=>({...f,meal:e.target.value}))} className={field}/></label>
    <label className="block text-xs text-muted-foreground">Kcal<input value={form.kcal} inputMode="decimal" onChange={e=>setForm(f=>({...f,kcal:e.target.value}))} className={field}/></label>
    <label className="block text-xs text-muted-foreground">Proteína (g)<input value={form.protein} inputMode="decimal" onChange={e=>setForm(f=>({...f,protein:e.target.value}))} className={field}/></label>
    <div className="flex gap-2 sm:col-span-4"><button type="button" className="btn-gold min-h-11" disabled={run.isPending} onClick={()=>run.mutate(()=>updateMeal(client,uid,r,form))}>Guardar</button><button type="button" className="btn-ghost min-h-11" onClick={()=>setEdit(null)}>Cancelar</button></div>
   </div>}
   {confirm===r.id&&<div role="group" aria-label="Confirmar eliminación" className="mt-2 rounded-xl border border-gym/40 p-3 text-xs"><p>¿Eliminar esta comida? No se puede deshacer.</p>
    <div className="mt-2 flex gap-2"><button type="button" className="btn-gold min-h-9 px-3" disabled={run.isPending} onClick={()=>run.mutate(()=>deleteMeal(client,uid,r))}>Eliminar</button><button type="button" className="btn-ghost min-h-9 px-3" onClick={()=>setConfirm(null)}>Cancelar</button></div></div>}
  </li>;})}</ul>
  {run.error&&<p role="alert" className="mt-2 text-sm text-gym">{run.error instanceof Error?run.error.message:"No se pudo guardar."}</p>}
 </SectionCard>;
}
export function FoodShopping({budget}:{budget:{min?:number;max?:number}}){
 const {user}=useAuth(),uid=user?.id||"";
 const month=new Date().toISOString().slice(0,7);
 const [done,setDone]=useState<string[]>([]);
 useEffect(()=>{setDone(uid?readShop(uid,month):[]);},[uid,month]);
 const has=Number.isFinite(budget.min)||Number.isFinite(budget.max);
 return <SectionCard eyebrow={"Compra mensual · "+month} title={`${done.length}/${SHOPPING_BASE.length} comprados`} accent="var(--gold)">
  <ul className="divide-y divide-hairline">{SHOPPING_BASE.map(([name,qty])=><li key={name}>
   <label className="flex min-h-11 items-center justify-between gap-3 py-2 text-sm">
    <span className="flex items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-[var(--gold)]" checked={done.includes(name)} disabled={!uid}
     onChange={e=>setDone(toggleShop(uid,month,name,e.target.checked))}/><span className={done.includes(name)?"text-muted-foreground line-through":""}>{name}</span></span>
    <span className="text-xs text-platinum/75">{qty}</span></label></li>)}</ul>
  <p className="mt-2 text-xs text-muted-foreground">Base para 1 persona, en crudo o tal como se vende. Las casillas se guardan en este dispositivo y se reinician cada mes.</p>
  <p className="mt-2 text-xs">{has?`Tu presupuesto mensual: ${Number.isFinite(budget.min)?budget.min:"—"}–${Number.isFinite(budget.max)?budget.max:"—"} €.`:"Sin presupuesto de comida en tu perfil corporal (Body). Referencia orientativa del plan original: base 180–230 €/mes, económica 150–180 €/mes."}</p>
 </SectionCard>;
}
