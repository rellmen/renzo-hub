// Fase C (01-11-2026) · Cierre del mes en Money. Lógica pura y de solo lectura:
// comprueba si el mes anterior está completo (extractos, categorías y nóminas) y dice qué falta.
// No importa, no categoriza ni aprueba nada: solo enlaza a donde se hace.
import {payDateOf} from "./payroll-monthly.mjs";
import {payrollOutlier} from "./payroll-outliers.mjs";

export const CLOSE_BANKS=Object.freeze(["ING","Revolut"]);
const DONE_REVIEW=new Set(["approved","reviewed","not_required","rejected"]);

const pad=n=>String(n).padStart(2,"0");
/** Mes anterior a `today` (YYYY-MM-DD) en formato YYYY-MM. */
export function previousMonth(today){
  const m=/^(\d{4})-(\d{2})-\d{2}$/.exec(String(today||""));
  if(!m)throw Error("Fecha inválida");
  let y=Number(m[1]),mo=Number(m[2])-1;
  if(mo===0){y-=1;mo=12;}
  return `${y}-${pad(mo)}`;
}
export function lastDayOf(month){
  const [y,m]=month.split("-").map(Number);
  return `${month}-${pad(new Date(Date.UTC(y,m,0)).getUTCDate())}`;
}
const bankOf=i=>/revolut/i.test(String(i?.bank||""))?"Revolut":"ING";
const MESES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
/** 2026-09-30 → «30 sep 2026». */
export function shortDate(d){const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(d||""));return m?`${Number(m[3])} ${MESES[Number(m[2])-1]} ${m[1]}`:String(d||"");}

/** Estado de un banco para el mes: complete | partial | missing | never. */
export function bankStatus(bank,month,lastDate){
  const start=`${month}-01`,end=lastDayOf(month);
  if(!lastDate)return {bank,status:"never",lastDate:null};
  if(lastDate>=end)return {bank,status:"complete",lastDate};
  if(lastDate>=start)return {bank,status:"partial",lastDate};
  return {bank,status:"missing",lastDate};
}

export function monthClose({items=[],bankUpdatedThrough={},payrollRows=[],today}){
  const month=previousMonth(today);
  const inMonth=items.filter(i=>String(i?.date||"").startsWith(month));
  const banks=CLOSE_BANKS.map(b=>bankStatus(b,month,bankUpdatedThrough?.[b]||null));
  const uncategorized=inMonth.filter(i=>i.category==="sin_categoria"&&Number(i.amount)<0);
  const slips=payrollRows.filter(r=>{const d=payDateOf(r).date;return d&&d.startsWith(month);})
   .sort((a,b)=>String(payDateOf(a).date).localeCompare(String(payDateOf(b).date)));
  const pending=slips.filter(r=>!DONE_REVIEW.has(String(r.review_status||"")));
  const flagged=pending.map(r=>({row:r,outlier:payrollOutlier(r,payrollRows)})).filter(x=>x.outlier);
  const label=r=>String(r.period_label||r.payslip_number||r.period_end||"nómina");
  const steps=[
   ...banks.map(b=>({id:"bank-"+b.bank.toLowerCase(),done:b.status==="complete",action:"import",
     title:`Extracto de ${b.bank}`,
     detail:b.status==="complete"?`Importado hasta el ${shortDate(b.lastDate)}.`
      :b.status==="partial"?`Último movimiento importado: ${shortDate(b.lastDate)}. Importa el extracto hasta el ${shortDate(lastDayOf(month))} (si no hubo movimientos después, puedes ignorarlo).`
      :b.status==="missing"?`No hay movimientos de este mes: el último importado es del ${shortDate(b.lastDate)}.`
      :"Nunca se ha importado un extracto de este banco."})),
   {id:"categories",done:uncategorized.length===0,action:"categorize",title:"Gastos sin categoría",
    detail:uncategorized.length?`${uncategorized.length} gasto(s) del mes sin categoría (${Math.round(uncategorized.reduce((s,i)=>s-Number(i.amount),0)*100)/100} €).`:"Todos los gastos importados del mes tienen categoría."},
   {id:"payroll",done:pending.length===0,action:"payroll",title:"Nóminas cobradas en el mes",
    detail:!slips.length?"No hay nóminas con fecha de cobro en este mes."
     :pending.length?`${pending.length} de ${slips.length} sin revisar: ${pending.map(label).join(", ")}.`+(flagged.length?` Con aviso de neto anómalo: ${flagged.map(x=>label(x.row)).join(", ")}.`:"")
     :`${slips.length} revisada(s).`},
  ];
  return {month,start:shortDate(`${month}-01`),end:shortDate(lastDayOf(month)),steps,done:steps.filter(s=>s.done).length,total:steps.length,
   complete:steps.every(s=>s.done),banks,uncategorized:uncategorized.length,payrollPending:pending.length,payrollFlagged:flagged.length,transactions:inMonth.length};
}
