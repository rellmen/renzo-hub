import {createFileRoute} from '@tanstack/react-router';
import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';
import {ExternalLink,RefreshCw} from 'lucide-react';
import {useAuth} from '@/lib/auth/AuthProvider';
import {loadPayrollRecords,payrollTotals} from '@/lib/payroll-records.mjs';
import {LEGACY_FALLBACK_URL} from '@/lib/nocturne-environment.mjs';
import {PageHeader,SectionCard} from '@/components/rise/primitives';
import {pageHead} from '@/lib/seo';
export const Route=createFileRoute('/nominas')({head:()=>pageHead('Nóminas y turnos','Nóminas y turnos privados registrados en RISE HUB.'),component:Payroll});
function money(value:number|string|null,currency:string|null){
 if(value==null||value===''||!Number.isFinite(Number(value)))return 'Sin datos';
 const code=currency?.trim();
 if(!code||!/^[A-Z]{3}$/.test(code))return `${Number(value).toFixed(2)} · moneda no indicada`;
 return new Intl.NumberFormat('es-ES',{style:'currency',currency:code}).format(Number(value));
}
function Payroll(){
 const {client,user}=useAuth();
 const [year,setYear]=useState('');
 const state=useQuery({queryKey:['payroll-real',user?.id],enabled:!!client&&!!user,
  queryFn:()=>loadPayrollRecords(client!,user!.id),staleTime:30_000});
 const data=state.data;
 const years=[...new Set((data?.payslips||[]).map(p=>(p.payment_date||p.period_end||'').slice(0,4)).filter(Boolean))].sort().reverse();
 const rows=(data?.payslips||[]).filter(p=>!year||(p.payment_date||p.period_end||'').startsWith(year));
 const totals=payrollTotals(rows);
 return <div className="space-y-6">
  <PageHeader eyebrow="PAYROLL · PRIVADO" title="Nóminas y turnos" subtitle="Documentos y horas registrados en tu cuenta. Los importes extraídos conservan su estado de revisión; no confirman un ingreso bancario."/>
  <div className="flex flex-wrap gap-3">
   <button type="button" className="btn-ghost" disabled={state.isFetching} onClick={()=>void state.refetch()}><RefreshCw className="h-4 w-4"/>Actualizar</button>
   <a href={`${LEGACY_FALLBACK_URL}?app=payroll`} target="_blank" rel="noopener noreferrer" className="btn-ghost">Importar, revisar o editar en Payroll clásico <ExternalLink className="h-4 w-4"/></a>
  </div>
  {state.isLoading&&<p role="status">Cargando registros privados…</p>}
  {state.error&&<p role="alert">{state.error instanceof Error?state.error.message:'No se pudieron cargar las nóminas.'}</p>}
  {data&&<>
   <SectionCard eyebrow="Documentos existentes" title="Historial de nóminas" accent="var(--money)">
    <label className="block text-sm">Año de pago <select value={year} onChange={e=>setYear(e.target.value)} className="ml-2 min-h-11 rounded-xl border border-input bg-obsidian px-3"><option value="">Todos</option>{years.map(y=><option key={y}>{y}</option>)}</select></label>
    {!rows.length&&<p className="mt-4 text-muted-foreground">No hay nóminas en este periodo.</p>}
    <dl className="my-5 grid gap-3 sm:grid-cols-2">{Object.entries(totals).map(([currency,t])=><div key={currency} className="rounded-xl border border-hairline p-4"><dt className="text-sm">Neto registrado · {currency}</dt><dd className="mt-2 font-display text-3xl">{money(t.amount,currency)}</dd><p className="mt-2 text-xs text-muted-foreground">{t.count} documentos · {t.missing} sin importe. Puede incluir correcciones o documentos pendientes de revisión.</p></div>)}</dl>
    <ul className="space-y-3">{rows.map(p=><li key={p.id} className="rounded-xl border border-hairline p-4">
     <div className="flex flex-wrap justify-between gap-2"><h3 className="font-medium">{p.period_label||`${p.period_start||'Sin fecha'} — ${p.period_end||'Sin fecha'}`}</h3><p>{money(p.net_payment,p.currency)}</p></div>
     <p className="mt-2 text-xs text-muted-foreground">Pago: {p.payment_date||'Sin fecha'} · Revisión: {p.review_status||'Sin revisar'} · Validación: {p.validation_status||'Sin datos'}</p>
     <details className="mt-3 text-sm"><summary>Desglose registrado</summary><p className="mt-2">Bruto: {money(p.gross_salary,p.currency)} · Horas: {p.worked_hours??'Sin datos'}</p><a className="mt-3 inline-block text-gold underline" href={`${LEGACY_FALLBACK_URL}?app=payroll&payslip=${encodeURIComponent(p.id)}`} target="_blank" rel="noopener noreferrer">Ver documento y auditoría completos</a></details>
    </li>)}</ul>
   </SectionCard>
   <SectionCard eyebrow="Shift Tracker" title="Turnos y contratos conservados" accent="var(--projects)">
    <p className="text-sm text-muted-foreground">Lectura del historial original. Los cálculos semanales, cambios CET/CEST, vacaciones y edición siguen disponibles en Payroll clásico.</p>
    <details className="mt-4"><summary>{data.contracts.length} contratos registrados</summary><ul className="mt-3 space-y-2">{data.contracts.map(c=><li key={c.id} className="rounded-xl border border-hairline p-3"><p>{c.title||'Contrato sin nombre'}</p><p className="mt-1 text-sm text-muted-foreground">Tarifa: {money(c.payload?.hourlyRate??null,'EUR')}/h</p></li>)}</ul></details>
    {!data.shifts.length&&<p className="mt-4 text-sm text-muted-foreground">No hay turnos guardados.</p>}
    <ul className="mt-4 space-y-2">{data.shifts.map(s=><li key={s.id} className="rounded-xl border border-hairline p-3"><p>{s.title||s.payload?.date||'Turno sin fecha'}</p><p className="mt-1 text-sm text-muted-foreground">{String(s.payload?.start||'Sin entrada')} — {String(s.payload?.end||'Sin salida')}</p></li>)}</ul>
   </SectionCard>
  </>}
 </div>;
}
