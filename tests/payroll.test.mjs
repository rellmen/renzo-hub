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
