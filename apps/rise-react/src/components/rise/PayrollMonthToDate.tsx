import {Link} from "@tanstack/react-router";
import {useMemo} from "react";
import {AlertTriangle,CalendarClock,CheckCircle2,Clock} from "lucide-react";
import {SectionCard} from "@/components/rise/primitives";
import {payrollMonthToDate} from "@/lib/payroll-monthly.mjs";

const eur=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"});
const money=(v:number|null|undefined)=>v==null?"—":eur.format(v);
const short=(d:string)=>new Intl.DateTimeFormat("es-ES",{weekday:"short",day:"numeric",month:"short",timeZone:"UTC"}).format(new Date(d+"T00:00:00Z"));
const monthName=(m:string)=>{const [y,mm]=m.split("-").map(Number);return new Intl.DateTimeFormat("es-ES",{month:"long",timeZone:"UTC"}).format(new Date(Date.UTC(y!,mm!-1,15)));};
/** Fecha de hoy en Holanda (no la del servidor ni UTC): decide qué miércoles ya han pasado. */
const amsterdamToday=(now=new Date())=>new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Amsterdam",year:"numeric",month:"2-digit",day:"2-digit"}).format(now);

/** Money · Resumen: neto acumulado del mes de cobro, miércoles a miércoles. Solo lectura. */
export function PayrollMonthToDate({rows,anomalies}:{rows:Parameters<typeof payrollMonthToDate>[0];anomalies:number}){
  const today=amsterdamToday();
  const m=useMemo(()=>payrollMonthToDate(rows,today),[rows,today]);
  if(!m)return null;
  const diff=m.previous?.samePoint!=null?Math.round((m.net-m.previous.samePoint)*100)/100:null;
  const missing=m.weeks.filter(w=>w.state==="missing");
  return <SectionCard eyebrow="MONEY · NÓMINAS DEL MES" title={<span>Acumulado de {monthName(m.month)}</span>} accent="var(--money)"
    action={<Link to="/nominas" className="btn-ghost min-h-11">Nóminas</Link>}>
    <p className="font-display text-5xl tabular-nums text-money" aria-live="polite">{money(m.net)}</p>
    <p className="mt-1 text-xs text-muted-foreground">Neto cobrado · {m.paidWeeks} de {m.totalWeeks} miércoles{m.nextPayday?` · próximo cobro ${short(m.nextPayday)}`:""}</p>

    <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Stat label="Bruto" value={money(m.gross)}/>
      <Stat label="Horas" value={m.hours.toLocaleString("es-ES")}/>
      <Stat label={m.previous?`vs ${monthName(m.previous.month)} a estas alturas`:"Mes anterior"}
        value={diff==null?"Sin datos":(diff>=0?"+":"")+eur.format(diff)} tone={diff==null?undefined:diff>=0?"text-money":"text-gym"}/>
      <Stat label={`Neto ${m.month.slice(0,4)}`} value={money(m.ytd)}/>
    </dl>

    <ol className="mt-4 divide-y divide-hairline">{m.weeks.map(w=><li key={w.date} className="flex min-h-12 items-center justify-between gap-3 py-2 text-sm">
      <span className="flex min-w-0 items-center gap-2">
        {w.state==="paid"?<CheckCircle2 className="h-4 w-4 shrink-0 text-money"/>:w.state==="missing"?<AlertTriangle className="h-4 w-4 shrink-0 text-gym"/>:<Clock className="h-4 w-4 shrink-0 text-muted-foreground"/>}
        <span className="capitalize">{short(w.date)}</span>
      </span>
      <span className="text-right tabular-nums">
        {w.state==="paid"&&<><span className="block font-semibold">+{money(w.net)}</span><span className="block text-xs text-muted-foreground">Acumulado {money(w.running)}</span></>}
        {w.state==="missing"&&<span className="text-xs text-gym">Falta subir la nómina</span>}
        {w.state==="upcoming"&&<span className="text-xs text-muted-foreground">Pendiente</span>}
      </span>
    </li>)}</ol>
    {m.offCycle.length>0&&<p className="mt-2 text-xs text-muted-foreground">{m.offCycle.length} cobro(s) fuera de semana habitual incluidos en el total ({m.offCycle.map(s=>s.label).join(", ")}).</p>}

    {missing.length>0&&<p role="note" className="mt-3 rounded-xl border border-gym/30 bg-gym/[0.06] p-3 text-xs text-platinum/85">
      <CalendarClock className="mr-1 inline h-3.5 w-3.5 text-gym"/>Sube la nómina de {missing.map(w=>short(w.date)).join(", ")} en <Link to="/nominas" className="text-gold underline">Nóminas</Link> para que el acumulado sea completo.
    </p>}
    {(m.pending>0||anomalies>0)&&<p className="mt-2 text-xs text-gym">{m.pending>0?`${m.pending} nómina(s) del mes pendientes de revisar. `:""}{anomalies>0?`${anomalies} anomalías abiertas.`:""}</p>}
    {m.estimated>0&&<p className="mt-2 text-xs text-muted-foreground">Fechas estimadas (miércoles siguiente a la semana trabajada) cuando la nómina no trae fecha de pago.</p>}
    <p className="mt-2 text-xs text-muted-foreground">Mes = fecha de cobro. El salario documentado no se suma a los movimientos del banco para no contarlo dos veces.</p>
  </SectionCard>;
}

function Stat({label,value,tone}:{label:string;value:string;tone?:string|undefined}){
  return <div className="rounded-xl border border-hairline p-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className={"mt-2 break-words text-base font-semibold tabular-nums "+(tone||"")}>{value}</dd></div>;
}
