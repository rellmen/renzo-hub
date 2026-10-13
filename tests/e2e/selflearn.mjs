// Smoke funcional sin entrar en una cuenta real: cuenta temporal y Supabase simulado.
import {createRequire} from "node:module";
import {resolve} from "node:path";
import assert from "node:assert/strict";
const require=createRequire(process.env.PLAYWRIGHT_ROOT?resolve(process.env.PLAYWRIGHT_ROOT,"package.json"):import.meta.url);
const {chromium}=require("playwright");
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
try{
 await page.goto(process.env.BASE_URL||"http://localhost:4173",{waitUntil:"domcontentloaded"});
 const first=await page.evaluate(async()=>{
  const {mountWorld}=await import("/world.js");
  const root=document.createElement("div");root.id="selflearn-test-harness";
  document.body.append(root);
  const query={
   select(){return this;},eq(){return this;},gte(){return this;},
   lte(){return Promise.resolve({data:[],error:null});},
   in(){return Promise.resolve({data:[],error:null});},
   maybeSingle(){return Promise.resolve({data:null,error:null});},
   upsert(){return Promise.resolve({data:null,error:null});}
  };
  const fakeSupabase={from:()=>({...query})};
  const app=mountWorld({study:root},()=>({id:"selflearn-ui-mock-20261013"}),fakeSupabase);
  localStorage.removeItem("renzo-world-v2:selflearn-ui-mock-20261013");
  localStorage.removeItem("renzo-world-preview-v1:selflearn-ui-mock-20261013");
  await app.load();
  window.__selflearn={app,root};
  return {label:root.querySelector("h1")?.textContent,levels:root.querySelectorAll(".study-level").length};
 });
 assert.match(first.label,/A0.*B2/);
 assert.equal(first.levels,5);
 console.log("OK: SelfLearn dashboard & A0–B2 levels");

 await page.evaluate(()=>{const root=window.__selflearn.root;
  root.querySelector('[name="startingLevel"]').value="A0";
  root.querySelector('[name="focus"]').value="Logística";
  root.querySelector('form[data-form="study-settings"]').requestSubmit();
 });
 await page.waitForFunction(()=>document.querySelector("#selflearn-test-harness .study-next .ey")?.textContent.includes("A0"));
 await page.evaluate(()=>window.__selflearn.root.querySelector('[data-study-action="start"][data-day="0"]').click());
 for(let step=0;step<5;step++){
  const state=await page.evaluate(async()=>{
   const root=window.__selflearn.root;
   const title=root.querySelector(".study-question-card h2")?.textContent||"";
   const {foundationLessons}=await import("/microapps/selflearn/catalog.js");
   const lesson=foundationLessons[0];
   const match=title.match(/«([^»]+)»/);
   const answer=match?lesson.words.find(x=>x[1]===match[1])?.[0]:lesson.translation;
   const button=[...root.querySelectorAll('[data-study-action="answer"]')].find(b=>b.textContent.trim()===answer);
   if(!button)throw Error("Correct option missing: "+title+" / "+answer);
   button.click();return {feedback:root.querySelector(".study-feedback")?.textContent||""};
  });
  assert.match(state.feedback,/Correcto/);
  await page.evaluate(()=>window.__selflearn.root.querySelector('[data-study-action="continue"]').click());
 }
 await page.evaluate(()=>window.__selflearn.root.querySelector('[data-study-action="finish"]').click());
 await page.waitForFunction(()=>document.querySelector("#selflearn-test-harness .study-next .ey")?.textContent.includes("A0"));
 const outcome=await page.evaluate(()=>{
  const state=JSON.parse(localStorage.getItem("renzo-world-v2:selflearn-ui-mock-20261013"));
  return {lessonDone:state.entries.some(x=>x.courseLessonId==="a0-1"&&x.passed),cards:state.vocabulary.length,startingLevel:state.learningSettings.startingLevel,focus:state.learningSettings.focus};
 });
 assert.equal(outcome.lessonDone,true);
 assert.equal(outcome.cards,4);
 assert.equal(outcome.startingLevel,"A0");
 assert.equal(outcome.focus,"Logística");
 console.log("OK: quiz 5/5, saved progress and vocabulary");

 await page.evaluate(()=>{
  const root=window.__selflearn.root;
  root.querySelector('[data-action="review-vocab"][data-grade="good"]').click();
 });
 await page.waitForFunction(()=>{
  const raw=localStorage.getItem("renzo-world-v2:selflearn-ui-mock-20261013");
  return JSON.parse(raw||"{}").vocabulary?.some(x=>x.fsrsCard?.stability>0);
 });
 console.log("OK: FSRS review synced");
 await page.evaluate(()=>window.__selflearn.root.querySelector('[data-study-action="diagnostic"]').click());
 for(let q=0;q<15;q++){
  await page.evaluate(()=>{
   const root=window.__selflearn.root;
   root.querySelector('[data-study-action="answer"]').click();
   root.querySelector('[data-study-action="continue"]').click();
  });
 }
 await page.evaluate(()=>window.__selflearn.root.querySelector('[data-study-action="finish"]').click());
 await page.waitForFunction(()=>{
  const raw=localStorage.getItem("renzo-world-v2:selflearn-ui-mock-20261013");
  return JSON.parse(raw||"{}").learningSettings?.placement?.total===15;
 });
 console.log("OK: 15-question orientation test saved");
}finally{await browser.close();}
