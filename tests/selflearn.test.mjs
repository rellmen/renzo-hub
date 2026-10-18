import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../microapps/selflearn/engine.js";
import {fsrs, createEmptyCard, Rating} from "../microapps/selflearn/fsrs-bundle.js";

const LEGACY_IDS = ["a0-1","a0-2","a0-3","a0-4","a0-5",...[0,1,2,3,4,5,6].map(i=>`a1-legacy-${i}`),"a1-8","a1-9","a1-10","a1-11","a1-12","a2-1","a2-2","a2-3","a2-4","a2-5","a2-6","b1-1","b1-2","b1-3","b1-4","b1-5","b2-1","b2-2","b2-3","b2-4","b2-5"];

test("SelfLearn: dos cursos completos (Nederlands A0–B2 e English B1–C2) con unidades válidas",()=>{
 assert.deepEqual(E.COURSES.nl.levels.map(l=>l.id),["A0","A1","A2","B1","B2"]);
 assert.deepEqual(E.COURSES.en.levels.map(l=>l.id),["B1","B2","C1","C2"]);
 for(const c of E.COURSE_IDS){
  const units=E.courseUnits(c);
  assert.equal(new Set(units.map(u=>u.id)).size,units.length,`${c}: IDs repetidos`);
  for(const level of E.COURSES[c].levels)assert.ok(units.filter(u=>u.level===level.id).length>=8,`${c} ${level.id}: pocas unidades`);
  for(const u of units){
   assert.ok(u.words.length>=8&&u.words.every(w=>w.length===2&&w[0]&&w[1]),`${u.id}: palabras`);
   assert.ok(u.sentences.length>=4&&u.sentences.every(s=>s.length===2&&s[0]&&s[1]),`${u.id}: frases`);
   assert.ok(u.grammar.title&&u.grammar.text,`${u.id}: gramática`);
   assert.ok(u.dialogue.length>=2&&u.dialogue.every(d=>d.who&&d.t&&d.es),`${u.id}: diálogo`);
  }
 }
 assert.ok(E.courseUnits("nl").length>=60);assert.ok(E.courseUnits("en").length>=40);
});

test("SelfLearn: se conservan los 33 IDs antiguos para no perder el progreso histórico",()=>{
 const ids=new Set(E.courseUnits("nl").map(u=>u.id));
 assert.deepEqual(LEGACY_IDS.filter(id=>!ids.has(id)),[]);
 // Registros antiguos: "Study path" aprobado y "Daily lesson" con lessonDay de las 7 lecciones de logística.
 const entries=[
  {kind:"learning",practice:"Study path",courseLessonId:"a0-1",passed:true},
  {kind:"learning",practice:"Study path",courseLessonId:"a0-2",passed:false},
  {kind:"learning",practice:"Daily lesson",lessonDay:3}
 ];
 const done=E.completedUnitIds(entries,"nl");
 assert.ok(done.has("a0-1"));assert.ok(!done.has("a0-2"));assert.ok(done.has("a1-legacy-3"));
});

test("SelfLearn: cada lección genera ejercicios variados y respuestas siempre presentes en las opciones",()=>{
 for(const c of E.COURSE_IDS)for(const u of E.courseUnits(c))for(const minutes of [5,10,20]){
  const run=E.buildLesson(c,u.id,{minutes,seed:123});
  const types=new Set(run.steps.map(s=>s.type));
  for(const t of ["learn","choice","grammar","match","listen","build"])assert.ok(types.has(t),`${u.id}/${minutes}: falta ${t}`);
  assert.ok(run.steps.filter(E.isGraded).length>=9,`${u.id}: pocos ejercicios`);
  for(const s of run.steps){
   if(s.options){assert.ok(s.options.some(o=>E.normalize(o)===E.normalize(s.answer)),`${u.id} ${s.type}: falta la respuesta`);assert.ok(s.options.length>=2);}
   if(s.type==="build")assert.ok(s.answer.every(t=>s.tiles.includes(t)),`${u.id}: fichas incompletas`);
   if(s.type==="match")assert.deepEqual([...s.rights].sort(),s.pairs.map(p=>p[1]).sort());
  }
  assert.ok(E.validRun(JSON.parse(JSON.stringify(run))),`${u.id}: el run no sobrevive a JSON`);
 }
});

