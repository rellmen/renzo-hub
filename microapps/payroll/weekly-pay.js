// Payroll calculations based on user-confirmed rules, not an interpretation of Dutch employment law.
// 40 paid WORK minutes per hour threshold per agency / ISO week; unpaid breaks and
// paid holidays charged to an accrued balance never count as worked overtime.
import {calculateShift,minutesOf} from './shifts.js';
const MINUTE=60000;
const isoWeek=date=>{const d=new Date(date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));const year=d.getUTCFullYear();const first=Date.UTC(year,0,1);return `${year}-W${String(Math.ceil(((d.getTime()-first)/86400000+1)/7)).padStart(2,'0')}`;};
const days=date=>Date.parse(date+'T00:00:00Z');
const dateTime=start=>new Date(start).toISOString().slice(0,10);
function timeline(shift){
 const c=shift.contractSnapshot;const verified=calculateShift(shift,c);
 const start=days(shift.date)+minutesOf(shift.start)*MINUTE;
 const worked=new Map();let expected=0;
 for (let i=0;i<verified.scheduledMinutes;i++){
  const when=start+i*MINUTE,clock=(minutesOf(shift.start)+i)%1440;
  const elapsed=i;
  if((shift.breaks||[]).some(br=>{const from=(minutesOf(br.start)-minutesOf(shift.start)+1440)%1440;const to=(minutesOf(br.end)-minutesOf(shift.start)+1440)%1440;return !br.paid&&elapsed>=from&&elapsed<to;}))continue;
  const b=c.bands.find(b=>{const a=minutesOf(b.start),end=minutesOf(b.end);return a<end?clock>=a&&clock<end:clock>=a||clock<end;});
  worked.set(when,b.percent);expected++;
 }
 if(expected!==verified.paidMinutes)throw Error('Horas calculadas inconsistentes.');
 return [...worked].map(([when,percent])=>({when,percent}));
}
export function calculateWeeklyPayroll(rows,{thresholdHours=40,overtimePercent=150}={}){
 if(!Number.isFinite(thresholdHours)||thresholdHours<0||thresholdHours>100)throw Error('Límite semanal de horas inválido.');
 if(!Number.isFinite(overtimePercent)||overtimePercent<100||overtimePercent>500)throw Error('Porcentaje extra inválido.');
 const groups=new Map(),details=[];
 const shifts=rows.map(r=>({id:r.id||null,shift:r.payload||r})).sort((a,b)=>`${a.shift.date}T${a.shift.start}`.localeCompare(`${b.shift.date}T${b.shift.start}`));
 const seen=new Map();
 for(const {id,shift} of shifts){
  const c=shift.contractSnapshot;
  if(!c?.agency)throw Error('Cada turno necesita agencia y contrato conservado.');
  const minuteByMinute=timeline(shift);
  let overtimeMinutes=0,normalMinutes=0;const grouped=new Map();
  for(const {when,percent} of minuteByMinute){
   const calendarDate=dateTime(when),week=isoWeek(calendarDate);
   const agency=String(c.agency).trim().toLocaleLowerCase('es');const key=`${agency}|${week}`;
   const intervalKey=`${key}|${when}`;
   if(seen.has(intervalKey))throw Error('Turnos solapados para la misma agencia; revisa registros duplicados.');seen.set(intervalKey,id);
   const limit=Number(c.overtimeThresholdHours??thresholdHours),premium=Number(c.overtimePercent??overtimePercent);
   if(!Number.isFinite(limit)||limit<=0||limit>100||!Number.isFinite(premium)||premium<100||premium>500)throw Error('Reglas de horas extraordinarias inválidas.');
   if(!groups.has(key))groups.set(key,{week,agency:c.agency,minutes:0,overtimeMinutes:0,normalMinutes:0,byPercentage:new Map(),grossUnrounded:0,thresholdHours:limit,overtimePercent:premium});
   const g=groups.get(key);if(g.thresholdHours!==limit||g.overtimePercent!==premium)throw Error('Hay reglas de horas extra diferentes en la misma agencia y semana: revísalas.');
   const over=g.minutes>=Math.round(limit*60);
   // Higher regular premiums are never reduced by overtime; overtime is NOT additive.
   const effectivePercent=over?Math.max(percent,premium):percent;
   const kind=over?'overtime':'regular';const bandKey=`${kind}:${effectivePercent}`;
   const line=grouped.get(bandKey)||{percent:effectivePercent,kind,minutes:0,amountRaw:0};
   line.minutes++;line.amountRaw+=c.hourlyRate*effectivePercent/(60*100);grouped.set(bandKey,line);
   const agg=g.byPercentage.get(bandKey)||{percent:effectivePercent,kind,minutes:0,amountRaw:0};agg.minutes++;agg.amountRaw+=c.hourlyRate*effectivePercent/(60*100);g.byPercentage.set(bandKey,agg);
   g.grossUnrounded+=c.hourlyRate*effectivePercent/(60*100);
   g.minutes++;if(over){g.overtimeMinutes++;overtimeMinutes++;}else{g.normalMinutes++;normalMinutes++;}
  }
  const amounts=[...grouped.values()].map(x=>({...x,amount:Math.round(x.amountRaw*100)/100}));
  details.push({id,date:shift.date,start:shift.start,end:shift.end,agency:c.agency,paidMinutes:minuteByMinute.length,normalMinutes,overtimeMinutes,segments:amounts,gross:Math.round(amounts.reduce((a,x)=>a+x.amountRaw,0)*100)/100});
 }
 const weeks=[...groups.values()].map(g=>({...g,byPercentage:[...g.byPercentage.values()].map(x=>({kind:x.kind,percent:x.percent,minutes:x.minutes,amount:Math.round(x.amountRaw*100)/100})),gross:Math.round(g.grossUnrounded*100)/100})).sort((a,b)=>b.week.localeCompare(a.week)||a.agency.localeCompare(b.agency));
 return {thresholdHours,overtimePercent,weeks,shifts:details};
}

