import {Link} from "@tanstack/react-router";
import {CheckCircle2,CircleDashed,FileUp,Tags,Receipt} from "lucide-react";
import {SectionCard,Bar} from "@/components/rise/primitives";
import {monthClose} from "@/lib/month-close.mjs";
import type {MoneySummary} from "@/lib/money-records.mjs";
import type {PayrollRow} from "@/lib/payroll-overview.mjs";

const monthName=(m:string)=>{const [y,mo]=m.split("-").map(Number);
 return new Intl.DateTimeFormat("es-ES",{month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(Date.UTC(y!,mo!-1,15)));};
const localDay=(d=new Date())=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
const ICON={import:FileUp,categorize:Tags,payroll:Receipt} as const;

/** Fase C · Cierre del mes anterior: qué falta para darlo por completo. Solo lectura; enlaza a donde se resuelve. */
export function MonthClosePanel({data,payrollRows,today=localDay()}:{data:MoneySummary;payrollRows:PayrollRow[]|null;today?:string}){
 const r=monthClose({items:data.items as Array<Record<string,unknown>>,bankUpdatedThrough:data.bankUpdatedThrough as Record<string,string>,payrollRows:payrollRows||[],today});
 const pct=Math.round(r.done*100/r.total);
 return <SectionCard eyebrow={<span className="text-money">Cierre del mes</span>}
   title={r.complete?`${monthName(r.month)} cerrado`:`Cerrar ${monthName(r.month)}: ${r.done} de ${r.total}`} accent="var(--money)">
  <div data-testid="month-close" className="space-y-4">
   <Bar value={pct} color="var(--money)"/>
   {payrollRows===null&&<p className="text-xs text-muted-foreground">No se pudo consultar Nóminas: el paso de nóminas puede estar incompleto.</p>}
   <ul className="space-y-2">{r.steps.map(s=>{const Icon=ICON[s.action];return <li key={s.id}
     className={"flex min-w-0 items-start gap-3 rounded-2xl border p-3 "+(s.done?"border-hairline":"border-money/40 bg-money/[0.06]")}>
    {s.done?<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-money" aria-label="Hecho"/>:<CircleDashed className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-label="Pendiente"/>}
    <span className="min-w-0 flex-1">
     <span className="block text-sm font-semibold">{s.title}</span>
     <span className="block break-words text-xs text-muted-foreground">{s.detail}</span>
    </span>
    {!s.done&&(s.action==="import"
     ?<a href="#importar-extracto" className="btn-ghost min-h-11 shrink-0 px-3 text-xs"><Icon className="h-4 w-4"/>Importar</a>
     :<Link to={s.action==="payroll"?"/nominas":"/gastos"} className="btn-ghost min-h-11 shrink-0 px-3 text-xs"><Icon className="h-4 w-4"/>{s.action==="payroll"?"Revisar":"Categorizar"}</Link>)}
   </li>;})}</ul>
   <p className="text-xs text-muted-foreground">Comprobación automática del mes anterior ({r.start} a {r.end}). No cambia ningún dato: solo te dice qué falta.</p>
  </div>
 </SectionCard>;
}
