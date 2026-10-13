import {createRecords} from '../records.js';
import {calculateShift,validateContract} from './shifts.js';
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
 const headers=['fecha','agencia','entrada','salida','min_programados','min_descanso_sin_pago','min_descanso_pagado','min_remunerados','horas_100','horas_130','horas_150','bruto_estimado_eur'];
 const cell=x=>'"'+String(x??'').replaceAll('"','""')+'"';
 const body=rows.map(r=>{const p=r.payload||{},result=calculateShift(p,p.contractSnapshot),byRate=rate=>result.segments.find(s=>s.percent===rate)?.hours??0;
  return [p.date,p.contractSnapshot.agency,p.start,p.end,result.scheduledMinutes,result.unpaidBreakMinutes,result.paidBreakMinutes,result.paidMinutes,byRate(100),byRate(130),byRate(150),result.estimatedGross].map(cell).join(';');
 });
 return '\uFEFF'+[headers.map(cell).join(';'),...body].join('\r\n');
}
export function createShiftTracker({db,getUser}){
 const contractsDb=createRecords(db,getUser,{domain:'money',type:'shift_contract'});
 const shiftsDb=createRecords(db,getUser,{domain:'work',type:'shift_log'});
 let contracts=[],shifts=[],ready=false,busy=false,error='',notice='',epoch=0;
 const clean=()=>{epoch++;contracts=[];shifts=[];ready=false;busy=false;error=notice='';};
 const refresh=async()=>{
  if(busy)return;const e=++epoch;busy=true;error='';
  try{const [c,s]=await Promise.all([contractsDb.list({limit:200}),shiftsDb.list({limit:300})]);
   if(e!==epoch)return;contracts=c;shifts=s;ready=true;
  }catch(err){if(e===epoch)error=err.message||'No se pudieron cargar turnos.';}finally{if(e===epoch)busy=false;}
 };
 const contractSelect=()=>contracts.map(c=>`<option value="${esc(c.id)}">${esc(c.title)} · ${cash(c.payload?.hourlyRate||0)}/h</option>`).join('');
 const card=c=>`<li class="shift-item"><b>${esc(c.title)}</b><span>${cash(c.payload.hourlyRate)} / hora · ${esc(c.payload.effectiveFrom||'Sin fecha')} · ${c.payload.effectiveTo?esc(c.payload.effectiveTo):'vigente sin fin definido'}</span><details><summary>Franjas originales del contrato</summary>${(c.payload.bands||[]).map(b=>`<p>${esc(b.start)}–${esc(b.end)}: ${n2(b.percent)} % de tarifa total</p>`).join('')}</details></li>`;
 const shiftCard=r=>{const x=r.payload||{};let v;try{v=calculateShift(x,x.contractSnapshot);}catch(err){return `<li class="shift-item" role="alert">${esc(x.date)}: ${esc(err.message)}</li>`;}
  return `<li class="shift-item"><div class="shift-item-head"><b>${esc(x.date)} · ${esc(x.start)}–${esc(x.end)}</b><b>${cash(v.estimatedGross)}</b></div><span>${esc(v.agency)} · ${n2(v.paidMinutes/60)} h remuneradas · ${n2(v.unpaidBreakMinutes)} min sin pago · estimación bruta</span><div class="shift-segments">${v.segments.map(s=>`<span>${n2(s.hours)} h × ${n2(s.percent)} % = ${cash(s.amount)}</span>`).join('')}</div><button type="button" data-shift-delete="${esc(r.id)}">Eliminar turno</button></li>`;
 };
 const html=(payslips=[])=>`<section class="shift-tracker" aria-label="Registro de turnos y ORT"><div class="card shift-hero"><div class="ey">PAYROLL / WORK HOURS</div><h2>Shift Tracker · horas y pluses</h2><p>Previsión **bruta**, no nómina verificada. Los pluses dependen de tu agencia, convenio y contrato. Registra siempre descansos no remunerados; no se aplican reglas legales inventadas.</p></div>
 ${error?`<p role="alert" class="shift-error">${esc(error)}</p>`:''}${notice?`<p role="status">${esc(notice)}</p>`:''}
 ${!ready?`<div class="card" role="status">${busy?'Cargando agencias y turnos…':error?'Pulsa Reintentar.':'Sin cargar.'}<button type="button" data-shift-reload>Reintentar</button></div>`:`
 <details class="card shift-contract" ${contracts.length?'':'open'}><summary>1. Configurar contrato / agencia (${contracts.length})</summary><form data-shift-contract><label>Agencia o empresa<input name="agency" maxlength="100" required placeholder="Nombre que figura en tu contrato"></label><label>Tarifa bruta por hora (€)<input name="hourlyRate" type="number" min="0.01" max="1000" step="0.01" required></label><div class="shift-fields"><label>Desde (vigencia)<input name="effectiveFrom" type="date" required></label><label>Hasta (opcional)<input name="effectiveTo" type="date"></label></div><label>Franjas horarias y porcentaje de TARIFA TOTAL<textarea name="bands" required rows="4" placeholder="00:00-06:00=150\n06:00-18:00=100\n18:00-00:00=130"></textarea></label><p class="small">Un 130% significa 1,30 × la tarifa; introduce los valores de tu contrato. Las franjas deben cubrir las 24 horas sin solaparse. Puedes crear otra versión del contrato si cambian.</p><button type="submit" class="primary">Guardar contrato</button></form><ul>${contracts.map(card).join('')}</ul></details>
 <div class="card"><h3>2. Registrar turno</h3>${contracts.length?`<form data-shift-log><label>Contrato verificado<select name="contractId" required>${contractSelect()}</select></label><div class="shift-fields"><label>Fecha de inicio<input name="date" type="date" required></label><label>Entrada<input name="start" type="time" required></label><label>Salida<input name="end" type="time" required></label></div><label>Descansos (uno por línea; vacío si no hubo)<textarea name="breaks" rows="2" placeholder="19:00-19:30;sinpago\n21:00-21:15;pagado"></textarea></label><p class="small">Los turnos que atraviesan medianoche se dividen automáticamente por franjas. En cambios de horario CET/CEST se exige revisión manual. No incluye automáticamente festivos ni horas extra.</p><button type="submit" class="primary">Guardar turno</button></form>`:'<p>Crea primero un contrato con sus tramos y porcentajes confirmados.</p>'}</div>
 <div class="card"><h3>3. Resumen por semana ISO</h3>${shiftWeeks(shifts).length?`<ul class="shift-list">${reconcileWeeks(shiftWeeks(shifts),payslips).map(w=>`<li><b>${esc(w.week)}</b> · ${w.shifts} turno(s) · ${n2(w.paidMinutes/60)} horas pagadas · <strong>${cash(w.gross)}</strong> bruto estimado <small>${esc(w.comparisonStatus)}${w.comparison?` · Nómina ${cash(w.comparison.amount)} (base + ORT) · diferencia ${cash(w.comparison.difference)} <b>no apta para reclamar sin verificar</b>`:''}</small></li>`).join('')}</ul><button type="button" data-shift-export>Exportar CSV de turnos</button>`:'<p>Sin turnos registrados.</p>'}<p class="small">Agrupación por semana de inicio del turno, no por fecha de cobro. No incluye transporte, horas extra, vacaciones, impuestos ni otras deducciones.</p></div>
 <div class="card"><h3>4. Historial de turnos (${shifts.length})</h3><ul class="shift-list">${shifts.slice().sort((a,b)=>String(b.payload?.date).localeCompare(String(a.payload?.date))).slice(0,60).map(shiftCard).join('')||'<li>Sin turnos registrados.</li>'}</ul></div>`}
 </section>`;
 async function submit(form){if(busy)return;error=notice='';try{
  const v=Object.fromEntries(new FormData(form));
  if(form.hasAttribute('data-shift-contract')){
   if(!validDate(v.effectiveFrom)||v.effectiveTo&&!validDate(v.effectiveTo)||v.effectiveTo&&v.effectiveTo<v.effectiveFrom)throw Error('Vigencia del contrato inválida.');
   const c=validateContract({agency:String(v.agency||'').trim(),hourlyRate:v.hourlyRate,bands:parseBands(v.bands),effectiveFrom:v.effectiveFrom,effectiveTo:v.effectiveTo||null});
   if(!c.agency)throw Error('Indica agencia o empresa.');
   await contractsDb.add({title:c.agency,status:'active',payload:c});notice='Contrato guardado. Los turnos conservarán una copia de estas condiciones.';
  }else if(form.hasAttribute('data-shift-log')){
   const record=contracts.find(c=>c.id===v.contractId);if(!record)throw Error('Selecciona un contrato guardado.');
   const contract=record.payload;
   if(v.date<contract.effectiveFrom||contract.effectiveTo&&v.date>contract.effectiveTo)throw Error('El contrato no estaba vigente en esa fecha.');
   const shift={date:v.date,start:v.start,end:v.end,breaks:parseBreaks(v.breaks),contractId:record.id,contractSnapshot:structuredClone(contract)};
   const summary=calculateShift(shift,contract);
   await shiftsDb.add({title:`${shift.date} ${shift.start}–${shift.end}`,status:'recorded',occurred_at:`${shift.date}T12:00:00Z`,payload:shift});
   notice=`Turno guardado · ${n2(summary.paidMinutes/60)} h remuneradas · ${cash(summary.estimatedGross)} bruto estimado.`;
  }else return;
  await refresh();
 }catch(e){error=e.message||'No se pudo guardar.';}return true;}
 async function handleClick(button){if(button.hasAttribute('data-shift-reload')){await refresh();return true;}
  if(button.hasAttribute('data-shift-export')){try{const csv=shiftCSV(shifts);const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='rise-hub-turnos.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){error=e.message||'No se pudo exportar.';}return true;}
  if(!button.hasAttribute('data-shift-delete'))return false;
  if(busy)return true;
  const row=shifts.find(s=>s.id===button.dataset.shiftDelete);if(!row)throw Error('Turno no encontrado.');
  if(!confirm(`¿Eliminar el turno ${row.title}? Esta acción no se puede deshacer.`))return true;
  error=notice='';try{await shiftsDb.remove(row.id);await refresh();notice='Turno eliminado.';}catch(e){error=e.message||'No se pudo eliminar.';}return true;
 }
 return {load:refresh,html,submit,handleClick,reset:clean};
}
