import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as bg from '../apps/rise-react/src/lib/body-goals.mjs';
import {sanitizeBodyProfile as classic} from '../profile.js';
const U='22222222-2222-4222-8222-222222222222';
test('Body profile sanitizer matches Classic; goals module byte-identical',()=>{
 for(const input of [{startWeight:'84,5',height:'1.70',kcalMin:'',proteinMax:'160',phases:'78, 74.5, abc, 70'},{kcalMin:-5,budgetMax:'x'},{}])
  assert.deepEqual(bg.sanitizeBodyProfile(input),classic(input));
 assert.equal(readFileSync(new URL('../apps/rise-react/src/lib/legacy-gym/goals.js',import.meta.url),'utf8'),readFileSync(new URL('../microapps/gym/goals.js',import.meta.url),'utf8'));
 assert.throws(()=>bg.checkRanges({kcalMin:3000,kcalMax:2000}),/kcal/);
 assert.throws(()=>bg.checkRanges({height:170}),/metros/);
});
function c(result,calls=[]){const ch={from(){return ch;},select(){return ch;},eq(k,v){calls.push(['eq',k,v]);return ch;},update(v){calls.push(['update',v]);return ch;},insert(v){calls.push(['insert',v]);return ch;},delete(){calls.push(['delete']);return ch;},
 order(){return ch;},maybeSingle:async()=>result,single:async()=>result,then(r,j){return Promise.resolve(result).then(r,j);}};return ch;}
test('Settings key save preserves other keys and is version-gated',async()=>{
 const calls=[];await bg.saveBodyProfile(c({data:{},error:null},calls),U,{settings:{skinInventory:{p1:'available'}},updated_at:'v1',exists:true},{kcalMin:'2000'});
 const up=calls.find(x=>x[0]==='update')[1];
 assert.deepEqual(up.settings,{skinInventory:{p1:'available'},bodyProfile:{kcalMin:2000}});
 assert.ok(calls.some(x=>x[0]==='eq'&&x[1]==='updated_at'&&x[2]==='v1'));
 await assert.rejects(bg.saveBodyProfile(c({data:null,error:null}),U,{settings:{},updated_at:'v1',exists:true},{}),/otro dispositivo/);
});
test('Gym goals validated then saved to auth metadata like Classic',async()=>{
 let sent;const client={auth:{updateUser:async x=>{sent=x;return {error:null};}}};
 await assert.rejects(bg.saveGymGoals(client,{priority:'x',sessionsPerWeek:7}),/2 a 5/);
 await bg.saveGymGoals(client,{priority:'Brazos',sessionsPerWeek:4,targetWeight:'78'});
 assert.deepEqual(sent,{data:{gym_goals:{priority:'Brazos',sessionsPerWeek:4,targetWeight:78}}});
});
test('Weight corrections keep the previous value and are CAS-scoped; delete is CAS-scoped',async()=>{
 const row={id:'w',updated_at:'v',payload:{date:'2026-10-20',value:84.2}};
 const calls=[];await bg.correctWeight(c({data:{id:'w'},error:null},calls),U,row,'83,9',new Date('2026-10-23T00:00:00Z'));
 const p=calls.find(x=>x[0]==='update')[1].payload;
 assert.equal(p.value,83.9);assert.deepEqual(p.corrections,[{at:'2026-10-23T00:00:00.000Z',previous:84.2}]);
 assert.ok(calls.some(x=>x[1]==='updated_at')&&calls.some(x=>x[1]==='record_type'&&x[2]==='body_weight'));
 await assert.rejects(bg.correctWeight(c({data:null,error:null}),U,row,'900'),/rango/);
 const del=[];assert.equal(await bg.deleteWeight(c({data:[{id:'w'}],error:null},del),U,row),true);assert.ok(del.some(x=>x[1]==='updated_at'));
 await assert.rejects(bg.deleteWeight(c({data:[],error:null}),U,row),/cambió/);
});
