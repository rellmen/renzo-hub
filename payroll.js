import {areaTabsHTML} from './microapps/registry.js';
import {createPayrollUpload} from './payroll-upload-ui.js';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => value == null ? 'Sin datos' : new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(Number(value));
const number = value => value == null ? 'Sin datos' : new Intl.NumberFormat('es-ES',{maximumFractionDigits:2}).format(Number(value));
const date = value => !value ? 'Sin fecha' : Number.isNaN(new Date(value).valueOf()) ? String(value) : new Intl.DateTimeFormat('es-ES',{dateStyle:'medium'}).format(new Date(value));
export const percent = value => value == null ? 'Sin datos' : new Intl.NumberFormat('es-ES',{style:'percent',maximumFractionDigits:2}).format(Number(value));
export const monthlyRows = (rows, year) => rows.filter(m=>String(m.mes).slice(0,4)===String(year)).sort((a,b)=>String(b.mes).localeCompare(String(a.mes)));
export const nonzeroRows = rows => rows.filter(([,value])=>value!=null&&Number(value)!==0);
// Regla de cobro de Renzo: trabaja una semana (ISO) y cobra el miércoles siguiente (lunes ISO + 9 días).
export function isoWednesdayAfter(year, week){
 const jan4=new Date(Date.UTC(Number(year),0,4)), d=new Date(jan4);
 d.setUTCDate(jan4.getUTCDate()-((jan4.getUTCDay()+6)%7)+(Number(week)-1)*7+9);
 return d.toISOString().slice(0,10);
}
// Igual que ref_date en las vistas (migración 20261010030000): nómina semanal normal -> regla; corrección -> su fecha de pago.
export function payDate(p){
 if(!p)return null;
 const weekly=p.period_type==='weekly'&&Number(p.period_year)>0&&Number(p.period_number)>=1&&Number(p.period_number)<=53;
 const rule=weekly?isoWednesdayAfter(p.period_year,p.period_number):null;
 if(rule&&!p.is_correction)return rule;
 const own=p.payment_date?String(p.payment_date).slice(0,10):null;
 return own||rule||(p.period_end?String(p.period_end).slice(0,10):null)||(p.document_date?String(p.document_date).slice(0,10):null);
}
export const isConfirmed = p => ['approved','not_required'].includes(p.review_status)&&p.validation_status!=='failed';
export const isPendingReview = p => p.review_status==='pending'&&p.validation_status!=='failed';
export function taxRate(p){
 const base=Number(p?.loon_voor_loonheffing??p?.taxable_income??p?.gross_salary);
 return base>0&&p?.loonheffing!=null?Math.round(Number(p.loonheffing)/base*10000)/10000:null;
}
// Totales del año según el año de COBRO. Separa confirmadas y pendientes de revisión (no inventa: sin datos -> null).
export function yearSummary(payslips, year){
 const inYear=payslips.filter(p=>String(payDate(p)||'').slice(0,4)===String(year)&&p.validation_status!=='failed'&&p.review_status!=='rejected');
 const sum=(list,key)=>list.length?Math.round(list.reduce((n,p)=>n+Number(p[key]||0),0)*100)/100:null;
 const confirmed=inYear.filter(isConfirmed), pending=inYear.filter(isPendingReview), normal=confirmed.filter(p=>!p.is_correction);
 const gross=sum(confirmed,'gross_salary'), tax=sum(confirmed,'loonheffing'), normalHours=sum(normal,'worked_hours');
 return {
  confirmed:{count:confirmed.length,net:sum(confirmed,'net_salary'),gross,tax,hours:sum(confirmed,'worked_hours')},
  pending:{count:pending.length,net:sum(pending,'net_salary'),gross:sum(pending,'gross_salary')},
  total:{count:confirmed.length+pending.length,net:sum([...confirmed,...pending],'net_salary'),gross:sum([...confirmed,...pending],'gross_salary')},
  taxRate:gross>0&&tax!=null?Math.round(tax/gross*10000)/10000:null,
  netPerHour:normalHours>0?Math.round(sum(normal,'net_salary')/normalHours*100)/100:null
 };
}
// Huecos en la numeración de nóminas (por empresa y año): solo entre la primera y la última recibidas; no inventa las futuras.
export function missingPayslipNumbers(payslips){
 const groups=new Map();
 for(const p of payslips){
  if(p.validation_status==='failed'||!/^\d+$/.test(String(p.payslip_number??'').trim()))continue;
  const key=`${p.employer_id||''}|${p.period_year||''}`;
  if(!groups.has(key))groups.set(key,{employer_id:p.employer_id,year:p.period_year,nums:new Set()});
  groups.get(key).nums.add(Number(String(p.payslip_number).trim()));
 }
 const out=[];
 for(const g of groups.values()){
  const sorted=[...g.nums].sort((a,b)=>a-b), missing=[];
  for(let n=sorted[0];n<=sorted[sorted.length-1]&&missing.length<=60;n++)if(!g.nums.has(n))missing.push(n);
  if(missing.length)out.push({employer_id:g.employer_id,year:g.year,missing});
 }
 return out;
}
export function missingText(missing,employer){
 const list=missing.length>8?`${missing.length} nóminas (nº ${missing[0]} a ${missing[missing.length-1]})`:missing.length===1?`la nómina nº ${missing[0]}`:`las nóminas nº ${missing.slice(0,-1).join(', ')} y ${missing[missing.length-1]}`;
 return `${missing.length===1?'Falta':'Faltan'} ${list} de ${employer}. Envíala por Telegram o Drive para que el año cuadre con el acumulado oficial.`;
}
// Tipo de nómina para ordenarlas: semanal normal o pago extra (vakantiegeld, vacaciones, corrección).
export function payCategory(p){
 if(!p.is_correction)return 'Semanal';
 const worked=Number(p.regular_pay||0)+Number(p.shift_allowance||0)+Number(p.overtime_pay||0);
 if(worked===0&&Number(p.holiday_pay||0)>0)return 'Vacaciones';
 if(worked===0&&Number(p.vakantiegeld||0)>0)return 'Vakantiegeld';
 return 'Corrección';
}
// Agrupa por mes de COBRO (regla: semana trabajada -> miércoles siguiente; pagos extra -> su fecha de pago),
// ordenado por fecha de cobro. Meses del más reciente al más antiguo.
export function groupByPayMonth(payslips){
 const months=new Map();
 for(const p of payslips){const d=payDate(p),key=d?d.slice(0,7):'sin-fecha';if(!months.has(key))months.set(key,[]);months.get(key).push(p);}
 const num=v=>Number.isFinite(Number(v))?Number(v):0;
 return [...months].sort((a,b)=>a[0]==='sin-fecha'?1:b[0]==='sin-fecha'?-1:b[0].localeCompare(a[0])).map(([month,items])=>{
  items.sort((a,b)=>String(payDate(a)||'').localeCompare(String(payDate(b)||''))||num(a.payslip_number)-num(b.payslip_number));
  const confirmed=items.filter(isConfirmed);
  return {month,items,regular:items.filter(p=>!p.is_correction).length,extra:items.filter(p=>p.is_correction).length,
   net:confirmed.length?Math.round(confirmed.reduce((s,p)=>s+num(p.net_payment??p.net_salary),0)*100)/100:null,pending:items.length-confirmed.length};
 });
}
// Agrupa cada corrección debajo de la nómina normal de la misma semana (si existe).
export function groupByWeek(payslips){
 const groups=[], byWeek=new Map();
 for(const p of payslips.filter(p=>!p.is_correction)){const g={main:p,extras:[]};groups.push(g);if(p.period_label&&!byWeek.has(p.period_label))byWeek.set(p.period_label,g);}
 for(const p of payslips.filter(p=>p.is_correction)){const g=byWeek.get(p.corrected_period_ref||p.period_label);if(g)g.extras.push(p);else groups.push({main:p,extras:[]});}
 return groups;
}
export function monthlyTotals(rows){
 return Object.fromEntries(['bruto','neto','allowances_netas','cobrado_banco','horas_trabajadas','horas_extra','pago_horas_extra'].map(key=>[key,rows.length&&rows.every(row=>row[key]!=null)?Math.round(rows.reduce((sum,row)=>sum+Number(row[key]),0)*100)/100:null]));
}
export function monthlyYears(rows, current=String(new Date().getFullYear())){
 const years=[...new Set(rows.map(row=>String(row.mes).slice(0,4)))].filter(y=>/^\d{4}$/.test(y)).sort().reverse();
 return {years,selected:years.includes(String(current))?String(current):years[0]||''};
}
export function yearCompleteness(row){
 if(row.completo===false&&row.bruto_acumulado_oficial==null)return {state:'unknown',text:'Sin acumulado oficial en las nóminas registradas: no se puede comprobar si el año está completo.'};
 if(row.completo===false&&row.diferencia_bruto!=null&&Number(row.diferencia_bruto)<0)return {state:'incomplete',text:`Lo registrado supera el acumulado oficial en ${money(-Number(row.diferencia_bruto))}. Revisa nóminas duplicadas o correcciones.`};
 if(row.completo===true)return {state:'complete',text:'Completo: lo registrado cuadra con el acumulado oficial.'};
 if(row.completo===false)return {state:'incomplete',text:row.diferencia_bruto==null?'Faltan nóminas. Diferencia con el acumulado oficial: sin datos. Sube las nóminas que falten.':`Faltan nóminas: el acumulado oficial supera lo registrado en ${money(row.diferencia_bruto)}. Sube las nóminas que falten.`};
 return {state:'unknown',text:'Sin datos para comprobar si el año está completo.'};
}
const labels = {received:'Recibido',processing:'Procesando',processed:'Procesado',review_required:'Revisión necesaria',failed:'Error',duplicate:'Duplicado',ignored:'Ignorado',pending:'Pendiente de revisión',approved:'Aprobada',rejected:'Rechazada',not_required:'Confirmada',verified:'Verificada',warning:'Advertencia',open:'Abierta',acknowledged:'Reconocida',resolved:'Resuelta',dismissed:'Descartada',registered:'Registrado',reprocess:'Reprocesado',duplicate_file:'Archivo duplicado',classified:'Clasificado',ingested:'Extraído',duplicate_logical:'Nómina duplicada',low:'Baja',medium:'Media',high:'Alta'};
const groups = {
 'Identificación': 'employee_number payslip_number payment_date contract_type',
 'Ingresos': 'gross_salary regular_pay overtime_pay holiday_pay vakantiegeld bonuses allowances shift_allowance travel_allowance expense_reimbursements other_income taxable_income total_employer_cost',
 'Deducciones': 'loonheffing wage_tax social_contributions pension_contribution insurance_deductions employee_contributions corrections garnishments other_deductions total_deductions',
 'Neto': 'net_salary net_payment bank_payment',
 'Horas y tarifa': 'hourly_rate salary_rate contracted_hours worked_hours regular_hours overtime_hours holiday_hours sick_hours unpaid_hours paid_leave_hours',
 'Acumulados': 'cumulative_gross cumulative_tax cumulative_net cumulative_hours cumulative_holiday_pay cumulative_taxable_income',
 'Datos fiscales NL': 'loon_voor_loonheffing sv_loon arbeidskorting vakantiegeld_reserved'
};
const names = {employee_number:'Número de empleado',payslip_number:'Número de nómina',payment_date:'Fecha de pago',contract_type:'Tipo de contrato',gross_salary:'Salario bruto',regular_pay:'Salario ordinario',overtime_pay:'Pago de horas extra',holiday_pay:'Pago de vacaciones',vakantiegeld:'Paga de vacaciones',bonuses:'Bonificaciones',allowances:'Complementos',shift_allowance:'Plus de turno',travel_allowance:'Transporte',expense_reimbursements:'Reembolsos',other_income:'Otros ingresos',taxable_income:'Base imponible',total_employer_cost:'Coste empresarial',loonheffing:'Retención NL',wage_tax:'Impuesto salarial',social_contributions:'Cotizaciones sociales',pension_contribution:'Pensión',insurance_deductions:'Seguros',employee_contributions:'Aportaciones',corrections:'Correcciones',garnishments:'Embargos',other_deductions:'Otras deducciones',total_deductions:'Total deducciones',net_salary:'Salario neto',net_payment:'Pago neto',bank_payment:'Transferencia',hourly_rate:'Tarifa por hora',salary_rate:'Tarifa salarial',contracted_hours:'Horas contratadas',worked_hours:'Horas trabajadas',regular_hours:'Horas ordinarias',overtime_hours:'Horas extra',holiday_hours:'Horas de vacaciones',sick_hours:'Horas de baja',unpaid_hours:'Horas no pagadas',paid_leave_hours:'Permiso pagado',cumulative_gross:'Bruto acumulado',cumulative_tax:'Impuestos acumulados',cumulative_net:'Neto acumulado',cumulative_hours:'Horas acumuladas',cumulative_holiday_pay:'Vacaciones acumuladas',cumulative_taxable_income:'Base imponible acumulada',loon_voor_loonheffing:'Loon voor loonheffing',sv_loon:'SV loon',arbeidskorting:'Arbeidskorting',vakantiegeld_reserved:'Vacaciones reservadas'};
export const reviewFields = Object.values(groups).join(' ').split(' ');
const textFields = new Set(['employee_number','payslip_number','payment_date','contract_type']);
export function reviewChanges(original, values){
 const changes={};
 for(const key of reviewFields){
  const raw=String(values[key]??'').trim();
  let value=raw===''?null:textFields.has(key)?raw:Number(raw);
  if(value!==null&&!textFields.has(key)&&!Number.isFinite(value))throw new Error(`Valor no válido: ${names[key]}`);
  if(key==='payment_date'&&value&&(!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value))throw new Error('Fecha de pago no válida');
  const old=original[key]==null||original[key]===''?null:textFields.has(key)?String(original[key]):Number(original[key]);
  if(value!==old)changes[key]=value;
 }
 return changes;
}
const payLabel = p => {const d=payDate(p);return d?new Intl.DateTimeFormat('es-ES',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(d+'T00:00:00Z')):'Sin fecha';};
const chip = value => `<span class="pay-chip pay-${esc(value)}">${esc(labels[value]||value||'Sin estado')}</span>`;
const empty = '<div class="card"><h2>Aún no hay nóminas</h2><p>Envía el PDF de tu nómina a Jarvis en Telegram y aparecerá aquí en menos de un minuto.</p></div>';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function mountPayroll(root, db, getUser, go){
 let active=false, owner=null, epoch=0, busy=false, ready=false, queued=false, channel=null, timer=null, poll=null, connected=false;
 let tab='summary', selected=null, detail=null, detailEpoch=0, loadingDetail=false, year=String(new Date().getFullYear()), employer='', message='', error='', saving=false;
 let pendingId=null, monthlyYear='', listView='month';
 let data={}, errors={}, draft=null, pdfUrl=null, pdfBusy=false, demo=false, fixture=null;
 const upload=createPayrollUpload({db,onChange:()=>{if(active)render();},onDone:async body=>{await load();if(body?.payslipId&&uuid.test(body.payslipId))loadDetail('payslip',body.payslipId);}});
 const alive=(uid,e)=>active&&getUser()?.id===uid&&owner===uid&&epoch===e;
 const revoke=()=>{if(pdfUrl)URL.revokeObjectURL(pdfUrl);pdfUrl=null;};
 function close(){active=false;epoch++;detailEpoch++;busy=false;ready=false;queued=false;clearTimeout(timer);clearInterval(poll);timer=poll=null;if(channel){db.removeChannel(channel);channel=null;}connected=false;revoke();data={};errors={};detail=null;draft=null;selected=null;pendingId=null;saving=false;pdfBusy=false;loadingDetail=false;root.innerHTML='';}
 function reset(){close();upload.reset();owner=null;fixture=null;tab='summary';monthlyYear='';message=error='';}
 const all=(key)=>data[key]||[];
 const employerName=p=>p.employer_name||all('employers').find(e=>e.id===p.employer_id)?.name||'Empresa sin identificar';
 async function rows(table, configure=q=>q){
  const result=[];
  for(let offset=0;;offset+=500){
   const response=await configure(db.from(table).select('*')).range(offset,offset+499);
   if(response.error)throw response.error;
   result.push(...response.data||[]);
   if((response.data||[]).length<500)return result;
  }
 }
 function schedule(){clearTimeout(timer);timer=setTimeout(()=>{if(active)load();},400);}
 function connect(){
  if(demo||channel)return;
  const uid=owner,e=epoch;
  channel=db.channel(`payroll:${uid}:${e}`);
  for(const table of ['payroll_documents','payroll_payslips','payroll_events','payroll_anomalies'])channel.on('postgres_changes',{event:'*',schema:'public',table,filter:`user_id=eq.${uid}`},()=>{if(alive(uid,e))schedule();});
  channel.subscribe(status=>{if(!alive(uid,e))return;connected=status==='SUBSCRIBED';if(connected)schedule();renderStatus();});
  poll=setInterval(()=>{if(active&&(!connected||all('documents').some(d=>['received','processing'].includes(d.status))))load();},20000);
 }
 function renderStatus(){const el=root.querySelector('[data-live]');if(el)el.textContent=demo?'Demostración · datos ficticios':connected?'Actualización en tiempo real':'Reconectando · comprobación cada 20 s';}
 async function load(){
  if(!active||!owner)return;
  if(busy){queued=true;return;}
  busy=true;const uid=owner,e=epoch;
  if(!ready)render();
  const specs=[['year_nl','payroll_v_jaaropgave_nl',q=>q.eq('user_id',uid).order('jaar',{ascending:false})],['monthly_nl','payroll_v_monthly_nl',q=>q.eq('user_id',uid).order('mes',{ascending:false})],['documents','payroll_documents',q=>q.eq('user_id',uid).order('created_at',{ascending:false}).order('id')],['payslips','payroll_payslips',q=>q.eq('user_id',uid).order('period_start',{ascending:false}).order('id')],['employers','payroll_employers'],['anomalies','payroll_anomalies',q=>q.eq('user_id',uid).order('detected_at',{ascending:false}).order('id')],['ytd','payroll_v_ytd',q=>q.eq('user_id',uid).order('year')],['monthly','payroll_v_monthly',q=>q.eq('user_id',uid).order('month')],['confirmed','payroll_v_confirmed',q=>q.eq('user_id',uid).order('ref_date',{ascending:false}).order('id')],['rates','payroll_v_rate_history',q=>q.order('from_period',{ascending:false})],['queue','payroll_v_queue']];
  const results=await Promise.allSettled(specs.map(([key,table,configure])=>demo?Promise.resolve(fixture[key]||[]):rows(table,configure)));
  if(!alive(uid,e))return;
  results.forEach((r,i)=>{const key=specs[i][0];if(r.status==='fulfilled'){data[key]=r.value;delete errors[key];}else{errors[key]=r.reason?.message||'No se pudo consultar';}});
  busy=false;ready=true;
  if(selected&&!draft&&!saving&&!loadingDetail)await loadDetail(selected.kind,selected.id,false);
  if(!alive(uid,e))return;
  if(!draft)render();else renderStatus();if(queued){queued=false;schedule();}
 }
 async function loadDetail(kind,id,paint=true){
  if(!uuid.test(id)){error='El enlace de nómina no es válido.';render();return;}
  revoke();draft=null;selected={kind,id};detail=null;loadingDetail=true;error='';const seq=++detailEpoch,uid=owner,e=epoch;if(paint)render();
  try{
   const base=demo?(kind==='payslip'?fixture.payslips:fixture.documents).find(x=>x.id===id):await db.from(kind==='payslip'?'payroll_payslips':'payroll_documents').select('*').eq('id',id).eq('user_id',uid).maybeSingle().then(r=>{if(r.error)throw r.error;return r.data;});
   if(!alive(uid,e)||seq!==detailEpoch)return;
   if(!base)throw new Error('No se encontró el documento o no tienes acceso.');
   const p=kind==='payslip'?base:all('payslips').find(x=>x.document_id===id);
   let doc=kind==='document'?base:all('documents').find(x=>x.id===base.document_id);
   if(!doc&&p?.document_id&&!demo){const r=await db.from('payroll_documents').select('*').eq('id',p.document_id).eq('user_id',uid).maybeSingle();if(!alive(uid,e)||seq!==detailEpoch)return;if(r.error)throw r.error;doc=r.data;}
   const requests=[['events',()=>rows('payroll_events',q=>q.eq('document_id',doc?.id||p.document_id).order('created_at').order('id'))]];
   if(p)requests.push(['lines',()=>rows('payroll_line_items',q=>q.eq('payslip_id',p.id).order('sort_order'))],['validations',()=>rows('payroll_validations',q=>q.eq('payslip_id',p.id).order('rule_code'))],['versions',()=>rows('payroll_payslip_versions',q=>q.eq('payslip_id',p.id))]);
   const results=await Promise.allSettled(requests.map(([key,fn])=>demo?Promise.resolve((fixture[key]||[]).filter(x=>key==='events'?x.document_id===doc?.id:x.payslip_id===p?.id)):fn()));
   if(!alive(uid,e)||seq!==detailEpoch)return;
   detail={p,doc,issues:[]};results.forEach((r,i)=>{if(r.status==='fulfilled')detail[requests[i][0]]=r.value;else detail.issues.push(`${requests[i][0]}: ${r.reason?.message||'no disponible'}`);});
  }catch(err){if(alive(uid,e)&&seq===detailEpoch)error=err.message||'No se pudo abrir el detalle.';}
  if(!alive(uid,e)||seq!==detailEpoch)return;loadingDetail=false;render();
 }
 function stats(){
  const y=yearSummary(all('payslips'),year);
  const last=all('payslips')[0], weeks=all('confirmed').filter(x=>x.period_type==='weekly').slice(0,12).reverse();
  const points=weeks.map((p,i)=>`${20+i*(560/Math.max(1,weeks.length-1))},${140-(Number(p.net_salary)||0)/Math.max(1,...weeks.map(x=>Math.abs(Number(x.net_salary)||0)))*100}`).join(' ');
  return `<div class="card pay-hero" data-year-summary><div class="ey">Año ${esc(year)} · por fecha de cobro · nóminas confirmadas</div><h2>${money(y.confirmed.net)}</h2><p>Neto confirmado (${esc(number(y.confirmed.count))} nóminas)</p>${y.pending.count?`<p class="pay-pending-note" data-pending-total>Pendientes sin contar: <b>${money(y.pending.net)}</b> neto (${esc(number(y.pending.count))} ${y.pending.count===1?'nómina':'nóminas'} por revisar) · Con pendientes: <b>${money(y.total.net)}</b></p>`:''}${missingPayslipNumbers(all('payslips')).filter(g=>String(g.year)===String(year)).map(g=>`<p class="pay-missing" data-missing-payslips>${esc(missingText(g.missing,all('employers').find(e=>e.id===g.employer_id)?.name||'la empresa'))}</p>`).join('')}<div class="pay-grid">${[['Bruto',money(y.confirmed.gross)],['Impuestos',`${money(y.confirmed.tax)} · ${percent(y.taxRate)}`],['Horas',number(y.confirmed.hours)],['Neto / hora',money(y.netPerHour)]].map(([k,v])=>`<div><small>${k}</small><strong>${v}</strong></div>`).join('')}</div><p class="pay-muted">Cada nómina cuenta cuando se cobra: trabajas una semana y cobras el miércoles siguiente.</p></div>
   <div class="pay-grid">${[['payslips','Por revisar',all('payslips').filter(p=>p.review_status==='pending').length],['alerts','Alertas abiertas',all('anomalies').filter(a=>a.status==='open').length],['inbox','Documentos con error',all('documents').filter(d=>d.status==='failed').length]].map(([t,k,v])=>`<button class="card" data-tab="${t}">${k}<strong>${v}</strong></button>`).join('')}</div>
   <h2>Última nómina</h2>${last?payslipCard(last):empty}<div class="card"><h2>Neto · últimas 12 semanas recibidas</h2>${weeks.length?`<svg viewBox="0 0 600 180" role="img" aria-label="Evolución del salario neto"><polyline fill="none" stroke="#bca2ff" stroke-width="3" points="${points}"/></svg><details><summary>Ver valores del gráfico</summary>${weeks.map(p=>`<p>${esc(p.period_label)}: ${money(p.net_salary)}</p>`).join('')}</details>`:'Sin datos confirmados'}</div>
   <h2>Evolución mensual</h2>${all('monthly').filter(m=>String(m.month).startsWith(year)).map(m=>`<div class="card"><b>${esc(date(m.month))}</b><div class="pay-grid"><span>Bruto ${money(m.gross)}</span><span>Neto ${money(m.net)}</span><span>Impuestos ${money(m.tax)}</span><span>${number(m.hours)} horas</span></div></div>`).join('')||'<p>Sin datos mensuales confirmados.</p>'}`;
 }
 function monthlyView(){
  const {years,selected:defaultYear}=monthlyYears(all('monthly_nl'));
  if(!years.includes(monthlyYear))monthlyYear=defaultYear;
  const months=monthlyRows(all('monthly_nl'),monthlyYear), totals=monthlyTotals(months);
  const grid=rows=>`<dl class="pay-grid pay-month-metrics">${rows.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;
  const amounts=rows=>grid(rows.map(([label,value])=>[label,money(value)]));
  const fold=(title,content,index)=>`<div class="pay-month-desktop"><h3>${esc(title)}</h3>${content}</div><details class="pay-month-mobile" ${index===0?'open':''}><summary>${esc(title)}</summary>${content}</details>`;
  return `<section class="pay-monthly"><p class="pay-muted">Cada nómina cuenta en el mes en que se cobra: trabajas una semana y cobras el miércoles siguiente. Las correcciones cuentan cuando se pagan.</p>${years.length?`<label>Año <select data-monthly-year>${years.map(y=>`<option value="${esc(y)}" ${y===monthlyYear?'selected':''}>${esc(y)}</option>`).join('')}</select></label>`:''}
   ${!months.length?`<div class="card">${errors.monthly_nl?'No se pudieron cargar los datos mensuales. Pulsa Actualizar para reintentar.':'Sin datos mensuales.'}</div>`:`<article class="card pay-hero" data-monthly-total><h2>Total del año ${esc(monthlyYear)}</h2>${amounts([['Bruto',totals.bruto],['Neto',totals.neto],['Allowances',totals.allowances_netas],['Ingresado en el banco',totals.cobrado_banco]])}${grid([['Horas trabajadas',number(totals.horas_trabajadas)],['Horas extra',number(totals.horas_extra)],['Pago de horas extra',money(totals.pago_horas_extra)]])}</article>
   ${months.map((m,index)=>`<article class="card" data-month="${esc(m.mes)}"><h2>${esc(new Intl.DateTimeFormat('es-ES',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(m.mes)))}</h2><p>${esc(number(m.pagos))} nóminas${Number(m.correcciones)>0?` · ${esc(number(m.correcciones))} ${Number(m.correcciones)===1?'corrección':'correcciones'}`:''} ${Number(m.pendientes_revision)>0?`<span class="pay-chip pay-pending">${esc(number(m.pendientes_revision))} por revisar</span>`:''}</p>
    <div class="pay-bank"><span>Ingresado en el banco</span><strong>${esc(money(m.cobrado_banco))}</strong></div>${amounts([['Bruto',m.bruto],['Neto',m.neto],['Allowances',m.allowances_netas]])}
    <details><summary>Desglose del bruto</summary>${amounts(nonzeroRows([['Salario base',m.salario_base],['ORT',m.toeslagen],['Horas extra',m.pago_horas_extra],['Feestdagen',m.feestdagen],['Vakantiegeld',m.vakantiegeld_pagado],['Vacaciones disfrutadas',m.verlof_pagado],['Baja',m.ziekte_pagado]]))}</details>
    <details><summary>Retenciones</summary>${amounts([['Loonheffing',m.loonheffing],['Pensioen',m.pensioen],['Premies',m.premies]])}${grid([['Tipo de retención',percent(m.tipo_retencion)]])}${Number(m.correcciones)>0?'<p class="pay-muted">Incluye pagos extra, que tributan con la tarifa especial.</p>':''}</details>
    ${fold('Horas',grid([['Total',number(m.horas_trabajadas)],['Normales',number(m.horas_normales)],['ORT',number(m.horas_ort)],['Extra',number(m.horas_extra)],['Neto por hora',money(m.neto_por_hora)]]),index)}
    ${fold('Saldos al cierre',grid([['Vakantiegeld reservado',money(m.vakantiegeld_reservado)],['Horas de vacaciones',number(m.vakantiedagen_uren)],['Keuzebudget',money(m.keuzebudget_saldo)]]),index)}
    <p class="pay-muted">Equivalente mensual: bruto ${esc(money(m.bruto_mensual_equivalente))} · neto ${esc(money(m.neto_mensual_equivalente))} (media semanal × 13/3)</p></article>`).join('')}`}</section>`;
 }
 function yearView(){
  const years=[...all('year_nl')].sort((a,b)=>Number(b.jaar)-Number(a.jaar));
  const grid=rows=>`<dl class="pay-grid pay-month-metrics">${rows.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;
  const amounts=rows=>grid(rows.map(([label,value])=>[label,money(value)]));
  return `<section class="pay-yearly">${years.map(y=>{
   const status=yearCompleteness(y);
   return `<article class="card" data-year-card="${esc(y.jaar)}"><h2>Año ${esc(y.jaar)}</h2>
    <p>${esc(number(y.nominas))} nóminas${Number(y.correcciones)>0?` · ${esc(number(y.correcciones))} ${Number(y.correcciones)===1?'corrección':'correcciones'}`:''} ${Number(y.pendientes_revision)>0?`<span class="pay-chip pay-pending">${esc(number(y.pendientes_revision))} por revisar</span>`:''}</p>
    <p class="pay-year-status pay-year-${esc(status.state)}" data-completeness="${esc(status.state)}">${esc(status.text)}</p>
    <section class="pay-year-official" data-official><h3>Para tu jaaropgave / aangifte</h3>${amounts([['Loon voor de loonheffing',y.loon_lh_acumulado_oficial],['Ingehouden loonheffing',y.loonheffing_acumulada_oficial],['Bruto acumulado',y.bruto_acumulado_oficial]])}</section>
    <section data-recorded><h3>Lo registrado en el Hub</h3>${amounts([['Bruto registrado',y.bruto_registrado],['Neto',y.neto],['Ingresado en el banco',y.cobrado_banco],['Reiskosten onbelast',y.reiskosten_onbelast],['Pensioen',y.pensioen],['Premies',y.premies]])}
     ${grid([['Horas',number(y.horas)],['Horas extra',number(y.horas_extra)],['Pago de horas extra',money(y.pago_horas_extra)],['ORT',money(y.toeslagen)],['Vakantiegeld pagado',money(y.vakantiegeld_pagado)]])}</section>
    <p class="pay-muted">Valores informativos. La jaaropgave oficial la emite SD Worx a principios del año siguiente.</p></article>`;
  }).join('')||`<div class="card">${errors.year_nl?'No se pudieron cargar los datos anuales. Pulsa Actualizar para reintentar.':'Sin datos anuales.'}</div>`}</section>`;
 }
 function payMonthView(list){
  const monthName=m=>m==='sin-fecha'?'Sin fecha de cobro':(t=>t.charAt(0).toUpperCase()+t.slice(1))(new Intl.DateTimeFormat('es-ES',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(m+'-15T00:00:00Z')));
  return groupByPayMonth(list).map(g=>`<section class="pay-month-group"><h3>${esc(monthName(g.month))}</h3><p class="pay-muted">${g.items.length} nómina${g.items.length===1?'':'s'}: ${g.regular} semanal${g.regular===1?'':'es'}${g.extra?` + ${g.extra} pago${g.extra===1?'':'s'} extra`:''} · Neto cobrado confirmado ${money(g.net)}${g.pending?` · ${g.pending} pendiente${g.pending===1?'':'s'} de revisar`:''}</p>${g.items.map(p=>{const cat=payCategory(p);return `<button class="card pay-row${p.is_correction?' pay-extra-row':''}" data-payslip="${esc(p.id)}"><b>${esc(payLabel(p))} · ${p.period_number?`Semana ${esc(p.period_number)}`:esc(p.period_label||'Semana sin identificar')}${p.payslip_number?` · nº ${esc(p.payslip_number)}`:''}</b><span class="pay-chip pay-cat-${esc(cat.toLowerCase().normalize('NFD').replace(/[^a-z]/g,''))}">${esc(cat)}</span><strong>${money(p.net_payment??p.net_salary)} cobrado</strong><span>${money(p.gross_salary)} bruto · ${esc(employerName(p))}</span>${chip(p.review_status)}</button>`;}).join('')}</section>`).join('');
 }
 function payslipCard(p,parent){const rate=taxRate(p),extra=Boolean(p.is_correction);return `<button class="card pay-row${parent?' pay-extra':''}" data-payslip="${esc(p.id)}"${extra?' data-extra':''}><b>${extra?`${parent?'↳ ':''}Pago adicional · corrección de ${esc(p.corrected_period_ref||p.period_label||'semana sin identificar')}`:esc(p.period_label||'Periodo sin identificar')}</b><span>${esc(employerName(p))} · Cobro ${esc(payLabel(p))}</span><strong>${money(p.net_salary)} neto</strong><span>${money(p.gross_salary)} bruto · Retención ${esc(percent(rate))}${extra&&rate!=null?' (tarifa especial, pago extra)':''}</span>${chip(p.review_status)}</button>`;}
 function alerts(items){return items.map(a=>`<article class="card"><div>${chip(a.severity)} ${chip(a.status)}</div><h3>${esc(a.title||a.anomaly_type)}</h3><p>${esc(typeof a.details==='object'?JSON.stringify(a.details):a.details)}</p>${a.payslip_id?`<button data-payslip="${esc(a.payslip_id)}">Ver nómina</button>`:''}${['open','acknowledged'].includes(a.status)?`<button data-alert="${esc(a.id)}" data-state="resolved" ${saving?'disabled':''}>Resolver</button><button data-alert="${esc(a.id)}" data-state="dismissed" ${saving?'disabled':''}>Descartar</button>`:''}</article>`).join('')||'<div class="card">No hay alertas pendientes.</div>';}
 function detailView(){
  if(loadingDetail)return '<p role="status">Cargando detalle…</p>';
  if(!detail)return '';
  const {p,doc}=detail;
  const fields=Object.entries(groups).map(([title,keys])=>{const present=keys.split(' ').filter(k=>p?.[k]!=null&&p[k]!=='');return present.length?`<div class="card"><h3>${title}</h3><dl class="pay-fields">${present.map(k=>`<div class="${p.field_confidence?.[k]!=null&&p.field_confidence[k]<.85?'pay-low':''}"><dt>${esc(names[k])}${p.field_confidence?.[k]!=null&&p.field_confidence[k]<.85?' · revisar':''}</dt><dd>${esc(textFields.has(k)?k==='payment_date'?date(p[k]):p[k]:k.includes('hours')?number(p[k]):money(p[k]))}</dd></div>`).join('')}</dl></div>`:'';}).join('');
  return `<button data-back>← Volver</button>${detail.issues.length?`<p role="alert">Algunos detalles no están disponibles: ${esc(detail.issues.join(' · '))}</p>`:''}<div class="card"><h2>${esc(p?.period_label||doc?.original_file_name)}</h2>${p?`<p>${esc(employerName(p))} · Cobro ${esc(date(payDate(p)))}${p.is_correction?' · pago adicional (corrección)':''}</p><p data-tax-rate>Retención: ${esc(percent(taxRate(p)))}${p.is_correction?' · los pagos extra tributan con la tarifa especial (bijzonder tarief), por eso el porcentaje es más alto':''}</p>${chip(p.validation_status)} ${chip(p.review_status)}<p>Confianza: ${p.confidence_overall==null?'Sin datos':number(p.confidence_overall*100)+'%'}</p><p>${esc(p.summary)}</p>`:''}${doc?`<p>${esc(doc.original_file_name)} · ${chip(doc.status)}</p>`:''}${doc?.storage_path_archive||doc?.storage_path_raw||demo?`<button data-pdf ${pdfBusy?'disabled':''}>${pdfBusy?'Preparando…':'Ver PDF'}</button>`:'<p>PDF aún no disponible.</p>'}${pdfUrl?`<a class="pay-button" href="${esc(pdfUrl)}" target="_blank" rel="noopener">Abrir PDF</a>`:''}</div>
   ${p?fields:''}${p?`<div class="card"><h3>Datos NL adicionales</h3>${['loonheffingskorting_applied','bijzonder_tarief_pct','tabel_type','reserveringen'].filter(k=>p[k]!=null).map(k=>`<p>${esc(k)}: ${esc(typeof p[k]==='object'?JSON.stringify(p[k]):p[k])}</p>`).join('')||'Sin datos adicionales'}</div>`:''}
   ${p&&p.review_status==='pending'?reviewForm(p):''}
   ${p?`<div class="card"><h3>Líneas originales</h3><div class="pay-table"><table><thead><tr><th>Concepto</th><th>Tipo</th><th>Cantidad</th><th>Tarifa</th><th>Importe</th></tr></thead><tbody>${(detail.lines||[]).map(l=>`<tr><td>${esc(l.label_original)} <small>${esc(l.code)} ${esc(l.period_ref)}</small></td><td>${esc(l.category)}</td><td>${number(l.quantity)}</td><td>${money(l.rate)}</td><td>${money(l.amount)}</td></tr>`).join('')}</tbody></table></div></div><div class="card"><h3>Validaciones</h3>${(detail.validations||[]).map(v=>`<p>${v.passed?'✓':'✗'} ${esc(v.rule_code)} · ${esc(v.severity)} · ${esc(v.message)}<br><small>Esperado ${esc(v.expected)} · Actual ${esc(v.actual)} · Diferencia ${esc(v.difference)}</small></p>`).join('')||'Sin validaciones'}</div>${alerts(all('anomalies').filter(a=>a.payslip_id===p.id))}<details class="card"><summary>Historial de versiones (${(detail.versions||[]).length})</summary>${(detail.versions||[]).map(v=>`<pre>${esc(JSON.stringify(v,null,2))}</pre>`).join('')}</details>`:''}
   <div class="card"><h3>Seguimiento del documento</h3>${(detail.events||[]).map(v=>`<p><b>${esc(labels[v.event_type]||v.event_type)}</b> · ${esc(date(v.created_at))}<br>${esc(typeof v.detail==='object'?JSON.stringify(v.detail):v.detail)}</p>`).join('')||'Todavía no hay eventos.'}</div>`;
 }
 function reviewForm(p){return `<form data-review class="card"><h3>Revisión de nómina</h3><p>Comprueba los valores contra el PDF. Las correcciones se guardan con la aprobación.</p><fieldset ${saving?'disabled':''}>${Object.entries(groups).map(([title,keys])=>`<details ${title==='Neto'?'open':''}><summary>${title}</summary><div class="pay-grid">${keys.split(' ').map(k=>`<label class="${p.field_confidence?.[k]<.85?'pay-low':''}">${esc(names[k])}<input name="${k}" type="${k==='payment_date'?'date':textFields.has(k)?'text':'number'}" ${textFields.has(k)?'':'step="any"'} value="${esc(draft?.[k]??p[k]??'')}"><span>Tipo de error</span><select name="error_${k}"><option value="">Sin especificar</option>${Object.entries({misread:'Lectura incorrecta',missing:'Faltante',wrong_field:'Campo equivocado',format:'Formato',hallucination:'Inventado',sign:'Signo',other:'Otro'}).map(([v,t])=>`<option value="${v}" ${draft?.['error_'+k]===v?'selected':''}>${t}</option>`).join('')}</select></label>`).join('')}</div></details>`).join('')}<label>Nota de revisión<textarea name="note" maxlength="4000">${esc(draft?.note||'')}</textarea></label><div class="pay-actions"><button type="submit" value="approve">Aprobar</button><button type="submit" value="correct">Guardar correcciones y aprobar</button><button type="submit" value="reject">Rechazar</button></div></fieldset></form>`;}
 function render(){
  if(!active)return;
  const years=[...new Set([String(new Date().getFullYear()),...all('payslips').map(p=>String(p.period_year)),...all('payslips').map(p=>String(payDate(p)||'').slice(0,4)),...all('ytd').map(y=>String(y.year))])].filter(y=>/^\d{4}$/.test(y)).sort().reverse();
  root.innerHTML=`<button class="microapp-back" data-home>← My Finance</button><div class="top"><div><div class="ey">My Finance · Documentos de Jarvis y revisión</div><h1>Nóminas</h1></div><button data-refresh ${busy?'disabled':''}>Actualizar</button></div>${areaTabsHTML('money','payroll')}<p data-live role="status"></p><div data-notice role="status" aria-live="polite">${esc(message)}</div>${error?`<p role="alert">${esc(error)}</p>`:''}${Object.keys(errors).length?`<div class="card" role="alert"><b>No se pudieron actualizar algunos datos</b><p>${esc(Object.entries(errors).map(([k,v])=>`${k}: ${v}`).join(' · '))}</p><p>Los datos anteriores pueden estar desactualizados.</p></div>`:''}<nav class="pay-tabs" aria-label="Secciones de Nóminas">${Object.entries({summary:'Resumen',inbox:'Bandeja',payslips:'Nóminas',monthly:'Mensual',year:'Año',alerts:'Alertas',rates:'Tarifa'}).map(([k,v])=>`<button data-tab="${k}" aria-pressed="${tab===k&&!selected}">${v}</button>`).join('')}</nav>
   ${selected?detailView():!ready?'<p role="status">Cargando nóminas…</p>':`${!demo&&['summary','payslips','inbox'].includes(tab)?upload.html():''}${['summary','payslips'].includes(tab)?`<label>Año <select data-year>${years.map(y=>`<option ${y===year?'selected':''}>${y}</option>`).join('')}</select></label>`:''}${tab==='summary'?stats():tab==='monthly'?monthlyView():tab==='year'?yearView():tab==='inbox'?all('documents').map(d=>`<button class="card pay-row" data-document="${esc(d.id)}"><b>${esc(d.original_file_name||'Documento')}</b><span>${d.source==='telegram'?'✈ ':d.source==='drive'?'▱ ':''}${esc(d.source)} · ${esc(date(d.created_at))}</span>${chip(d.status)}<span>${esc(all('payslips').find(p=>p.document_id===d.id)?.period_label||'Periodo pendiente')} · ${number(d.attempt_count??0)} intentos</span>${d.last_error_message?`<span>${esc(d.last_error_code)}: ${esc(d.last_error_message)}</span>`:''}${d.duplicate_of?`<small>Duplicado de ${esc(d.duplicate_of)}</small>`:''}</button>`).join('')||empty:tab==='payslips'?`<label>Empresa <select data-employer><option value="">Todas</option>${all('employers').map(e=>`<option value="${esc(e.id)}" ${e.id===employer?'selected':''}>${esc(e.name)}</option>`).join('')}</select></label><label>Ordenar <select data-list-view><option value="month" ${listView==='month'?'selected':''}>Por mes de cobro</option><option value="week" ${listView==='week'?'selected':''}>Por semana trabajada</option></select></label>${listView==='month'?payMonthView(all('payslips').filter(p=>String(payDate(p)||'').slice(0,4)===year&&(!employer||p.employer_id===employer)))||empty:groupByWeek(all('payslips').filter(p=>String(p.period_year)===year&&(!employer||p.employer_id===employer))).map(g=>payslipCard(g.main)+g.extras.map(x=>payslipCard(x,g.main)).join('')).join('')||empty}`:tab==='alerts'?alerts(all('anomalies').filter(a=>['open','acknowledged'].includes(a.status))):all('rates').map(r=>`<div class="card"><h3>${esc(r.employer_code)}</h3><strong>${money(r.hourly_rate)} / hora</strong><p>${esc(r.from_period)} → ${esc(r.to_period)} · ${number(r.payslips)} nóminas</p></div>`).join('')||'<div class="card">Sin historial de tarifas confirmado.</div>'}`}`;
  renderStatus();
 }
 root.addEventListener('input',event=>{const form=event.target.closest('[data-review]');if(form)draft=Object.fromEntries(new FormData(form));});
 root.addEventListener('change',event=>{if(upload.handleChange(event.target))return;if(event.target.matches('[data-list-view]')){listView=event.target.value;render();return;}if(event.target.matches('[data-monthly-year]')){monthlyYear=event.target.value;render();}if(event.target.matches('[data-year]')){year=event.target.value;render();}if(event.target.matches('[data-employer]')){employer=event.target.value;render();}});
 root.addEventListener('click',async event=>{
  if(upload.handleClick(event.target))return;
  const b=event.target.closest('button');if(!b||saving)return;
  if(b.hasAttribute('data-home'))return go('money');
  if(b.hasAttribute('data-refresh'))return load();
  if(b.dataset.tab||b.hasAttribute('data-back')){detailEpoch++;loadingDetail=false;revoke();selected=detail=draft=null;error='';tab=b.dataset.tab||tab;render();return;}
  if(b.dataset.payslip)return loadDetail('payslip',b.dataset.payslip);
  if(b.dataset.document)return loadDetail('document',b.dataset.document);
  if(b.hasAttribute('data-pdf')){
   const uid=owner,e=epoch,seq=detailEpoch;pdfBusy=true;render();
   try{const result=demo?{data:new Blob([fixture.pdf],{type:'application/pdf'})}:await db.storage.from('payroll').download(detail.doc.storage_path_archive||detail.doc.storage_path_raw);if(!alive(uid,e)||seq!==detailEpoch)return;if(result.error)throw result.error;revoke();pdfUrl=URL.createObjectURL(result.data);message='PDF preparado. Pulsa Abrir PDF para verlo en otra pestaña.';}catch(err){if(alive(uid,e)&&seq===detailEpoch)error=err.message||'No se pudo descargar el PDF.';}
   if(alive(uid,e)&&seq===detailEpoch){pdfBusy=false;render();}return;
  }
  if(b.dataset.alert&&!saving){const uid=owner,e=epoch;saving=true;render();try{if(demo){const a=fixture.anomalies.find(a=>a.id===b.dataset.alert);a.status=b.dataset.state;a.resolved_at=new Date().toISOString();}else{const r=await db.from('payroll_anomalies').update({status:b.dataset.state,resolved_at:new Date().toISOString()}).eq('id',b.dataset.alert).eq('user_id',uid).select('id');if(!alive(uid,e))return;if(r.error)throw r.error;if(r.data?.length!==1)throw new Error('La alerta no se actualizó. Comprueba los permisos.');}if(!alive(uid,e))return;message='Alerta actualizada.';await load();}catch(err){if(alive(uid,e))error=err.message;}if(alive(uid,e)){saving=false;render();}}
 });
 root.addEventListener('submit',async event=>{
  if(!event.target.matches('[data-review]'))return;event.preventDefault();if(saving)return;
  const p=detail.p,uid=owner,e=epoch,seq=detailEpoch,values=Object.fromEntries(new FormData(event.target));draft=values;
  try{
   const changes=reviewChanges(p,values),decision=event.submitter?.value==='reject'?'rejected':'approved';
   if(event.submitter?.value==='approve'&&Object.keys(changes).length)throw new Error('Hay cambios: utiliza Guardar correcciones y aprobar.');
   const errorTypes={};for(const k of Object.keys(changes))if(values['error_'+k])errorTypes[k]=values['error_'+k];
   saving=true;error='';render();
   if(demo){fixture.applyReview(p.id,changes,decision);}else{const r=await db.rpc('payroll_apply_review',{p_payslip_id:p.id,p_changes:decision==='rejected'?{}:changes,p_decision:decision,p_error_types:decision==='rejected'?{}:errorTypes,p_note:values.note||null});if(!alive(uid,e))return;if(r.error)throw r.error;}
   if(!alive(uid,e))return;draft=null;message=decision==='approved'?'Nómina aprobada. KPIs actualizados.':'Nómina rechazada.';saving=false;await load();if(!alive(uid,e))return;if(seq===detailEpoch||selected?.id===p.id)await loadDetail('payslip',p.id);
  }catch(err){if(alive(uid,e)){saving=false;error=err.message||'No se pudo guardar la revisión.';render();}}
 });
 return {async open(id){
  const uid=getUser()?.id;if(!uid)return;
  if(active&&owner===uid){if(id){if(!ready)pendingId=id;else await loadDetail('payslip',id);}return;}
  reset();active=true;owner=uid;const e=epoch;
  demo=['renzo-hub-2-1-staging.vercel.app','renzo-hub-2-1-staging-renzojesus99-1996.vercel.app'].includes(location.hostname)&&new URLSearchParams(location.search).get('demo')==='1';
  if(demo){try{const module=await import('./payroll-demo.js');if(!alive(uid,e))return;fixture=module.createPayrollDemo(uid);}catch{if(!alive(uid,e))return;demo=false;error='No se pudo cargar la demostración.';}}
  connect();await load();if(!alive(uid,e))return;if(id||pendingId){const target=id||pendingId;pendingId=null;await loadDetail('payslip',target);}
 },close,reset};
}
