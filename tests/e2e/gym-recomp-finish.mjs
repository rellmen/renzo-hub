// E2E · Gym 2.49.0: programa Recomp 12 semanas, sesión olvidada (reloj de 288 h) y botón Finalizar.
// Supabase SIMULADO (sin red real) que apunta cada escritura en window.__writes. Chromium y WebKit a 375 px.
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium,webkit}=require('playwright');
const base='https://renzo-hub-2-1-staging.vercel.app';
const UID='33333333-3333-4333-8333-333333333333';
const daysAgo=n=>new Date(Date.now()-n*864e5).toISOString();
const OLD_PLAN=[0,1,2,3,4].map(i=>[`Día viejo ${i+1}`,'20-30',[['Lat Pulldown',3,8,12,'Espalda',1]]]);
const staleDraft=(done)=>({id:'stale-1',user_id:UID,workout_date:daysAgo(12).slice(0,10),day:0,title:'Espalda + Bíceps',cardio_target:'25-35',started_at:daysAgo(12),completed_at:null,duration_minutes:null,cardio_type:'',cardio_minutes:0,body_weight:null,energy:null,fatigue:null,notes:'',
 exercises:[{name:'Lat Pulldown',min:6,max:10,muscle:'Espalda',compound:true,superset:false,notes:'',sets:[{weight:done?50:null,reps:done?8:null,rir:done?2:null,completed:done},{weight:null,reps:null,rir:null,completed:false}]}]});
const mock=FIX=>`const FIX=${JSON.stringify(FIX)};window.__writes=[];export function createClient(){
 let user=null,authCb;
 const db={from(table){let single=false,type=null,op='select',payload=null;const q=new Proxy({}, {get(_,key){if(key==='then'){if(op!=='select'){window.__writes.push({table,op,payload});return (ok,bad)=>Promise.resolve({data:null,error:null}).then(ok,bad);}const rows=table==='hub_records'?(FIX[type]||[]):(FIX[table]||[]);return (ok,bad)=>Promise.resolve({data:single?(rows[0]??null):rows,error:null,count:rows.length}).then(ok,bad);}return (...a)=>{if(key==='upsert'||key==='insert'||key==='update'){op=key;payload=JSON.parse(JSON.stringify(a[0]));}if(key==='delete')op='delete';if(op==='delete'&&key==='eq'){(payload??={})[a[0]]=a[1];}if(key==='maybeSingle'||key==='single')single=true;if(key==='eq'&&a[0]==='record_type')type=a[1];return q;};}});return q;},
  channel(){const ch={on(){return ch;},subscribe(){return ch;}};return ch;},removeChannel(){},rpc:async()=>({data:null,error:null}),
  storage:{from:()=>({download:async()=>({data:null,error:null}),upload:async()=>({data:null,error:null}),list:async()=>({data:[],error:null})})},
  functions:{invoke:async()=>({data:null,error:null})},
  auth:{onAuthStateChange(cb){authCb=cb;return {data:{subscription:{unsubscribe(){}}}};},getSession:async()=>({data:{session:user?{user,access_token:'t'}:null}}),getUser:async()=>({data:{user}}),
   updateUser:async()=>({data:{user},error:null}),signInWithPassword:async()=>{user={id:'${UID}',email:'demo@example.test',user_metadata:{}};authCb('SIGNED_IN',{user});return {};},signOut:async()=>{user=null;authCb('SIGNED_OUT',null);return {};}}};
 return db;}`;
