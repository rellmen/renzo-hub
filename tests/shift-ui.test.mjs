import test from 'node:test';import assert from 'node:assert/strict';
import {parseBands,parseBreaks,isoWeek,shiftWeeks} from '../microapps/payroll/shift-tracker.js';
const agency={agency:'QA',hourlyRate:15,bands:parseBands('00:00-06:00=150\n06:00-18:00=100\n18:00-00:00=130')};
test('reads configurable contract bands without defaulting salary percentages',()=>{
 assert.equal(agency.bands[1].percent,100);assert.equal(parseBands('18:00-00:00=130,5')[0].percent,130.5);
 assert.throws(()=>parseBands(''),/verificadas/);assert.throws(()=>parseBands('not a band'),/Franja no válida/);
});
test('parses multiple paid/unpaid breaks, rejects unexplained or invalid ones',()=>{
 assert.deepEqual(parseBreaks('19:00-19:30;sinpago\n22:00-22:10;pagado'),[{start:'19:00',end:'19:30',paid:false},{start:'22:00',end:'22:10',paid:true}]);
 assert.deepEqual(parseBreaks(''),[]);assert.throws(()=>parseBreaks('19:00-19:30'),/Descanso inválido/);
});
test('ISO weeks: new years, monday and sunday',()=>{
 assert.equal(isoWeek('2026-01-01'),'2026-W01');assert.equal(isoWeek('2027-01-01'),'2026-W53');
 assert.equal(isoWeek('2026-10-12'),'2026-W42');assert.equal(isoWeek('2026-10-18'),'2026-W42');
});
test('weekly totals reflect saved contract snapshot without restating historical rates',()=>{
 const rows=[{payload:{date:'2026-10-12',start:'15:00',end:'00:00',breaks:[{start:'19:00',end:'19:30',paid:false}],contractSnapshot:agency}},
  {payload:{date:'2026-10-16',start:'07:00',end:'13:00',breaks:[],contractSnapshot:agency}}];
 const x=shiftWeeks(rows);assert.equal(x.length,1);assert.equal(x[0].paidMinutes,870);assert.equal(x[0].gross,242.25);
});
test('reconciliation compares only confirmed weekly base + shift components and labels other states',async()=>{
 const {reconcileWeeks}=await import('../microapps/payroll/shift-tracker.js');const week=shiftWeeks([{payload:{date:'2026-10-12',start:'15:00',end:'00:00',breaks:[{start:'19:00',end:'19:30',paid:false}],contractSnapshot:agency}}]);
 assert.equal(reconcileWeeks(week,[])[0].comparison,null);
 const p={id:'sample-payslip',period_type:'weekly',period_year:2026,period_number:42,is_correction:false,review_status:'approved',validation_status:'verified',regular_pay:45,shift_allowance:107.25};
 assert.equal(reconcileWeeks(week,[p])[0].comparison.difference,0);
 assert.equal(reconcileWeeks(week,[{...p,review_status:'pending'}])[0].comparison,null);
 assert.equal(reconcileWeeks(week,[{...p,shift_allowance:null}])[0].comparison,null);
 assert.equal(reconcileWeeks(week,[p,{...p,id:'other'}])[0].comparison,null);
});
test('CSV quote escaping and shift totals use historical contract snapshot',async()=>{
 const {shiftCSV}=await import('../microapps/payroll/shift-tracker.js');const csv=shiftCSV([{payload:{date:'2026-10-12',start:'15:00',end:'00:00',breaks:[{start:'19:00',end:'19:30',paid:false}],contractSnapshot:{...agency,agency:'Agencia "A"'}}}]);
 assert.match(csv,/"Agencia ""A"""/);assert.match(csv,/"152.25"/);assert.match(csv,/"510"/);
});