test("SelfLearn: un fallo se repite al final y la lección se completa sin umbral bloqueante",()=>{
 const run=E.buildLesson("nl","a2-3",{minutes:10,seed:1}),initial=run.queue.length;
 let failedOnce=false;
 while(!E.isComplete(run)){
  const step=E.currentStep(run);
  const ok=E.isGraded(step)&&!failedOnce?(failedOnce=true,false):true;
  E.answer(run,ok);E.advance(run);
 }
 assert.equal(run.queue.length,initial+1);
 const sc=E.score(run);assert.equal(sc.correct,sc.total-1);
 assert.equal(E.mistakeWords(run).length<=1,true);
});

test("SelfLearn: corrección escrita tolera mayúsculas, acentos, artículo y una errata",()=>{
 assert.deepEqual(E.checkTyped("Voorraad","de voorraad","nl"),{ok:true,typo:false});
 assert.deepEqual(E.checkTyped("winkle","de winkel","nl"),{ok:true,typo:true});
 assert.deepEqual(E.checkTyped("efficient","efficiënt","nl"),{ok:true,typo:false});
 assert.equal(E.checkTyped("huis","de winkel","nl").ok,false);
 assert.equal(E.checkTyped("","insight","en").ok,false);
 assert.ok(E.checkBuild(["ik","werk","in","een","magazijn."],["Ik","werk","in","een","magazijn."]));
});

test("SelfLearn: la sesión a medias más reciente gana al fusionar dispositivos",()=>{
 const a=E.buildLesson("en","en-b1-1",{seed:5}),b=JSON.parse(JSON.stringify(a));
 E.answer(b,true);E.advance(b);b.updatedAt=a.updatedAt+1000;
 assert.equal(E.newerRun(a,b),b);assert.equal(E.newerRun(b,a),b);
 assert.equal(E.newerRun(null,a),a);assert.equal(E.newerRun({version:1},null),null);
});

test("SelfLearn: siguiente unidad, foco, ajustes por curso y diagnóstico",()=>{
 assert.equal(E.nextUnit("nl",[],{startingLevel:"A0"}).id,"a0-1");
 assert.equal(E.nextUnit("nl",[{kind:"learning",practice:"Study path",courseLessonId:"a0-1",passed:true}],{startingLevel:"A0"}).id,"a0-2");
 assert.equal(E.nextUnit("nl",[],{startingLevel:"A2",focus:"Logística"}).topic,"Logística");
 assert.equal(E.nextUnit("en",[],{}).id,"en-b1-1");
 assert.equal(E.courseSettings({courses:{en:{startingLevel:"C1"}}},"en").startingLevel,"C1");
 assert.equal(E.courseSettings({startingLevel:"Z9"},"nl").startingLevel,"A1");
 const d=E.buildDiagnostic("en",{seed:9});assert.equal(d.steps.length,12);
 for(const s of d.steps)d.firstTry[s.id]=["B1","B2"].includes(s.level);
 assert.equal(E.recommendLevel("en",d).recommended,"C1");
});

test("SelfLearn: repaso FSRS desde tarjetas vencidas",()=>{
 const cards=[{id:"1",front:"de voorraad",back:"el stock"},{id:"2",front:"tellen",back:"contar"},{id:"3",front:"het verschil",back:"la diferencia"}];
 const run=E.buildReview("nl",cards,{seed:3});
 assert.equal(run.steps.length,3);assert.ok(run.steps.every(s=>s.cardId));
 assert.equal(E.buildReview("nl",[]),null);
});

test("SelfLearn: FSRS permite ratings y serialización para sincronizar vocabulario",()=>{
 const card=createEmptyCard(new Date("2026-10-13T10:00:00.000Z"));
 const f=fsrs();
 const result=f.next(card,new Date("2026-10-13T10:00:00.000Z"),Rating.Good);
 assert.ok(result.card.due instanceof Date);
 const saved=JSON.parse(JSON.stringify(result.card));
 const revived={...saved,due:new Date(saved.due),last_review:saved.last_review?new Date(saved.last_review):undefined};
 const second=f.next(revived,new Date("2026-10-15T10:00:00.000Z"),Rating.Easy);
 assert.ok(second.card.reps>result.card.reps);
});

test("SelfLearn: racha de días consecutivos",()=>{
 const e=[{kind:"learning",date:"2026-10-15"},{kind:"learning",date:"2026-10-16"},{kind:"learning",date:"2026-10-17"},{kind:"learning",date:"2026-10-13"}];
 assert.equal(E.streak(e,"2026-10-17"),3);assert.equal(E.streak(e,"2026-10-18"),3);assert.equal(E.streak(e,"2026-10-19"),0);
});
