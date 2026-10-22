import {createFileRoute,Link} from "@tanstack/react-router";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useEffect,useState} from "react";
import {RefreshCw,ShieldCheck} from "lucide-react";
import {pageHead} from "@/lib/seo";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PageHeader,SectionCard} from "@/components/rise/primitives";
import {loadGastos,saveGastosCategory,GASTOS_CATEGORIES} from "@/lib/gastos-editor.mjs";

export const Route=createFileRoute("/gastos")({
 head:()=>pageHead("Gastos","Categorías reales de los movimientos bancarios guardados."),
 component:Expenses
});
const eur=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"});
function Expenses(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const [month,setMonth]=useState("");
 const query=useQuery({queryKey:["gastos-bank",uid],enabled:!!client&&!!uid,
  queryFn:()=>loadGastos(client!,uid),staleTime:15000,refetchOnWindowFocus:true});
 useEffect(()=>{if(query.data&&!query.data.months.includes(month))setMonth(query.data.months[0]||"");},[query.data,month]);
 const [status,setStatus]=useState("");
 const mutation=useMutation({mutationFn:async(input:{id:string;category:string})=>{
  if(!client||!query.data)throw Error("Actualiza tus movimientos antes de editar.");
  const row=query.data.transactions.find(t=>t.id===input.id);
  if(!row)throw Error("Movimiento no encontrado, actualiza.");
  return saveGastosCategory(client,uid,row,input.category);
 },onSuccess:async()=>{
  setStatus("Categoría guardada. Los informes volverán a calcularse con tus datos.");
  await Promise.all([
   qc.invalidateQueries({queryKey:["gastos-bank",uid]}),
   qc.invalidateQueries({queryKey:["money-real",uid]})
  ]);
 }});
 const summary=query.data&&month?query.data.summary(month):null;
 const items=(query.data?.items||[]).filter(i=>i.date?.startsWith(month)).slice(0,200);
 return <div className="space-y-6">
  <PageHeader eyebrow="MY FINANCE · GASTOS" title="Categoriza tus movimientos"
   subtitle="Utiliza los movimientos originales de ING y Revolut. Puedes corregir una categoría sin alterar fecha, importe o procedencia bancaria."/>
  <div className="flex flex-wrap items-center justify-between gap-3">
   <p className="text-xs text-muted-foreground"><ShieldCheck className="mr-1 inline h-4 w-4"/>Solo datos de tu sesión, protegidos por Supabase</p>
   <button className="btn-ghost min-h-11" type="button" disabled={query.isFetching||mutation.isPending} onClick={()=>void query.refetch()}><RefreshCw className="h-4 w-4"/>Actualizar</button>
  </div>
  {query.isLoading&&<p role="status" className="surface p-4">Cargando movimientos…</p>}
  {query.error&&<p role="alert" className="surface border border-gym/40 p-4 text-sm text-gym">No se pudo cargar el historial; no mostraremos cifras parciales.</p>}
  {query.data&&<>
   <SectionCard eyebrow="Periodo" title="Resumen mensual" accent="var(--money)">
    <label className="block text-sm">Mes
     <select value={month} onChange={e=>setMonth(e.target.value)} className="ml-3 min-h-11 rounded-xl border border-hairline bg-obsidian px-3">
      {query.data.months.map(m=><option key={m} value={m}>{m}</option>)}
     </select>
    </label>
    {summary&&<div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
     <div><p className="text-xs text-muted-foreground">Gastos</p><strong>{eur.format(summary.spent)}</strong></div>
     <div><p className="text-xs text-muted-foreground">Ingresos</p><strong>{eur.format(summary.earned)}</strong></div>
     <div><p className="text-xs text-muted-foreground">Sin categoría</p><strong>{summary.uncategorized}</strong></div>
    </div>}
   </SectionCard>
   <SectionCard eyebrow="Categorías" title="Movimientos bancarios" accent="var(--gold)">
    {!items.length&&<p className="text-sm text-muted-foreground">No hay movimientos para este periodo.</p>}
    <ul className="divide-y divide-hairline">{items.map(i=><li key={i.id} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
     <div className="min-w-0">
      <p className="truncate text-sm font-medium">{i.merchant||i.name||"Movimiento"}</p>
      <p className="mt-1 text-xs text-muted-foreground">{i.date} · {i.bank||"Banco no identificado"} · {i.source==="manual"?"Asignada manualmente":"Sugerida: "+i.source}</p>
      <p className="mt-1 text-sm">{eur.format(i.amount)}</p>
     </div>
     <label className="text-xs text-muted-foreground">Categoría
      <select aria-label={"Categoría de "+i.merchant+" "+i.date} value={i.category}
       disabled={mutation.isPending} onChange={e=>{setStatus("");mutation.mutate({id:i.id,category:e.target.value});}}
       className="mt-1 block min-h-11 w-full min-w-[185px] rounded-xl border border-hairline bg-obsidian px-3 text-foreground">
       {GASTOS_CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
     </label>
    </li>)}</ul>
    {summary&&summary.count>200&&<p className="mt-3 text-xs text-muted-foreground">Se muestran los primeros 200 movimientos del mes. Los totales incluyen todos los movimientos cargados.</p>}
   </SectionCard>
  </>}
  {status&&<p role="status" className="surface p-3 text-sm">{status}</p>}
  {mutation.error&&<p role="alert" className="surface border border-gym/40 p-3 text-sm text-gym">{mutation.error instanceof Error?mutation.error.message:"No se pudo guardar la categoría."}</p>}
  <p className="text-xs text-muted-foreground">Importación y reglas por comercio siguen pendientes de portar a React. <Link to="/dinero" className="text-gold underline">Volver al resumen financiero</Link>.</p>
 </div>;
}
