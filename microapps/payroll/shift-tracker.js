import {createRecords} from '../records.js';
import {calculateShift,validateContract} from './shifts.js';
import {calculateWeeklyPayroll,leaveBalance} from './weekly-pay.js';
import {extrasHTML,leaveFormData,proposedForDate} from './shift-extras.js';
const esc=x=>String(x??'').replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&quot;'}[k]));
const cash=x=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(x);
const n2=x=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:2}).format(x);
const validDate=x=>/^\d{4}-\d{2}-\d{2}$/.test(x)&&new Date(`${x}T00:00:00Z`).toISOString().slice(0,10)===x;

// Each contract defines percentages of the TOTAL hourly rate (130 = base * 1.30),
// not only the additional premium. Never seed a real user's contract from an example.
export function parseBands(value){
 const lines=String(value||'').trim().split(/\n/).map(s=>s.trim()).filter(Boolean);
 if(!lines.length)throw Error('Escribe las franjas verificadas de tu contrato.');
 const bands=lines.map(line=>{
  const match=/^([01]\d|2[0-3]):([0-5]\d)\s*-\s*([01]\d|2[0-3]):([0-5]\d)\s*=\s*(\d+(?:[.,]\d+)?)\s*%?$/.exec(line);
  if(!match)throw Error(`Franja no válida: ${line.slice(0,50)}. Usa 18:00-00:00=130`);
  return {start:`${match[1]}:${match[2]}`,end:`${match[3]}:${match[4]}`,percent:Number(match[5].replace(',','.'))};
 });
 return bands;
}
export function parseBreaks(value){
 const raw=String(value||'').trim();if(!raw)return [];
 return raw.split(/\n/).map(line=>{
  const m=/^([01]\d|2[0-3]):([0-5]\d)\s*-\s*([01]\d|2[0-3]):([0-5]\d)\s*;\s*(pagado|sinpago)$/i.exec(line.trim());
  if(!m)throw Error('Descanso inválido. Escribe una línea como 19:00-19:30;sinpago o 10:00-10:15;pagado.');
  return {start:`${m[1]}:${m[2]}`,end:`${m[3]}:${m[4]}`,paid:m[5].toLowerCase()==='pagado'};
 });
}
export function isoWeek(date){
 if(!validDate(date))throw Error('Fecha no válida.');
 const d=new Date(`${date}T00:00:00Z`);d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));const year=d.getUTCFullYear();const first=new Date(Date.UTC(year,0,1));const week=Math.ceil((((d-first)/86400000)+1)/7);return `${year}-W${String(week).padStart(2,'0')}`;
}
export function shiftWeeks(rows){
 const weeks=new Map();
 for(const r of rows){const x=r.payload||{},c=x.contractSnapshot;
  if(!c)continue;let calculated;try{calculated=calculateShift(x,c);}catch{continue;}
  const week=isoWeek(x.date);if(!weeks.has(week))weeks.set(week,{week,paidMinutes:0,grossCents:0,shifts:0});
  const entry=weeks.get(week);entry.shifts++;entry.paidMinutes+=calculated.paidMinutes;entry.grossCents+=Math.round(calculated.estimatedGross*100);
 }
 return [...weeks.values()].sort((a,b)=>b.week.localeCompare(a.week)).map(x=>({...x,gross:x.grossCents/100}));
}
export function reconcileWeeks(weeks,payslips=[]){
 return weeks.map(w=>{
  const [year,number]=w.week.split('-W').map(Number);
  const candidates=payslips.filter(p=>p.period_type==='weekly'&&Number(p.period_year)===year&&Number(p.period_number)===number&&!p.is_correction&&['approved','not_required'].includes(p.review_status)&&p.validation_status!=='failed');
  // A weekly wage statement may include additional paid leave, overtime, and expenses.
  // Only compare the regular and shift-allowance components when both exist.
  if(candidates.length!==1)return {...w,comparison:null,comparisonStatus:candidates.length?'Varias nóminas: selecciona y revisa la empresa.':'Sin nómina semanal confirmada en este período.'};
  const p=candidates[0];if(p.regular_pay==null||p.shift_allowance==null)return {...w,comparison:null,comparisonStatus:'La nómina no tiene componentes base y ORT completos.'};
  const paid=Math.round((Number(p.regular_pay)+Number(p.shift_allowance))*100)/100;
  if(!Number.isFinite(paid))return {...w,comparison:null,comparisonStatus:'Componentes salariales inválidos.'};
  return {...w,comparison:{amount:paid,difference:Math.round((paid-w.gross)*100)/100,payslipId:p.id},comparisonStatus:'Comparación orientativa de salario base + ORT; revisa agencia, extras, festivos y reglas contractuales.'};
 });
}
export function shiftCSV(rows){
 const headers=['fecha','agencia','entrada','salida','min_programados','min_descanso_sin_pago','min_descanso_pagado','min_remunerados','horas_100','horas_130','horas_150','horas_extra','bruto_estimado_eur'];
 const cell=x=>'"'+String(x??'').replaceAll('"','""')+'"';
 const payroll=calculateWeeklyPayroll(rows);
 const detailsById=new Map(payroll.shifts.filter(x=>x.id).map(x=>[x.id,x]));
 const body=rows.map((r,index)=>{const p=r.payload||{},base=calculateShift(p,p.contractSnapshot);
  const extra=detailsById.get(r.id)||payroll.shifts.find(s=>s.date===p.date&&s.start===p.start&&s.end===p.end&&s.agency===p.contractSnapshot?.agency);
  if(!extra)throw Error('Falta la distribución semanal para el turno.');
  const byRate=percent=>extra.segments.filter(s=>s.percent===percent).reduce((a,x)=>a+x.minutes,0)/60;
  return [p.date,p.contractSnapshot.agency,p.start,p.end,base.scheduledMinutes,base.unpaidBreakMinutes,base.paidBreakMinutes,base.paidMinutes,byRate(100),byRate(130),byRate(150),extra.overtimeMinutes/60,extra.gross].map(cell).join(';');
 });
 return '\uFEFF'+[headers.map(cell).join(';'),...body].join('\r\n');
}

