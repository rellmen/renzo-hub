import {createFileRoute,Link} from "@tanstack/react-router";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useEffect,useState} from "react";
import {ChevronDown,Pencil,RefreshCw} from "lucide-react";
import {pageHead} from "@/lib/seo";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PageHeader,SectionCard} from "@/components/rise/primitives";
import {CarPanel} from "@/components/rise/money/CarPanel";
import {ReceiptsPanel} from "@/components/rise/money/ReceiptsPanel";
import {BankStatementImport} from "@/components/rise/BankStatementImport";
import {loadGastos,saveGastosCategory,saveMerchantRule,deleteMerchantRule,GASTOS_CATEGORIES,type MoneyRule} from "@/lib/gastos-editor.mjs";

export const Route=createFileRoute("/gastos")({
 head:()=>pageHead("Gastos","Categorías reales de los movimientos bancarios y gastos fijos del coche."),
 component:Expenses
});
const eur=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"});
// Apartados de Gastos. El hash (#coche, #tickets…) abre el apartado: /car lleva a #coche.
const TABS=[{id:"categorias",label:"Categorías"},{id:"coche",label:"Coche"},{id:"tickets",label:"Tickets"},{id:"reglas",label:"Reglas"},{id:"importar",label:"Importar"}] as const;
type Tab=typeof TABS[number]["id"];
const tabFromHash=():Tab=>{const h=typeof window==="undefined"?"":window.location.hash.slice(1);return (TABS.find(t=>t.id===h)?.id)||"categorias";};
const KIND_ORDER:Record<string,number>={expense:0,income:1,transfer:2};
type Item={id:string;date:string;merchant:string;name?:string;amount:number;category:string;bank?:string;source:string};
// Agrupa los movimientos del mes por categoría: primero "Sin categoría", luego gastos de mayor a menor, ingresos y traspasos.
function groupByCategory(items:Item[]){
 const map=new Map<string,{id:string;name:string;icon:string;kind:string;items:Item[];total:number}>();
 for(const i of items){
  const c=GASTOS_CATEGORIES.find(x=>x.id===i.category)||{id:i.category||"sin_categoria",name:"Sin categoría",kind:"expense",icon:"?"};
  const g=map.get(c.id)||{id:c.id,name:c.name,icon:c.icon,kind:c.kind,items:[],total:0};
  g.items.push(i);g.total=Math.round((g.total+(Number(i.amount)||0))*100)/100;map.set(c.id,g);
 }
 return [...map.values()].sort((a,b)=>(a.id==="sin_categoria"?-1:b.id==="sin_categoria"?1:0)
  ||(KIND_ORDER[a.kind]??3)-(KIND_ORDER[b.kind]??3)||Math.abs(b.total)-Math.abs(a.total));
}
function Expenses(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const [month,setMonth]=useState("");
 const [tab,setTab]=useState<Tab>("categorias");
 const [editing,setEditing]=useState("");
 useEffect(()=>{const sync=()=>setTab(tabFromHash());sync();window.addEventListener("hashchange",sync);return()=>window.removeEventListener("hashchange",sync);},[]);
 const go=(t:Tab)=>{setTab(t);if(typeof window!=="undefined")window.history.replaceState(null,"",t==="categorias"?window.location.pathname:"#"+t);};
 const query=useQuery({queryKey:["gastos-bank",uid],enabled:!!client&&!!uid,
  queryFn:()=>loadGastos(client!,uid),staleTime:15000,refetchOnWindowFocus:true});
 useEffect(()=>{if(query.data&&!query.data.months.includes(month))setMonth(query.data.months[0]||"");},[query.data,month]);
 const [status,setStatus]=useState("");
 const [pending,setPending]=useState<{id:string;merchant:string;category:string}|null>(null);
 useEffect(()=>{setPending(null);setEditing("");},[uid,month]);
 const name=(id:string)=>GASTOS_CATEGORIES.find(c=>c.id===id)?.name||id;
 const mutation=useMutation({mutationFn:async(input:{id:string;category:string;scope:"one"|"merchant"|"delete-rule";rule?:MoneyRule;merchant?:string})=>{
  if(!client||!query.data)throw Error("Actualiza tus movimientos antes de editar.");
  if(input.scope==="delete-rule"){await deleteMerchantRule(client,uid,input.rule!);return "Regla eliminada. Esos movimientos vuelven a la categoría sugerida.";}
  const row=query.data.transactions.find(t=>t.id===input.id);
  if(!row)throw Error("Movimiento no encontrado, actualiza.");
  if(input.scope==="merchant"){await saveMerchantRule(client,uid,{merchant:input.merchant||"",txRow:row},input.category,query.data.rules);
   return `Todos los movimientos de ${input.merchant} pasan a ${name(input.category)}, también los que importes después.`;}
  await saveGastosCategory(client,uid,row,input.category);return "Categoría guardada. Los informes volverán a calcularse con tus datos.";
 },onSuccess:async(text)=>{
  setPending(null);setEditing("");setStatus(text);
  await Promise.all([
   qc.invalidateQueries({queryKey:["gastos-bank",uid]}),
   qc.invalidateQueries({queryKey:["money-real",uid]})
  ]);
 }});
 const summary=query.data&&month?query.data.summary(month):null;
 const monthItems=(query.data?.items||[]).filter(i=>i.date?.startsWith(month)) as Item[];
 const groups=groupByCategory(monthItems);
 return <div className="space-y-6">
  
  <PageHeader eyebrow="MONEY · GASTOS" title="Categoriza tus movimientos"
   subtitle="Tus movimientos de ING y Revolut agrupados por categoría. Toca una categoría para desplegarla y un movimiento para cambiarlo."/>
  <div className="flex flex-wrap items-center justify-end gap-3">
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
     <div><p className="text-xs text-muted-foreground">Ingresos (nómina y ayudas)</p><strong>{eur.format(summary.earned)}</strong></div>
     <div><p className="text-xs text-muted-foreground">Recibido de personas</p><strong>{eur.format(summary.received)}</strong></div>
     <div><p className="text-xs text-muted-foreground">Sin categoría</p><strong>{summary.uncategorized}</strong></div>
    </div>}
   </SectionCard>
  </>}
  <div role="tablist" aria-label="Apartados de Gastos" className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-hairline bg-obsidian p-1">
   {TABS.map(t=><button key={t.id} type="button" role="tab" aria-selected={tab===t.id} onClick={()=>go(t.id)}
    className={"min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold "+(tab===t.id?"bg-money/20 text-foreground ring-1 ring-money/50":"text-muted-foreground")}>
    {t.label}{t.id==="categorias"&&summary&&summary.uncategorized>0?<span className="ml-1 rounded-full bg-gym/25 px-1.5 text-[10px] text-gym">{summary.uncategorized}</span>:null}
    {t.id==="reglas"&&query.data?.rules.length?<span className="ml-1 text-[10px] text-muted-foreground">{query.data.rules.length}</span>:null}
   </button>)}
  </div>
  {tab==="coche"&&<CarPanel month={month}/>}
  {tab==="tickets"&&query.data&&<ReceiptsPanel items={query.data.items} month={month}/>}
  {tab==="importar"&&<BankStatementImport/>}
  {tab==="categorias"&&query.data&&<section aria-label="Movimientos por categoría" className="space-y-2">
   {!groups.length&&<p className="surface p-4 text-sm text-muted-foreground">No hay movimientos para este periodo. <button type="button" className="text-gold underline" onClick={()=>go("importar")}>Importar un extracto</button></p>}
   {groups.map(g=><details key={g.id+month} open={g.id==="sin_categoria"} className="group surface overflow-hidden rounded-2xl">
    <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
     <span aria-hidden className="w-6 text-center text-lg">{g.icon}</span>
     <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{g.name}</span>
      <span className="text-xs text-muted-foreground">{g.items.length} {g.items.length===1?"movimiento":"movimientos"}{g.kind==="transfer"?" · no cuenta como gasto":""}</span></span>
     <span className={"text-sm font-semibold tabular-nums "+(g.id==="sin_categoria"?"text-gym":g.total>0?"text-money":"")}>{eur.format(g.total)}</span>
     <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"/>
    </summary>
    <ul className="divide-y divide-hairline border-t border-hairline">{g.items.map(i=><li key={i.id} className="px-4 py-3">
     <button type="button" className="flex w-full items-center gap-3 text-left" aria-expanded={editing===i.id}
      onClick={()=>{setStatus("");mutation.reset();setPending(null);setEditing(editing===i.id?"":i.id);}}>
      <span className="min-w-0 flex-1"><span className="block truncate text-sm">{i.merchant||i.name||"Movimiento"}</span>
       <span className="text-[11px] text-muted-foreground">{i.date} · {i.bank||"Banco no identificado"}{i.source==="manual"?" · a mano":""}</span></span>
      <span className="text-sm tabular-nums">{eur.format(i.amount)}</span>
      <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground"/>
     </button>
     {editing===i.id&&<div className="mt-3 space-y-2">
      <label className="block text-xs text-muted-foreground">Categoría
       <select aria-label={"Categoría de "+i.merchant+" "+i.date} value={pending?.id===i.id?pending.category:i.category}
        disabled={mutation.isPending} onChange={e=>{setStatus("");mutation.reset();setPending({id:i.id,merchant:i.merchant,category:e.target.value});}}
        className="mt-1 block min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-foreground">
        {GASTOS_CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
       </select>
      </label>
      {pending?.id===i.id&&pending.category!==i.category&&<div role="group" aria-label="Aplicar categoría" className="rounded-xl border border-gold/40 p-3 text-xs">
       <p>Cambiar a <strong>{name(pending.category)}</strong>:</p>
       <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="btn-gold min-h-9 px-3" disabled={mutation.isPending} onClick={()=>mutation.mutate({id:i.id,category:pending.category,scope:"one"})}>Solo este movimiento</button>
        {!!i.merchant&&<button type="button" className="btn-ghost min-h-9 px-3" disabled={mutation.isPending} onClick={()=>mutation.mutate({id:i.id,category:pending.category,scope:"merchant",merchant:i.merchant})}>Todos de {i.merchant} (también futuros)</button>}
        <button type="button" className="btn-ghost min-h-9 px-3" onClick={()=>setPending(null)}>Cancelar</button>
       </div></div>}
     </div>}
    </li>)}</ul>
   </details>)}
  </section>}
  {tab==="reglas"&&query.data&&<SectionCard eyebrow="Reglas por comercio" title={query.data.rules.length?`${query.data.rules.length} reglas`:"Sin reglas"} accent="var(--money)">
   {!query.data.rules.length&&<p className="text-sm text-muted-foreground">Cuando cambies la categoría con «Todos de…», la regla aparecerá aquí.</p>}
   <ul className="divide-y divide-hairline">{query.data.rules.map(r=><li key={r.id} className="flex items-center justify-between gap-3 py-2 text-sm">
    <span className="min-w-0 break-words">{String(r.payload?.merchant||"")} → {name(String(r.payload?.category||""))}</span>
    <button type="button" className="btn-ghost min-h-9 px-3 text-xs" disabled={mutation.isPending} onClick={()=>mutation.mutate({id:"",category:"",scope:"delete-rule",rule:r})}>Eliminar regla</button>
   </li>)}</ul>
   <p className="mt-2 text-xs text-muted-foreground">Una categoría puesta a mano en un movimiento concreto tiene prioridad sobre la regla.</p>
  </SectionCard>}
  {status&&<p role="status" className="surface p-3 text-sm">{status}</p>}
  {mutation.error&&<p role="alert" className="surface border border-gym/40 p-3 text-sm text-gym">{mutation.error instanceof Error?mutation.error.message:"No se pudo guardar la categoría."}</p>}
  <p className="text-xs text-muted-foreground">Resumen, presupuesto y gastos fijos en <Link to="/dinero" className="text-gold underline">Money</Link>.</p>
 </div>;
}
