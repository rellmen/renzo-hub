// E2E · Gym 2.45.0 (diseño de Lovable, solo CSS sobre gym.js): pestañas de 44 px, series con campos de 48 px
// y letra de 16 px, sin scroll horizontal ni errores JS. Chromium y WebKit a 375 px y 430 px.
// Supabase SIMULADO: devuelve filas por tabla y tipo de registro. Sin red real.
import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium,webkit}=require('playwright');
const base='https://renzo-hub-2-1-staging.vercel.app';
const UID='33333333-3333-4333-8333-333333333333';
const shots=process.env.GYM_SHOTS||'';
const today=(()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');})();
const ago=n=>{const d=new Date(Date.now()-n*864e5);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
const FIX={
 body_weight:[[40,81.4],[28,80.6],[20,80.1],[12,79.7],[5,79.3],[1,79.0]].map(([d,v])=>({payload:{date:ago(d),value:v},occurred_at:ago(d)+'T12:00:00.000Z'})),
 food_log:[{payload:{date:today,kcal:620,protein:41,meal:'Comida',description:'Arroz con pollo'}},{payload:{date:today,kcal:380,protein:30,meal:'Snack',description:'Skyr'}}],
 gym_sessions:[{workout_date:today,title:'Push A',completed_at:today+'T18:00:00Z'}],
 skin_routine_logs:[{session:'am',completed_steps:[0,1,2]}],
};
FIX.gym_sessions=[]; // gym.js necesita sesiones completas; aquí se prueba la presentación con un plan nuevo
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
  await page.evaluate(()=>{const b=document.createElement('button');b.dataset.open='gym';b.hidden=true;document.body.append(b);b.click();b.remove();});
  await page.locator('#gym .gymtabs').waitFor();
  const tabs=await page.$$eval('#gym .gymtabs > *',els=>els.map(e=>Math.round(e.getBoundingClientRect().height)));
  assert.ok(tabs.length>=6&&tabs.every(h=>h>=44),`pestañas de 44 px: ${tabs}`);
  const views=['train','ranks','trends','progress','plan'];
  for(const v of views){
   await page.locator(`#gym .gymtabs [data-view="${v}"]`).click();
   await page.waitForTimeout(250);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=0,`${v}: scroll horizontal de ${overflow}px a ${width}px`);
   const zoom=await page.evaluate(()=>[...document.querySelectorAll('#gym input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]), #gym select, #gym textarea')].filter(el=>el.offsetParent&&parseFloat(getComputedStyle(el).fontSize)<16).map(el=>el.name||el.className));
   assert.deepEqual(zoom,[],`${v}: campos con letra < 16 px`);
   if(v==='train'){
    await page.locator('#gym [data-start]').first().click();
    await page.locator('#gym .setrow:not(.sethead)').first().waitFor();
    const ov2=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert.ok(ov2<=0,`sesión: scroll horizontal de ${ov2}px a ${width}px`);
    const small=await page.evaluate(()=>[...document.querySelectorAll('#gym button')].filter(el=>el.offsetParent&&el.getBoundingClientRect().height<43.5).map(el=>el.textContent.trim().slice(0,30)));
    assert.deepEqual(small,[],'sesión: botones de menos de 44 px');
    const rows=await page.$$eval('#gym .setrow:not(.sethead) input:not([type=checkbox])',els=>els.filter(e=>e.offsetParent).map(e=>Math.round(e.getBoundingClientRect().height)));
    if(rows.length)assert.ok(rows.every(h=>h>=48),`campos de serie de 48 px: ${rows.slice(0,6)}`);
    console.log(`  ${engine.name()} ${width}px · Entrenar: ${rows.length} campos de serie`);
   }
   if(shots&&engine===webkit){await page.setViewportSize({width,height:2400});await page.waitForTimeout(250);await page.screenshot({path:`${shots}/gym-${v}-${width}.png`});await page.setViewportSize({width,height:900});}
  }
  assert.deepEqual(errors,[],`${engine.name()} ${width}px: errores JS`);
  await context.close();
 }
 await browser.close();
 console.log(`Gym OK · ${engine.name()} a 375 y 430 px: pestañas de 44 px, 5 vistas sin scroll horizontal, campos de 16 px`);
}
