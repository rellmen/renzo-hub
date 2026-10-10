import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewChanges,reviewFields} from '../payroll.js';
import {createPayrollDemo} from '../payroll-demo.js';
test('review only sends changed whitelisted fields, retaining zero and null',()=>{
 const original={net_salary:'512.34',worked_hours:38,gross_salary:700};const values={...original,net_salary:'0',worked_hours:'',user_id:'attacker'};
 assert.deepEqual(reviewChanges(original,values),{net_salary:0,worked_hours:null});
 assert.ok(!reviewFields.includes('user_id'));
});
test('rejects invalid numbers and dates',()=>{
 assert.throws(()=>reviewChanges({},{net_salary:'NaN'}));assert.throws(()=>reviewChanges({},{payment_date:'2026-02-30'}));
});
test('confirmed KPIs exclude pending and rejected, include corrected approvals',()=>{
 const f=createPayrollDemo('test');const p=f.payslips.find(p=>p.review_status==='pending'),before=f.ytd[0].net_ytd;
 f.applyReview(p.id,{net_salary:600},'approved');assert.equal(f.ytd[0].net_ytd,before+600);assert.equal(f.anomalies[0].status,'acknowledged');
 f.applyReview(p.id,{},'rejected');assert.equal(f.ytd[0].net_ytd,before);
});

import {monthlyRows,monthlyTotals,monthlyYears,nonzeroRows,percent} from '../payroll.js';
test('monthly filtering orders payment months without mutating input and defaults to a year with data',()=>{
 const rows=[{mes:'2025-03-01'},{mes:'2026-01-01'},{mes:'2025-12-01'}];
 assert.deepEqual(monthlyRows(rows,2025).map(r=>r.mes),['2025-12-01','2025-03-01']);
 assert.equal(rows[0].mes,'2025-03-01');assert.equal(monthlyYears(rows,2027).selected,'2026');assert.equal(monthlyYears(rows,2025).selected,'2025');assert.equal(monthlyYears([]).selected,'');
});
test('monthly totals preserve cents, negative corrections and missing data',()=>{
 const totals=monthlyTotals([{bruto:'100.10',neto:0},{bruto:'-0.20',neto:0}]);
 assert.equal(totals.bruto,99.9);assert.equal(totals.neto,0);assert.equal(totals.cobrado_banco,null);assert.equal(monthlyTotals([]).bruto,null);
});
test('gross breakdown hides numeric zero and missing values but retains negative corrections',()=>{
 assert.deepEqual(nonzeroRows([['zero',0],['string','0.00'],['missing',null],['correction',-25]]),[['correction',-25]]);
 assert.equal(percent(.125),'12,5 %');assert.equal(percent(0),'0 %');assert.equal(percent(null),'Sin datos');
});
test('monthly demo has coherent fictitious amounts, corrections and overtime',()=>{
 const rows=createPayrollDemo('test').monthly_nl;assert.ok(rows.length>=3);
 for(const m of rows){assert.equal(m.bruto-m.loonheffing-m.pensioen-m.premies,m.neto);assert.equal(m.neto+m.allowances_netas,m.cobrado_banco);assert.equal(m.salario_base+m.toeslagen+m.pago_horas_extra,m.bruto);}
 assert.ok(rows.some(m=>m.correcciones===1&&m.pendientes_revision===1));assert.ok(rows.some(m=>m.horas_extra>0));assert.equal(monthlyTotals(rows).bruto,8100);
});

