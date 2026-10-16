import test from 'node:test';import assert from 'node:assert/strict';
import {GYM_GOALS_DEFAULT,validateGymGoals,getGymGoals,putGymGoals} from '../microapps/gym/goals.js';
test('default objectives are valid and optional target is not invented',()=>{
 assert.deepEqual(validateGymGoals(GYM_GOALS_DEFAULT),GYM_GOALS_DEFAULT);
 assert.equal(validateGymGoals({...GYM_GOALS_DEFAULT,targetWeight:''}).targetWeight,null);
});
test('invalid goals are rejected before saving',()=>{
 assert.throws(()=>validateGymGoals({priority:'',sessionsPerWeek:4}),/prioridad/);
 assert.throws(()=>validateGymGoals({priority:'Salud',sessionsPerWeek:8}),/Sesiones/);
 assert.throws(()=>validateGymGoals({priority:'Salud',sessionsPerWeek:3,targetWeight:12}),/peso/);
});
test('storage isolates goals by user account',()=>{
 const store=new Map();
 globalThis.localStorage={getItem:key=>store.get(key)??null,setItem:(key,v)=>store.set(key,v)};
 try{
  putGymGoals('owner-a',{priority:'Fuerza',sessionsPerWeek:3,targetWeight:75});
  assert.equal(getGymGoals('owner-a').targetWeight,75);
  assert.equal(getGymGoals('owner-b').targetWeight,null);
 }finally{delete globalThis.localStorage;}
});

test('cloud metadata is used when available for cross-device goals',()=>{
 const result=getGymGoals('owner-c',{gym_goals:{priority:'Fuerza',sessionsPerWeek:5,targetWeight:72}});
 assert.equal(result.sessionsPerWeek,5);assert.equal(result.targetWeight,72);
});
