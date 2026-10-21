// SelfLearn E2E sin cuenta real: Supabase simulado EN MEMORIA que conserva los datos entre montajes,
// para comprobar que el progreso sobrevive a cerrar la app a mitad de lección (también sin copia local).
import {createRequire} from "node:module";
import {resolve} from "node:path";
import assert from "node:assert/strict";
const require=createRequire(process.env.PLAYWRIGHT_ROOT?resolve(process.env.PLAYWRIGHT_ROOT,"package.json"):import.meta.url);
const {chromium}=require("playwright");
const browser=await chromium.launch({headless:true});
// Sin service worker (su activación recarga la página) y sin app.js: el test monta world.js directamente.
const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:"block"});
await context.route("**/app.js",r=>r.fulfill({contentType:"text/javascript",body:"export {};"}));
const page=await context.newPage();
const errors=[];page.on("pageerror",e=>errors.push(e.message));
const USER="selflearn-ui-mock-20261017",KEY=`renzo-world-v2:${USER}`;
try{
 await page.goto(process.env.BASE_URL||"http://localhost:4173",{waitUntil:"domcontentloaded"});
 await page.evaluate(({USER,KEY})=>{
  localStorage.removeItem(KEY);
  window.__cloud={state:null,records:new Map(),upserts:0,recordWrites:0};
  const cloud=window.__cloud,clone=x=>JSON.parse(JSON.stringify(x));
  window.__fakeSupabase={from(table){const api={select(){return api},eq(){return api},gte(){return api},
   lte(){return Promise.resolve({data:[],error:null})},
   in(){return Promise.resolve({data:[...cloud.records.values()].map(clone),error:null})},
   maybeSingle(){return Promise.resolve({data:cloud.state?clone(cloud.state):null,error:null})},
   upsert(rows){cloud.upserts++;if(table==="hub_user_state")cloud.state={state:clone(rows.state),updated_at:rows.updated_at};else for(const r of [].concat(rows)){cloud.recordWrites++;cloud.records.set(r.id,{...clone(r),updated_at:new Date().toISOString()});}return Promise.resolve({data:null,error:null});}};return api;}};
  window.__mount=async()=>{
   document.querySelector("#study")?.remove();
   const {mountWorld}=await import("/world.js");
   const root=document.createElement("div");root.id="study";document.body.append(root);
   const app=mountWorld({study:root},()=>({id:USER}),window.__fakeSupabase);
   await app.load();window.__selflearn={app,root};return root.querySelector(".sl-hero h2")?.textContent;
  };
  // Responde correctamente al paso actual leyendo la lección guardada (la misma que ve el usuario).
  window.__answer=async(course="nl",wrong=false)=>{
   const root=window.__selflearn.root,state=JSON.parse(localStorage.getItem(KEY)),run=state.learningRuns[course];
   if(!run)return "no-run";
   const step=run.steps.find(s=>s.id===run.queue[run.index]);if(!step)return "done";
   const norm=t=>String(t).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^\p{L}\p{N}' ]+/gu," ").replace(/\s+/g," ").trim();
   const click=el=>{if(!el)throw Error(`Falta control en paso ${step.type}`);el.click();};
   if(["learn","grammar","speak"].includes(step.type)){click(root.querySelector('[data-sl="next"]'));return step.type;}
   if(["choice","listen","gap","dialogue"].includes(step.type)){
    const opts=[...root.querySelectorAll('[data-sl="choose"]')];
    click(wrong?opts.find(b=>norm(b.textContent)!==norm(step.answer)):opts.find(b=>norm(b.textContent)===norm(step.answer)));
   }else if(step.type==="build"){
    const used=new Set();for(const t of step.answer){const i=step.tiles.findIndex((x,k)=>x===t&&!used.has(k));used.add(i);click(root.querySelector(`[data-sl="build"][data-i="${i}"]`));}
    click(root.querySelector('[data-sl="check-build"]'));
   }else if(step.type==="type"){
    const input=root.querySelector("[data-sl-type]");input.value=wrong?"xxx":step.answer;root.querySelector('form[data-sl-form="type"]').requestSubmit();
   }else if(step.type==="match"){
    for(const [l,r] of step.pairs){click(root.querySelector(`[data-sl="match-left"][data-v="${CSS.escape(l)}"]`));click(root.querySelector(`[data-sl="match-right"][data-v="${CSS.escape(r)}"]`));}
   }
   const fb=root.querySelector(".sl-feedback");if(!fb)throw Error("Sin feedback tras "+step.type);
   const ok=fb.classList.contains("good");click(fb.querySelector('[data-sl="next"]'));return `${step.type}:${ok?"ok":"bad"}`;
  };
 },{USER,KEY});

 const title=await page.evaluate(()=>window.__mount());
 assert.match(title,/Nederlands A0 → B2/);
 const home=await page.evaluate(()=>({tabs:document.querySelectorAll(".sl-tab").length,levels:document.querySelectorAll(".sl-level").length,units:document.querySelectorAll(".sl-unit").length,overflow:document.documentElement.scrollWidth>window.innerWidth}));
 assert.equal(home.tabs,2);assert.equal(home.levels,5);assert.ok(home.units>=60);assert.equal(home.overflow,false);
 console.log(`OK: panel con 2 cursos, 5 niveles y ${home.units} lecciones de neerlandés a 390 px`);

 // Lección: 6 pasos y "cerrar la app" a mitad, borrando incluso la copia local.
 await page.evaluate(()=>document.querySelector('.sl-next [data-sl="start"]').click());
 const done=[];for(let i=0;i<6;i++)done.push(await page.evaluate(()=>window.__answer("nl")));
 await page.waitForTimeout(1600); // subida agrupada a Supabase
 const mid=await page.evaluate(KEY=>{const s=JSON.parse(localStorage.getItem(KEY));return {index:s.learningRuns.nl.index,unit:s.learningRuns.nl.unitId,cloudIndex:window.__cloud.state?.state?.learningRuns?.nl?.index};},KEY);
 assert.equal(mid.index,6);assert.equal(mid.cloudIndex,6,"el paso no llegó a Supabase");
 await page.evaluate(KEY=>localStorage.removeItem(KEY),KEY);
 await page.evaluate(()=>window.__mount());
 const resumed=await page.evaluate(()=>({card:!!document.querySelector(".sl-resume"),text:document.querySelector(".sl-resume small")?.textContent||""}));
 assert.ok(resumed.card,"no aparece la lección a medias tras recargar");assert.match(resumed.text,/^6\//);
 console.log(`OK: lección a medias (${mid.unit}, paso 6) recuperada desde Supabase tras borrar la copia local`);

 // Continuar, fallar un ejercicio y terminar: el fallo se repite al final y la unidad queda completada.
 await page.evaluate(()=>document.querySelector('[data-sl="resume"]').click());
 let failed=false,guard=0,log=[];
 while(guard++<80){
  const r=await page.evaluate(w=>window.__answer("nl",w),!failed&&guard>2);
  if(r==="no-run"||r==="done")break; log.push(r);
  if(!failed&&r.endsWith(":bad"))failed=true;
  if(await page.evaluate(()=>!!document.querySelector(".sl-summary")))break;
 }
 assert.ok(failed,"no se pudo provocar un fallo");
 const summary=await page.evaluate(()=>document.querySelector(".sl-summary")?.textContent||"");
 assert.match(summary,/LECCIÓN COMPLETADA/);assert.match(summary,/Progreso guardado/);
 await page.waitForTimeout(300);
 const after=await page.evaluate(({KEY,unit})=>{const s=JSON.parse(localStorage.getItem(KEY)),cloudRecs=[...window.__cloud.records.values()];return {
  entry:s.entries.find(x=>x.courseLessonId===unit&&x.practice==="Study path"),run:s.learningRuns.nl||null,cards:s.vocabulary.filter(v=>v.course==="nl").length,
  cloudEntry:cloudRecs.some(r=>r.payload.courseLessonId===unit),cloudCards:cloudRecs.filter(r=>r.record_type==="renzo_vocabulary").length,dueNow:s.vocabulary.filter(v=>v.nextReview<=new Date().toLocaleDateString('sv-SE')).length /* día local, como today() de la app */};},{KEY,unit:mid.unit});
 assert.ok(after.entry&&after.entry.passed);assert.ok(after.entry.score<after.entry.totalQuestions,"el fallo debería restar en la nota");
 assert.equal(after.run,null);assert.equal(after.cards,8);assert.ok(after.cloudEntry);assert.equal(after.cloudCards,8);assert.ok(after.dueNow>=1,"la palabra fallada debe quedar para repasar");
 console.log(`OK: lección completada con un fallo repetido (${after.entry.score}/${after.entry.totalQuestions}), 8 tarjetas y registro en Supabase`);

 // Solo se suben los registros que cambian.
 const before=await page.evaluate(()=>window.__cloud.recordWrites);
 await page.evaluate(()=>{document.querySelector('[data-sl="close-summary"]').click();document.querySelector('[data-sl="course"][data-course="en"]').click();});
 await page.waitForTimeout(300);
 const writes=await page.evaluate(b=>window.__cloud.recordWrites-b,before);
 assert.equal(writes,0,`se reenviaron ${writes} registros sin cambios`);
 console.log("OK: cambiar de curso no reenvía registros sin cambios");

 // Curso de inglés: preferencias propias y sesión guardada por separado.
 const en=await page.evaluate(()=>document.querySelector("#study h1").textContent);
 assert.match(en,/English B1 → C2/);
 await page.evaluate(()=>{const f=document.querySelector('form[data-sl-form="settings"]');f.startingLevel.value="B2";f.sessionMinutes.value="5";f.requestSubmit();});
 await page.waitForFunction(()=>document.querySelector(".sl-next .ey")?.textContent.includes("B2"));
 await page.evaluate(()=>document.querySelector('.sl-next [data-sl="start"]').click());
 for(let i=0;i<3;i++)await page.evaluate(()=>window.__answer("en"));
 await page.evaluate(()=>document.querySelector('[data-sl="pause"]').click());
 const enState=await page.evaluate(KEY=>{const s=JSON.parse(localStorage.getItem(KEY));return {en:s.learningSettings.courses?.en,nlLevel:s.learningSettings.startingLevel,run:s.learningRuns.en?.index,active:s.learningSettings.activeCourse};},KEY);
 assert.equal(enState.en.startingLevel,"B2");assert.equal(enState.nlLevel,"A1");assert.equal(enState.run,3);assert.equal(enState.active,"en");
 console.log("OK: inglés con nivel propio (B2), sesión corta y progreso independiente del neerlandés");

 // Repaso FSRS en neerlandés.
 await page.evaluate(()=>document.querySelector('[data-sl="course"][data-course="nl"]').click());
 await page.evaluate(()=>document.querySelector('[data-sl="review"]').click());
 for(let i=0;i<20;i++){const r=await page.evaluate(()=>window.__answer("nl"));if(r==="no-run"||await page.evaluate(()=>!!document.querySelector(".sl-summary")))break;}
 const review=await page.evaluate(KEY=>{const s=JSON.parse(localStorage.getItem(KEY));return {summary:document.querySelector(".sl-summary")?.textContent||"",fsrs:s.vocabulary.filter(v=>v.fsrsCard).length,entry:s.entries.some(x=>x.practice==="Review session")};},KEY);
 assert.match(review.summary,/REPASO COMPLETADO/);assert.ok(review.fsrs>=1);assert.ok(review.entry);
 console.log(`OK: repaso FSRS completado (${review.fsrs} tarjetas reprogramadas)`);

 // Diagnóstico de inglés.
 await page.evaluate(()=>{document.querySelector('[data-sl="close-summary"]').click();document.querySelector('[data-sl="course"][data-course="en"]').click();});
 await page.evaluate(()=>{window.confirm=()=>true;document.querySelector('[data-sl="diagnostic"]').click();});
 for(let i=0;i<12;i++)await page.evaluate(()=>window.__answer("en"));
 const diag=await page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).learningSettings.courses.en.placement,KEY);
 assert.equal(diag.total,12);assert.equal(diag.recommended,"C2");
 console.log("OK: diagnóstico de inglés guardado (recomienda C2 con 12/12)");
 // Cerrar sesión justo después de responder y abrir en "otro dispositivo" (sin copia local).
 // Antes de 2.42.0, reset() llegaba tras signOut() y la última respuesta (aún en el temporizador de 1,2 s) no subía.
 await page.evaluate(()=>{document.querySelector('[data-sl="close-summary"]')?.click();document.querySelector('[data-sl="course"][data-course="nl"]').click();});
 await page.evaluate(()=>document.querySelector('.sl-next [data-sl="start"]').click());
 await page.evaluate(()=>window.__answer("nl"));await page.evaluate(()=>window.__answer("nl"));
 const beforeLogout=await page.evaluate(KEY=>({local:JSON.parse(localStorage.getItem(KEY)).learningRuns.nl.index,cloud:window.__cloud.state?.state?.learningRuns?.nl?.index??null}),KEY);
 assert.equal(beforeLogout.local,2);assert.notEqual(beforeLogout.cloud,2,"la subida debería estar aún agrupada (control del test)");
 await page.evaluate(async()=>{await window.__selflearn.app.flush();window.__selflearn.app.reset();});
 await page.evaluate(KEY=>localStorage.removeItem(KEY),KEY);
 await page.evaluate(()=>window.__mount());
 const otherDevice=await page.evaluate(()=>({cloud:window.__cloud.state?.state?.learningRuns?.nl?.index,resume:document.querySelector(".sl-resume small")?.textContent||""}));
 assert.equal(otherDevice.cloud,2,"la respuesta previa a cerrar sesión no llegó a Supabase");assert.match(otherDevice.resume,/^2\//);
 console.log("OK: cerrar sesión 0,1 s después de responder conserva el progreso en otro dispositivo");
 assert.deepEqual(errors,[],"errores de JavaScript en la página");
}finally{await browser.close();}
