// Europe/Amsterdam offset-aware date/time utilities. Keep user's wall clock explicit.
const formatter=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
const OFFSET_INSTANT=/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d)$/;
export function localAmsterdamMinute(epoch){
 if(!Number.isInteger(epoch)||epoch%60000!==0)throw Error('Se requieren minutos exactos.');
 const p=Object.fromEntries(formatter.formatToParts(new Date(epoch)).map(x=>[x.type,x.value]));
 return {date:`${p.year}-${p.month}-${p.day}`,clock:`${p.hour}:${p.minute}`};
}
export function instantInAmsterdam(value){
 if(!OFFSET_INSTANT.test(String(value||'')))throw Error('Fecha y offset obligatorios, ejemplo 2026-10-25T02:30+02:00.');
 const ms=Date.parse(value);
 if(!Number.isFinite(ms)||ms%60000!==0)throw Error('Instante con offset inválido.');
 const local=localAmsterdamMinute(ms);
 if(local.date!==value.slice(0,10)||local.clock!==value.slice(11,16))throw Error('Offset no corresponde a Europe/Amsterdam.');
 return ms;
}
export function nextCalendarDay(date){
 const t=Date.parse(date+'T00:00:00Z');if(!Number.isFinite(t))throw Error('Fecha inválida.');
 return new Date(t+86400000).toISOString().slice(0,10);
}

export function resolveAmsterdamLocalMinute(date,clock){
 const label=date+'T'+clock;
 const wall=Date.parse(label+':00Z');
 if(!Number.isFinite(wall)||new Date(wall).toISOString().slice(0,16)!==label)throw Error('Fecha u hora local inválida.');
 const matches=[60,120].map(offset=>wall-offset*60000).filter(ms=>{const local=localAmsterdamMinute(ms);return local.date===date&&local.clock===clock;});
 if(matches.length!==1)throw Error('Hora local ambigua o inexistente CET/CEST: introduce instantes con offset.');
 return matches[0];
}
