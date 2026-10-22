import test from 'node:test';
import assert from 'node:assert/strict';
import {planToSession,prepareGymSave,startGymDraft,saveGymDraft}
 from '../apps/rise-react/src/lib/gym-session-actions.mjs';
const uid='22222222-2222-4222-8222-222222222222';
const at=new Date('2026-10-22T11:00:00.000Z');
const plan=[['Upper Body','20-30',[['Chest Press',2,8,12,'Pecho',true,false,{rest:90,rir:2}],
 ['Cable Row',2,8,12,'Espalda',false,false,{rest:120}]]]];
function inputSets(row){return row.exercises.map(e=>e.sets.map(s=>({...s})));}
function fakeClient({current=null,existing=[]}={}){
 const ops=[];const state={current,existing};
 const client={from(table){assert.equal(table,'gym_sessions');let kind='select',value,filters=[];
 const q={
   select(){return q},eq(field,val){filters.push(['eq',field,val]);return q},is(field,val){filters.push(['is',field,val]);return q},
   limit(){return Promise.resolve({data:state.existing,error:null})},
   insert(val){kind='insert';value=val;ops.push({kind,value});return q},
   update(val){kind='update';value=val;ops.push({kind,value});return q},
   single(){return Promise.resolve({data:kind==='insert'?value:null,error:null})},
   maybeSingle(){ops.push({kind:'maybeSingle',filters});return Promise.resolve({data:kind==='update'?{...state.current,...value}:state.current,error:null})}
 };return q;
 }};
 return {client,ops};
}
test('Uses original session tuple structure without inventing completed sets',()=>{
 const x=planToSession(plan,0,uid,at);
 assert.equal(x.workout_date,'2026-10-22');
 assert.equal(x.user_id,uid);
 assert.equal(x.exercises.length,2);
 assert.equal(x.exercises[0].sets.length,2);
 assert(x.exercises.every(e=>e.sets.every(s=>s.completed===false&&s.weight===null)));
 assert.equal(x.exercises[0].rest,90);
 assert.equal(x.completed_at,null);
});
test('Draft cannot be started when a session is already active',async()=>{
 const db=fakeClient({existing:[{id:'session-in-progress'}]});
 await assert.rejects(startGymDraft(db.client,uid,plan,0,at),/Ya existe una sesión/);
 assert.equal(db.ops.length,0);
});
test('New draft is inserted using the user owner and original Gym session shape',async()=>{
 const db=fakeClient();
 const x=await startGymDraft(db.client,uid,plan,0,at);
 assert.equal(x.user_id,uid);
 assert.equal(x.title,'Upper Body');
 assert.equal(x.exercises[1].name,'Cable Row');
 assert(db.ops.some(x=>x.kind==='insert'));
});
test('Completed sets require measured weight, reps and RIR; unfinished may stay empty',()=>{
 const base=planToSession(plan,0,uid,at);
 const edits=inputSets(base);
 edits[0][0]={completed:true,weight:null,reps:8,rir:2};
 assert.throws(()=>prepareGymSave(base,edits,{finish:true,at:new Date(at.getTime()+3600000)}),/Completa los valores/);
 edits[0][0]={completed:true,weight:40,reps:12,rir:2};
 const result=prepareGymSave(base,edits,{finish:true,at:new Date(at.getTime()+3600000)});
 assert.equal(result.completed_at,'2026-10-22T12:00:00.000Z');
 assert.equal(result.duration_minutes,60);
 assert.equal(result.exercises[0].sets[0].weight,40);
 assert.equal(result.exercises[0].sets[1].completed,false);
 assert.equal(result.exercises[1].sets[1].reps,null);
});
test('Cannot complete zero sets, a finished workout, or tamper with exercise count',()=>{
 const base=planToSession(plan,0,uid,at);
 assert.throws(()=>prepareGymSave(base,inputSets(base),{finish:true}),/No hay series terminadas/);
 assert.throws(()=>prepareGymSave({...base,completed_at:at.toISOString()},inputSets(base)),/sesiones abiertas/);
 assert.throws(()=>prepareGymSave(base,[]),/plan de la sesión cambió/);
});
test('Rejects saved concurrent edits and cross-user ownership; does not overwrite stale exercises',async()=>{
 const base=planToSession(plan,0,uid,at);
 const other={...base,exercises:[{...base.exercises[0],sets:[{completed:true,weight:40,reps:8,rir:2}]}]};
 const d=fakeClient({current:other});
 await assert.rejects(saveGymDraft(d.client,uid,base,inputSets(base)),/otro dispositivo/);
 await assert.rejects(saveGymDraft(d.client,'another-user',base,inputSets(base)),/no pertenece/);
 assert(!d.ops.some(x=>x.kind==='update'));
});
test('Finished updates are owner-scoped, cannot modify completed workouts',async()=>{
 const base=planToSession(plan,0,uid,at);
 const edits=inputSets(base);edits[0][0]={completed:true,weight:25,reps:12,rir:1};
 const d=fakeClient({current:base});
 const saved=await saveGymDraft(d.client,uid,base,edits,{finish:true,at:new Date(at.getTime()+3600000)});
 assert.equal(saved.completed_at,'2026-10-22T12:00:00.000Z');
 const check=d.ops.find(x=>x.kind==='maybeSingle'&&x.filters.some(f=>f[0]==='is'&&f[1]==='completed_at'));
 assert(check);
 assert(d.ops.some(x=>x.kind==='update'));
});
