import test from 'node:test';
import assert from 'node:assert/strict';
import {payDateOf,payrollByPayMonth,expectedPayDate} from '../apps/rise-react/src/lib/payroll-monthly.mjs';

test('Pay date uses the document date, else the Wednesday after the period (estimated)',()=>{
 assert.deepEqual(payDateOf({payment_date:'2026-09-29',period_end:'2026-09-27'}),{date:'2026-09-29',estimated:false});
 assert.deepEqual(payDateOf({payment_date:null,period_end:'2026-10-04'}),{date:'2026-10-07',estimated:true}); // domingo → miércoles
 assert.deepEqual(payDateOf({period_end:'2026-10-07'}),{date:'2026-10-14',estimated:true}); // miércoles → siguiente
 assert.deepEqual(payDateOf({payment_date:'2026-02-30',period_end:'bad'}),{date:null,estimated:true});
 assert.equal(expectedPayDate({period_end:'2026-10-25'}),'2026-10-28');
});

test('Weekly payslips accumulate inside their pay month; rejected ones are ignored',()=>{
 const rows=[
  {id:'25',payslip_number:'25',period_label:'2026-W39',period_end:'2026-09-27',payment_date:'2026-09-29',net_payment:'666.48',gross_salary:800,worked_hours:40,review_status:'not_required'},
  {id:'26',payslip_number:'26',period_label:'2026-W40',period_end:'2026-10-04',payment_date:null,net_payment:685.24,net_salary:651.94,gross_salary:820,worked_hours:41,review_status:'approved'},
  {id:'27',payslip_number:'27',period_label:'2026-W41',period_end:'2026-10-11',payment_date:null,net_payment:632.54,gross_salary:760,worked_hours:38,review_status:'approved'},
  {id:'x',payslip_number:'99',period_end:'2026-10-18',net_payment:500,review_status:'rejected'},
  {id:'31',payslip_number:'31',period_end:'2026-11-01',net_payment:600,review_status:'pending'}
 ];
 const months=payrollByPayMonth(rows);
 assert.deepEqual(months.map(m=>m.month),['2026-11','2026-10','2026-09']);
 const oct=months[1];
 assert.equal(oct.slips.length,2);
 assert.deepEqual(oct.slips.map(s=>s.running),[685.24,1317.78]);
 assert.equal(oct.net,1317.78);assert.equal(oct.gross,1580);assert.equal(oct.hours,79);assert.equal(oct.estimated,2);
 assert.equal(months[2].net,666.48);assert.equal(months[2].estimated,0);
 assert.equal(months[0].pending,1);
});

import {wednesdaysOf,payrollMonthToDate} from '../apps/rise-react/src/lib/payroll-monthly.mjs';

test('Wednesdays of a month (SD Worx pay day)',()=>{
 assert.deepEqual(wednesdaysOf('2026-10'),['2026-10-07','2026-10-14','2026-10-21','2026-10-28']);
 assert.deepEqual(wednesdaysOf('2026-09'),['2026-09-02','2026-09-09','2026-09-16','2026-09-23','2026-09-30']);
 assert.deepEqual(wednesdaysOf('bad'),[]);
});

test('Money summary: month-to-date accumulates each Wednesday, flags missing weeks, compares at the same point',()=>{
 const rows=[
  // septiembre: 2 nóminas antes del día 24 y una el martes 29 (cae en la semana del miércoles 30)
  {id:'s1',payslip_number:'21',period_end:'2026-08-30',net_payment:600,gross_salary:750,worked_hours:38,review_status:'approved'},
  {id:'s2',payslip_number:'22',period_end:'2026-09-06',net_payment:650,gross_salary:800,worked_hours:40,review_status:'approved'},
  {id:'s3',payslip_number:'25',payment_date:'2026-09-29',period_end:'2026-09-27',net_payment:666.48,gross_salary:800,worked_hours:40,review_status:'approved'},
  // octubre: miércoles 7 y 14 cobrados; el 21 no se ha subido
  {id:'o1',payslip_number:'26',period_end:'2026-10-04',net_payment:685.24,gross_salary:820,worked_hours:41,review_status:'approved'},
  {id:'o2',payslip_number:'27',period_end:'2026-10-11',net_payment:632.54,gross_salary:760,worked_hours:38,review_status:'pending'},
  {id:'r',payslip_number:'99',period_end:'2026-10-18',net_payment:500,review_status:'rejected'},
 ];
 const m=payrollMonthToDate(rows,'2026-10-24');
 assert.equal(m.month,'2026-10');
 assert.equal(m.net,1317.78);
 assert.equal(m.slips,2);
 assert.deepEqual(m.weeks.map(w=>[w.date,w.state,w.net,w.running]),[
  ['2026-10-07','paid',685.24,685.24],
  ['2026-10-14','paid',632.54,1317.78],
  ['2026-10-21','missing',null,null],   // la nómina rechazada no cuenta
  ['2026-10-28','upcoming',null,null],
 ]);
 assert.equal(m.missing,1);
 assert.equal(m.paidWeeks,2);
 assert.equal(m.totalWeeks,4);
 assert.equal(m.nextPayday,'2026-10-28');
 assert.equal(m.pending,1);
 assert.deepEqual(m.previous,{month:'2026-09',net:1916.48,samePoint:1250});
 assert.equal(m.ytd,3234.26);
 assert.equal(m.lastSlip.id,'o2');

 const sep=payrollMonthToDate(rows,'2026-09-30');
 assert.equal(sep.weeks.at(-1).state,'paid');           // pagada el martes 29 → semana del 30
 assert.equal(sep.offCycle.length,0);
 assert.equal(sep.weeks.find(w=>w.date==='2026-09-16').state,'missing');
});

test('Money summary: empty month and invalid date',()=>{
 const m=payrollMonthToDate([],'2026-11-04');
 assert.equal(m.net,0);
 assert.equal(m.weeks[0].state,'missing');
 assert.equal(m.previous,null);
 assert.equal(payrollMonthToDate([],'2026-13-01'),null);
});
