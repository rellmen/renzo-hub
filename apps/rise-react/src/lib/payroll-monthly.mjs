// Nocturne · nóminas acumuladas por MES DE COBRO (criterio de Renzo: cobra semanal,
// el miércoles siguiente a la semana trabajada). Solo lectura: no escribe nada.
// Si la nómina no tiene fecha de pago, se estima el miércoles posterior al fin de periodo
// y se marca como estimada; nunca se presenta como dato del documento.
const ISO=/^\d{4}-\d{2}-\d{2}$/;
function validDate(value){
 if(typeof value!=="string"||!ISO.test(value))return null;
 const d=new Date(value+"T00:00:00Z");
 return Number.isNaN(d.valueOf())||d.toISOString().slice(0,10)!==value?null:d;
}
const num=v=>{const n=typeof v==="string"&&v.trim()!==""?Number(v):v;return typeof n==="number"&&Number.isFinite(n)?n:null;};
const cents=n=>Math.round(n*100)/100;

/** Fecha de cobro: la del documento o el miércoles siguiente al fin de periodo (estimada). */
export function payDateOf(p){
 const real=validDate(p?.payment_date);
 if(real)return{date:p.payment_date,estimated:false};
 const end=validDate(p?.period_end);
 if(!end)return{date:null,estimated:true};
 const offset=((3-end.getUTCDay())+7)%7||7; // siguiente miércoles, nunca el mismo día
 end.setUTCDate(end.getUTCDate()+offset);
 return{date:end.toISOString().slice(0,10),estimated:true};
}
/** Para la conciliación con el banco: misma regla. */
export const expectedPayDate=p=>payDateOf(p).date;

/** Agrupa por mes de cobro con acumulado semana a semana. Excluye rechazadas y correcciones duplicadas no aplica. */
export function payrollByPayMonth(rows=[]){
 const months=new Map();
 for(const p of rows){
  if(!p||p.review_status==="rejected")continue;
  const {date,estimated}=payDateOf(p);
  if(!date)continue;
  const month=date.slice(0,7);
  const entry=months.get(month)||{month,slips:[],net:0,gross:0,hours:0,estimated:0,pending:0};
  const net=num(p.net_payment)??num(p.net_salary);
  entry.slips.push({id:p.id,label:p.period_label||p.period_end||"Periodo sin identificar",
   number:p.payslip_number??null,date,estimated,net,gross:num(p.gross_salary),hours:num(p.worked_hours),
   status:p.review_status||null,running:0});
  months.set(month,entry);
 }
 const out=[...months.values()].map(m=>{
  m.slips.sort((a,b)=>a.date.localeCompare(b.date)||String(a.number??"").localeCompare(String(b.number??"")));
  let run=0;
  for(const s of m.slips){
   if(s.net!=null)run+=s.net;
   s.running=cents(run);
   if(s.gross!=null)m.gross+=s.gross;
   if(s.hours!=null)m.hours+=s.hours;
   if(s.estimated)m.estimated++;
   if(s.status==="pending")m.pending++;
  }
  m.net=cents(run);m.gross=cents(m.gross);m.hours=cents(m.hours);
  return m;
 });
 return out.sort((a,b)=>b.month.localeCompare(a.month));
}
