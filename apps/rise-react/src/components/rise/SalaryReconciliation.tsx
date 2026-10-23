import {useMemo} from "react";
import {Link} from "@tanstack/react-router";
import {SectionCard} from "@/components/rise/primitives";
import type {MoneySummary} from "@/lib/money-records.mjs";
import type {PayrollOverview} from "@/lib/payroll-overview.mjs";
import {incomeBreakdown} from "@/lib/salary-reconciliation.mjs";

const money=n=>new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(n);
export function SalaryReconciliation({moneyData,payrollData,month}:{moneyData:MoneySummary;payrollData:PayrollOverview;month:string}){
 const result=useMemo(()=>{
  if(!/^\d{4}-\d{2}$/.test(month)||!moneyData.months.includes(month))return null;
  return incomeBreakdown({
   items:moneyData.items,txs:moneyData.salaryBankTxs,payslips:payrollData.rows,
   month,expectedDate:(p:{payment_date?:string|null})=>p.payment_date||null,
   lastImport:moneyData.bankUpdatedThrough.ING||null
  });
 },[moneyData,payrollData,month]);
 if(!result)return null;
 const names:{[key:string]:string}={confirmed:"Confirmado",review:"Revisar nómina",difference:"Diferencia",unlinked:"Sin vínculo"};
 return <SectionCard eyebrow="MY FINANCE · CONCILIACIÓN" title={"Nóminas y banco · "+month} accent="var(--money)">
  <p className="text-sm text-platinum/80">Compara únicamente ingresos salariales detectados en el extracto y nóminas registradas. Los importes se contabilizan una sola vez en el flujo bancario.</p>
  <dl className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
   <div><dt className="text-muted-foreground">Cobros de nómina</dt><dd className="mt-1 text-base font-semibold">{money(result.salary)}</dd></div>
   <div><dt className="text-muted-foreground">Confirmados</dt><dd className="mt-1 text-base font-semibold text-money">{money(result.confirmed)}</dd></div>
   <div><dt className="text-muted-foreground">Por revisar</dt><dd className="mt-1 text-base font-semibold">{money(result.unverified)}</dd></div>
   <div><dt className="text-muted-foreground">Sin banco verificado</dt><dd className="mt-1 text-base font-semibold">{result.missing.length}</dd></div>
  </dl>
  {result.rows.length?<ul className="mt-4 divide-y divide-hairline">{result.rows.map(r=><li key={r.id} className="flex flex-wrap items-start justify-between gap-2 py-3 text-xs">
   <div><strong className="text-sm">{r.date} · {money(r.amount)}</strong>
    <p className="text-muted-foreground">Nóminas {r.numbers.length?r.numbers.join(", "):"no identificadas"} · {names[r.status]||r.status}</p>
   </div>
   {r.status==="difference"&&r.diff!=null&&<span className="text-gym">Diferencia {money(r.diff)}</span>}
  </li>)}</ul>:<p className="mt-3 text-sm text-muted-foreground">No hay cobros clasificados como nómina en este periodo.</p>}
  {result.missing.length>0&&<p className="mt-3 text-xs text-gym">Hay {result.missing.length} nóminas revisadas con fecha esperada cubierta por el extracto y sin un movimiento enlazado. Comprueba su cobro.</p>}
  {result.notImported.length>0&&<p className="mt-2 text-xs text-muted-foreground">{result.notImported.length} nóminas aún no pueden contrastarse porque el extracto no cubre su fecha prevista.</p>}
  <p className="mt-3 text-xs text-muted-foreground">Vinculación orientativa por número, año y fecha; las discrepancias requieren revisión humana. La ausencia de un movimiento no significa impago confirmado.</p>
  <Link to="/nominas" className="mt-3 inline-flex min-h-11 items-center text-sm text-gold underline">Revisar nóminas originales</Link>
 </SectionCard>;
}
