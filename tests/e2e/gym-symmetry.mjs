// Gym tipo Symmetry: progresión automática precargada, récord al guardar serie, descanso, resumen y rangos.
// Sin cuenta real: Supabase simulado en memoria con dos sesiones previas.
import {createRequire} from "node:module";
import {resolve} from "node:path";
import assert from "node:assert/strict";
const require=createRequire(process.env.PLAYWRIGHT_ROOT?resolve(process.env.PLAYWRIGHT_ROOT,"package.json"):import.meta.url);
const {chromium}=require("playwright");
const shots=process.env.SHOTS||"";
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:"block"});
await context.route("**/app.js",r=>r.fulfill({contentType:"text/javascript",body:"export {};"}));
const page=await context.newPage();
const errors=[];page.on("pageerror",e=>errors.push(e.message));
try{
 await page.goto(process.env.BASE_URL||"http://localhost:4173",{waitUntil:"domcontentloaded"});
 await page.evaluate(async()=>{
  const day=(d,w)=>({id:crypto.randomUUID(),user_id:"u1",workout_date:d,day:0,title:"Espalda + Bíceps",started_at:d+"T18:00:00Z",completed_at:d+"T19:00:00Z",duration_minutes:55,body_weight:82,cardio_minutes:0,exercises:[
   {name:"Lat Pulldown",min:6,max:10,muscle:"Espalda",compound:true,sets:[1,2,3,4].map(()=>({weight:w,reps:10,rir:2,completed:true}))},
   {name:"EZ Bar Curl",min:6,max:10,muscle:"Bíceps",compound:false,sets:[1,2,3].map(()=>({weight:25,reps:8,rir:1,completed:true}))}]});
  const store={sessions:[day("2026-10-08",57.5),day("2026-10-13",60)],plans:null,upserts:0};window.__store=store;
  const q=table=>{const api={select(){return api},eq(){return api},order(){return Promise.resolve({data:table==="gym_sessions"?structuredClone(store.sessions):[],error:null})},maybeSingle(){return Promise.resolve({data:null,error:null})},
   upsert(rec){store.upserts++;if(table==="gym_sessions"){store.sessions=[structuredClone(rec),...store.sessions.filter(r=>r.id!==rec.id)];}return Promise.resolve({error:null});}};return api;};
  const db={from:q,auth:{updateUser:async()=>({error:null})}};
  // Conserva las hojas de estilo del final del <body> (editorial y Gym) y muestra solo Gym.
  const links=[...document.body.querySelectorAll('link[rel="stylesheet"]')];
  document.body.innerHTML='<section id="gym" class="page active"><div id="gymRoot"></div></section>';links.forEach(l=>document.head.append(l));
  const {mountGym}=await import("/gym.js");
  const app=mountGym(document.getElementById("gymRoot"),db,()=>({id:"u1",user_metadata:{}}));
  await app.load();window.__gym=app;
 });
 await page.waitForFunction(()=>document.querySelector("#gymStatus")?.textContent.includes("Sincronizado"));
 const tabs=await page.$$eval("#gym .gymtabs .switch",n=>n.map(x=>x.textContent.trim()));
 assert.deepEqual(tabs.slice(0,5),["Entrenar","Rangos","Fuerza","Progreso","Rutinas"]);
 console.log("OK: pestañas simplificadas + menú Más");

 await page.click('[data-start="0"]');
 await page.waitForSelector("#workoutForm");
 const pre=await page.evaluate(()=>({w:document.querySelector('[name="w-0-0"]').value,r:document.querySelector('[name="r-0-0"]').value,target:document.querySelector(".gym-target")?.textContent||"",tech:!!document.querySelector(".gym-tech"),plates:document.querySelector('[data-plates]')?.dataset.plates}));
 assert.equal(pre.w,"62.5");assert.equal(pre.r,"6");assert.match(pre.target,/Sube carga/);assert.ok(pre.tech);assert.equal(pre.plates,"4");
 console.log("OK: progresión automática precargada (60 kg × 10 ×4 → 62,5 kg × 6) + técnica + discos");
 if(shots)await page.screenshot({path:shots+"/gym-train.png"});

 await page.click('[data-plates="4"]');
 assert.match(await page.textContent('[data-plates-out="4"]'),/barra 10 kg/);
 await page.fill('[name="w-0-0"]',"70");await page.fill('[name="r-0-0"]',"8");
 await page.click('[data-quick-done="0-0"]');
 await page.waitForFunction(()=>document.querySelector("#gymToast")?.classList.contains("on"));
 assert.match(await page.textContent("#gymToast"),/Nuevo récord en Lat Pulldown/);
 await page.waitForFunction(()=>!document.getElementById("gymRestTimer")?.hidden);
 assert.match(await page.textContent(".gym-rest-label"),/Lat Pulldown/);
 console.log("OK: aviso de récord y temporizador de descanso al guardar la serie");
 if(shots)await page.screenshot({path:shots+"/gym-rest.png"});
 await page.click('[data-rest="skip"]');

 await page.click('#workoutForm button[type="submit"]');
 await page.waitForSelector(".gym-summary");
 const sum=await page.textContent(".gym-summary");
 assert.match(sum,/Récords/);assert.match(sum,/Lat Pulldown/);
 console.log("OK: resumen de sesión con récords");
 if(shots)await page.screenshot({path:shots+"/gym-summary.png"});

 await page.click('[data-view="ranks"]');
 await page.waitForSelector(".gym-rank-hero");
 const ranks=await page.evaluate(()=>({global:document.querySelector(".gym-rank-hero h2").textContent,filled:document.querySelectorAll(".gym-body-rank[style]").length,rows:document.querySelectorAll(".gym-rank-ex").length}));
 assert.ok(ranks.global.length>3);assert.ok(ranks.filled>=2);assert.equal(ranks.rows,2);
 console.log(`OK: rangos (global ${ranks.global}, ${ranks.filled} zonas coloreadas)`);
 if(shots)await page.screenshot({path:shots+"/gym-ranks.png",fullPage:true});

 await page.selectOption("[data-more]","photos");
 await page.waitForFunction(()=>/Fotos de progreso/.test(document.querySelector("#gymContent")?.textContent||""));
 console.log("OK: menú Más abre Fotos de progreso");
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
 assert.equal(overflow,false,"scroll horizontal a 390 px");
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
