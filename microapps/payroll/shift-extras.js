import {balanceSnapshotHTML} from './balance-import.js';
// Rotation and paid-leave user interface: explicit user-entered data only.
import {periodWeeks,rotationForDate,proposedShift} from './shift-schedule.js';
import {leaveBalance} from './weekly-pay.js';
const esc=x=>String(x??'').replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[k]));
export function nlToday(){
 const f=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const v=Object.fromEntries(f.map(x=>[x.type,x.value]));return `${v.year}-${v.month}-${v.day}`;
}
export function leaveFormData(formData){
 const date=String(formData.date||'');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)throw Error('Fecha de vacaciones inválida.');
 const kind=String(formData.kind||'');if(!['opening','accrual','used','adjustment'].includes(kind))throw Error('Tipo de movimiento inválido.');
 const hours=Number(formData.hours);if(!Number.isFinite(hours)||Math.abs(hours)>400||(hours<=0&&kind!=='adjustment'))throw Error('Indica horas válidas (no días).');
 const minutes=Math.round(hours*60);if(Math.abs(hours*60-minutes)>0.001)throw Error('Introduce horas en incrementos de un minuto.');
 if(kind==='adjustment'&&minutes===0)throw Error('La corrección no puede ser cero.');
 const reason=String(formData.reason||'other');if(!['holiday','dayoff','other'].includes(reason))throw Error('Motivo no válido.');
 return {date,kind,minutes,reason,note:String(formData.note||'').trim().slice(0,180)};
}
export function extrasHTML(leaveRows=[],referenceDate=nlToday(),snapshot=null){
 const state=rotationForDate(referenceDate),balance=leaveBalance(leaveRows,snapshot);
 const next=periodWeeks(referenceDate,'2026-10-12',4);
 const summary=balance.known?`${(balance.minutes/60).toLocaleString('es-ES',{maximumFractionDigits:2})} h ${balance.overdrawn?'· saldo negativo: revisar':'· saldo estimado'}`:'Desconocido: introduce las horas acumuladas de tu nómina';
 const days=balance.history.slice().reverse().slice(0,12).map(e=>`<li>${esc(e.date)} · ${esc({opening:'Saldo inicial',accrual:'Acumuladas',used:'Usadas',adjustment:'Corrección'}[e.kind])} · ${esc(e.minutes/60)} h${e.reason==='holiday'?' · Festivo':e.reason==='dayoff'?' · Día libre':''}${e.includedInSnapshot?' · Ya incluido en el saldo documentado (sin segundo descuento)':''}${e.note?` · ${esc(e.note)}`:''}</li>`).join('');
 return `<div class="card shift-rotation"><h3>Rotación de mañana y tarde</h3><p>Semana del <b>${esc(state.weekStart)}</b>: <strong>${state.type==='morning'?'Mañana · 06:00–15:00':'Tarde · 15:00–00:00'}</strong>. Alterna cada lunes desde el 12/10/2026.</p><ul>${next.map(w=>`<li>${esc(w.date)} · ${esc(w.label)}</li>`).join('')}</ul><p class="small">Propuesta, no horas realmente trabajadas. Entrada y salida modificables: viernes, salida anticipada o día sin trabajar. Confirma el descanso real (normalmente 30 min sin remunerar).</p><button type="button" data-shift-propose>Rellenar el turno del día seleccionado</button></div>
 ${snapshot?balanceSnapshotHTML(snapshot):''}<div class="card shift-holidays"><h3>Saldo de vacaciones y festivos</h3><p><strong>${esc(summary)}</strong></p><p class="small">Según tu información, los festivos y días libres que se pagan de este saldo lo descuentan. Esto NO son horas trabajadas y no suman al límite semanal de 40 horas. El valor monetario se confirmará con la nómina.</p>
 <form data-leave-event><div class="shift-fields"><label>Fecha<input type="date" name="date" value="${esc(referenceDate)}" required></label><label>Movimiento<select name="kind"><option value="opening">Saldo inicial confirmado</option><option value="accrual">Horas acumuladas</option><option value="used">Festivo / día libre descontado</option><option value="adjustment">Corrección +/-</option></select></label><label>Horas<input type="number" name="hours" step="any" min="-400" max="400" required placeholder="Ej.: 8"></label><label>Motivo<select name="reason"><option value="holiday">Festivo</option><option value="dayoff">Día libre</option><option value="other">Otro</option></select></label></div><label>Nota (opcional)<input name="note" maxlength="180" placeholder="Referencia a saldo de nómina"></label><button type="submit" class="primary">Registrar movimiento de vacaciones</button></form>${!balance.known?'<p class="shift-error">No se puede calcular el saldo disponible sin saldo inicial. Los movimientos quedan registrados, pero no se inventa la cifra.</p>':''}${balance.overdrawn?'<p role="alert">El saldo calculado es negativo: comprueba acumulaciones y descuentos en SD Worx.</p>':''}<details><summary>Historial de movimientos (${leaveRows.length})</summary><ul class="shift-list">${days||'<li>No hay movimientos registrados.</li>'}</ul></details></div>`;
}
export function proposedForDate(date){return proposedShift(date);}