export function leaveBalance(rows,snapshot=null){
 const movements=rows.map(r=>({...r,payload:r.payload||r})).sort((a,b)=>`${a.payload.date}|${a.created_at||''}`.localeCompare(`${b.payload.date}|${b.created_at||''}`));
 const openings=movements.filter(r=>r.payload.kind==='opening');
 if(openings.length>1||snapshot&&openings.length)throw Error('Hay más de un saldo inicial: concilia los registros.');
 if(snapshot&&(!Number.isInteger(snapshot.leave_minutes)||snapshot.leave_minutes<0||snapshot.leave_minutes>24000||!/^\d{4}-\d{2}-\d{2}$/.test(snapshot.as_of)))throw Error('Saldo documentado inválido.');
 let minutes=snapshot?snapshot.leave_minutes:null;const history=[];
 for(const item of movements){const e=item.payload;
  if(!['opening','accrual','used','adjustment'].includes(e.kind))throw Error('Movimiento de vacaciones inválido.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(e.date)||!Number.isInteger(e.minutes)||Math.abs(e.minutes)>24000)throw Error('Horas de vacaciones inválidas.');
  if(snapshot&&e.date<=snapshot.as_of){history.push({...e,includedInSnapshot:true,balanceMinutes:null});continue;}
  if(e.kind==='opening'){if(e.minutes<0)throw Error('Saldo inicial negativo.');minutes=e.minutes;}
  else if(minutes!==null){if(e.kind==='used'&&e.minutes<=0)throw Error('El descuento exige horas positivas.');if(e.kind==='accrual'&&e.minutes<=0)throw Error('La acumulación exige horas positivas.');minutes+=e.kind==='used'?-e.minutes:e.minutes;}
  history.push({...e,balanceMinutes:minutes});
 }
 return {known:minutes!==null,minutes,history,asOf:snapshot?.as_of||null,overdrawn:minutes!==null&&minutes<0};
}
