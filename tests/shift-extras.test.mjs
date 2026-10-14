import test from 'node:test';
import assert from 'node:assert/strict';
import {leaveFormData,extrasHTML,proposedForDate} from '../microapps/payroll/shift-extras.js';
import {calculateWeeklyPayroll} from '../microapps/payroll/weekly-pay.js';
import {shiftCSV} from '../microapps/payroll/shift-tracker.js';
const base={agency:'QA agency',hourlyRate:15, overtimeThresholdHours:40,overtimePercent:150,bands:[{start:'00:00',end:'06:00',percent:100},{start:'06:00',end:'18:00',percent:100},{start:'18:00',end:'00:00',percent:130}]};
test('leave hour movements can be recorded without extrapolating payments or overtime',()=>{
 assert.deepEqual(leaveFormData({kind:'used',date:'2026-10-12',hours:'8',reason:'holiday'}),{date:'2026-10-12',kind:'used',minutes:480,reason:'holiday',note:''});
 assert.equal(leaveFormData({kind:'accrual',date:'2026-10-12',hours:'1.5',reason:'other'}).minutes,90);
 assert.equal(leaveFormData({kind:'adjustment',date:'2026-10-12',hours:'-0.5',reason:'other'}).minutes,-30);
 assert.throws(()=>leaveFormData({kind:'used',date:'2026-10-12',hours:'-1',reason:'holiday'}),/válidas/);
 assert.throws(()=>leaveFormData({kind:'used',date:'2026-10-12',hours:'8',reason:'unknown'}),/Motivo/);
 assert.throws(()=>leaveFormData({kind:'used',date:'2026-02-31',hours:'8',reason:'holiday'}),/inválida/);
});
test('extra UI discloses unknown leave balance and confirms alternating shifts',()=>{
 const html=extrasHTML([],'2026-10-14');
 assert.match(html,/Mañana · 06:00–15:00/);assert.match(html,/Desconocido/);assert.match(html,/18.*no/); // Shows paid leave not worked rule in text.
 assert.match(extrasHTML([{payload:{date:'2026-10-12',kind:'opening',minutes:1200}}],'2026-10-20'),/20 h/);
 assert.equal(proposedForDate('2026-10-22').start,'15:00');
});
test('weekly calculations can use contract-specific 40h/150% without combining 130 and 150',()=>{
 const dates=['2026-10-19','2026-10-20','2026-10-21','2026-10-22','2026-10-23'];
 const shifts=dates.map((date,i)=>({id:String(i),payload:{date,start:'15:00',end:'00:00',breaks:[{start:'19:00',end:'19:30',paid:false}],contractSnapshot:base}}));
 const result=calculateWeeklyPayroll(shifts);assert.equal(result.weeks[0].overtimeMinutes,150);assert.equal(result.weeks[0].gross,768.75);
 const csv=shiftCSV(shifts);assert.match(csv,/horas_extra/);assert.match(csv,/"2.5";"159.75"/); // final 6h base +2.5h extra; 3h 100 +3h 130 = 103.50 plus 56.25 = 159.75
});
