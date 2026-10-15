import test from 'node:test';
import assert from 'node:assert/strict';
import {reconcileOfficialPayroll} from '../microapps/payroll/weekly-pay.js';
import {parseBreaks} from '../microapps/payroll/shift-tracker.js';
const week={week:'2026-W41',agency:'Agency QA',employerId:'employer-a',minutes:2400,gross:650,overtimeMinutes:0};
const payslip={id:'payslip-qa',employer_id:'employer-a',period_type:'weekly',period_year:2026,period_number:41,is_correction:false,review_status:'approved',validation_status:'valid',regular_pay:612.8,shift_allowance:37.2,overtime_pay:0,worked_hours:40};
test('unlinked agency cannot be compared with any employer even if week matches',()=>{
 const w=reconcileOfficialPayroll([{...week,employerId:null}],[payslip])[0];
 assert.equal(w.comparison,null);assert.match(w.comparisonStatus,/Sin vincular/);
});
test('wrong employer and mismatched weeks are rejected safely',()=>{
 assert.equal(reconcileOfficialPayroll([week],[{...payslip,employer_id:'employer-b'}])[0].comparison,null);
 assert.equal(reconcileOfficialPayroll([week],[{...payslip,period_number:40}])[0].comparison,null);
});
test('review required or failed validation cannot be considered audited',()=>{
 assert.equal(reconcileOfficialPayroll([week],[{...payslip,review_status:'pending'}])[0].comparison,null);
 assert.equal(reconcileOfficialPayroll([week],[{...payslip,validation_status:'failed'}])[0].comparison,null);
});
test('duplicate official payslips are not arbitrarily selected; corrections ignored',()=>{
 const w=reconcileOfficialPayroll([week],[payslip,{...payslip,id:'another'}])[0];
 assert.equal(w.comparison,null);assert.match(w.comparisonStatus,/Varias/);
 const corrected=reconcileOfficialPayroll([week],[payslip,{...payslip,id:'correction',is_correction:true}])[0];
 assert.equal(corrected.comparison.payslipId,'payslip-qa');
});
test('genuine approved same-employer base + ORT + overtime reconciles with hours',()=>{
 const out=reconcileOfficialPayroll([week],[payslip])[0];
 assert.equal(out.comparison.official,650);
 assert.equal(out.comparison.difference,0);
 assert.equal(out.comparison.hourDifference,0);
 assert.match(out.comparisonStatus,/orientativa/i);
});
test('missing overtime component prevents false claims',()=>{
 const w={...week,overtimeMinutes:60,gross:700,minutes:2460};
 assert.equal(reconcileOfficialPayroll([w],[{...payslip,overtime_pay:null}])[0].comparison,null);
});
test('no official worked hours or no salary breakdown blocks comparison',()=>{
 assert.equal(reconcileOfficialPayroll([week],[{...payslip,worked_hours:null}])[0].comparison,null);
 assert.equal(reconcileOfficialPayroll([week],[{...payslip,regular_pay:null}])[0].comparison,null);
});
test('parseBreaks supports offset-aware break while retaining simple syntax',()=>{
 assert.deepEqual(parseBreaks('19:00-19:30;sinpago'),[{start:'19:00',end:'19:30',paid:false}]);
 const x=parseBreaks('02:15-02:45;sinpago;2026-10-25T02:15+02:00;2026-10-25T02:45+01:00');
 assert.equal(x[0].startInstant,'2026-10-25T02:15+02:00');
 assert.equal(x[0].endInstant,'2026-10-25T02:45+01:00');
});
