import test from 'node:test';import assert from 'node:assert/strict';
import {recoveryInsights} from '../microapps/gym/recovery.js';
const row=(date,energy,fatigue,done=true)=>({workout_date:date,completed_at:done?date+'T18:00:00Z':null,energy,fatigue});
test('never claims recovery readiness without three paired records',()=>{
 const r=recoveryInsights([row('2026-10-15',2,9),row('2026-10-16',3,8)],new Date('2026-10-16T12:00:00'));
 assert.equal(r.hasEnough,false);assert.match(r.interpretation,/insuficientes/);
});
test('high fatigue produces conservative guidance, ignores incomplete and old sessions',()=>{
 const r=recoveryInsights([row('2026-10-13',3,8),row('2026-10-14',4,7),row('2026-10-16',3,9),row('2026-09-01',1,10),row('2026-10-15',1,10,false)],new Date('2026-10-16T12:00:00'));
 assert.equal(r.sessions,3);assert.equal(r.averageEnergy,3.3);assert.equal(r.averageFatigue,8);assert.equal(r.hasEnough,true);assert.match(r.interpretation,/descanso/);
});
test('invalid or absent scores are excluded rather than treated as zero',()=>{
 const r=recoveryInsights([row('2026-10-16',null,11)],new Date('2026-10-16T12:00:00'));
 assert.equal(r.averageEnergy,null);assert.equal(r.averageFatigue,null);
});
