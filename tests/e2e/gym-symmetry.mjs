// Gym tipo Symmetry: progresión automática precargada, récord al guardar serie, descanso, resumen, rangos,
// rutina por preguntas (sin guardar hasta confirmar) y fotos privadas con comparador.
// Sin cuenta real: Supabase simulado en memoria con dos sesiones previas.
import {createRequire} from "node:module";
import {resolve} from "node:path";
import assert from "node:assert/strict";
const require=createRequire(process.env.PLAYWRIGHT_ROOT?resolve(process.env.PLAYWRIGHT_ROOT,"package.json"):import.meta.url);
const pw=require("playwright");const engine=pw[process.env.BROWSER||"chromium"];
const shots=process.env.SHOTS||"";
const browser=await engine.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:"block"});
await context.route("**/app.js",r=>r.fulfill({contentType:"text/javascript",body:"export {};"}));
const page=await context.newPage();
const errors=[];page.on("pageerror",e=>errors.push(e.message));
try{
 await page.goto(process.env.BASE_URL||"http://localhost:4173",{waitUntil:"domcontentloaded"});
 await page.evaluate(async()=>{
  const UID="11111111-2222-4333-8444-555555555555";window.__uid=UID;
  const day=(d,w)=>({id:crypto.randomUUID(),user_id:UID,workout_date:d,day:0,title:"Espalda + Bíceps",started_at:d+"T18:00:00Z",completed_at:d+"T19:00:00Z",duration_minutes:55,body_weight:82,cardio_minutes:0,exercises:[
   {name:"Lat Pulldown",min:6,max:10,muscle:"Espalda",compound:true,sets:[1,2,3,4].map(()=>({weight:w,reps:10,rir:2,completed:true}))},
   {name:"EZ Bar Curl",min:6,max:10,muscle:"Bíceps",compound:false,sets:[1,2,3].map(()=>({weight:25,reps:8,rir:1,completed:true}))}]});
  const store={sessions:[day("2026-10-08",57.5),day("2026-10-13",60)],plans:null,upserts:0,planUpserts:0,files:new Map()};window.__store=store;
  const q=table=>{const api={select(){return api},eq(){return api},order(){return Promise.resolve({data:table==="gym_sessions"?structuredClone(store.sessions):[],error:null})},maybeSingle(){return Promise.resolve({data:null,error:null})},
   upsert(rec){store.upserts++;if(table==="gym_plans")store.planUpserts++;if(table==="gym_sessions"){store.sessions=[structuredClone(rec),...store.sessions.filter(r=>r.id!==rec.id)];}return Promise.resolve({error:null});}};return api;};
  // Storage privado simulado: guarda los archivos en memoria y devuelve URLs blob: (las permite la CSP).
  const bucket={
   async upload(path,file){if(store.files.has(path))return {data:null,error:{message:"existe"}};store.files.set(path,file);return {data:{path},error:null};},
   async list(dir){return {data:[...store.files.keys()].filter(k=>k.startsWith(dir+"/")).map(k=>({name:k.slice(dir.length+1)})),error:null};},
   async createSignedUrls(paths){return {data:paths.map(p=>({path:p,signedUrl:store.files.has(p)?URL.createObjectURL(store.files.get(p)):null})),error:null};},
   async remove(paths){paths.forEach(p=>store.files.delete(p));return {data:null,error:null};}
  };
  const db={from:q,auth:{updateUser:async()=>({error:null})},storage:{from:()=>bucket}};
  // Conserva las hojas de estilo del final del <body> (editorial y Gym) y muestra solo Gym.
  const links=[...document.body.querySelectorAll('link[rel="stylesheet"]')];
  document.body.innerHTML='<section id="gym" class="page active"><div id="gymRoot"></div></section>';links.forEach(l=>document.head.append(l));
  const {mountGym}=await import("/gym.js");
  const app=mountGym(document.getElementById("gymRoot"),db,()=>({id:UID,user_metadata:{}}));
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

 // Rutina por preguntas: propuesta visible, se carga como borrador y solo se guarda al confirmar.
 await page.click('[data-view="plan"]');
 assert.ok(await page.$$eval('[data-ex-library="0"] optgroup',g=>g.length)>=8,"biblioteca agrupada por músculo");
 assert.ok(await page.$$eval('[data-ex-library="0"] option',o=>o.length)>=80,"≥80 ejercicios en el editor");
 await page.click("[data-onboard] summary");
 await page.selectOption('[data-onboard-form] [name="days"]',"3");
 await page.selectOption('[data-onboard-form] [name="goal"]',"strength");
 await page.click('[data-onboard-form] button[type="submit"]');
 await page.waitForSelector(".gym-onboard-day");
 assert.equal(await page.$$eval(".gym-onboard-day",d=>d.length),5);
 const before=await page.evaluate(()=>window.__store.planUpserts);
 await page.click("[data-onboard-use]");
 await page.waitForFunction(()=>/Propuesta cargada/.test(document.querySelector("#gymStatus")?.textContent||""));
 assert.equal(await page.inputValue('[data-day-title="0"]'),"Empuje · pecho, hombro y tríceps");
 assert.equal(await page.inputValue('[data-day-cardio="0"]'),"15-20");
 assert.equal(await page.evaluate(()=>window.__store.planUpserts),before,"no guarda sin confirmar");
 await page.click("#gymSavePlan");
 await page.waitForFunction(b=>window.__store.planUpserts===b+1,before);
 console.log("OK: rutina por 3 preguntas → borrador revisable → guardada solo al confirmar; biblioteca ≥80 por músculo");
 if(shots)await page.screenshot({path:shots+"/gym-onboarding.png",fullPage:true});

 // Fotos privadas: subir dos (con fecha), comparar con deslizador, borrar.
 await page.selectOption("[data-more]","photos");
 await page.waitForFunction(()=>/Aún no hay fotos/.test(document.querySelector("#gymContent")?.textContent||""));
 const addPhoto=async(date,hue)=>{
  await page.evaluate(async hue=>{const c=document.createElement("canvas");c.width=1200;c.height=1600;const x=c.getContext("2d");x.fillStyle=`hsl(${hue},40%,40%)`;x.fillRect(0,0,1200,1600);const blob=await new Promise(r=>c.toBlob(r,"image/png"));const dt=new DataTransfer();dt.items.add(new File([blob],"foto.png",{type:"image/png"}));const input=document.querySelector('[data-photo-form] [name="file"]');input.files=dt.files;},hue);
  await page.fill('[data-photo-form] [name="date"]',date);
  const n=await page.evaluate(()=>window.__store.files.size);
  await page.click('[data-photo-form] button[type="submit"]');
  await page.waitForFunction(n=>window.__store.files.size===n+1&&!document.querySelector('[data-photo-form] button[disabled]'),n);
 };
 await addPhoto("2026-07-20",20);await addPhoto("2026-10-12",200);
 const stored=await page.evaluate(async()=>{const [k,f]=[...window.__store.files][0];const bmp=await createImageBitmap(f);return {k,type:f.type,w:bmp.width,h:bmp.height,uid:window.__uid};});
 assert.match(stored.k,new RegExp(`^${stored.uid}/gym/\\d{4}-\\d{2}-\\d{2}_front_[0-9a-f-]{36}\\.jpg$`));
 assert.equal(stored.type,"image/jpeg");assert.equal(Math.max(stored.w,stored.h),1600,"reducida a 1600 px");
 await page.waitForSelector(".gym-compare-stage");
 assert.equal(await page.$$eval(".gym-photo",f=>f.length),2);
 assert.match(await page.textContent("[data-compare-gap]"),/12 semanas/);
 await page.fill("[data-slider]","30");
 assert.equal(await page.$eval("[data-stage]",s=>s.style.getPropertyValue("--split")),"30%");
 await page.waitForFunction(()=>[...document.querySelectorAll(".gym-compare-stage img")].every(i=>i.complete&&i.naturalWidth>0));
 console.log("OK: fotos privadas en <usuario>/gym, JPEG 1600 px sin EXIF, comparador antes/después (12 semanas)");
 await page.waitForFunction(()=>!document.querySelector("#gymToast")?.classList.contains("on"),null,{timeout:6000});
 if(shots)await page.screenshot({path:shots+"/gym-photos.png",fullPage:true});
 page.once("dialog",d=>d.accept());
 await page.click(".gym-photo-del");
 await page.waitForFunction(()=>document.querySelectorAll(".gym-photo").length===1);
 assert.equal(await page.evaluate(()=>window.__store.files.size),1);
 console.log("OK: borrar foto con confirmación");
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
 assert.equal(overflow,false,"scroll horizontal a 390 px");
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
