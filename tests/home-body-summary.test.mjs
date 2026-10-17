import test from 'node:test';import assert from 'node:assert/strict';import {summarizeBodyHome} from '../microapps/home/body-summary.js';
test('dashboard reports only actual completed sessions and checklist entries',()=>{
 const result=summarizeBodyHome([{workout_date:'2026-10-16',completed_at:null,title:'Not finished'},{workout_date:'2026-10-14',completed_at:'2026-10-14T14:00:00Z',title:'Piernas'}],[{session:'am',completed_steps:[0,1,1]},{session:'pm',completed_steps:[2]}]);
 assert.equal(result.gym.title,'Piernas');assert.equal(result.skin.am,3);assert.equal(result.skin.pm,1);
});
test('no recorded history does not become fictional progress',()=>{
 assert.deepEqual(summarizeBodyHome(),{gym:null,skin:{am:0,pm:0}});
});
