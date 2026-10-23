import {CalendarClock} from "lucide-react";
import {SectionCard} from "@/components/rise/primitives";
import type {MoneySummary} from "@/lib/money-records.mjs";
const fmt=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"});
export function RecurringExpenses({data}:{data:MoneySummary}){
 const fixed=data.fixedExpenses;
 return <SectionCard eyebrow="MY FINANCE · GASTOS RECURRENTES" title="Fijos y suscripciones" accent="var(--money)">
  <p className="text-xs text-muted-foreground">Estimación calculada desde el historial bancario y reglas que ya existen en Classic. No son cargos futuros confirmados.</p>
  {fixed?.items.length?<div className="mt-4 space-y-3">
   <div className="grid grid-cols-2 gap-3 text-xs">
    <div className="rounded-xl border border-hairline p-3"><p className="text-muted-foreground">Fijos netos estimados</p>
     <strong className="mt-1 text-lg">{fmt.format(fixed.total)}</strong></div>
    <div className="rounded-xl border border-hairline p-3"><p className="text-muted-foreground">Suscripciones estimadas</p>
     <strong className="mt-1 text-lg">{fmt.format(fixed.subscriptions)}</strong></div>
   </div>
   <ul className="divide-y divide-hairline">{fixed.items.map(entry=><li key={entry.key} className="flex items-center justify-between gap-2 py-3 text-xs">
    <div><strong className="text-sm">{entry.name}</strong>
     <p className="text-muted-foreground">{entry.contribution?"Aporte que reduce el alquiler":entry.subscription?"Suscripción":"Gasto periódico"} · {entry.source==="manual"?"marcado manualmente":"detección automática"}</p>
     {entry.nextDate&&<p className="mt-1 flex items-center gap-1 text-muted-foreground"><CalendarClock className="h-3 w-3"/> Próxima fecha aproximada: {entry.nextDate}</p>}
    </div>
    <strong className="tabular-nums">{fmt.format(entry.monthly)}</strong>
   </li>)}</ul>
  </div>:<p className="mt-3 text-sm text-muted-foreground">Todavía no hay suficientes gastos recurrentes verificados para este periodo.</p>}
 </SectionCard>;
}
