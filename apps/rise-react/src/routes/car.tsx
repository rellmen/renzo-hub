import {createFileRoute,Link} from '@tanstack/react-router';
import {useQuery} from '@tanstack/react-query';
import {RefreshCw} from 'lucide-react';
import {useAuth} from '@/lib/auth/AuthProvider';
import {PageHeader,SectionCard} from '@/components/rise/primitives';
import {FinanceSections} from '@/components/rise/FinanceSections';
import {loadCar} from '@/lib/car-records.mjs';
import {pageHead} from '@/lib/seo';
export const Route=createFileRoute('/car')({head:()=>pageHead('Car','Gastos privados del coche y documentos pendientes.'),component:Car});
const eur=new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'});
function Car(){
 const {client,user}=useAuth(),uid=user?.id||'';
 const q=useQuery({queryKey:['car',uid],enabled:!!uid&&!!client,queryFn:()=>loadCar(client!,uid),staleTime:15000,refetchOnWindowFocus:true});
 return <div className="space-y-6"><FinanceSections/>
  <PageHeader eyebrow="MY FINANCE · CAR" title="Tu coche, en detalle" subtitle="Combustible, parking y gastos registrados. Los documentos y movimientos bancarios se muestran por separado para evitar sumarlos dos veces."/>
  <button type="button" className="btn-ghost" disabled={q.isFetching} onClick={()=>void q.refetch()}><RefreshCw className="h-4 w-4"/>Actualizar Car</button>
  {q.isLoading&&<p role="status">Consultando gastos del coche…</p>}
  {q.error&&<p role="alert">No se pudo recuperar el historial completo. Vuelve a intentarlo.</p>}
  {q.data&&<>
   <SectionCard eyebrow="Banco" title="Movimientos del coche" accent="var(--money)">
    {!q.data.movements.length?<p className="text-sm text-muted-foreground">Sin movimientos de combustible o coche en los extractos importados.</p>:<ul className="space-y-3">{q.data.movements.map(r=><li key={r.id} className="flex flex-wrap justify-between gap-2 border-b border-hairline pb-3"><div className="min-w-0"><p className="break-words">{r.merchant}</p><p className="text-xs text-muted-foreground">{r.date} · {r.category==='gasolina'?'Combustible':'Coche y parking'}</p></div><span>{eur.format(r.amount)}</span></li>)}</ul>}
    <Link to="/gastos" className="btn-ghost mt-4 inline-flex">Revisar categorías</Link>
   </SectionCard>
   <SectionCard eyebrow="Historial de documentos" title="Gastos registrados" accent="var(--gold)">
    {!q.data.expenses.length?<p className="text-sm text-muted-foreground">Todavía no hay gastos del coche registrados.</p>:<ul className="space-y-3">{q.data.expenses.map(r=><li key={r.id} className="rounded-xl border border-hairline p-3"><div className="flex flex-wrap justify-between gap-2"><p className="break-words">{r.title}</p><span>{eur.format(r.amount)}</span></div><p className="mt-1 text-xs text-muted-foreground">{r.date} · {r.source}</p>{r.note&&<p className="mt-2 whitespace-pre-wrap break-words text-sm">{r.note}</p>}</li>)}</ul>}
   </SectionCard>
   <SectionCard eyebrow="AI Inbox" title="Documentos por revisar" accent="var(--ares)">
    {!q.data.pending.length?<p className="text-sm text-muted-foreground">Sin documentos del coche pendientes.</p>:<ul className="space-y-3">{q.data.pending.map(r=><li key={r.id} className="break-words text-sm">{r.title||'Documento sin título'} · {r.payload.date||r.occurred_at.slice(0,10)}</li>)}</ul>}
    <Link to="/inbox" className="btn-ghost mt-4 inline-flex">Abrir AI Inbox</Link>
   </SectionCard>
  </>}
 </div>;
}
