import test from 'node:test';
import assert from 'node:assert/strict';
import {COURSES,buildLesson,advance,answer} from '../apps/rise-react/src/lib/legacy-selflearn/engine.js';
import {safeCheckpoint,recentLearningCheckpoints,newestStudyRun,appendStudyCheckpoint,resumedStudyRun}
 from '../apps/rise-react/src/lib/selflearn-checkpoints.mjs';
const uid='22222222-2222-4222-8222-222222222222';
const sessionId='33333333-3333-4333-8333-333333333333';
const unit=COURSES.nl.units[0].id;
const run=()=>buildLesson('nl',unit,{seed:99,minutes:5});
function mock({rows=[],error=null}={}){
 const actions=[];
 const db={from(table){
   assert.equal(table,'hub_records');
   let type='select',value,filters=[];
   const q={select(){return q},eq(k,v){filters.push([k,v]);return q},
    order(){return q},
    limit(){actions.push({type,filters});return Promise.resolve({data:rows,error:error?{message:error}:null})},
    insert(row){type='insert';value=row;return q},
    single(){actions.push({type,value,filters});return Promise.resolve({data:error?null:
      {id:'44444444-4444-4444-8444-444444444444',payload:value?.payload,created_at:new Date().toISOString()},error:error?{message:error}:null})}
   };return q;
 }};
 return {db,actions};
}
test('Real original language engine yields a safe lesson that survives serialization',()=>{
 const origin=run(),copy=safeCheckpoint(origin,sessionId);
 assert.equal(copy.course,'nl');
 assert.equal(copy.unitId,unit);
 assert.notEqual(origin,copy.run);
 assert.equal(copy.run.queue.length,origin.queue.length);
 assert.equal(copy.run.index,0);
 assert(copy.run.steps.length>3);
 assert.throws(()=>safeCheckpoint({...origin,queue:['INVALID']},sessionId),/compatible/);
 assert.throws(()=>safeCheckpoint(origin,'not-a-uuid'),/Identificador/);
});
test('Every answered step can append immutable private checkpoint with exact original state',async()=>{
 const {db,actions}=mock(),lesson=run();
 answer(lesson,true);advance(lesson);
 const saved=await appendStudyCheckpoint(db,uid,lesson,sessionId);
 assert.equal(saved.payload.run.index,1);
 assert.deepEqual(saved.payload.run.attempts,lesson.attempts);
 const row=actions.find(x=>x.type==='insert').value;
 assert.equal(row.owner_id,uid);
 assert.equal(row.domain,'learning');
 assert.equal(row.record_type,'learning_run');
 assert.equal(row.requires_review,false);
 assert.equal(row.payload.sessionId,sessionId);
 assert(!('state' in row));
});
test('Read only own checkpoints, filter malformed runs, prefer latest valid row',async()=>{
 const a=run(),next=run();advance(next);next.updatedAt=a.updatedAt+1000;
 const oldRow={id:'A',created_at:'2026-10-21T10:00:00Z',payload:{course:'nl',sessionId,run:a}};
 const newRow={id:'B',created_at:'2026-10-21T10:01:00Z',payload:{course:'nl',sessionId,run:next}};
 const {db,actions}=mock({rows:[newRow,{id:'C',payload:{course:'nl',sessionId,run:{queue:['bad']}}},oldRow]});
 const saved=await recentLearningCheckpoints(db,uid);
 assert.equal(saved.length,2);
 assert.equal(newestStudyRun(saved,'nl').id,'B');
 assert.equal(newestStudyRun(saved,'en'),null);
 assert.equal(resumedStudyRun(a,{run:next}),next);
 const filters=actions[0].filters;
 assert(filters.some(([k,v])=>k==='owner_id'&&v===uid));
 assert(filters.some(([k,v])=>k==='domain'&&v==='learning'));
 assert(filters.some(([k,v])=>k==='record_type'&&v==='learning_run'));
});
test('Stale expected checkpoint never overwrites another device progress',async()=>{
 const saved=run();
 const {db,actions}=mock({rows:[{id:'newer-step',created_at:new Date().toISOString(),payload:{course:'nl',sessionId,run:saved}}]});
 await assert.rejects(appendStudyCheckpoint(db,uid,saved,sessionId,{previousId:'old-step'}),/otro dispositivo/);
 assert(!actions.some(x=>x.type==='insert'));
});
test('Never write without authenticated identity, without valid run, or on RLS denial',async()=>{
 const {db,actions}=mock({error:'RLS denied'});
 await assert.rejects(appendStudyCheckpoint(db,'',run(),sessionId),/sesión/);
 await assert.rejects(appendStudyCheckpoint(db,uid,{},sessionId),/compatible/);
 await assert.rejects(appendStudyCheckpoint(db,uid,run(),sessionId),/RLS denied/);
 assert.equal(actions.filter(x=>x.type==='insert').length,1);
});
