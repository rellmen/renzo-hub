import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {COURSES,currentStep} from "../apps/rise-react/src/lib/legacy-selflearn/engine.js";
import {makePractice,gradePractice,practicePrompt} from "../apps/rise-react/src/lib/selflearn-practice.mjs";
import {lessonAward,stableRecordId,finalizeOfficialLesson}
 from "../apps/rise-react/src/lib/selflearn-finalization.mjs";

const uid="22222222-2222-4222-8222-222222222222";
const session="33333333-3333-4333-8333-333333333333";
function input(step){
 if(["learn","grammar","speak"].includes(step.type))return "";
 if(step.type==="match")return step.pairs.map(p=>p[1]);
 if(step.type==="build")return step.answer.join(" ");
 return step.answer;
}
function finished(course="nl",wrong=false){
 let run=makePractice(course,COURSES[course].units[0].id,{seed:2026,minutes:5});
 let i=0;
 while(!practicePrompt(run).complete){
   const step=currentStep(run);
   let answer=input(step);
   if(wrong&&step.type==="choice"&&!run.mistakes.length)answer="deliberately wrong";
   run=gradePractice(run,answer).run;
   assert(++i<180);
 }
 return run;
}
const existing=(run,overrides={})=>({
 entries:[],vocabulary:[],completed:{nl:[],en:[]},learningRuns:{nl:null,en:null},...overrides
});
test("Deterministic IDs are stable and isolated by user/lesson/word namespace",async()=>{
 const a=await stableRecordId(uid+"/lesson/nl/a1-1");
 assert.match(a,/^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
 assert.equal(a,await stableRecordId(uid+"/lesson/nl/a1-1"));
 assert.notEqual(a,await stableRecordId(uid+"/lesson/en/a1-1"));
 assert.notEqual(a,await stableRecordId(uid+"/vocabulary/nl/a1-1"));
});
test("Original engine award uses first-try graded score, not artificial XP",()=>{
 const run=finished("nl");
 const p=lessonAward(run,existing(run),{uid,at:new Date(2026,9,22,12)});
 assert.equal(p.event.practice,"Study path");
 assert.equal(p.event.courseLessonId,run.unitId);
 assert.equal(p.event.xp,p.event.score*10);
 assert.equal(p.event.score,p.event.totalQuestions);
 assert.equal(p.newVocabulary.length,p.unit.words.length);
 assert.equal(p.newVocabulary[0].nextReview,"2026-10-23");
 assert.equal(p.event.stage,"Application");
});
test("Re-accrediting a completed unit never grants XP or creates duplicate vocabulary",()=>{
 const run=finished("nl");
 const known=COURSES.nl.units[0].words[0];
 const p=lessonAward(run,existing(run,{
   completed:{nl:[run.unitId],en:[]},
   vocabulary:[{course:"nl",front:known[0],back:known[1],fsrsCard:{due:"2028-01-01",stability:20}}]
 }),{uid,at:new Date(2026,9,22,12)});
 assert.equal(p.already,true);
 assert.equal(p.event.xp,0);
 assert.equal(p.newVocabulary.length,p.unit.words.length-1);
});
test("Rejects unfinished/missing answers and unauthenticated awards",()=>{
 const run=makePractice("nl",COURSES.nl.units[0].id,{minutes:5});
 assert.throws(()=>lessonAward(run,existing(run),{uid}),/terminadas/);
 const done=finished();
 const bad=structuredClone(done);
 const graded=bad.steps.find(x=>["choice","listen","gap","build","type","dialogue","match"].includes(x.type));
 delete bad.attempts[graded.id];
 assert.throws(()=>lessonAward(bad,existing(done),{uid}),/Falta confirmar/);
 assert.throws(()=>lessonAward(done,existing(done),{uid:""}),/Inicia sesión/);
});
test("Fail closed: finalizer needs a saved checkpoint and refuses an old/active classic run",async()=>{
 const run=finished(),cp={id:"row1",sessionId:session,run};
 await assert.rejects(finalizeOfficialLesson(null,uid,cp),/Supabase/);
 await assert.rejects(finalizeOfficialLesson({},uid,cp,{legacyActive:true}),/sesión activa/);
 const db={from(){return {
   select(){return this},eq(){return this},order(){return this},
   limit(){return Promise.resolve({data:[{id:"newer",payload:{course:run.course,sessionId:session,run}}],error:null});}
 }}};
 await assert.rejects(finalizeOfficialLesson(db,uid,cp),/otro dispositivo/);
});
test("A single atomic batch creates the lesson event and only missing new vocabulary",async()=>{
 const run=finished("en"),checkpoint={id:"cp0",sessionId:session,run};
 const inserted=[];const selected=[];
 const db={from(table){
   const q={type:"",filters:[],
    select(){return q},
    eq(k,v){q.filters.push([k,v]);return q},
    in(){return q},
    order(){return q},
    limit(){return Promise.resolve({data:[{id:"cp0",payload:{course:"en",sessionId:session,run}}],error:null})},
    range(){return Promise.resolve({data:[],error:null})},
    maybeSingle(){
      if(table==="hub_user_state")return Promise.resolve({data:{state:{}},error:null});
      return Promise.resolve({data:inserted.find(x=>x.record_type==="renzo_event")&&{
        id:inserted[0].id,payload:inserted[0].payload
      },error:null});
    },
    upsert(rows,opts){inserted.push(...rows);selected.push(opts);return Promise.resolve({data:null,error:null})}
   };
   return q;
 }};
 const res=await finalizeOfficialLesson(db,uid,checkpoint,{at:new Date(2026,9,22,12)});
 assert.equal(res.already,false);
 assert.equal(res.xp,res.addedCards>=0?lessonAward(run,existing(run),{uid,at:new Date(2026,9,22,12)}).event.xp:-1);
 assert.equal(inserted.filter(r=>r.record_type==="renzo_event").length,1);
 assert(inserted.some(r=>r.record_type==="renzo_vocabulary"));
 assert(inserted.every(r=>r.owner_id===uid&&r.source==="manual"));
 assert.equal(selected[0].onConflict,"id");
 assert.equal(selected[0].ignoreDuplicates,true);
});

test("Previously accredited legacy unit is never paid again and no FSRS cards are rewritten",async()=>{
 const run=finished("nl"),checkpoint={id:"verified",sessionId:session,run},at=new Date(2026,9,22,12);
 let writes=0;
 const db={from(table){
   const filters=[];
   const q={select(){return q},
     eq(k,v){filters.push([k,v]);return q},
     in(){return q},order(){return q},
     limit(){return Promise.resolve({data:[{id:"verified",payload:{course:"nl",sessionId:session,run}}],error:null})},
     range(){return Promise.resolve({data:[{id:"old-done",record_type:"renzo_event",
       payload:{kind:"learning",practice:"Study path",passed:true,course:"nl",courseLessonId:run.unitId,xp:90}}],error:null})},
     maybeSingle(){return Promise.resolve({data:table==="hub_user_state"?{state:{}}:null,error:null})},
     upsert(){writes++;throw Error("An existing lesson must never be rewritten");}
   };return q;
 }};
 const result=await finalizeOfficialLesson(db,uid,checkpoint,{at});
 assert.equal(result.already,true);
 assert.equal(result.xp,0);
 assert.equal(result.addedCards,0);
 assert.equal(writes,0);
});
test("Staging official-award control is always disabled in default builds",()=>{
 const src=readFileSync(new URL("../apps/rise-react/src/components/rise/SelfLearnCheckpointPractice.tsx",import.meta.url),"utf8");
 assert.match(src,/VITE_ENABLE_SELFLEARN_AWARDS===\s*["']true["']/);
 assert.match(src,/finalizeOfficialLesson\(/);
 assert.match(src,/legacyActive/);
});
