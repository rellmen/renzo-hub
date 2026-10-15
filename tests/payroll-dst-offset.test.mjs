import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateShift,shiftMinuteTimeline} from '../microapps/payroll/shifts.js';
import {calculateWeeklyPayroll} from '../microapps/payroll/weekly-pay.js';
import {localAmsterdamMinute,instantInAmsterdam} from '../microapps/payroll/amsterdam-time.js';
const contract={agency:'TEST ONLY',hourlyRate:15,bands:[{start:'00:00',end:'06:00',percent:150},{start:'06:00',end:'18:00',percent:100},{start:'18:00',end:'00:00',percent:130}]};
const s=(date,start,end,startInstant,endInstant,breaks=[])=>({date,start,end,startInstant,endInstant,breaks,contractSnapshot:contract});
test('spring 2026 Amsterdam: non-existent hour not payable; offset-aware 1:30 to 3:30 lasts 60 minutes',()=>{
 const x=s('2026-03-29','01:30','03:30','2026-03-29T01:30+01:00','2026-03-29T03:30+02:00');
 assert.equal(calculateShift(x,contract).paidMinutes,60);
 assert.equal(calculateWeeklyPayroll([x]).weeks[0].minutes,60);
 assert.throws(()=>calculateShift({...x,startInstant:null,endInstant:null},contract),/CET\/CEST/);
});
test('autumn 2026 Amsterdam: repeated 02:00 pays twice; 1:30–3:30 spans 180 minutes',()=>{
 const x=s('2026-10-25','01:30','03:30','2026-10-25T01:30+02:00','2026-10-25T03:30+01:00');
 assert.equal(calculateShift(x,contract).paidMinutes,180);
 const minutes=shiftMinuteTimeline(x,contract).minutes;
 assert.equal(minutes.filter(m=>m.clock==='02:30').length,2);
 assert.equal(calculateWeeklyPayroll([x]).weeks[0].minutes,180);
});
test('autumn break across repeated local hour removes actual 90 minutes',()=>{
 const breaks=[{start:'02:15',end:'02:45',startInstant:'2026-10-25T02:15+02:00',endInstant:'2026-10-25T02:45+01:00',paid:false}];
 const x=s('2026-10-25','01:30','03:30','2026-10-25T01:30+02:00','2026-10-25T03:30+01:00',breaks);
 const calc=calculateShift(x,contract);assert.equal(calc.unpaidBreakMinutes,90);assert.equal(calc.paidMinutes,90);
 assert.throws(()=>calculateShift({...x,breaks:[{start:'02:15',end:'02:45',paid:false}]},contract),/instantes/);
});
test('invalid or fictional offset cannot distort payroll',()=>{
 assert.throws(()=>instantInAmsterdam('2026-10-25T02:30+03:00'),/Offset no corresponde/);
 assert.throws(()=>instantInAmsterdam('2026-03-29T02:30+01:00'),/Offset no corresponde/);
 const x=s('2026-10-25','01:30','03:30','2026-10-25T01:30+02:00','2026-10-25T03:30+02:00');
 assert.throws(()=>calculateShift(x,contract),/Offset no corresponde/);
});
test('regular 00:00 crossing between ISO Sunday/Monday uses local calendar and not UTC',()=>{
 const x=s('2026-10-25','23:30','00:30','2026-10-25T23:30+01:00','2026-10-26T00:30+01:00');
 const weekly=calculateWeeklyPayroll([x]);assert.equal(weekly.weeks.length,2);
 assert(weekly.weeks.some(w=>w.week==='2026-W43'&&w.minutes===30));
 assert(weekly.weeks.some(w=>w.week==='2026-W44'&&w.minutes===30));
});
test('minute-by-minute ISO dates remain Amsterdam dates even before UTC midnight',()=>{
 const t=instantInAmsterdam('2026-03-30T00:15+02:00');
 assert.equal(localAmsterdamMinute(t).date,'2026-03-30');
 const x=s('2026-03-30','00:15','01:15','2026-03-30T00:15+02:00','2026-03-30T01:15+02:00');
 assert.equal(calculateWeeklyPayroll([x]).weeks[0].week,'2026-W14');
});