const TYPES={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpeg':'image/jpeg','.woff2':'font/woff2'};

async function openGym(browser,FIX){
 const context=await browser.newContext({viewport:{width:375,height:900},hasTouch:true,serviceWorkers:'block'});
 const page=await context.newPage();page.setDefaultTimeout(15000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('dialog',d=>d.accept());
 await context.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({contentType:'text/javascript',body:mock(FIX)}));
 await context.route(base+'/**',async r=>{const path=new URL(r.request().url()).pathname;
  if(path==='/api/supabase-config')return r.fulfill({json:{supabaseUrl:'https://example.supabase.co',publishableKey:'test-public'}});
  if(path.startsWith('/api/'))return r.fulfill({json:{}});
  const file=path==='/'?'index.html':'.'+path;
  try{return r.fulfill({body:await readFile(resolve(file)),contentType:TYPES[extname(file)]||'application/octet-stream'});}catch{return r.fulfill({status:404,body:''});}});
 await page.goto(base+'/');
 await page.locator('#email').fill('demo@example.test');await page.locator('#password').fill('fake-test-password');
 await page.locator('#loginForm button[type=submit]').click();
 await page.locator('#authScreen').waitFor({state:'hidden'});
 await page.evaluate(()=>{const b=document.createElement('button');b.dataset.open='gym';b.hidden=true;document.body.append(b);b.click();b.remove();});
 await page.locator('#gym .gymtabs').waitFor();
 return {context,page,errors,writes:()=>page.evaluate(()=>window.__writes)};
}

for(const engine of [chromium,webkit]){
 const browser=await engine.launch();
 // A · sesión olvidada hace 12 días sin series: reloj legible y se puede descartar
 {const {context,page,errors,writes}=await openGym(browser,{gym_sessions:[staleDraft(false)]});
  const clock=await page.locator('#gym [data-gp-clock]').textContent();
  assert.match(clock,/^Abierta desde /,`reloj: ${clock}`);assert.doesNotMatch(clock,/\d{3}:/);
  await page.locator('#gym .gp-stale [data-gp-discard]').click();
  await page.locator('#gym [data-start]').first().waitFor();
  const w=await writes();assert.deepEqual(w.map(x=>[x.table,x.op,x.payload?.id]),[['gym_sessions','delete','stale-1']]);
  assert.match(await page.locator('#gym [data-start]').first().textContent(),/Lunes · Push/);
  // B · Recomp: Lunes Push con descanso/RIR del CSV; Finalizar aunque haya un valor no válido en una serie sin marcar de otro ejercicio
  await page.locator('#gym [data-start]').first().click();
  await page.locator('#gym details.gp-current').waitFor();
  assert.match(await page.locator('#gym details[data-gp-ex="0"]').textContent(),/Press inclinado con mancuernas[\s\S]*3 × 6–10 · RIR 2 · Descanso 2 min 30 s · Banco 20-30 grados/);
  await page.evaluate(()=>{const f=document.getElementById('workoutForm');f.elements['w-0-0'].value='22.5';f.elements['r-0-0'].value='8';f.elements['i-0-0'].value='2';});
  await page.locator('#gym details[data-gp-ex="0"] .gp-row').first().locator('.gp-tick').click();
  await page.waitForFunction(()=>document.querySelector('#gym details[data-gp-ex="0"] .gp-row')?.classList.contains('gp-done'));
  await page.evaluate(()=>{document.querySelector('#gymRestTimer [data-rest="skip"]')?.click();document.getElementById('workoutForm').elements['w-3-0'].value='13.1';});
  await page.locator('#gym .gp-bar [data-gp-finish]').click();
  await page.locator('#gym .gym-summary').waitFor();
  const fin=(await writes()).filter(x=>x.table==='gym_sessions'&&x.op==='upsert').pop().payload;
  assert.ok(fin.completed_at,'sesión cerrada');assert.equal(fin.exercises[3].sets[0].weight,null,'valor no válido de serie sin marcar se guarda vacío');
  assert.equal(fin.exercises[0].rest,150);assert.equal(fin.exercises[0].sets[0].completed,true);
  assert.ok(fin.duration_minutes>=0&&fin.duration_minutes<=5,`duración ${fin.duration_minutes}`);
  assert.deepEqual(errors,[],'errores JS (A/B)');await context.close();}
 // C · sesión olvidada CON series: Finalizar con lo hecho guarda sin inventar duración (antes: 17.280 min y la base de datos lo rechazaba)
 {const {context,page,errors,writes}=await openGym(browser,{gym_sessions:[staleDraft(true)]});
  await page.locator('#gym .gp-stale [data-gp-finish-stale]').click();
  await page.locator('#gym .gym-summary').waitFor();
  const fin=(await writes()).pop().payload;assert.ok(fin.completed_at);assert.equal(fin.duration_minutes,null);
  assert.deepEqual(errors,[],'errores JS (C)');await context.close();}
 // D · serie marcada con un peso no válido en un ejercicio oculto: se enseña ese ejercicio y no se guarda
 {const {context,page,errors,writes}=await openGym(browser,{gym_sessions:[]});
  await page.locator('#gym [data-start]').first().click();
  await page.locator('#gym details.gp-current').waitFor();
  await page.evaluate(()=>{const f=document.getElementById('workoutForm');f.elements['w-4-1'].value='13.1';f.elements['r-4-1'].value='10';f.elements['i-4-1'].value='2';f.elements['c-4-1'].checked=true;});
  const before=(await writes()).length;
  await page.locator('#gym .gp-bar [data-gp-finish]').click();
  await page.waitForFunction(()=>document.querySelector('#gym details.gp-current')?.dataset.gpEx==='4');
  assert.match(await page.locator('#gymToast').textContent(),/Revisa/);
  assert.equal((await writes()).length,before,'no se guarda con un valor no válido en una serie hecha');
  assert.deepEqual(errors,[],'errores JS (D)');await context.close();}
 // E · rutina antigua guardada: aviso para pasar a Recomp, guarda el plan y deja volver atrás
 {const {context,page,errors,writes}=await openGym(browser,{gym_sessions:[],gym_plans:[{user_id:UID,plan:OLD_PLAN}]});
  await page.locator('#gym [data-plan-recomp]').click();
  await page.waitForFunction(()=>document.querySelector('#gym [data-start] h3')?.textContent==='Lunes · Push');
  const p=(await writes()).pop();assert.equal(p.table,'gym_plans');assert.equal(p.payload.plan[2][2][6][7].rir,3);
  await page.locator('#gym [data-plan-restore]').click();
  await page.waitForFunction(()=>document.querySelector('#gym [data-start] h3')?.textContent==='Día viejo 1');
  assert.deepEqual(errors,[],'errores JS (E)');await context.close();}
 await browser.close();
 console.log(`Gym 2.49 OK · ${engine.name()} 375 px: reloj de sesión olvidada, descartar, Finalizar con campos ocultos, duración no inventada, cambio a Recomp y vuelta atrás`);
}
