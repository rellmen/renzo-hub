import test from 'node:test';
import assert from 'node:assert/strict';
import {grammarDrills,checkGrammar} from '../microapps/selflearn/grammar.js';
import {pronunciationDrills} from '../microapps/selflearn/pronunciation.js';
for(const course of ['nl','en']){
 test(`${course}: grammar exercises have stable ids, explanations and unambiguous answers`,()=>{
  const drills=grammarDrills(course);assert.ok(drills.length>=5);
  assert.equal(new Set(drills.map(d=>d.id)).size,drills.length);
  for(const d of drills){assert.ok(d.explanation.length>15);assert.ok(d.options.includes(d.answer));assert.equal(checkGrammar(d,d.answer),true);for(const wrong of d.options.filter(x=>x!==d.answer))assert.equal(checkGrammar(d,wrong),false);}
 });
 test(`${course}: pronunciation drills have practical instructions`,()=>{
  const drills=pronunciationDrills(course);assert.ok(drills.length>=5);assert.equal(new Set(drills.map(d=>d.id)).size,drills.length);
  for(const d of drills){assert.ok(d.tip.length>20);assert.ok(d.example);assert.ok(d.contrast);}
 });
}