import {yearCompleteness} from '../payroll.js';
test('year completeness uses the view flag and does not invent official amounts',()=>{
 assert.deepEqual(yearCompleteness({completo:true}),{state:'complete',text:'Completo: lo registrado cuadra con el acumulado oficial.'});
 const missing=yearCompleteness({completo:false,bruto_acumulado_oficial:'1000',diferencia_bruto:'250.50'});assert.equal(missing.state,'incomplete');assert.match(missing.text,/250,50/);
 assert.match(yearCompleteness({completo:false,bruto_acumulado_oficial:'1000',diferencia_bruto:null}).text,/sin datos/);
 assert.equal(yearCompleteness({completo:null,diferencia_bruto:0}).state,'unknown');
 assert.equal(yearCompleteness({completo:false,bruto_acumulado_oficial:null,diferencia_bruto:'-500'}).state,'unknown');
 const over=yearCompleteness({completo:false,bruto_acumulado_oficial:'1000',diferencia_bruto:'-12.5'});assert.equal(over.state,'incomplete');assert.match(over.text,/supera el acumulado oficial en 12,50/);
});
test('annual demo distinguishes official accumulations and reconciles recorded sums with monthly demo',()=>{
 const f=createPayrollDemo('test'),current=f.year_nl[0],previous=f.year_nl[1];
 assert.equal(current.completo,false);assert.equal(previous.completo,true);
 assert.equal(current.bruto_registrado,monthlyTotals(f.monthly_nl).bruto);
 assert.equal(current.bruto_acumulado_oficial-current.bruto_registrado,current.diferencia_bruto);
 assert.ok(current.loonheffing_acumulada_oficial>current.loonheffing_registrada);
 for(const y of f.year_nl){assert.equal(y.bruto_registrado-y.loonheffing_registrada-y.pensioen-y.premies,y.neto);assert.equal(y.neto+y.reiskosten_onbelast,y.cobrado_banco);}
 assert.equal(previous.diferencia_bruto,0);assert.equal(previous.bruto_acumulado_oficial,previous.bruto_registrado);
});
import {isoWednesdayAfter,payDate,yearSummary,groupByWeek,taxRate} from '../payroll.js';
test('pay date: a worked ISO week is paid the following Wednesday; corrections use their own payment date',()=>{
 assert.equal(isoWednesdayAfter(2026,19),'2026-05-13');
 assert.equal(isoWednesdayAfter(2026,22),'2026-06-03');
 assert.equal(isoWednesdayAfter(2026,53),'2027-01-06');
 const w=(n,extra={})=>({period_type:'weekly',period_year:2026,period_number:n,period_label:`2026-W${n}`,...extra});
 assert.equal(payDate(w(22,{payment_date:'2026-05-31'})),'2026-06-03','regular weekly ignores a misread payment date');
 assert.equal(payDate(w(22,{is_correction:true,payment_date:'2026-06-24'})),'2026-06-24');
 assert.equal(payDate(w(26,{is_correction:true})),'2026-07-01');
 assert.equal(payDate({period_type:'monthly',payment_date:'2026-03-25'}),'2026-03-25');
 assert.equal(payDate({}),null);
});
test('year summary splits confirmed and pending by pay year and never invents values',()=>{
 const w=(n,net,status,extra={})=>({period_type:'weekly',period_year:2026,period_number:n,period_label:`2026-W${n}`,net_salary:net,gross_salary:net+50,loonheffing:10,worked_hours:10,review_status:status,validation_status:'verified',...extra});
 const rows=[w(19,100,'not_required'),w(20,200,'approved'),w(21,40,'pending',{is_correction:true,worked_hours:0,payment_date:'2026-06-10'}),w(22,999,'rejected'),w(23,999,'approved',{validation_status:'failed'}),w(53,70,'approved')];
 const y=yearSummary(rows,2026);
 assert.deepEqual(y.confirmed,{count:2,net:300,gross:400,tax:20,hours:20});
 assert.deepEqual(y.pending,{count:1,net:40,gross:90});
 assert.deepEqual(y.total,{count:3,net:340,gross:490});
 assert.equal(y.taxRate,0.05);
 assert.equal(y.netPerHour,15,'net per hour excludes corrections');
 assert.equal(yearSummary(rows,2027).confirmed.net,70,'W53 paid in January counts next year');
 const empty=yearSummary([],2026);
 assert.equal(empty.confirmed.net,null);assert.equal(empty.taxRate,null);assert.equal(empty.netPerHour,null);
});
test('corrections are grouped under the regular payslip of the same week',()=>{
 const rows=[{id:'b',period_label:'2026-W22',is_correction:true,corrected_period_ref:'2026-W22'},{id:'a',period_label:'2026-W22'},{id:'c',period_label:'2026-W23'},{id:'d',period_label:'2026-W30',is_correction:true}];
 const g=groupByWeek(rows);
 assert.deepEqual(g.map(x=>[x.main.id,x.extras.map(e=>e.id)]),[['a',['b']],['c',[]],['d',[]]]);
});
test('tax rate uses the taxable base when present',()=>{
 assert.equal(taxRate({gross_salary:200,loonheffing:20}),0.1);
 assert.equal(taxRate({gross_salary:200,loon_voor_loonheffing:100,loonheffing:20}),0.2);
 assert.equal(taxRate({gross_salary:0,loonheffing:20}),null);
 assert.equal(taxRate({gross_salary:200}),null);
});
import {missingPayslipNumbers,missingText} from '../payroll.js';
test('detects gaps in payslip numbering per employer and year without inventing future ones',()=>{
 const p=(n,extra={})=>({employer_id:'e1',period_year:2026,payslip_number:String(n),validation_status:'verified',...extra});
 const rows=[p(1),p(2),p(4),p(5),p(7),p(3,{validation_status:'failed'}),p('A-9'),p(1,{employer_id:'e2'}),p(2,{employer_id:'e2'}),p(10,{period_year:2027})];
 assert.deepEqual(missingPayslipNumbers(rows),[{employer_id:'e1',year:2026,missing:[3,6]}]);
 assert.deepEqual(missingPayslipNumbers([]),[]);
 assert.match(missingText([22],'SD Worx'),/^Falta la nómina nº 22 de SD Worx\./);
 assert.match(missingText([3,6],'X'),/^Faltan las nóminas nº 3 y 6 de X\./);
 assert.match(missingText([1,2,3,4,5,6,7,8,9],'X'),/9 nóminas \(nº 1 a 9\)/);
});

