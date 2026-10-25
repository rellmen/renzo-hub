import {useQuery} from "@tanstack/react-query";
import {RefreshCw,ShieldCheck} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {SectionCard} from "@/components/rise/primitives";
import {loadSavedShifts,buildContractualReport} from "@/lib/shift-payroll-report.mjs";

const eur=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"});
const hours=new Intl.NumberFormat("es-ES",{maximumFractionDigits:2});

export function ShiftPayrollReport(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const query=useQuery({queryKey:["shift-payroll-report",uid],enabled:!!client&&!!uid,
   queryFn:async()=>buildContractualReport(await loadSavedShifts(client!,uid)),
   staleTime:30000,refetchOnWindowFocus:true,retry:false});
 return <SectionCard eyebrow="TURNOS · CÁLCULO CONTRACTUAL" title="Horas y bruto por semana" accent="var(--money)">
  <p className="text-sm text-platinum/80">Motor salarial original de Rise: franjas ORT, descansos, umbral semanal y cambios de horario de Países Bajos. Solo usa turnos y contratos que hayas guardado.</p>
  <button type="button" className="btn-ghost mt-3 min-h-11" disabled={query.isFetching} onClick={()=>void query.refetch()}>
    <RefreshCw className={"h-4 w-4 "+(query.isFetching?"animate-spin":"")}/>Actualizar cálculo
  </button>
  {query.isLoading&&<p role="status" className="mt-3 text-sm">Consultando turnos y condiciones contractuales…</p>}
  {query.error&&<p role="alert" className="mt-3 rounded-xl border border-gym/40 p-3 text-sm text-gym">
   {query.error instanceof Error?query.error.message:"No se pudo comprobar el historial completo."}
  </p>}
  {query.data&&<>
   <p className="mt-3 text-xs text-platinum/70">{query.data.count} turnos con historial. {query.data.warning}</p>
   {!query.data.weeks.length&&<p className="mt-3 text-sm text-muted-foreground">No hay importes que calcular; registra tus turnos con su contrato en el Shift Tracker de esta página.</p>}
   {!!query.data.weeks.length&&<ul className="mt-3 divide-y divide-hairline">
     {query.data.weeks.slice(0,52).map(w=><li key={w.week+"-"+w.agency} className="space-y-1 py-3">
       <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
         <strong>{w.week} · {w.agency}</strong><strong>{eur.format(w.gross)}</strong>
       </div>
       <p className="text-xs text-muted-foreground">{hours.format(w.minutes/60)} h remuneradas · {hours.format(w.overtimeMinutes/60)} h extraordinarias</p>
       <p className="text-xs text-muted-foreground">{w.byPercentage.map(s=>hours.format(s.minutes/60)+" h al "+s.percent+" %"+(s.kind==="overtime"?" (extra)":"")).join(" · ")}</p>
     </li>)}
   </ul>}
   {!!query.data.weeks.length&&<p className="mt-3 flex gap-2 text-xs text-muted-foreground">
    <ShieldCheck className="h-4 w-4 shrink-0"/> No se han generado ingresos ni modificado nóminas. Los importes mostrados son estimaciones, no cobros confirmados.
   </p>}
  </>}
 </SectionCard>;
}
