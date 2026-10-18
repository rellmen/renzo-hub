// Synthetic personal context only. Real UI, owned-query contract and network privacy.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 let externalPosts=0;const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/app.js',r=>r.fulfill({contentType:'text/javascript',body:'export {};'}));
 await page.route('**/api/ares-ai',r=>{if(r.request().method()==='POST')externalPosts++;return r.fulfill({json:{enabled:true,text:'External reply must not be used'}});});
 await page.goto(process.env.BASE_URL||'http://localhost:4198');
 await page.evaluate(async()=>{
  document.body.innerHTML='<section id="system"></section><section id="money"></section><section id="work"></section><section id="study"></section><section id="gym"></section><section id="skin"></section>';
  const fact=(section,label,value,owner_id='owner-a')=>({owner_id,record_type:'personal_fact',payload:{section,confirmed:true,confirmedAt:'2026-10-18',facts:[{label,value,verification:'user_confirmed',asOf:'2026-10-18',provenance:'Synthetic user confirmation'}]}});
  const rows=[fact('learning','Curso','Curso X completado · SQL iniciado · meta B2 y C1'),fact('finance','Alquiler','1200 € · vigencia pendiente'),fact('skincare','Producto','Producto fotografiado · variante sin confirmar'),fact('profile','Residencia','City A'),fact('profile','Residencia','PRIVATE OTHER USER','owner-b')];
  let user={id:'owner-a'};
  const db={from(table){if(table!=='hub_records')throw Error('Unexpected table');const filters={};return {select(){return this},eq(k,v){filters[k]=v;return this},in(k,v){filters[k]=v;return this},order(){return this},limit(){if(filters.owner_id!==user?.id)throw Error('Missing owner filter');return Promise.resolve({data:rows.filter(r=>r.owner_id===filters.owner_id&&(!filters.record_type||[].concat(filters.record_type).includes(r.record_type))),error:null});}}},auth:{getSession:async()=>({data:{session:{access_token:'test-token'}}})}};
  const {mountAresAI}=await import('/microapps/ares-ai.js');
  const {mountConfirmedContext}=await import('/microapps/confirmed-context.js');
  const context=mountConfirmedContext({db,getUser:()=>user});await context.load();
  const ares=mountAresAI({supabase:db,getUser:()=>user,navigate:()=>{}});ares.setSession();
  window.__contextTest={context,ares,setUser(v){user=v;}};
 });
 assert.equal(await page.locator('[data-confirmed-context]').count(),4);
 await page.locator('[data-confirmed-context="learning"] summary').click();
 assert.match(await page.locator('#study').innerText(),/SQL iniciado/);
 await page.evaluate(()=>{document.querySelector('#study').innerHTML='<h1>Course rerender</h1>';});
 await page.waitForFunction(()=>!!document.querySelector('#study [data-confirmed-context="learning"]'));
 assert.match(await page.locator('#study').innerText(),/SQL iniciado/);
 assert.doesNotMatch(await page.locator('body').innerText(),/PRIVATE OTHER USER/);
 await page.locator('.ares-fab').click();
 for(const [question,want] of [['Qué estoy estudiando','Curso X completado'],['Qué sabes de mis finanzas','1200 €'],['Qué productos tengo en skincare','variante sin confirmar'],['Qué sabes de mi perfil','City A'],['¿Dónde vivo?','City A'],['¿Cuánto cobro?','1200 €'],['¿Cuál es mi sueldo?','1200 €'],['¿Qué sabes sobre mí?','City A'],['Repite ese dato','Estado de RISE HUB']]){
  await page.locator('.ares-chat-form textarea').fill(question);
  await page.locator('.ares-chat-form button[type="submit"]').click();
  await page.waitForFunction(w=>[...document.querySelectorAll('.ares-msg-bot')].at(-1)?.textContent.includes(w),want);
 }
 assert.equal(externalPosts,0,'Personal questions must never reach external AI');
 assert.doesNotMatch(await page.locator('.ares-chat').innerText(),/PRIVATE OTHER USER/);
 await page.evaluate(()=>{window.__contextTest.setUser(null);window.__contextTest.context.reset();window.__contextTest.ares.reset();});
 assert.equal(await page.locator('[data-confirmed-context]').count(),0);
 assert.equal(await page.locator('.ares-msg').count(),0);
 assert.deepEqual(errors,[]);
 console.log('PASS: private learning, finance, skincare, profile; 0 external AI POSTs; owner isolation; logout clears context');
 await page.close();
 // Exercise the real app.js auth callback, including its deferred data loads.
 const authPage=await browser.newPage({serviceWorkers:'block'});authPage.setDefaultTimeout(15000);
 await authPage.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({contentType:'text/javascript',body:`
 export function createClient(){
  let user={id:'owner-a',email:'a@example.test'},callback;
  window.__switchContextOwner=id=>{user={id,email:id+'@example.test'};callback('SIGNED_IN',{user});return [...document.querySelectorAll('[data-confirmed-context]')].map(n=>n.textContent).join(' ');};
  const db={from(table){let single=false;const filters={};const q=new Proxy({}, {get(_,k){
   if(k==='then')return (ok,bad)=>{const owner=filters.owner_id;const data=table==='hub_records'&&filters.record_type==='personal_fact'?[{owner_id:owner,record_type:'personal_fact',payload:{section:'profile',confirmed:true,confirmedAt:'2026-10-18',facts:[{label:'Residence',value:owner==='owner-a'?'CITY A PRIVATE':'CITY B PRIVATE',verification:'user_confirmed',asOf:'2026-10-18',provenance:'Synthetic user'}]}}]:single?null:[];return Promise.resolve({data,error:null,count:0}).then(ok,bad);};
   return (...a)=>{if(k==='eq')filters[a[0]]=a[1];if(k==='maybeSingle'||k==='single')single=true;return q;};}});return q;},
   auth:{onAuthStateChange(cb){callback=cb;return {data:{subscription:{unsubscribe(){}}}};},getSession:async()=>({data:{session:{user,access_token:'test'}}}),getUser:async()=>({data:{user}})},
   rpc:async()=>({data:null,error:null}),channel(){const c={on(){return c},subscribe(){return c}};return c},removeChannel(){},storage:{from:()=>({list:async()=>({data:[],error:null})})}};
  return db;
 }`}));
 await authPage.route('**/api/supabase-config',r=>r.fulfill({json:{supabaseUrl:'https://example.supabase.co',publishableKey:'test-public'}}));
 await authPage.route('**/api/ares-ai',r=>r.fulfill({json:{enabled:false}}));
 await authPage.route('https://*.supabase.co/**',r=>r.abort());
 await authPage.goto(process.env.BASE_URL||'http://localhost:4198');
 await authPage.waitForFunction(()=>document.querySelector('[data-confirmed-context="profile"]')?.textContent.includes('CITY A PRIVATE'));
 const immediate=await authPage.evaluate(()=>window.__switchContextOwner('owner-b'));
 assert.doesNotMatch(immediate,/CITY A PRIVATE/,'Owner A must be cleared inside the auth callback before deferred loads');
 await authPage.waitForFunction(()=>document.querySelector('[data-confirmed-context="profile"]')?.textContent.includes('CITY B PRIVATE'));
 assert.doesNotMatch(await authPage.locator('[data-confirmed-context="profile"]').innerText(),/CITY A PRIVATE/);
 await authPage.close();
 console.log('PASS: real app auth callback clears owner A synchronously before loading owner B');
}finally{await browser.close();}
