// Payroll calculations based on user-confirmed rules, not an interpretation of Dutch employment law.
// 40 paid WORK minutes per hour threshold per agency / ISO week; unpaid breaks and
// paid holidays charged to an accrued balance never count as worked overtime.
import {shiftMinuteTimeline} from './shifts.js';
import {instantInAmsterdam,resolveAmsterdamLocalMinute} from './amsterdam-time.js';
const MINUTE=60000;
const isoWeek=date=>{const d=new Date(date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));const year=d.getUTCFullYear();const first=Date.UTC(year,0,1);return `${year}-W${String(Math.ceil(((d.getTime()-first)/86400000+1)/7)).padStart(2,'0')}`;};
const days=date=>Date.parse(date+'T00:00:00Z');
const dateTime=start=>new Date(start).toISOString().slice(0,10);
function timeline(shift){
 return shiftMinuteTimeline(shift,shift.contractSnapshot).minutes;
}

export function calculateWeeklyPayroll(rows,{thresholdHours=40,overtimePercent=150}={}){
 if(!Number.isFinite(thresholdHours)||thresholdHours<0||thresholdHours>100)throw Error('Límite semanal de horas inválido.');
 if(!Number.isFinite(overtimePercent)||overtimePercent<100||overtimePercent>500)throw Error('Porcentaje extra inválido.');
 const groups=new Map(),details=[];
 const startMs=s=>s.startInstant?instantInAmsterdam(s.startInstant):resolveAmsterdamLocalMinute(s.date,s.start);
 const shifts=rows.map(r=>({id:r.id||null,shift:r.payload||r})).sort((a,b)=>startMs(a.shift)-startMs(b.shift));
 const seen=new Map();
 for(const {id,shift} of shifts){
  const c=shift.contractSnapshot;
  if(!c?.agency)throw Error('Cada turno necesita agencia y contrato conservado.');
  const minuteByMinute=timeline(shift);
  let overtimeMinutes=0,normalMinutes=0;const grouped=new Map();
  for(const {when,percent,localDate} of minuteByMinute){
   const calendarDate=localDate,week=isoWeek(calendarDate);
   const agency=String(c.agency).trim().toLocaleLowerCase('es');const key=`${agency}|${week}`;
   const intervalKey=`${key}|${when}`;
   if(seen.has(intervalKey))throw Error('Turnos solapados para la misma agencia; revisa registros duplicados.');seen.set(intervalKey,id);
   const limit=Number(c.overtimeThresholdHours??thresholdHours),premium=Number(c.overtimePercent??overtimePercent);
   if(!Number.isFinite(limit)||limit<=0||limit>100||!Number.isFinite(premium)||premium<100||premium>500)throw Error('Reglas de horas extraordinarias inválidas.');
   if(!groups.has(key))groups.set(key,{week,agency:c.agency,minutes:0,overtimeMinutes:0,normalMinutes:0,byPercentage:new Map(),grossUnrounded:0,thresholdHours:limit,overtimePercent:premium,employerId:c.employerId||null});
   const g=groups.get(key);if(g.thresholdHours!==limit||g.overtimePercent!==premium)throw Error('Hay reglas de horas extra diferentes en la misma agencia y semana: revísalas.');
   if(g.employerId!==(c.employerId||null))throw Error('Una agencia aparece vinculada a empresas distintas: separa contratos antes de reconciliar.');
   const over=g.minutes>=Math.round(limit*60);
   // Higher regular premiums are never reduced by overtime; overtime is NOT additive.
   const effectivePercent=over?Math.max(percent,premium):percent;
   const kind=over?'overtime':'regular';const bandKey=`${kind}:${effectivePercent}`;
   const line=grouped.get(bandKey)||{percent:effectivePercent,kind,minutes:0,amountRaw:0};
   line.minutes++;line.amountRaw+=c.hourlyRate*effectivePercent/(60*100);grouped.set(bandKey,line);
   const agg=g.byPercentage.get(bandKey)||{percent:effectivePercent,kind,minutes:0,amountRaw:0};agg.minutes++;agg.amountRaw+=c.hourlyRate*effectivePercent/(60*100);g.byPercentage.set(bandKey,agg);
   g.grossUnrounded+=c.hourlyRate*effectivePercent/(60*100);
   g.minutes++;if(over){g.overtimeMinutes++;overtimeMinutes++;}else{g.normalMinutes++;normalMinutes++;}
  }
  const amounts=[...grouped.values()].map(x=>({...x,amount:Math.round(x.amountRaw*100)/100}));
  details.push({id,date:shift.date,start:shift.start,end:shift.end,agency:c.agency,paidMinutes:minuteByMinute.length,normalMinutes,overtimeMinutes,segments:amounts,gross:Math.round(amounts.reduce((a,x)=>a+x.amountRaw,0)*100)/100});
 }
 const weeks=[...groups.values()].map(g=>({...g,byPercentage:[...g.byPercentage.values()].map(x=>({kind:x.kind,percent:x.percent,minutes:x.minutes,amount:Math.round(x.amountRaw*100)/100})),gross:Math.round(g.grossUnrounded*100)/100})).sort((a,b)=>b.week.localeCompare(a.week)||a.agency.localeCompare(b.agency));
 return {thresholdHours,overtimePercent,weeks,shifts:details};
}

