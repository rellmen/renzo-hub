import {useMemo,useState} from "react";
import {SectionCard} from "@/components/rise/primitives";
import {payrollByPayMonth} from "@/lib/payroll-monthly.mjs";

const eur=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"});
const money=(v:number|null)=>v==null?"—":eur.format(v);
function monthName(month:string){
 const [y,m]=month.split("-").map(Number);
 return new Intl.DateTimeFormat("es-ES",{month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(Date.UTC(y!,m!-1,15)));
}
function dayName(date:string){
 return new Intl.DateTimeFormat("es-ES",{weekday:"short",day:"numeric",month:"short",timeZone:"UTC"}).format(new Date(date+"T00:00:00Z"));
}

/** Acumulado de nóminas por mes de cobro, semana a semana. Solo lectura. */
export function PayrollMonthly({rows}:{rows:Array<Record<string,any>>}){
 const months=useMemo(()=>payrollByPayMonth(rows),[rows]);
 const [selected,setSelected]=useState("");
 if(!months.length)return null;
 const current=months.find(m=>m.month===selected)||months[0]!;
 return <SectionCard eyebrow="MY FINANCE · MES DE COBRO" title={"Nóminas de "+monthName(current.month)} accent="var(--gold)">
  <div className="flex flex-wrap items-center justify-between gap-3">
   <label className="text-xs text-muted-foreground">Mes
    <select className="ml-2 min-h-11 rounded-xl border border-hairline bg-raised px-3 text-sm text-foreground"
     value={current.month} onChange={e=>setSelected(e.target.value)}>
     {months.map(m=><option key={m.month} value={m.month}>{monthName(m.month)}</option>)}
    </select>
   </label>
   <p className="text-xs text-muted-foreground">{current.slips.length} {current.slips.length===1?"nómina":"nóminas"} cobradas en el mes</p>
  </div>
  <dl className="mt-4 grid grid-cols-3 gap-3">
   <div className="rounded-xl border border-hairline p-3"><dt className="text-xs text-muted-foreground">Neto acumulado</dt><dd className="mt-2 break-words text-lg font-semibold text-money">{money(current.net)}</dd></div>
   <div className="rounded-xl border border-hairline p-3"><dt className="text-xs text-muted-foreground">Bruto</dt><dd className="mt-2 break-words text-lg font-semibold">{money(current.gross)}</dd></div>
   <div className="rounded-xl border border-hairline p-3"><dt className="text-xs text-muted-foreground">Horas</dt><dd className="mt-2 text-lg font-semibold">{current.hours.toLocaleString("es-ES")}</dd></div>
  </dl>
  <ul className="mt-4 divide-y divide-hairline">{current.slips.map(s=><li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
   <div className="min-w-0">
    <strong>{s.label}</strong>{s.number!=null&&<span className="text-xs text-muted-foreground"> · nº {String(s.number)}</span>}
    <p className="text-xs text-muted-foreground">Cobro {dayName(s.date)}{s.estimated?" · fecha estimada":""}{s.status==="pending"?" · pendiente de revisar":""}</p>
   </div>
   <div className="text-right tabular-nums">
    <p className="font-semibold">+{money(s.net)}</p>
    <p className="text-xs text-muted-foreground">Acumulado {money(s.running)}</p>
   </div>
  </li>)}</ul>
  {current.estimated>0&&<p className="mt-3 text-xs text-muted-foreground">Las fechas estimadas son el miércoles siguiente a la semana trabajada. Al subir el extracto del mes, Money cruza cada cobro por número de nómina.</p>}
  <p className="mt-2 text-xs text-muted-foreground">Neto = importe a pagar de la nómina. No se suma a los ingresos bancarios para no contarlo dos veces.</p>
 </SectionCard>;
}
