import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {planToSession,prepareGymSave,saveGymDraft} from '../apps/rise-react/src/lib/gym-session-actions.mjs';
import * as prog from '../apps/rise-react/src/lib/legacy-gym/progression.js';
const uid='22222222-2222-4222-8222-222222222222';
const at=new Date('2026-10-22T11:00:00.000Z');
const plan=[['Upper',' 20',[['Chest Press',2,8,12,'Pecho',true,false,{rest:90,rir:2}]]]];
const sets=row=>row.exercises.map(e=>e.sets.map(s=>({...s})));
test('Progression engine copy is byte-identical to Classic',()=>{
 assert.equal(readFileSync(new URL('../apps/rise-react/src/lib/legacy-gym/progression.js',import.meta.url),'utf8'),
  readFileSync(new URL('../microapps/gym/progression.js',import.meta.url),'utf8'));
 const ex={min:8,max:12,compound:true,sets:[{},{}]};
 assert.equal(prog.suggestSets(ex,{sets:[{weight:60,reps:12,rir:2},{weight:60,reps:12,rir:2}]}).mode,'increase');
});
test('Sets can be appended or trailing unfinished sets removed; completed sets are never dropped',()=>{
 const base=planToSession(plan,0,uid,at);
 const add=sets(base);add[0].push({weight:50,reps:null,rir:null,completed:false});
 assert.equal(prepareGymSave(base,add).exercises[0].sets.length,3);
 const less=sets(base);less[0].pop();
 assert.equal(prepareGymSave(base,less).exercises[0].sets.length,1);
 const done={...base,exercises:[{...base.exercises[0],sets:[base.exercises[0].sets[0],{weight:50,reps:10,rir:2,completed:true}]}]};
 const drop=sets(done);drop[0].pop();
 assert.throws(()=>prepareGymSave(done,drop),/series distinto/);
 const many=sets(base);many[0]=Array.from({length:21},()=>({completed:false}));
 assert.throws(()=>prepareGymSave(base,many),/series distinto/);
});
function client(base,rpc){
 const calls=[];
 return {calls,rpc:async(name,args)=>{calls.push([name,args]);return rpc(args);},
  from(){const q={select(){return q;},eq(){return q;},is(){return q;},update(v){calls.push(['update',v]);return q;},maybeSingle:async()=>({data:calls.some(c=>c[0]==='update')?{...base,...calls.find(c=>c[0]==='update')[1]}:base,error:null})};return q;}};
}
test('Save uses the atomic RPC with the fresh snapshot; conflicts surface; legacy fallback only when the function is missing',async()=>{
 const base=planToSession(plan,0,uid,at);
 const ok=client(base,args=>({data:{...base,exercises:args.p_exercises},error:null}));
 await saveGymDraft(ok,uid,base,sets(base));
 const [name,args]=ok.calls[0];
 assert.equal(name,'gym_save_session_cas');assert.deepEqual(args.p_expected,base.exercises);assert.equal(args.p_finish,false);
 assert.ok(!ok.calls.some(c=>c[0]==='update'),'no non-atomic write when RPC succeeds');
 const conflict=client(base,()=>({data:null,error:{code:'40001',message:'Gym session changed on another device; reload'}}));
 await assert.rejects(saveGymDraft(conflict,uid,base,sets(base)),/otro dispositivo/);
 assert.ok(!conflict.calls.some(c=>c[0]==='update'));
 const other=client(base,()=>({data:null,error:{code:'42501',message:'permission denied'}}));
 await assert.rejects(saveGymDraft(other,uid,base,sets(base)),/permission/);
 assert.ok(!other.calls.some(c=>c[0]==='update'));
 const missing=client(base,()=>({data:null,error:{code:'PGRST202',message:'Could not find the function'}}));
 await saveGymDraft(missing,uid,base,sets(base));
 assert.ok(missing.calls.some(c=>c[0]==='update'),'legacy path only when not installed');
});
