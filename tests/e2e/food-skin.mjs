// E2E · Food y Skin 2.47.0 (diseño de Lovable): Hoy frente al perfil, chips de comida, comidas agrupadas,
// compra con casillas, Mañana/Noche segmentado y pasos grandes. Chromium y WebKit a 375 y 430 px.
// Supabase SIMULADO: devuelve filas por tabla y tipo de registro. Sin red real.
import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium,webkit}=require('playwright');
const base='https://renzo-hub-2-1-staging.vercel.app';
const UID='33333333-3333-4333-8333-333333333333';
const shots=process.env.FS_SHOTS||'';
const today=(()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');})();
const ago=n=>{const d=new Date(Date.now()-n*864e5);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
const FIX={
 body_weight:[[40,81.4],[28,80.6],[20,80.1],[12,79.7],[5,79.3],[1,79.0]].map(([d,v])=>({payload:{date:ago(d),value:v},occurred_at:ago(d)+'T12:00:00.000Z'})),
 food_log:[{payload:{date:today,kcal:620,protein:41,meal:'Comida',description:'Arroz con pollo'}},{payload:{date:today,kcal:380,protein:30,meal:'Snack',description:'Skyr'}}],
 gym_sessions:[{workout_date:today,title:'Push A',completed_at:today+'T18:00:00Z'}],
 skin_routine_logs:[],
 user_settings:[{settings:{bodyProfile:{kcalMin:2200,kcalMax:2400,proteinMin:140,proteinMax:160,budgetMin:180,budgetMax:230}}}],
};
const mock=`const FIX=${JSON.stringify(FIX)};export function createClient(){
 let user=null,authCb;
 const db={from(table){let single=false,type=null;const q=new Proxy({}, {get(_,key){if(key==='then'){const rows=table==='hub_records'?(FIX[type]||[]):(FIX[table]||[]);return (ok,bad)=>Promise.resolve({data:single?(rows[0]||null):rows,error:null,count:rows.length}).then(ok,bad);}return (...a)=>{if(key==='maybeSingle'||key==='single')single=true;if(key==='eq'&&a[0]==='record_type')type=a[1];return q;};}});return q;},
  channel(){const ch={on(){return ch;},subscribe(){return ch;}};return ch;},removeChannel(){},rpc:async()=>({data:null,error:null}),
  storage:{from:()=>({download:async()=>({data:null,error:null}),upload:async()=>({data:null,error:null}),list:async()=>({data:[],error:null})})},
  functions:{invoke:async()=>({data:null,error:null})},
  auth:{onAuthStateChange(cb){authCb=cb;return {data:{subscription:{unsubscribe(){}}}};},getSession:async()=>({data:{session:user?{user,access_token:'t'}:null}}),getUser:async()=>({data:{user}}),
   updateUser:async()=>({data:{user},error:null}),signInWithPassword:async()=>{user={id:'${UID}',email:'demo@example.test',user_metadata:{gym_goals:{priority:'x',sessionsPerWeek:4,targetWeight:76}}};authCb('SIGNED_IN',{user});return {};},signOut:async()=>{user=null;authCb('SIGNED_OUT',null);return {};}}};
 return db;}`;
const TYPES={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpeg':'image/jpeg','.jpg':'image/jpeg','.woff2':'font/woff2'};
if(shots)await mkdir(shots,{recursive:true});
const open=(page,id)=>page.evaluate(id=>{const b=document.createElement('button');b.dataset.open=id;b.hidden=true;document.body.append(b);b.click();b.remove();},id);
for(const engine of [chromium,webkit]){
 const browser=await engine.launch();
 for(const width of [375,430]){
  const context=await browser.newContext({viewport:{width,height:900},isMobile:engine===chromium,hasTouch:true,serviceWorkers:'block',deviceScaleFactor:2});
  const page=await context.newPage();page.setDefaultTimeout(15000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await context.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({contentType:'text/javascript',body:mock}));
  await context.route(base+'/**',async r=>{
   const path=new URL(r.request().url()).pathname;
   if(path==='/api/supabase-config')return r.fulfill({json:{supabaseUrl:'https://example.supabase.co',publishableKey:'test-public'}});
   if(path.startsWith('/api/'))return r.fulfill({json:{}});
   const file=path==='/'?'index.html':'.'+path;
   try{return r.fulfill({body:await readFile(resolve(file)),contentType:TYPES[extname(file)]||'application/octet-stream'});}catch{return r.fulfill({status:404,body:''});}
  });
  await page.goto(base+'/');
  await page.locator('#email').fill('demo@example.test');await page.locator('#password').fill('fake-test-password');
  await page.locator('#loginForm button[type=submit]').click();
  await page.locator('#authScreen').waitFor({state:'hidden'});
  const check=async where=>{
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=0,`${where}: scroll horizontal de ${overflow}px a ${width}px`);
   const sec=where.split(' ')[0].toLowerCase();
   const small=await page.evaluate(sec=>[...document.querySelectorAll(`#${sec} button, #${sec} input:not([type=checkbox]):not([type=radio]), #${sec} select, #${sec} textarea`)].filter(el=>el.offsetParent&&el.getBoundingClientRect().height<43.5).map(el=>el.outerHTML.slice(0,70)),sec);
   assert.deepEqual(small,[],`${where}: zonas táctiles de menos de 44 px`);
   const zoom=await page.evaluate(sec=>[...document.querySelectorAll(`#${sec} input:not([type=checkbox]):not([type=radio]), #${sec} select, #${sec} textarea`)].filter(el=>el.offsetParent&&parseFloat(getComputedStyle(el).fontSize)<16).length,sec);
   assert.equal(zoom,0,`${where}: campos con letra < 16 px`);
  };
  // Food
  await open(page,'food');
  await page.locator('#foodToday .food-meter').first().waitFor();
  // El resumen se pinta al momento y se completa cuando Food termina de cargar las comidas de hoy
  await page.waitForFunction(()=>/1000\s*kcal/.test(document.getElementById('foodToday')?.innerText||''));
  const today=await page.locator('#foodToday').innerText();
  assert.match(today,/1000\s*kcal/);assert.match(today,/Faltan 1200 kcal para el mínimo/);assert.match(today,/Faltan 69 g para el mínimo/);
  assert.equal(await page.locator('#p1Food .food-meal').count(),4);
  assert.equal(await page.locator('#p1Food .food-group').count(),2,'comidas agrupadas: Comida y Snack');
  const box=page.locator('#food .food-shop-check').first();await box.check();
  assert.ok(await page.locator('#food .food-list > div.food-bought').count()===1,'compra marcada');
  await check('Food');
  if(shots&&engine===webkit){await page.setViewportSize({width,height:2600});await page.waitForTimeout(250);await page.screenshot({path:`${shots}/food-${width}.png`});await page.setViewportSize({width,height:900});}
  // Skin
  await open(page,'skin');
  await page.locator('#steps .step').first().waitFor();
  const pm=page.locator('[data-skin-mode="pm"]');await pm.click();
  assert.equal(await pm.getAttribute('aria-pressed'),'true');assert.equal((await page.textContent('#pill')).trim(),'NOCHE');
  await page.locator('[data-skin-mode="am"]').click();
  const steps=await page.locator('#steps .step .check').count();assert.ok(steps>=2,'pasos de mañana');
  for(let i=0;i<steps;i++)await page.locator('#steps .step .check').nth(i).click();
  await page.locator('#steps .skin-finished').waitFor();
  assert.match(await page.textContent('#prog'),new RegExp(`${steps} de ${steps} pasos · 100%`));
  await check('Skin');
  if(shots&&engine===webkit){await page.setViewportSize({width,height:2600});await page.waitForTimeout(250);await page.screenshot({path:`${shots}/skin-${width}.png`});await page.setViewportSize({width,height:900});}
  assert.deepEqual(errors,[],`${engine.name()} ${width}px: errores JS`);
  await context.close();
 }
 await browser.close();
 console.log(`Food y Skin OK · ${engine.name()} a 375 y 430 px: Hoy frente al perfil, chips, grupos, compra, Mañana/Noche y rutina terminada`);
}
