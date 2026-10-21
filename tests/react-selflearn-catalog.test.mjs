import test from 'node:test';
import assert from 'node:assert/strict';
import {COURSES,courseUnits,completedUnitIds,nextUnit,levelProgress}
  from '../apps/rise-react/src/lib/legacy-selflearn/engine.js';
import {loadLearningSnapshot,summarizeLearningSnapshot}
  from '../apps/rise-react/src/lib/selflearn-snapshot.mjs';
import {readFileSync} from 'node:fs';

test('Real Dutch and English catalogs preserve stable unit IDs and meaningful B2/C1 goals',()=>{
 for(const course of ['nl','en']){
   const units=courseUnits(course);
   assert(units.length>=40,'Original catalog must not be replaced by four fake lessons');
   assert.equal(new Set(units.map(u=>u.id)).size,units.length);
   assert(units.every(u=>u.level&&u.title&&Array.isArray(u.words)));
 }
 assert(COURSES.nl.units.some(u=>u.level==='B2'));
 assert(COURSES.en.units.some(u=>u.level==='C1'));
});
test('Completed progress derives only from recorded original Study path events',()=>{
 const id=COURSES.nl.units[0].id;
 const entries=[{kind:'learning',practice:'Study path',course:'nl',courseLessonId:id,passed:true},
   {kind:'learning',practice:'Study path',course:'nl',courseLessonId:'FAKE_UNIT',passed:true},
   {kind:'learning',practice:'Study path',course:'nl',courseLessonId:COURSES.nl.units[1].id,passed:false}];
 const done=completedUnitIds(entries,'nl');
 assert.equal(done.size,1);
 assert(done.has(id));
 assert(!done.has('FAKE_UNIT'));
 assert.equal(levelProgress('nl',entries).reduce((n,x)=>n+x.done,0),1);
 const next=nextUnit('nl',entries,{});
 assert(next&&next.id!==id);
});
test('Snapshot keeps authenticated unfinished sessions instead of resetting them',()=>{
 const run={version:2,course:'nl',mode:'lesson',unitId:COURSES.nl.units[0].id,updatedAt:1762000000000};
 const out=summarizeLearningSnapshot({state:{learningRuns:{nl:run}},rows:[]});
 assert.equal(out.learningRuns.nl,run);
 assert.equal(out.goals.nl,'B2');
 assert.equal(out.goals.en,'C1');
});
test('React SelfLearn may read cloud state but must not save demo progress locally',()=>{
 const route=readFileSync(new URL('../apps/rise-react/src/routes/aprender.tsx',import.meta.url),'utf8');
 assert.match(route,/loadLearningSnapshot/);
 assert.match(route,/completedUnitIds/);
 assert.match(route,/courseUnits|selected\.units/);
 assert.doesNotMatch(route,/useLocalStorage|\bCOURSES\s*=\s*\{/);
 assert.doesNotMatch(route,/setDone\(|setLocalProgress|DemoDataBadge/);
});
test('Snapshot query is scoped to the authenticated owner and rejects unauthenticated users',async()=>{
 const calls=[],uid='22222222-2222-4222-8222-222222222222';
 const client={from(table){
   const q={select(){return q},eq(field,value){calls.push({table,field,value});return q},
     in(){return q},order(){return q},
     maybeSingle(){return Promise.resolve({data:{state:{learningRuns:{}}},error:null})},
     range(){return Promise.resolve({data:[],error:null})}};
   return q;
 }};
 const data=await loadLearningSnapshot(client,uid);
 assert.deepEqual(data.vocabulary,[]);
 assert(calls.some(x=>x.table==='hub_user_state'&&x.field==='owner_id'&&x.value===uid));
 assert(calls.some(x=>x.table==='hub_records'&&x.field==='owner_id'&&x.value===uid));
 await assert.rejects(loadLearningSnapshot(client,''),/Inicia sesión/);
});
