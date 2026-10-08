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
