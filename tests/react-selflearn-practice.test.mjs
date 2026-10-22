import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {transformSync} from "esbuild";
import {COURSES,currentStep,score} from "../apps/rise-react/src/lib/legacy-selflearn/engine.js";
import {makePractice,practicePrompt,gradePractice,supportedSelfLearnStepTypes}
 from "../apps/rise-react/src/lib/selflearn-practice.mjs";
import {safeCheckpoint} from "../apps/rise-react/src/lib/selflearn-checkpoints.mjs";

const session="33333333-3333-4333-8333-333333333333";
function correctInput(step){
 if(["learn","grammar","speak"].includes(step.type))return "";
 if(step.type==="match")return step.pairs.map(pair=>pair[1]);
 if(step.type==="build")return step.answer.join(" ");
 if(["choice","listen","gap","dialogue","type"].includes(step.type))return step.answer;
 throw Error("Unknown step "+step.type);
}
test("Original Dutch and English courses complete a simulated practice with matching answer grading",()=>{
 for(const course of ["nl","en"]){
   let run=makePractice(course,COURSES[course].units[0].id,{minutes:5,seed:2026});
   const types=new Set();
   let total=0;
   while(!practicePrompt(run).complete){
     const step=currentStep(run);
     assert(step);
     types.add(step.type);
     const next=gradePractice(run,correctInput(step));
     assert.equal(next.correct,true,"Correct "+step.type);
     assert.equal(run.index,total,"Source run should not be mutated");
     run=next.run;total++;
     assert(total<250,"Lesson must terminate");
     safeCheckpoint(run,session);
   }
   assert.equal(practicePrompt(run).complete,true);
   assert.equal(score(run).pct,100);
   assert(types.has("learn")&&types.has("grammar")&&types.has("match"));
   assert(types.has("choice")&&types.has("type"));
   for(const type of types)assert(supportedSelfLearnStepTypes.includes(type),"Port missing "+type);
 }
});
test("Wrong graded responses follow the original repeat queue and can be recovered",()=>{
 let run=makePractice("nl",COURSES.nl.units[0].id,{minutes:5,seed:101});
 while(!["choice","listen","gap","type","build","dialogue"].includes(currentStep(run).type))
   run=gradePractice(run,"").run;
 const current=currentStep(run);
 const len=run.queue.length;
 const grade=gradePractice(run,"definitely wrong answer");
 assert.equal(grade.correct,false);
 assert(grade.run.attempts[current.id]>=1);
 assert(grade.run.mistakes.includes(current.id));
 assert(grade.run.queue.length>=len);
 const saved=safeCheckpoint(grade.run,session);
 assert.equal(saved.run.index,grade.run.index);
 assert.equal(saved.run.queue.length,grade.run.queue.length);
});
test("Input checks reject empty answers, missing match choices and finished sessions",()=>{
 const lesson=makePractice("en",COURSES.en.units[0].id,{minutes:5,seed:22});
 assert.throws(()=>makePractice("sql","sql-intro"),/Curso no válido/);
 assert.throws(()=>makePractice("en","not-a-unit"),/No pude preparar/);
 assert.throws(()=>makePractice("en",COURSES.en.units[0].id,{minutes:100}),/Duración/);
 let run=lesson;
 while(!["choice","listen","gap","type","build","dialogue","match"].includes(currentStep(run).type))
   run=gradePractice(run,"").run;
 assert.throws(()=>gradePractice(run,""),/respuesta|parejas|frase/i);
});
test("Practice is clearly labelled as non-accredited and guarded behind RLS-confirmed writes",()=>{
 const component=readFileSync(new URL("../apps/rise-react/src/components/rise/SelfLearnCheckpointPractice.tsx",import.meta.url),"utf8");
 const route=readFileSync(new URL("../apps/rise-react/src/routes/aprender.tsx",import.meta.url),"utf8");
 assert(transformSync(component,{loader:"tsx",jsx:"automatic",format:"esm",target:"es2022"}).code.length>300);
 assert.match(route,/SelfLearnCheckpointPractice/);
 assert.match(component,/appendStudyCheckpoint/);
 assert.match(component,/previousId:active\.id/);
 assert.match(component,/XP y FSRS/);
 assert.match(component,/legacyActive/);
 assert.doesNotMatch(component,/localStorage|service_role|sb_secret_|\bSQL\b/);
});
