// E2E · Body 2.44.0 (diseño de Lovable): resumen de hoy con datos reales simulados, accesos a Gym/Food/Skin
// y registro corporal. Chromium y WebKit a 375 px y 430 px, sin scroll horizontal ni errores JS.
// Supabase SIMULADO: devuelve filas por tabla y tipo de registro. Sin red real.
import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium,webkit}=require('playwright');
const base='https://renzo-hub-2-1-staging.vercel.app';
const UID='33333333-3333-4333-8333-333333333333';
const shots=process.env.BODY_SHOTS||'';
const today=(()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');})();
const ago=n=>{const d=new Date(Date.now()-n*864e5);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
const FIX={
 body_weight:[[40,81.4],[28,80.6],[20,80.1],[12,79.7],[5,79.3],[1,79.0]].map(([d,v])=>({payload:{date:ago(d),value:v},occurred_at:ago(d)+'T12:00:00.000Z'})),
 food_log:[{payload:{date:today,kcal:620,protein:41,meal:'Comida',description:'Arroz con pollo'}},{payload:{date:today,kcal:380,protein:30,meal:'Snack',description:'Skyr'}}],
 gym_sessions:[{workout_date:today,title:'Push A',completed_at:today+'T18:00:00Z'}],
 skin_routine_logs:[{session:'am',completed_steps:[0,1,2]}],
};
const mock=`const FIX=${JSON.stringify(FIX)};export function createClient(){
 let user=null,authCb;
 const db={from(table){let single=false,type=null;const q=new Proxy({}, {get(_,key){if(key==='then'){const rows=table==='hub_records'?(FIX[type]||[]):(FIX[table]||[]);return (ok,bad)=>Promise.resolve({data:single?null:rows,error:null,count:rows.length}).then(ok,bad);}return (...a)=>{if(key==='maybeSingle'||key==='single')single=true;if(key==='eq'&&a[0]==='record_type')type=a[1];return q;};}});return q;},
  channel(){const ch={on(){return ch;},subscribe(){return ch;}};return ch;},removeChannel(){},rpc:async()=>({data:null,error:null}),
  storage:{from:()=>({download:async()=>({data:null,error:null}),upload:async()=>({data:null,error:null}),list:async()=>({data:[],error:null})})},
  functions:{invoke:async()=>({data:null,error:null})},
  auth:{onAuthStateChange(cb){authCb=cb;return {data:{subscription:{unsubscribe(){}}}};},getSession:async()=>({data:{session:user?{user,access_token:'t'}:null}}),getUser:async()=>({data:{user}}),
   updateUser:async()=>({data:{user},error:null}),signInWithPassword:async()=>{user={id:'${UID}',email:'demo@example.test',user_metadata:{gym_goals:{priority:'x',sessionsPerWeek:4,targetWeight:76}}};authCb('SIGNED_IN',{user});return {};},signOut:async()=>{user=null;authCb('SIGNED_OUT',null);return {};}}};
 return db;}`;
const TYPES={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpeg':'image/jpeg','.jpg':'image/jpeg','.woff2':'font/woff2'};
if(shots)await mkdir(shots,{recursive:true});
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
  await page.evaluate(()=>{const b=document.createElement('button');b.dataset.open='body';b.hidden=true;document.body.append(b);b.click();b.remove();});
  const ov=page.locator('#bodyOverview');
  await ov.locator('.body-w-value').waitFor();
  const text=await ov.innerText();
  assert.match(text,/79,0\s*kg/,'peso actual real');
  assert.match(text,/-1,6 kg/,'cambio en 30 días (80,6 → 79,0)');
  assert.match(text,/Meta 76,0 kg/);
  assert.match(text,/1\/4 sesiones esta semana/);
  assert.match(text,/71 g proteína · 1000 kcal/);
  assert.match(text,/AM hecho · PM pendiente/);
  assert.equal(await page.locator('[data-body-mod="gym"]').innerText(),'Push A');
  assert.equal(await page.locator('[data-body-mod="food"]').innerText(),'71 g proteína');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<=0,`scroll horizontal de ${overflow}px a ${width}px`);
  const small=await page.evaluate(()=>[...document.querySelectorAll('#body button, #body input, #body select, #body textarea')].filter(el=>el.offsetParent&&el.getBoundingClientRect().height<43.5).map(el=>el.outerHTML.slice(0,60)));
  assert.deepEqual(small,[],'zonas táctiles de menos de 44 px');
  const zoom=await page.evaluate(()=>[...document.querySelectorAll('#body input, #body select, #body textarea')].filter(el=>el.offsetParent&&parseFloat(getComputedStyle(el).fontSize)<16).length);
  assert.equal(zoom,0,'campos con letra < 16 px (zoom en iPhone)');
  if(shots&&engine===webkit){await page.setViewportSize({width,height:2600});await page.waitForTimeout(300);await page.screenshot({path:`${shots}/body-${width}.png`});await page.setViewportSize({width,height:900});}
  // Los accesos llevan a sus microapps
  await page.locator('#body .body-mod[data-open="gym"]').click();
  await page.waitForFunction(()=>document.body.dataset.activeSection==='gym');
  assert.deepEqual(errors,[],`${engine.name()} ${width}px: errores JS`);
  await context.close();
 }
 await browser.close();
 console.log(`Body OK · ${engine.name()} a 375 y 430 px: datos reales, meta, semana, comida, skin, accesos y sin scroll horizontal`);
}
