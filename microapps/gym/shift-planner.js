// Turnos alternos confirmados por el usuario: lunes 2026-10-12 mañana.
// Sugerencias horarias: no son reservas, eventos de calendario ni recordatorios.
const ANCHOR='2026-10-12';
const DAY_MS=86400000;
function utcDay(date){const d=new Date(date+'T12:00:00Z');return Number.isNaN(d.getTime())?null:Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());}
export function shiftForDate(iso,anchor=ANCHOR){
 const date=utcDay(iso),base=utcDay(anchor);
 if(date===null||base===null)throw new Error('Fecha inválida');
 const d=new Date(date),monday=date-((d.getUTCDay()+6)%7)*DAY_MS;
 const anchorDate=new Date(base),anchorMonday=base-((anchorDate.getUTCDay()+6)%7)*DAY_MS;
 const weeks=Math.round((monday-anchorMonday)/(7*DAY_MS));
 return weeks%2===0?'morning':'evening';
}
export function suggestedTrainingWeek(iso,trainingDays=4){
 const day=utcDay(iso);if(day===null)throw new Error('Fecha inválida');
 const d=new Date(day);const monday=day-((d.getUTCDay()+6)%7)*DAY_MS;
 const format=ms=>new Date(ms).toISOString().slice(0,10);
 const shift=shiftForDate(format(monday));
 const time=shift==='morning'?'16:30':'10:30';
 // Balanced distribution with at least one recovery day after two consecutive sessions.
 const patterns={3:[0,2,4],4:[0,1,3,5],5:[0,1,2,4,5]};
 const n=patterns[trainingDays]?trainingDays:4;
 return {shift,workHours:shift==='morning'?'06:00–15:00':'15:00–00:00',
  suggestedTime:time,days:patterns[n].map(offset=>({date:format(monday+offset*DAY_MS),time})),
  description:'Propuesta editable: ajusta las sesiones según sueño, recuperación y disponibilidad. No se han creado eventos.'};
}
