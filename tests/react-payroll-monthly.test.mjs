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