export function leaveBalance(rows,snapshot=null){
 const movements=rows.map(r=>({...r,payload:r.payload||r})).sort((a,b)=>`${a.payload.date}|${a.created_at||''}`.localeCompare(`${b.payload.date}|${b.created_at||''}`));
 const openings=movements.filter(r=>r.payload.kind==='opening');
 if(openings.length>1||snapshot&&openings.length)throw Error('Hay más de un saldo inicial: concilia los registros.');
 if(snapshot&&(!Number.isInteger(snapshot.leave_minutes)||snapshot.leave_minutes<0||snapshot.leave_minutes>24000||!/^\d{4}-\d{2}-\d{2}$/.test(snapshot.as_of)))throw Error('Saldo documentado inválido.');
 let minutes=snapshot?snapshot.leave_minutes:null;const history=[];
 for(const item of movements){const e=item.payload;
  if(!['opening','accrual','used','adjustment'].includes(e.kind))throw Error('Movimiento de vacaciones inválido.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(e.date)||!Number.isInteger(e.minutes)||Math.abs(e.minutes)>24000)throw Error('Horas de vacaciones inválidas.');
  if(snapshot&&e.date<=snapshot.as_of){history.push({...e,includedInSnapshot:true,balanceMinutes:null});continue;}
  if(e.kind==='opening'){if(e.minutes<0)throw Error('Saldo inicial negativo.');minutes=e.minutes;}
  else if(minutes!==null){if(e.kind==='used'&&e.minutes<=0)throw Error('El descuento exige horas positivas.');if(e.kind==='accrual'&&e.minutes<=0)throw Error('La acumulación exige horas positivas.');minutes+=e.kind==='used'?-e.minutes:e.minutes;}
  history.push({...e,balanceMinutes:minutes});
 }
 return {known:minutes!==null,minutes,history,asOf:snapshot?.as_of||null,overdrawn:minutes!==null&&minutes<0};
}

/**
 * Conservative reconciliation: refuse comparisons without a verified, uniquely
 * linked employer and a reviewed weekly payslip. Never call the delta a claim.
 */
export function reconcileOfficialPayroll(weeks,payslips=[]){
 return weeks.map(w=>{
  const base={...w,comparison:null};
  if(!w.employerId)return {...base,comparisonStatus:'Sin vincular a una empresa de la nómina. No se calcula diferencia.'};
  const [year,n]=w.week.split('-W').map(Number);
  const all=payslips.filter(p=>p.employer_id===w.employerId&&p.period_type==='weekly'&&Number(p.period_year)===year&&Number(p.period_number)===n&&!p.is_correction);
  if(all.length!==1)return {...base,comparisonStatus:all.length?'Varias nóminas de esa empresa/semana: revisión manual.':'Sin nómina de esa empresa en esta semana.'};
  const p=all[0];
  if(!['approved','not_required'].includes(p.review_status)||['failed','rejected'].includes(p.validation_status))return {...base,comparisonStatus:'La nómina requiere revisión y aprobación antes de comparar.'};
  if(p.regular_pay==null||p.shift_allowance==null&&p.overtime_pay==null)return {...base,comparisonStatus:'No hay desglose suficiente de base, ORT y extra: revisar PDF.'};
  if(w.overtimeMinutes>0&&p.overtime_pay==null)return {...base,comparisonStatus:'Horas extra detectadas pero no figura concepto separado: revisión manual.'};
  if(p.worked_hours==null)return {...base,comparisonStatus:'Sin horas trabajadas oficiales para conciliar.'};
  const regular=Number(p.regular_pay),ort=Number(p.shift_allowance||0),extra=Number(p.overtime_pay||0),paidHours=Number(p.worked_hours);
  if(![regular,ort,extra,paidHours].every(Number.isFinite))return {...base,comparisonStatus:'Campos de nómina no numéricos.'};
  const official=Math.round((regular+ort+extra)*100)/100;
  return {...base,comparison:{payslipId:p.id,paidHours,official,difference:Math.round((official-w.gross)*100)/100,hourDifference:Math.round((paidHours-w.minutes/60)*100)/100},comparisonStatus:'Alerta orientativa base + ORT + extras; comprobar correcciones, festivos, periodización y convenio antes de reclamar.'};
 });
}
