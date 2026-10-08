const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => value == null ? 'Sin datos' : new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(Number(value));
const number = value => value == null ? 'Sin datos' : new Intl.NumberFormat('es-ES',{maximumFractionDigits:2}).format(Number(value));
const date = value => !value ? 'Sin fecha' : Number.isNaN(new Date(value).valueOf()) ? String(value) : new Intl.DateTimeFormat('es-ES',{dateStyle:'medium'}).format(new Date(value));
export const percent = value => value == null ? 'Sin datos' : new Intl.NumberFormat('es-ES',{style:'percent',maximumFractionDigits:2}).format(Number(value));
export const monthlyRows = (rows, year) => rows.filter(m=>String(m.mes).slice(0,4)===String(year)).sort((a,b)=>String(b.mes).localeCompare(String(a.mes)));
export const nonzeroRows = rows => rows.filter(([,value])=>value!=null&&Number(value)!==0);
export function monthlyTotals(rows){
 return Object.fromEntries(['bruto','neto','allowances_netas','cobrado_banco','horas_trabajadas','horas_extra','pago_horas_extra'].map(key=>[key,rows.length&&rows.every(row=>row[key]!=null)?Math.round(rows.reduce((sum,row)=>sum+Number(row[key]),0)*100)/100:null]));
}
export function monthlyYears(rows, current=String(new Date().getFullYear())){
 const years=[...new Set(rows.map(row=>String(row.mes).slice(0,4)))].filter(y=>/^\d{4}$/.test(y)).sort().reverse();
 return {years,selected:years.includes(String(current))?String(current):years[0]||''};
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
const chip = value => `<span class="pay-chip pay-${esc(value)}">${esc(labels[value]||value||'Sin estado')}</span>`;
const empty = '<div class="card"><h2>Aún no hay nóminas</h2><p>Envía el PDF de tu nómina a Jarvis en Telegram y aparecerá aquí en menos de un minuto.</p></div>';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function mountPayroll(root, db, getUser, go){
 let active=false, owner=null, epoch=0, busy=false, ready=false, queued=false, channel=null, timer=null, poll=null, connected=false;
 let tab='summary', selected=null, detail=null, detailEpoch=0, loadingDetail=false, year=String(new Date().getFullYear()), employer='', message='', error='', saving=false;
 let pendingId=null, monthlyYear='';
 let data={}, errors={}, draft=null, pdfUrl=null, pdfBusy=false, demo=false, fixture=null;
 const alive=(uid,e)=>active&&getUser()?.id===uid&&owner===uid&&epoch===e;
 const revoke=()=>{if(pdfUrl)URL.revokeObjectURL(pdfUrl);pdfUrl=null;};
 function close(){active=false;epoch++;detailEpoch++;busy=false;ready=false;queued=false;clearTimeout(timer);clearInterval(poll);timer=poll=null;if(channel){db.removeChannel(channel);channel=null;}connected=false;revoke();data={};errors={};detail=null;draft=null;selected=null;pendingId=null;saving=false;pdfBusy=false;loadingDetail=false;root.innerHTML='';}
 function reset(){close();owner=null;fixture=null;tab='summary';monthlyYear='';message=error='';}
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
  const specs=[['monthly_nl','payroll_v_monthly_nl',q=>q.eq('user_id',uid).order('mes',{ascending:false})],['documents','payroll_documents',q=>q.eq('user_id',uid).order('created_at',{ascending:false}).order('id')],['payslips','payroll_payslips',q=>q.eq('user_id',uid).order('period_start',{ascending:false}).order('id')],['employers','payroll_employers'],['anomalies','payroll_anomalies',q=>q.eq('user_id',uid).order('detected_at',{ascending:false}).order('id')],['ytd','payroll_v_ytd',q=>q.eq('user_id',uid).order('year')],['monthly','payroll_v_monthly',q=>q.eq('user_id',uid).order('month')],['confirmed','payroll_v_confirmed',q=>q.eq('user_id',uid).order('ref_date',{ascending:false}).order('id')],['rates','payroll_v_rate_history',q=>q.order('from_period',{ascending:false})],['queue','payroll_v_queue']];
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
  const y=all('ytd').find(x=>String(x.year)===year);
  const last=all('payslips')[0], weeks=all('confirmed').filter(x=>x.period_type==='weekly').slice(0,12).reverse();
  const points=weeks.map((p,i)=>`${20+i*(560/Math.max(1,weeks.length-1))},${140-(Number(p.net_salary)||0)/Math.max(1,...weeks.map(x=>Math.abs(Number(x.net_salary)||0)))*100}`).join(' ');
  return `<div class="card pay-hero"><div class="ey">Año ${esc(year)} · solo nóminas confirmadas</div><h2>${money(y?.net_ytd)}</h2><p>Neto del año</p><div class="pay-grid">${[['Bruto',money(y?.gross_ytd)],['Impuestos',money(y?.tax_ytd)],['Horas',number(y?.hours_ytd)],['Neto / hora',money(y?.effective_net_hourly)]].map(([k,v])=>`<div><small>${k}</small><strong>${v}</strong></div>`).join('')}</div></div>
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
  return `<section class="pay-monthly"><p class="pay-muted">Cada nómina cuenta en el mes en que se paga, como en la jaaropgave.</p>${years.length?`<label>Año <select data-monthly-year>${years.map(y=>`<option value="${esc(y)}" ${y===monthlyYear?'selected':''}>${esc(y)}</option>`).join('')}</select></label>`:''}
   ${!months.length?`<div class="card">${errors.monthly_nl?'No se pudieron cargar los datos mensuales. Pulsa Actualizar para reintentar.':'Sin datos mensuales.'}</div>`:`<article class="card pay-hero" data-monthly-total><h2>Total del año ${esc(monthlyYear)}</h2>${amounts([['Bruto',totals.bruto],['Neto',totals.neto],['Allowances',totals.allowances_netas],['Ingresado en el banco',totals.cobrado_banco]])}${grid([['Horas trabajadas',number(totals.horas_trabajadas)],['Horas extra',number(totals.horas_extra)],['Pago de horas extra',money(totals.pago_horas_extra)]])}</article>
   ${months.map((m,index)=>`<article class="card" data-month="${esc(m.mes)}"><h2>${esc(new Intl.DateTimeFormat('es-ES',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(m.mes)))}</h2><p>${esc(number(m.pagos))} nóminas${Number(m.correcciones)>0?` · ${esc(number(m.correcciones))} ${Number(m.correcciones)===1?'corrección':'correcciones'}`:''} ${Number(m.pendientes_revision)>0?`<span class="pay-chip pay-pending">${esc(number(m.pendientes_revision))} por revisar</span>`:''}</p>
    <div class="pay-bank"><span>Ingresado en el banco</span><strong>${esc(money(m.cobrado_banco))}</strong></div>${amounts([['Bruto',m.bruto],['Neto',m.neto],['Allowances',m.allowances_netas]])}
    <details><summary>Desglose del bruto</summary>${amounts(nonzeroRows([['Salario base',m.salario_base],['ORT',m.toeslagen],['Horas extra',m.pago_horas_extra],['Feestdagen',m.feestdagen],['Vakantiegeld',m.vakantiegeld_pagado],['Vacaciones disfrutadas',m.verlof_pagado],['Baja',m.ziekte_pagado]]))}</details>
    <details><summary>Retenciones</summary>${amounts([['Loonheffing',m.loonheffing],['Pensioen',m.pensioen],['Premies',m.premies]])}${grid([['Tipo de retención',percent(m.tipo_retencion)]])}</details>
    ${fold('Horas',grid([['Total',number(m.horas_trabajadas)],['Normales',number(m.horas_normales)],['ORT',number(m.horas_ort)],['Extra',number(m.horas_extra)],['Neto por hora',money(m.neto_por_hora)]]),index)}
    ${fold('Saldos al cierre',grid([['Vakantiegeld reservado',money(m.vakantiegeld_reservado)],['Horas de vacaciones',number(m.vakantiedagen_uren)],['Keuzebudget',money(m.keuzebudget_saldo)]]),index)}
    <p class="pay-muted">Equivalente mensual: bruto ${esc(money(m.bruto_mensual_equivalente))} · neto ${esc(money(m.neto_mensual_equivalente))} (media semanal × 13/3)</p></article>`).join('')}`}</section>`;
 }
 function payslipCard(p){return `<button class="card pay-row" data-payslip="${esc(p.id)}"><b>${esc(p.period_label||'Periodo sin identificar')}</b><span>${esc(employerName(p))}</span><strong>${money(p.net_salary)} neto</strong><span>${money(p.gross_salary)} bruto</span>${chip(p.review_status)}</button>`;}
 function alerts(items){return items.map(a=>`<article class="card"><div>${chip(a.severity)} ${chip(a.status)}</div><h3>${esc(a.title||a.anomaly_type)}</h3><p>${esc(typeof a.details==='object'?JSON.stringify(a.details):a.details)}</p>${a.payslip_id?`<button data-payslip="${esc(a.payslip_id)}">Ver nómina</button>`:''}${['open','acknowledged'].includes(a.status)?`<button data-alert="${esc(a.id)}" data-state="resolved" ${saving?'disabled':''}>Resolver</button><button data-alert="${esc(a.id)}" data-state="dismissed" ${saving?'disabled':''}>Descartar</button>`:''}</article>`).join('')||'<div class="card">No hay alertas pendientes.</div>';}
 function detailView(){
  if(loadingDetail)return '<p role="status">Cargando detalle…</p>';
  if(!detail)return '';
  const {p,doc}=detail;
  const fields=Object.entries(groups).map(([title,keys])=>{const present=keys.split(' ').filter(k=>p?.[k]!=null&&p[k]!=='');return present.length?`<div class="card"><h3>${title}</h3><dl class="pay-fields">${present.map(k=>`<div class="${p.field_confidence?.[k]!=null&&p.field_confidence[k]<.85?'pay-low':''}"><dt>${esc(names[k])}${p.field_confidence?.[k]!=null&&p.field_confidence[k]<.85?' · revisar':''}</dt><dd>${esc(textFields.has(k)?k==='payment_date'?date(p[k]):p[k]:k.includes('hours')?number(p[k]):money(p[k]))}</dd></div>`).join('')}</dl></div>`:'';}).join('');
  return `<button data-back>← Volver</button>${detail.issues.length?`<p role="alert">Algunos detalles no están disponibles: ${esc(detail.issues.join(' · '))}</p>`:''}<div class="card"><h2>${esc(p?.period_label||doc?.original_file_name)}</h2>${p?`<p>${esc(employerName(p))} · Pago ${esc(date(p.payment_date))}</p>${chip(p.validation_status)} ${chip(p.review_status)}<p>Confianza: ${p.confidence_overall==null?'Sin datos':number(p.confidence_overall*100)+'%'}</p><p>${esc(p.summary)}</p>`:''}${doc?`<p>${esc(doc.original_file_name)} · ${chip(doc.status)}</p>`:''}${doc?.storage_path_archive||doc?.storage_path_raw||demo?`<button data-pdf ${pdfBusy?'disabled':''}>${pdfBusy?'Preparando…':'Ver PDF'}</button>`:'<p>PDF aún no disponible.</p>'}${pdfUrl?`<a class="pay-button" href="${esc(pdfUrl)}" target="_blank" rel="noopener">Abrir PDF</a>`:''}</div>
   ${p?fields:''}${p?`<div class="card"><h3>Datos NL adicionales</h3>${['loonheffingskorting_applied','bijzonder_tarief_pct','tabel_type','reserveringen'].filter(k=>p[k]!=null).map(k=>`<p>${esc(k)}: ${esc(typeof p[k]==='object'?JSON.stringify(p[k]):p[k])}</p>`).join('')||'Sin datos adicionales'}</div>`:''}
   ${p&&p.review_status==='pending'?reviewForm(p):''}
   ${p?`<div class="card"><h3>Líneas originales</h3><div class="pay-table"><table><thead><tr><th>Concepto</th><th>Tipo</th><th>Cantidad</th><th>Tarifa</th><th>Importe</th></tr></thead><tbody>${(detail.lines||[]).map(l=>`<tr><td>${esc(l.label_original)} <small>${esc(l.code)} ${esc(l.period_ref)}</small></td><td>${esc(l.category)}</td><td>${number(l.quantity)}</td><td>${money(l.rate)}</td><td>${money(l.amount)}</td></tr>`).join('')}</tbody></table></div></div><div class="card"><h3>Validaciones</h3>${(detail.validations||[]).map(v=>`<p>${v.passed?'✓':'✗'} ${esc(v.rule_code)} · ${esc(v.severity)} · ${esc(v.message)}<br><small>Esperado ${esc(v.expected)} · Actual ${esc(v.actual)} · Diferencia ${esc(v.difference)}</small></p>`).join('')||'Sin validaciones'}</div>${alerts(all('anomalies').filter(a=>a.payslip_id===p.id))}<details class="card"><summary>Historial de versiones (${(detail.versions||[]).length})</summary>${(detail.versions||[]).map(v=>`<pre>${esc(JSON.stringify(v,null,2))}</pre>`).join('')}</details>`:''}
   <div class="card"><h3>Seguimiento del documento</h3>${(detail.events||[]).map(v=>`<p><b>${esc(labels[v.event_type]||v.event_type)}</b> · ${esc(date(v.created_at))}<br>${esc(typeof v.detail==='object'?JSON.stringify(v.detail):v.detail)}</p>`).join('')||'Todavía no hay eventos.'}</div>`;
 }
 function reviewForm(p){return `<form data-review class="card"><h3>Revisión de nómina</h3><p>Comprueba los valores contra el PDF. Las correcciones se guardan con la aprobación.</p><fieldset ${saving?'disabled':''}>${Object.entries(groups).map(([title,keys])=>`<details ${title==='Neto'?'open':''}><summary>${title}</summary><div class="pay-grid">${keys.split(' ').map(k=>`<label class="${p.field_confidence?.[k]<.85?'pay-low':''}">${esc(names[k])}<input name="${k}" type="${k==='payment_date'?'date':textFields.has(k)?'text':'number'}" ${textFields.has(k)?'':'step="any"'} value="${esc(draft?.[k]??p[k]??'')}"><span>Tipo de error</span><select name="error_${k}"><option value="">Sin especificar</option>${Object.entries({misread:'Lectura incorrecta',missing:'Faltante',wrong_field:'Campo equivocado',format:'Formato',hallucination:'Inventado',sign:'Signo',other:'Otro'}).map(([v,t])=>`<option value="${v}" ${draft?.['error_'+k]===v?'selected':''}>${t}</option>`).join('')}</select></label>`).join('')}</div></details>`).join('')}<label>Nota de revisión<textarea name="note" maxlength="4000">${esc(draft?.note||'')}</textarea></label><div class="pay-actions"><button type="submit" value="approve">Aprobar</button><button type="submit" value="correct">Guardar correcciones y aprobar</button><button type="submit" value="reject">Rechazar</button></div></fieldset></form>`;}
 function render(){
  if(!active)return;
  const years=[...new Set([String(new Date().getFullYear()),...all('payslips').map(p=>String(p.period_year)),...all('ytd').map(y=>String(y.year))])].filter(y=>/^\d{4}$/.test(y)).sort().reverse();
  root.innerHTML=`<button class="microapp-back" data-home>← System</button><div class="top"><div><div class="ey">Jarvis · Documentos y revisión</div><h1>Nóminas</h1></div><button data-refresh ${busy?'disabled':''}>Actualizar</button></div><p data-live role="status"></p><div data-notice role="status" aria-live="polite">${esc(message)}</div>${error?`<p role="alert">${esc(error)}</p>`:''}${Object.keys(errors).length?`<div class="card" role="alert"><b>No se pudieron actualizar algunos datos</b><p>${esc(Object.entries(errors).map(([k,v])=>`${k}: ${v}`).join(' · '))}</p><p>Los datos anteriores pueden estar desactualizados.</p></div>`:''}<nav class="pay-tabs" aria-label="Secciones de Nóminas">${Object.entries({summary:'Resumen',inbox:'Bandeja',payslips:'Nóminas',monthly:'Mensual',alerts:'Alertas',rates:'Tarifa'}).map(([k,v])=>`<button data-tab="${k}" aria-pressed="${tab===k&&!selected}">${v}</button>`).join('')}</nav>
   ${selected?detailView():!ready?'<p role="status">Cargando nóminas…</p>':`${['summary','payslips'].includes(tab)?`<label>Año <select data-year>${years.map(y=>`<option ${y===year?'selected':''}>${y}</option>`).join('')}</select></label>`:''}${tab==='summary'?stats():tab==='monthly'?monthlyView():tab==='inbox'?all('documents').map(d=>`<button class="card pay-row" data-document="${esc(d.id)}"><b>${esc(d.original_file_name||'Documento')}</b><span>${d.source==='telegram'?'✈ ':d.source==='drive'?'▱ ':''}${esc(d.source)} · ${esc(date(d.created_at))}</span>${chip(d.status)}<span>${esc(all('payslips').find(p=>p.document_id===d.id)?.period_label||'Periodo pendiente')} · ${number(d.attempt_count??0)} intentos</span>${d.last_error_message?`<span>${esc(d.last_error_code)}: ${esc(d.last_error_message)}</span>`:''}${d.duplicate_of?`<small>Duplicado de ${esc(d.duplicate_of)}</small>`:''}</button>`).join('')||empty:tab==='payslips'?`<label>Empresa <select data-employer><option value="">Todas</option>${all('employers').map(e=>`<option value="${esc(e.id)}" ${e.id===employer?'selected':''}>${esc(e.name)}</option>`).join('')}</select></label>${all('payslips').filter(p=>String(p.period_year)===year&&(!employer||p.employer_id===employer)).map(payslipCard).join('')||empty}`:tab==='alerts'?alerts(all('anomalies').filter(a=>['open','acknowledged'].includes(a.status))):all('rates').map(r=>`<div class="card"><h3>${esc(r.employer_code)}</h3><strong>${money(r.hourly_rate)} / hora</strong><p>${esc(r.from_period)} → ${esc(r.to_period)} · ${number(r.payslips)} nóminas</p></div>`).join('')||'<div class="card">Sin historial de tarifas confirmado.</div>'}`}`;
  renderStatus();
 }
 root.addEventListener('input',event=>{const form=event.target.closest('[data-review]');if(form)draft=Object.fromEntries(new FormData(form));});
 root.addEventListener('change',event=>{if(event.target.matches('[data-monthly-year]')){monthlyYear=event.target.value;render();}if(event.target.matches('[data-year]')){year=event.target.value;render();}if(event.target.matches('[data-employer]')){employer=event.target.value;render();}});
 root.addEventListener('click',async event=>{
  const b=event.target.closest('button');if(!b||saving)return;
  if(b.hasAttribute('data-home'))return go('system');
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