test('payCategory distingue semanal, vakantiegeld, vacaciones y corrección', async () => {
  const { payCategory } = await import('../payroll.js');
  assert.equal(payCategory({ is_correction: false, regular_pay: 200, vakantiegeld: 58 }), 'Semanal');
  assert.equal(payCategory({ is_correction: true, vakantiegeld: 179.13 }), 'Vakantiegeld');
  assert.equal(payCategory({ is_correction: true, holiday_pay: 367.68, vakantiegeld: 29.41 }), 'Vacaciones');
  assert.equal(payCategory({ is_correction: true, regular_pay: 12 }), 'Corrección');
});

test('groupByPayMonth: septiembre 2026 = 5 semanales (5 miércoles) + pagos extra, ordenado por fecha de cobro', async () => {
  const { groupByPayMonth } = await import('../payroll.js');
  const wk = (n, num) => ({ id: 'w' + n, period_type: 'weekly', period_year: 2026, period_number: n, payslip_number: String(num), is_correction: false, review_status: 'approved', validation_status: 'verified', net_payment: 600 });
  const list = [wk(34, 18), wk(35, 20), wk(36, 21), wk(37, 23), wk(38, 24), wk(39, 25), wk(40, 26),
    { id: 'x19', period_type: 'weekly', period_year: 2026, period_number: 34, payslip_number: '19', is_correction: true, payment_date: '2026-09-03', vakantiegeld: 50, review_status: 'approved', validation_status: 'verified', net_payment: 30 },
    { id: 'x22', period_type: 'weekly', period_year: 2026, period_number: 36, payslip_number: '22', is_correction: true, payment_date: '2026-09-10', holiday_pay: 367.68, review_status: 'pending', validation_status: 'review_required', net_payment: 321.74 }];
  const groups = groupByPayMonth(list);
  assert.deepEqual(groups.map(g => g.month), ['2026-10', '2026-09', '2026-08']);
  const sep = groups[1];
  assert.equal(sep.items.length, 7); assert.equal(sep.regular, 5); assert.equal(sep.extra, 2);
  assert.deepEqual(sep.items.map(p => p.id), ['w35', 'x19', 'w36', 'x22', 'w37', 'w38', 'w39']);
  assert.equal(sep.pending, 1); assert.equal(sep.net, 3030, 'solo suma lo confirmado');
  assert.deepEqual(groups[2].items.map(p => p.id), ['w34'], 'la W34 se cobra el 26 de agosto');
  assert.deepEqual(groups[0].items.map(p => p.id), ['w40'], 'la W40 se cobra el 7 de octubre');
});
