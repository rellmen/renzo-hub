import test from 'node:test';
import assert from 'node:assert/strict';
import {exerciseTrends,exercisesWithHistory} from '../microapps/gym/trends.js';
const set=(weight,reps,completed=true)=>({weight,reps,completed});
const row=(date,sets,completed=true)=>({workout_date:date,completed_at:completed?date+'T17:00:00Z':null,exercises:[{name:'Chest Press',sets}]});
test('exercise history excludes incomplete sessions and unfinished sets',()=>{
 const sessions=[row('2026-10-14',[set(50,10),set(65,5,false)]),row('2026-10-15',[set(60,8)],false),row('2026-10-16',[set(55,10)])];
 const r=exerciseTrends(sessions,'Chest Press');
 assert.equal(r.entries.length,2);
 assert.equal(r.last.tonnage,550);
 assert.equal(r.last.maxWeight,55);
 assert.equal(r.best1RM,55*(1+10/30));
 assert.deepEqual(exercisesWithHistory(sessions),['Chest Press']);
});
test('no invented progress when data is missing',()=>{
 const r=exerciseTrends([], 'Unknown');
 assert.equal(r.last,null);
 assert.equal(r.deltaStrength,null);
 assert.equal(r.best1RM,0);
});
test('Epley is not extrapolated from high-rep endurance sets',()=>{
 const r=exerciseTrends([row('2026-10-16',[set(30,20)])],'Chest Press');
 assert.equal(r.last.estimated1RM,0);
 assert.equal(r.last.tonnage,600);
});
