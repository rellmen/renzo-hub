import {useEffect,useRef,useState} from "react";
import {Link,useRouterState} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {Car,RefreshCw} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {SectionCard} from "@/components/rise/primitives";
import {loadCar} from "@/lib/car-records.mjs";

const eur=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"});
const FIRST=5;

/**
 * Gastos fijos · Coche, dentro de Gastos (antes la pantalla /car).
 * Mismos datos y misma regla: banco, documentos y pendientes se muestran por separado para no sumarlos dos veces.
 */
export function CarPanel({month}:{month:string}){
 const {client,user}=useAuth(),uid=user?.id||"";
 // Misma clave que la antigua pantalla Car: comparte caché.
 const q=useQuery({queryKey:["car",uid],enabled:!!uid&&!!client,queryFn:()=>loadCar(client!,uid),staleTime:15000,refetchOnWindowFocus:true});
 const [all,setAll]=useState(false);
 const movements=(q.data?.movements||[]).filter(r=>!month||r.date?.startsWith(month));
 const monthTotal=movements.reduce((a,r)=>a+Math.abs(Number(r.amount)||0),0);
 const docs=q.data?.expenses||[];
 const pending=q.data?.pending||[];
 // Al llegar desde /car (#coche) la página aún carga lo de arriba: desplaza una vez cuando el bloque ya tiene datos.
 const hash=useRouterState({select:s=>s.location.hash});
 const ref=useRef<HTMLElement>(null),scrolled=useRef(false);
 useEffect(()=>{if(hash==="coche"&&q.data&&!scrolled.current&&ref.current){scrolled.current=true;ref.current.scrollIntoView({block:"start"});}},[hash,q.data]);
 return <section id="coche" ref={ref} className="scroll-mt-24">
  <SectionCard eyebrow="Gastos fijos · Coche" title={q.data?(month?`${eur.format(monthTotal)} en ${month}`:"Coche"):"Coche"} accent="var(--money)"
   action={<button type="button" className="btn-ghost min-h-11" disabled={q.isFetching} onClick={()=>void q.refetch()} aria-label="Actualizar coche"><RefreshCw className={"h-4 w-4 "+(q.isFetching?"animate-spin":"")}/></button>}>
   {q.isLoading&&<p role="status" className="text-sm">Consultando gastos del coche…</p>}
   {q.error&&<p role="alert" className="text-sm text-gym">No se pudo recuperar el historial del coche. Vuelve a intentarlo.</p>}
   {q.data&&<div className="grid gap-5 lg:grid-cols-3">
    <div className="min-w-0">
     <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground"><Car className="h-4 w-4"/>Banco · este mes</h3>
     {!movements.length?<p className="text-sm text-muted-foreground">Sin combustible ni parking en {month||"este periodo"}.</p>
      :<ul className="space-y-2">{movements.slice(0,all?movements.length:FIRST).map(r=><li key={r.id} className="flex justify-between gap-2 text-sm">
       <span className="min-w-0"><span className="block truncate">{r.merchant}</span><span className="block text-xs text-muted-foreground">{r.date} · {r.category==="gasolina"?"Combustible":"Coche y parking"}</span></span>
       <span className="shrink-0 tabular-nums">{eur.format(r.amount)}</span></li>)}</ul>}
    </div>
    <div className="min-w-0">
     <h3 className="mb-2 text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">Documentos registrados</h3>
     {!docs.length?<p className="text-sm text-muted-foreground">Todavía no hay gastos del coche registrados.</p>
      :<ul className="space-y-2">{docs.slice(0,all?docs.length:FIRST).map(r=><li key={r.id} className="text-sm">
       <div className="flex justify-between gap-2"><span className="min-w-0 break-words">{r.title}</span><span className="shrink-0 tabular-nums">{eur.format(r.amount)}</span></div>
       <p className="text-xs text-muted-foreground">{r.date} · {r.source}</p>
       {all&&r.note&&<p className="mt-1 whitespace-pre-wrap break-words text-xs">{r.note}</p>}</li>)}</ul>}
    </div>
    <div className="min-w-0">
     <h3 className="mb-2 text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">Por revisar en AI Inbox</h3>
     {!pending.length?<p className="text-sm text-muted-foreground">Sin documentos del coche pendientes.</p>
      :<ul className="space-y-2">{pending.slice(0,all?pending.length:FIRST).map(r=><li key={r.id} className="break-words text-sm">{r.title||"Documento sin título"} · {r.payload.date||r.occurred_at.slice(0,10)}</li>)}</ul>}
     <Link to="/inbox" className="btn-ghost mt-3 inline-flex min-h-11">Abrir AI Inbox</Link>
    </div>
   </div>}
   {q.data&&(movements.length>FIRST||docs.length>FIRST||pending.length>FIRST)&&<button type="button" className="btn-ghost mt-4 min-h-11" onClick={()=>setAll(x=>!x)}>{all?"Mostrar menos":"Ver todo el coche"}</button>}
   <p className="mt-3 text-xs text-muted-foreground">Banco y documentos se muestran por separado para no contar dos veces el mismo gasto.</p>
  </SectionCard>
 </section>;
}
