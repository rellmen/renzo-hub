import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeLearningSnapshot,loadLearningSnapshot}
 from '../apps/rise-react/src/lib/selflearn-snapshot.mjs';
const uid='22222222-2222-4222-8222-222222222222';
const make=(entries,learningRuns={})=>{
 const calls=[];
 const client={from(table){
   const builder={
     select(cols){calls.push({op:'select',table,cols});return builder;},
     eq(key,value){calls.push({op:'eq',table,key,value});return builder;},
     in(key,value){calls.push({op:'in',table,key,value});return builder;},
     order(key,v){calls.push({op:'order',table,key,v});return builder;},
     maybeSingle(){return Promise.resolve({data:{state:{learningRuns,learningSettings:{sessionMinutes:10}}},error:null});},
     range(from,to){calls.push({op:'range',table,from,to});return Promise.resolve({data:entries.slice(from,to+1),error:null});}
   };
   return builder;
 }};
 return {client,calls};
};
test('SelfLearn reader preserves actual lesson and run ids for NL and EN',async()=>{
 const active={unitId:'a1-8',mode:'lesson',answers:[1,2],updatedAt:'2026-10-22T11:00:00Z'};
 const records=[
  {id:'a',record_type:'renzo_event',updated_at:'2026-10-21T00:00:00Z',payload:{kind:'learning',course:'nl',practice:'Study path',passed:true,courseLessonId:'a1-8'}},
  {id:'b',record_type:'renzo_event',payload:{kind:'learning',course:'en',practice:'Study path',passed:true,courseLessonId:'en-b1-2'}},
  {id:'c',record_type:'renzo_vocabulary',payload:{course:'nl',front:'hallo',nextReview:'2020-01-01'}}
 ];
 const {client,calls}=make(records,{nl:active});
 const snapshot=await loadLearningSnapshot(client,uid);
 assert.deepEqual(snapshot.completed.nl,['a1-8']);
 assert.deepEqual(snapshot.completed.en,['en-b1-2']);
 assert.equal(snapshot.learningRuns.nl,active);
 assert.equal(snapshot.learningRuns.en,null);
 assert.equal(snapshot.reviewDue.nl,1);
 assert.equal(snapshot.vocabulary.length,1);
 assert.deepEqual(snapshot.goals,{nl:'B2',en:'C1'});
 for(const c of calls.filter(c=>c.op==='eq'))assert.equal(c.value,uid);
 assert(calls.some(c=>c.op==='in'&&c.key==='record_type'));
});
test('SelfLearn does not count failed exercises, free practice or invented completion',()=>{
 const r=summarizeLearningSnapshot({rows:[
  {id:'x',record_type:'renzo_event',payload:{kind:'learning',course:'nl',practice:'Study path',passed:false,courseLessonId:'a1-9'}},
  {id:'y',record_type:'renzo_event',payload:{kind:'learning',course:'nl',practice:'Offline tutor',passed:true,courseLessonId:'a1-7'}},
  {id:'z',record_type:'renzo_vocabulary',payload:{course:'en',front:'hello',fsrsCard:{due:'2099-01-01'}}}
 ]});
 assert.deepEqual(r.completed.nl,[]);
 assert.equal(r.reviewDue.en,0);
 assert.equal(r.entries.length,2);
 assert.match(r.note,/no certifican/);
});
test('SelfLearn rejects missing identity before any Supabase query',async()=>{
 await assert.rejects(loadLearningSnapshot(make([]).client,''),/Inicia sesión/);
});

test('Due counts respect FSRS time of day and legacy Daily lesson completion',()=>{
 const future=new Date(Date.now()+60*60*1000).toISOString();
 const result=summarizeLearningSnapshot({rows:[
  {id:'legacy',record_type:'renzo_event',payload:{kind:'learning',practice:'Daily lesson',lessonDay:1}},
  {id:'future',record_type:'renzo_vocabulary',payload:{course:'nl',fsrsCard:{due:future}}}
 ]});
 assert(result.completed.nl.includes('a1-legacy-1'));assert.equal(result.reviewDue.nl,0);
});
