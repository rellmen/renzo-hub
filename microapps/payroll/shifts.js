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
export function calculateShift(shift,contract){
 const c=validateContract(contract);
 if(!iso.test(String(shift?.date||''))||!Number.isFinite(Date.parse(shift.date+'T00:00:00Z'))||dateKey(shift.date+'T00:00:00Z')!==shift.date)throw Error('Fecha inválida.');
 const start=minutesOf(shift.start),end=minutesOf(shift.end),duration=(end-start+1440)%1440;
 if(crossesAmsterdamDst(shift))throw Error('Turno en cambio de horario CET/CEST: verifica offsets y nómina manualmente.');
 if(!duration||duration>16*60)throw Error('Duración de turno inválida o excesiva.');
 const breaks=shift.breaks||[];if(!Array.isArray(breaks))throw Error('Descansos inválidos.');
 const total=Array(1440).fill(null);
 const paidBreaks=[];
 for(const br of breaks){const from=(minutesOf(br.start)-start+1440)%1440,to=(minutesOf(br.end)-start+1440)%1440;if(to<=from||to>duration)throw Error('Descanso fuera del turno o que cruza el inicio: divídelo en tramos.');
  for(let i=from;i<to;i++){if(total[i])throw Error('Descansos superpuestos.');total[i]=br.paid===true?'paid':'unpaid';}
  paidBreaks.push({minutes:to-from,paid:br.paid===true});
 }
 const summary=new Map(),lines=[];
 const paidBreakMinutes=paidBreaks.filter(b=>b.paid).reduce((x,b)=>x+b.minutes,0),unpaidBreakMinutes=paidBreaks.filter(b=>!b.paid).reduce((x,b)=>x+b.minutes,0);
 for(let offset=0;offset<duration;offset++){
  if(total[offset]==='unpaid')continue;
  const clock=(start+offset)%1440;
  const band=c.bands.find(b=>{const a=minutesOf(b.start),e=minutesOf(b.end);return a<e?clock>=a&&clock<e:clock>=a||clock<e;});
  const k=`${band.percent}`;summary.set(k,(summary.get(k)||0)+1);
 }
 let grossCents=0,minutes=0;for(const [percent,count] of summary){
  const pay=+((count/60)*c.hourlyRate*(Number(percent)/100)).toFixed(2);
  minutes+=count;grossCents+=Math.round(pay*100);
  lines.push({percent:Number(percent),minutes:count,hours:count/60,amount:pay});
 }
 lines.sort((a,b)=>a.percent-b.percent);
 return {date:shift.date,agency:String(c.agency||'Sin agencia'),scheduledMinutes:duration,unpaidBreakMinutes,paidBreakMinutes,paidMinutes:minutes,workedHours:minutes/60,segments:lines,estimatedGross:Math.round(grossCents)/100,currency:'EUR',source:'estimación contractual no verificada con nómina'};
}
