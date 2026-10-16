import test from 'node:test';
import assert from 'node:assert/strict';
import {muscleInsights,muscleOfExercise} from '../microapps/gym/insights.js';

const session=(date,exercises,completed=true)=>({workout_date:date,completed_at:completed?date+'T18:00:00Z':null,exercises});
const ex=(name,muscle,sets)=>({name,muscle,sets:sets.map(([weight,reps,completed=true])=>({weight,reps,completed}))});

test('leg exercises use more specific muscle groups rather than generic Piernas',()=>{
 assert.equal(muscleOfExercise({name:'Leg Press',muscle:'Piernas'}),'Cuádriceps');
 assert.equal(muscleOfExercise({name:'Romanian Deadlift',muscle:'Piernas'}),'Isquiotibiales');
 assert.equal(muscleOfExercise({name:'Calf Raise',muscle:'Piernas'}),'Gemelos');
});
test('counts only completed positive-repetition sets for the current week',()=>{
 const result=muscleInsights([
  session('2026-10-12',[ex('Chest Press','Pecho',[[40,10],[45,8,false]])]),
  session('2026-10-13',[ex('Chest Press','Pecho',[[40,0],[40,9]])]),
  session('2026-10-14',[ex('Lat Pulldown','Espalda',[[50,10]])],false),
  session('2026-10-05',[ex('Lat Pulldown','Espalda',[[50,10]])])
 ],new Date('2026-10-16T12:00:00'));
 assert.equal(result.week,'2026-10-12');
 assert.equal(result.sessions,2);
 assert.equal(result.counts.Pecho,2);
 assert.equal(result.counts.Espalda,0);
 assert.equal(result.previous.Espalda,1);
 assert.equal(result.completedSets,2);
 assert.equal(result.tonnage,760);
});
test('no invented training signals with empty history',()=>{
 const result=muscleInsights([],new Date('2026-10-16T12:00:00'));
 assert.equal(result.sessions,0);
 assert.equal(result.balance[0].note,'Datos insuficientes esta semana');
 assert.ok(Object.values(result.counts).every(v=>v===0));
});
