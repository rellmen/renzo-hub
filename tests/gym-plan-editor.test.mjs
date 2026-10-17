import test from 'node:test';import assert from 'node:assert/strict';
import {GYM_LIBRARY,validateGymPlan,updateGymExercise,moveGymExercise,replaceGymExercise} from '../microapps/gym/plan-editor.js';
import {DEFAULT_PLAN} from '../gym.js';
test('default five-day plan validates, invalid exercise values rejected',()=>{
 assert.equal(validateGymPlan(DEFAULT_PLAN),true);
 const invalid=structuredClone(DEFAULT_PLAN);invalid[0][2][0][1]=0;assert.equal(validateGymPlan(invalid),false);
});
test('editor updates one exercise without mutating source or histories',()=>{
 const newPlan=updateGymExercise(DEFAULT_PLAN,0,0,{name:'Row Test',sets:3,minReps:8,maxReps:12});
 assert.equal(newPlan[0][2][0][0],'Row Test');assert.notEqual(DEFAULT_PLAN[0][2][0][0],'Row Test');
 assert.throws(()=>updateGymExercise(DEFAULT_PLAN,0,0,{maxReps:0}),/repeticiones/);
});
test('reordering exercises and library replacement preserve valid plan',()=>{
 const moved=moveGymExercise(DEFAULT_PLAN,0,1,-1);
 assert.equal(moved[0][2][0][0],DEFAULT_PLAN[0][2][1][0]);
 assert.equal(moveGymExercise(DEFAULT_PLAN,0,0,-1),null);
 const replaced=replaceGymExercise(DEFAULT_PLAN,0,0,GYM_LIBRARY[0]);
 assert.equal(validateGymPlan(replaced),true);
});
