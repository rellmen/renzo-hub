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

/** Miércoles (día de cobro SD Worx) de un mes "YYYY-MM". */
export function wednesdaysOf(month){
 if(typeof month!=="string"||!/^\d{4}-\d{2}$/.test(month))return[];
 const [y,m]=month.split("-").map(Number);
 const out=[];
 for(let d=new Date(Date.UTC(y,m-1,1));d.getUTCMonth()===m-1;d.setUTCDate(d.getUTCDate()+1))
  if(d.getUTCDay()===3)out.push(d.toISOString().slice(0,10));
 return out;
}
/** Lunes de la semana ISO de una fecha "YYYY-MM-DD". */
function weekKey(date){
 const d=new Date(date+"T00:00:00Z");
 d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));
 return d.toISOString().slice(0,10);
}
const prevMonth=month=>{const [y,m]=month.split("-").map(Number);const d=new Date(Date.UTC(y,m-2,1));return d.toISOString().slice(0,7);};

/**
 * Resumen de Money: acumulado del mes de cobro en curso, semana a semana.
 * Se actualiza solo cada vez que entra la nómina del miércoles.
 * `today` = fecha local de Renzo "YYYY-MM-DD" (Europe/Amsterdam), no la del servidor.
 */
export function payrollMonthToDate(rows=[],today){
 const t=validDate(today);
 if(!t)return null;
 const month=today.slice(0,7),day=today.slice(8,10);
 const months=payrollByPayMonth(rows);
 const cur=months.find(m=>m.month===month)||{month,slips:[],net:0,gross:0,hours:0,estimated:0,pending:0};
 const paid=new Set(cur.slips.map(s=>s.date));
 const weds=wednesdaysOf(month);
 // Cada nómina cae en la semana (lunes a domingo) de su miércoles: SD Worx a veces paga el martes.
 const used=new Set();
 const weeks=weds.map(date=>{
  const wk=weekKey(date);
  const slips=cur.slips.filter(s=>weekKey(s.date)===wk&&!used.has(s.id));
  slips.forEach(s=>used.add(s.id));
  const state=slips.length?"paid":date<=today?"missing":"upcoming";
  return{date,state,net:slips.length?cents(slips.reduce((a,s)=>a+(s.net??0),0)):null,
   running:slips.length?slips[slips.length-1].running:null};
 });
 // Nóminas fuera de esas semanas (correcciones, vacaciones): cuentan en el total, pero se listan aparte.
 const offCycle=cur.slips.filter(s=>!used.has(s.id));
 const pm=prevMonth(month);
 const prev=months.find(m=>m.month===pm)||null;
 const prevSamePoint=prev?cents(prev.slips.filter(s=>s.date.slice(8,10)<=day).reduce((a,s)=>a+(s.net??0),0)):null;
 const year=month.slice(0,4);
 const ytd=cents(months.filter(m=>m.month.startsWith(year)&&m.month<=month).reduce((a,m)=>a+m.net,0));
 const next=weds.find(d=>d>today)||null;
 return{month,net:cur.net,gross:cur.gross,hours:cur.hours,slips:cur.slips.length,
  weeks,offCycle,missing:weeks.filter(w=>w.state==="missing").length,
  paidWeeks:weeks.filter(w=>w.state==="paid").length,totalWeeks:weds.length,
  nextPayday:next,pending:cur.pending,estimated:cur.estimated,
  previous:prev?{month:pm,net:prev.net,samePoint:prevSamePoint}:null,ytd,
  lastSlip:cur.slips.length?cur.slips[cur.slips.length-1]:null,paidDates:[...paid]};
}
