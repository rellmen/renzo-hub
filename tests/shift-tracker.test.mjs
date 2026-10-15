import test from 'node:test';import assert from 'node:assert/strict';import {calculateShift,validateContract} from '../microapps/payroll/shifts.js';
const contract={agency:'Agencia de pruebas',hourlyRate:15,bands:[{start:'00:00',end:'06:00',percent:150},{start:'06:00',end:'18:00',percent:100},{start:'18:00',end:'00:00',percent:130}]};
test('paid 15:00–00:00 with unpaid 30min at 19:00',()=>{let s=calculateShift({date:'2026-10-12',start:'15:00',end:'00:00',breaks:[{start:'19:00',end:'19:30',paid:false}]},contract);assert.equal(s.scheduledMinutes,540);assert.equal(s.unpaidBreakMinutes,30);assert.equal(s.paidMinutes,510);assert.deepEqual(s.segments.map(x=>[x.percent,x.minutes,x.amount]),[[100,180,45],[130,330,107.25]]);assert.equal(s.estimatedGross,152.25);});
test('overnight 23:00–07:00 uses 130% then 150% then 100%',()=>{let s=calculateShift({date:'2026-10-12',start:'23:00',end:'07:00',breaks:[]},contract);assert.deepEqual(s.segments.map(x=>[x.percent,x.minutes]),[[100,60],[130,60],[150,360]]);});
test('paid breaks remain remunerated and unpaid excluded',()=>{let s=calculateShift({date:'2026-10-12',start:'07:00',end:'13:00',breaks:[{start:'09:00',end:'09:15',paid:true}]},contract);assert.equal(s.paidMinutes,360);assert.equal(s.paidBreakMinutes,15);assert.equal(s.estimatedGross,90);});
test('must not invent missing contract rates',()=>assert.throws(()=>calculateShift({date:'2026-10-12',start:'07:00',end:'13:00'}, {hourlyRate:15}),/no se presumen/));
test('detects overlapping rate bands and breaks',()=>{assert.throws(()=>validateContract({...contract,bands:[...contract.bands,{start:'20:00',end:'22:00',percent:200}]}),/sin solaparse/);assert.throws(()=>calculateShift({date:'2026-10-12',start:'15:00',end:'00:00',breaks:[{start:'19:00',end:'20:00'},{start:'19:30',end:'20:30'}]},contract),/superpuestos/);});
test('reject invalid time, missing date and >16h shift',()=>{assert.throws(()=>calculateShift({date:'2026-10-12',start:'16:00',end:'15:00'},contract),/excesiva/);assert.throws(()=>calculateShift({date:'2026-02-31',start:'08:00',end:'12:00'},contract),/Fecha inválida/);});
test('rejects Amsterdam DST transition overlap while allowing unaffected same-day shifts',()=>{
 for(const d of ['2026-03-29','2026-10-25']){
  assert.throws(()=>calculateShift({date:d,start:'01:00',end:'06:00'},contract),/CET\/CEST/);
  const ok=calculateShift({date:d,start:'15:00',end:'23:00'},contract);assert.equal(ok.paidMinutes,480);
 }
 assert.throws(()=>calculateShift({date:'2026-03-28',start:'23:00',end:'07:00'},contract),/CET\/CEST/);
 assert.throws(()=>calculateShift({date:'2026-10-24',start:'23:00',end:'07:00'},contract),/CET\/CEST/);
});