export function createShiftTracker({db,getUser,root}){
 const contractsDb=createRecords(db,getUser,{domain:'money',type:'shift_contract'});
 const shiftsDb=createRecords(db,getUser,{domain:'work',type:'shift_log'});
 const leaveDb=createRecords(db,getUser,{domain:'money',type:'shift_leave_event'});
 let contracts=[],shifts=[],leaveRows=[],weeklyDetailCache=new Map(),ready=false,busy=false,error='',notice='',epoch=0;
 const clean=()=>{epoch++;contracts=[];shifts=[];leaveRows=[];ready=false;busy=false;error=notice='';};
 const refresh=async()=>{
  if(busy)return;const e=++epoch;busy=true;error='';
  try{const [c,s,l]=await Promise.all([contractsDb.list({limit:200}),shiftsDb.list({limit:300}),leaveDb.list({limit:300})]);
   if(e!==epoch)return;contracts=c;shifts=s;leaveRows=l;ready=true;
  }catch(err){if(e===epoch)error=err.message||'No se pudieron cargar turnos.';}finally{if(e===epoch)busy=false;}
 };
 const contractSelect=()=>contracts.map(c=>`<option value="${esc(c.id)}">${esc(c.title)} · ${cash(c.payload?.hourlyRate||0)}/h</option>`).join('');
 const card=c=>`<li class="shift-item"><b>${esc(c.title)}</b><span>${cash(c.payload.hourlyRate)} / hora · ${esc(c.payload.effectiveFrom||'Sin fecha')} · ${c.payload.effectiveTo?esc(c.payload.effectiveTo):'vigente sin fin definido'}</span><details><summary>Franjas originales del contrato</summary>${(c.payload.bands||[]).map(b=>`<p>${esc(b.start)}–${esc(b.end)}: ${n2(b.percent)} % de tarifa total</p>`).join('')}</details></li>`;
 const weeklyHTML=(payslips=[])=>{
  let result;
  try{result=calculateWeeklyPayroll(shifts);weeklyDetailCache=new Map(result.shifts.filter(d=>d.id).map(d=>[d.id,d]));}catch(e){weeklyDetailCache=new Map();return `<div class="card" role="alert"><h3>Resumen semanal no calculable</h3><p>${esc(e.message)}</p><p>Revisa turnos duplicados y condiciones de la agencia antes de comparar con Nóminas.</p></div>`;}
  const summary=result.weeks;
  return `<div class="card"><h3>3. Resumen por semana · horas extra al 150 %</h3>${summary.length?`<ul class="shift-list">${summary.map(w=>`<li><b>${esc(w.week)} · ${esc(w.agency)}</b> · ${n2(w.minutes/60)} h pagadas · <b>${cash(w.gross)}</b> bruto estimado. <div class="shift-segments">${w.byPercentage.map(x=>`<span>${n2(x.minutes/60)} h al ${n2(x.percent)} %${x.kind==='overtime'?' (extra)':''}</span>`).join('')}</div>${w.overtimeMinutes?`<small>Extra al 150 %: ${n2(w.overtimeMinutes/60)} h (se aplican después de 40 h trabajadas, no se suma con el plus normal).</small>`:''}<small>Comparar con nómina solo tras vincular contrato/empleador y separar pluses, festivos y correcciones.</small></li>`).join('')}</ul><button type="button" data-shift-export>Exportar CSV de turnos</button>`:'<p>Sin turnos registrados.</p>'}<p class="small">Los días libres y festivos pagados del saldo de vacaciones NO cuentan para las 40 horas trabajadas. Agrupación por semana ISO y agencia; los cambios de horario CET/CEST requieren revisión.</p></div>`;
 };
 const shiftCard=r=>{const x=r.payload||{};let v,weeklyDetail;try{v=calculateShift(x,x.contractSnapshot);weeklyDetail=weeklyDetailCache.get(r.id);} catch(err){return `<li class="shift-item" role="alert">${esc(x.date)}: ${esc(err.message)}</li>`;}
  return `<li class="shift-item"><div class="shift-item-head"><b>${esc(x.date)} · ${esc(x.start)}–${esc(x.end)}</b><b>${cash(weeklyDetail?.gross??v.estimatedGross)}</b></div><span>${esc(v.agency)} · ${n2(v.paidMinutes/60)} h remuneradas · ${n2(v.unpaidBreakMinutes)} min sin pago · estimación bruta</span><div class="shift-segments">${(weeklyDetail?.segments||v.segments).map(s=>`<span>${n2((s.minutes??(s.hours*60))/60)} h × ${n2(s.percent)} %${s.kind==='overtime'?' extra':''} = ${cash(s.amount)}</span>`).join('')}</div><button type="button" data-shift-edit="${esc(r.id)}">Editar</button> <button type="button" data-shift-delete="${esc(r.id)}">Eliminar turno</button></li>`;
 };
 const html=(payslips=[])=>`<section class="shift-tracker" aria-label="Registro de turnos y ORT"><div class="card shift-hero"><div class="ey">PAYROLL / WORK HOURS</div><h2>Shift Tracker · horas y pluses</h2><p>Previsión **bruta**, no nómina verificada. Los pluses dependen de tu agencia, convenio y contrato. Registra siempre descansos no remunerados; no se aplican reglas legales inventadas.</p></div>
 ${error?`<p role="alert" class="shift-error">${esc(error)}</p>`:''}${notice?`<p role="status">${esc(notice)}</p>`:''}
 ${!ready?`<div class="card" role="status">${busy?'Cargando agencias y turnos…':error?'Pulsa Reintentar.':'Sin cargar.'}<button type="button" data-shift-reload>Reintentar</button></div>`:`
 <details class="card shift-contract" ${contracts.length?'':'open'}><summary>1. Configurar contrato / agencia (${contracts.length})</summary><form data-shift-contract><label>Agencia o empresa<input name="agency" maxlength="100" required placeholder="Nombre que figura en tu contrato"></label><label>Tarifa bruta por hora (€)<input name="hourlyRate" type="number" min="0.01" max="1000" step="0.01" required></label><div class="shift-fields"><label>Límite semanal de extra (h)<input name="overtimeThresholdHours" type="number" min="1" max="100" step="0.5" value="40" required></label><label>Horas extra: % de tarifa total<input name="overtimePercent" type="number" min="100" max="500" step="1" value="150" required></label></div><div class="shift-fields"><label>Desde (vigencia)<input name="effectiveFrom" type="date" required></label><label>Hasta (opcional)<input name="effectiveTo" type="date"></label></div><label>Franjas horarias y porcentaje de TARIFA TOTAL<textarea name="bands" required rows="4" placeholder="00:00-06:00=100\n06:00-18:00=100\n18:00-00:00=130"></textarea></label><p class="small">Un 130% significa 1,30 × la tarifa; introduce los valores de tu contrato. Las franjas deben cubrir las 24 horas sin solaparse. Puedes crear otra versión del contrato si cambian.</p><button type="submit" class="primary">Guardar contrato</button></form><ul>${contracts.map(card).join('')}</ul></details>
 <div class="card"><h3>2. Registrar turno</h3>${contracts.length?`<p role="status" data-shift-feedback></p><form data-shift-log><input type="hidden" name="shiftId" value=""><label>Contrato verificado<select name="contractId" required>${contractSelect()}</select></label><div class="shift-fields"><label>Fecha de inicio<input name="date" type="date" required></label><label>Entrada<input name="start" type="time" required></label><label>Salida<input name="end" type="time" required></label></div><label>Descansos (uno por línea; vacío si no hubo)<textarea name="breaks" rows="2" placeholder="19:00-19:30;sinpago\n21:00-21:15;pagado"></textarea></label><p class="small">Los turnos que atraviesan medianoche se dividen automáticamente por franjas. En cambios de horario CET/CEST se exige revisión manual. Las horas extra se recalculan por semana; los festivos/días libres se descuentan del saldo solo si los registras.</p><button type="submit" class="primary">Guardar turno</button></form>`:'<p>Crea primero un contrato con sus tramos y porcentajes confirmados.</p>'}</div>
 ${weeklyHTML(payslips)}
 ${extrasHTML(leaveRows)}
 <div class="card"><h3>4. Historial de turnos (${shifts.length})</h3><ul class="shift-list">${shifts.slice().sort((a,b)=>String(b.payload?.date).localeCompare(String(a.payload?.date))).slice(0,60).map(shiftCard).join('')||'<li>Sin turnos registrados.</li>'}</ul></div>`}
 </section>`;
 async function submit(form){if(busy)return;error=notice='';try{
  const v=Object.fromEntries(new FormData(form));
  if(form.hasAttribute('data-shift-contract')){
   if(!validDate(v.effectiveFrom)||v.effectiveTo&&!validDate(v.effectiveTo)||v.effectiveTo&&v.effectiveTo<v.effectiveFrom)throw Error('Vigencia del contrato inválida.');
   const c=validateContract({agency:String(v.agency||'').trim(),hourlyRate:v.hourlyRate,bands:parseBands(v.bands),overtimeThresholdHours:Number(v.overtimeThresholdHours),overtimePercent:Number(v.overtimePercent),effectiveFrom:v.effectiveFrom,effectiveTo:v.effectiveTo||null});
   if(!Number.isFinite(c.overtimeThresholdHours)||c.overtimeThresholdHours<=0||c.overtimeThresholdHours>100||!Number.isFinite(c.overtimePercent)||c.overtimePercent<100||c.overtimePercent>500)throw Error('Reglas de horas extra inválidas.');
   if(!c.agency)throw Error('Indica agencia o empresa.');
   await contractsDb.add({title:c.agency,status:'active',payload:c});notice='Contrato guardado. Los turnos conservarán una copia de estas condiciones.';
  }else if(form.hasAttribute('data-shift-log')){
   const record=contracts.find(c=>c.id===v.contractId);if(!record)throw Error('Selecciona un contrato guardado.');
   const contract=record.payload;
   if(v.date<contract.effectiveFrom||contract.effectiveTo&&v.date>contract.effectiveTo)throw Error('El contrato no estaba vigente en esa fecha.');
   const shift={date:v.date,start:v.start,end:v.end,breaks:parseBreaks(v.breaks),contractId:record.id,contractSnapshot:structuredClone(contract)};
   const summary=calculateShift(shift,contract);
   const old=v.shiftId?shifts.find(r=>r.id===v.shiftId):null;
   if(v.shiftId&&!old)throw Error('No se encuentra el turno que quieres modificar.');
   const fields={title:`${shift.date} ${shift.start}–${shift.end}`,status:'recorded',occurred_at:`${shift.date}T12:00:00Z`,payload:old?{...shift,revision:(old.payload?.revision||0)+1,priorRevisions:[...(old.payload?.priorRevisions||[]).slice(-8),{at:new Date().toISOString(),previous:old.payload}]}:shift};
   if(old)await shiftsDb.update(old.id,fields);else await shiftsDb.add(fields);
   notice=`Turno guardado · ${n2(summary.paidMinutes/60)} h remuneradas. Comprueba el importe semanal con horas extra en el resumen; el cálculo de un turno aislado no incluye el umbral de 40 h.`;
  }else if(form.hasAttribute('data-leave-event')){
   const movement=leaveFormData(v);const existing=leaveBalance(leaveRows);
   if(movement.kind==='opening'&&existing.known)throw Error('Ya existe un saldo inicial. Registra diferencias como corrección.');
   await leaveDb.add({title:`${movement.date} · ${movement.kind}`,occurred_at:`${movement.date}T12:00:00Z`,status:'recorded',payload:movement});
   notice='Movimiento de vacaciones guardado. Comprueba el saldo con tu nómina de SD Worx.';
  }else return;
  await refresh();
 }catch(e){error=e.message||'No se pudo guardar.';}return true;}
 async function handleClick(button){if(button.hasAttribute('data-shift-reload')){await refresh();return true;}
  if(button.hasAttribute('data-shift-propose')){
   const form=root.querySelector('[data-shift-log]');if(!form){error='Guarda antes un contrato.';return true;}
   const date=form.querySelector('[name=date]')?.value;
   if(!date){error='Selecciona primero la fecha del turno.';return true;}
   const proposal=proposedForDate(date);
   if(!proposal.workingDay){error='Es fin de semana. Introduce las horas reales solo si trabajaste.';return true;}
   form.querySelector('[name=start]').value=proposal.start;form.querySelector('[name=end]').value=proposal.end;
   form.querySelector('[name=breaks]').value='';
   notice=`Turno ${proposal.rotation==='morning'?'mañana':'tarde'} sugerido para ${date}. Ajusta la salida y registra el descanso real (30 min normalmente).`;
   const msg=root.querySelector('[data-shift-feedback]');if(msg)msg.textContent=notice;
   form.querySelector('[name=start]').focus();return true;
  }
  if(button.hasAttribute('data-shift-edit')){
   const record=shifts.find(r=>r.id===button.dataset.shiftEdit),form=root.querySelector('[data-shift-log]');
   if(!record||!form){error='No se ha encontrado el turno editable.';return true;}
   const p=record.payload||{};
   for(const k of ['date','start','end','contractId']){const field=form.querySelector(`[name=${k}]`);if(field)field.value=p[k]||'';}
   form.querySelector('[name=shiftId]').value=record.id;
   form.querySelector('[name=breaks]').value=(p.breaks||[]).map(b=>`${b.start}-${b.end};${b.paid?'pagado':'sinpago'}`).join('\n');
   const noticeNode=root.querySelector('[data-shift-feedback]');if(noticeNode)noticeNode.textContent='Editando turno existente: revisa y pulsa Guardar cambios. El historial anterior queda asociado al registro.';
   const submit=form.querySelector('button[type=submit]');if(submit)submit.textContent='Guardar cambios en el turno';
   form.scrollIntoView({behavior:'smooth',block:'start'});return true;
  }
  if(button.hasAttribute('data-shift-export')){try{const csv=shiftCSV(shifts);const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='rise-hub-turnos.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){error=e.message||'No se pudo exportar.';}return true;}
  if(!button.hasAttribute('data-shift-delete'))return false;
  if(busy)return true;
  const row=shifts.find(s=>s.id===button.dataset.shiftDelete);if(!row)throw Error('Turno no encontrado.');
  if(!confirm(`¿Eliminar el turno ${row.title}? Esta acción no se puede deshacer.`))return true;
  error=notice='';try{await shiftsDb.remove(row.id);await refresh();notice='Turno eliminado.';}catch(e){error=e.message||'No se pudo eliminar.';}return true;
 }
 return {load:refresh,html,submit,handleClick,reset:clean};
}
