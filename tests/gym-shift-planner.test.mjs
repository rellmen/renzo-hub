import test from 'node:test';
import assert from 'node:assert/strict';
import {shiftForDate,suggestedTrainingWeek} from '../microapps/gym/shift-planner.js';
test('shift rotation is stable for both weeks and across year boundaries',()=>{
 assert.equal(shiftForDate('2026-10-12'),'morning');
 assert.equal(shiftForDate('2026-10-19'),'evening');
 assert.equal(shiftForDate('2026-10-25'),'evening');
 assert.equal(shiftForDate('2026-10-26'),'morning');
 assert.equal(shiftForDate('2027-01-01'),'evening');
});
test('planner proposes count of sessions without mutating external calendars',()=>{
 const p=suggestedTrainingWeek('2026-10-19',3);
 assert.equal(p.shift,'evening');assert.equal(p.workHours,'15:00–00:00');
 assert.equal(p.days.length,3);assert.equal(p.days[0].time,'10:30');
 assert.equal(suggestedTrainingWeek('2026-10-12',4).days.length,4);
});
test('invalid dates are rejected',()=>assert.throws(()=>suggestedTrainingWeek('not-a-date'),/Fecha inválida/));
