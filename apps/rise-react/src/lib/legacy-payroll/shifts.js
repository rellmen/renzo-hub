import {buildPaidMinuteTimeline} from './dst-timeline.js';
// Shift Tracker · pure estimate engine: does not assume NL agency rules or legal entitlement.
// Clock minutes and ISO local dates, Europe/Amsterdam is represented by local input labels;
// DST transitions require an explicit offset-aware extension before being accepted.
const MINUTE=60_000;
const iso=/^\d{4}-\d{2}-\d{2}$/;
const hhmm=/^([01]\d|2[0-3]):([0-5]\d)$/;
export const minutesOf = value => {const m=hhmm.exec(String(value||''));if(!m)throw Error('Hora no válida (HH:MM).');return Number(m[1])*60+Number(m[2]);};
const dateKey = date => new Date(date).toISOString().slice(0,10);
const atUTC=(day,mins)=>Date.parse(day+'T00:00:00Z')+mins*MINUTE;
export function validateContract(contract){
 if(!contract||typeof contract!=='object')throw Error('Contrato de agencia no indicado.');
 const rate=Number(contract.hourlyRate);if(!Number.isFinite(rate)||rate<=0||rate>1000)throw Error('Tarifa base inválida.');
 const bands=contract.bands||[];
 if(!Array.isArray(bands)||!bands.length)throw Error('Configura los tramos contractuales: no se presumen porcentajes de pluses.');
 for(const b of bands){minutesOf(b.start);minutesOf(b.end);if(b.start===b.end)throw Error('Tramo horario vacío.');if(!Number.isFinite(Number(b.percent))||Number(b.percent)<0||Number(b.percent)>500)throw Error('Porcentaje de plus inválido.');}
 for(let t=0;t<1440;t++){
  const active=bands.filter(b=>{const start=minutesOf(b.start),end=minutesOf(b.end);return start<end?t>=start&&t<end:t>=start||t<end;});
  if(active.length!==1)throw Error('Los tramos del contrato deben cubrir 24 horas sin solaparse.');
 }
 return {...contract,hourlyRate:rate,bands:bands.map(b=>({...b,percent:Number(b.percent)}))};
}
// Europe/Amsterdam DST: clock-only shifts crossing 02:00–03:00 on the last Sunday
// of March or October have ambiguous/nonexistent local minutes. Reject until offsets
// are captured, rather than silently under/overpaying one hour.
export function crossesAmsterdamDst(shift){
 const stamp=Date.parse(String(shift?.date||'')+'T00:00:00Z');
 if(!Number.isFinite(stamp))return false;
 const start=minutesOf(shift.start),end=minutesOf(shift.end),duration=(end-start+1440)%1440;
 const from=stamp+start*MINUTE,to=from+duration*MINUTE;
 for(const mo of [2,9]){
  for(const yr of [new Date(stamp).getUTCFullYear(),new Date(stamp).getUTCFullYear()+1]){
   const last=new Date(Date.UTC(yr,mo+1,0));last.setUTCDate(last.getUTCDate()-last.getUTCDay());
   const boundary=last.getTime()+120*MINUTE;
   const windowEnd=boundary+60*MINUTE;
   if(from<windowEnd&&to>boundary)return true;
  }
 }
 return false;
}
export function shiftMinuteTimeline(shift,contract){
 const c=validateContract(contract);
 return buildPaidMinuteTimeline(shift,c,crossesAmsterdamDst);
}
export function calculateShift(shift,contract){
 const c=validateContract(contract);
 const result=buildPaidMinuteTimeline(shift,c,crossesAmsterdamDst);
 const totals=new Map();
 for(const minute of result.minutes)totals.set(minute.percent,(totals.get(minute.percent)||0)+1);
 const lines=[];
 let grossCents=0;
 for(const [percent,count] of totals){
  const amount=Math.round(count*c.hourlyRate*percent/(60*100)*100)/100;
  grossCents+=Math.round(amount*100);
  lines.push({percent,minutes:count,hours:count/60,amount});
 }
 lines.sort((a,b)=>a.percent-b.percent);
 return {date:shift.date,agency:String(c.agency||'Sin agencia'),scheduledMinutes:result.scheduledMinutes,unpaidBreakMinutes:result.unpaidBreakMinutes,paidBreakMinutes:result.paidBreakMinutes,paidMinutes:result.paidMinutes,workedHours:result.paidMinutes/60,segments:lines,estimatedGross:grossCents/100,currency:'EUR',source:'estimación contractual no verificada con nómina'};
}
