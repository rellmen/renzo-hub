import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveAmsterdamLocalMinute} from '../microapps/payroll/amsterdam-time.js';
import {calculateWeeklyPayroll} from '../microapps/payroll/weekly-pay.js';
const c={agency:'QA',hourlyRate:15,bands:[{start:'00:00',end:'06:00',percent:150},{start:'06:00',end:'18:00',percent:100},{start:'18:00',end:'00:00',percent:130}]};
const shift=(date,start,end,a=null,b=null)=>({date,start,end,startInstant:a,endInstant:b,breaks:[],contractSnapshot:c});
test('autumn fold is absolute',()=>{
 assert.equal(resolveAmsterdamLocalMinute('2026-10-25','03:00'),Date.parse('2026-10-25T03:00+01:00'));
 assert.throws(()=>resolveAmsterdamLocalMinute('2026-10-25','02:30'),/ambigua/);
});
test('autumn overlap rejected',()=>{
 const a=shift('2026-10-25','01:30','03:30','2026-10-25T01:30+02:00','2026-10-25T03:30+01:00');
 assert.throws(()=>calculateWeeklyPayroll([a,shift('2026-10-25','03:00','04:00')]),/solapados/);
});
test('spring overlap rejected',()=>{
 const a=shift('2026-03-29','01:30','03:30','2026-03-29T01:30+01:00','2026-03-29T03:30+02:00');
 assert.throws(()=>calculateWeeklyPayroll([a,shift('2026-03-29','03:00','04:00')]),/solapados/);
});
