// Build actual paid minutes for Amsterdam shifts. DST folds/gaps need explicit offset-bearing instants.
import {instantInAmsterdam,localAmsterdamMinute,nextCalendarDay} from './amsterdam-time.js';
const DAY=86400000,MINUTE=60000;
const clockMinutes=x=>{if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(x||'')))throw Error('Hora no válida.');return Number(x.slice(0,2))*60+Number(x.slice(3));};
const day=x=>{const t=Date.parse(String(x)+'T00:00:00Z');if(!Number.isFinite(t)||new Date(t).toISOString().slice(0,10)!==x)throw Error('Fecha inválida.');return t;};
export function buildPaidMinuteTimeline(shift,contract,crossesDst){
 const startClock=clockMinutes(shift.start),endClock=clockMinutes(shift.end),at=day(shift.date);
 const instants=!!(shift.startInstant||shift.endInstant);
 if(instants&&(!shift.startInstant||!shift.endInstant))throw Error('Para el cambio de hora hacen falta ambos instantes con offset.');
 if(!instants&&crossesDst(shift))throw Error('Turno en cambio de horario CET/CEST: introduce ambos instantes con offset.');
 const start=instants?instantInAmsterdam(shift.startInstant):at+startClock*MINUTE;
 const end=instants?instantInAmsterdam(shift.endInstant):start+((endClock-startClock+1440)%1440)*MINUTE;
 if(instants){
  const a=localAmsterdamMinute(start),b=localAmsterdamMinute(end);
  const validDate=b.date===shift.date||b.date===nextCalendarDay(shift.date);
  if(a.date!==shift.date||a.clock!==shift.start||b.clock!==shift.end||!validDate)throw Error('Los instantes no coinciden con el horario local del turno.');
 }
 const duration=(end-start)/MINUTE;
 if(!Number.isInteger(duration)||duration<=0||duration>960)throw Error('Duración de turno inválida o excesiva.');
 const paidMask=new Uint8Array(duration),breaks=shift.breaks||[];
 if(!Array.isArray(breaks))throw Error('Descansos inválidos.');
 let unpaid=0,paidBreak=0;
 for(const br of breaks){
  const a=clockMinutes(br.start),b=clockMinutes(br.end);
  let from,to;
  if(instants){
   if(!br.startInstant||!br.endInstant)throw Error('En turnos CET/CEST, cada descanso necesita instantes con offset.');
   const f=instantInAmsterdam(br.startInstant),t=instantInAmsterdam(br.endInstant);
   if(localAmsterdamMinute(f).clock!==br.start||localAmsterdamMinute(t).clock!==br.end)throw Error('El descanso no coincide con los instantes locales.');
   from=(f-start)/MINUTE;to=(t-start)/MINUTE;
  }else{
   from=(a-startClock+1440)%1440;to=(b-startClock+1440)%1440;
  }
  if(!Number.isInteger(from)||!Number.isInteger(to)||to<=from||from<0||to>duration)throw Error('Descanso fuera del turno o que cruza el inicio: divídelo en tramos.');
  for(let i=from;i<to;i++){if(paidMask[i])throw Error('Descansos superpuestos.');paidMask[i]=br.paid===true?1:2;}
  if(br.paid===true)paidBreak+=to-from;else unpaid+=to-from;
 }
 const timeline=[];
 for(let i=0;i<duration;i++){
  if(paidMask[i]===2)continue;
  const when=start+i*MINUTE;
  const local=instants?localAmsterdamMinute(when):{date:new Date(at+(startClock+i)*MINUTE).toISOString().slice(0,10),clock:String(Math.floor((startClock+i)%1440/60)).padStart(2,'0')+':'+String((startClock+i)%60).padStart(2,'0')};
  const minute=clockMinutes(local.clock);
  const matches=contract.bands.filter(b=>{const a=clockMinutes(b.start),e=clockMinutes(b.end);return a<e?minute>=a&&minute<e:minute>=a||minute<e;});
  if(matches.length!==1)throw Error('Franjas salariales sin cobertura o solapadas.');
  timeline.push({when,localDate:local.date,clock:local.clock,percent:Number(matches[0].percent)});
 }
 return {minutes:timeline,scheduledMinutes:duration,unpaidBreakMinutes:unpaid,paidBreakMinutes:paidBreak,paidMinutes:timeline.length};
}
