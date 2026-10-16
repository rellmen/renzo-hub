// E2E · My Finance Fase 2A "Ingresos del mes" con Supabase SIMULADO y datos FICTICIOS (Chromium y WebKit).
// Sirve los ficheros locales a través de la URL de staging (sin pedir nada real a staging ni a Supabase).
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium,webkit}=require('playwright');
const base='https://renzo-hub-2-1-staging.vercel.app';
const UID='11111111-1111-4111-8111-111111111111';
const mock=`export function createClient(){
 let user=null,authCb;
 const tx=(id,date,name,amount,extra={})=>({id,owner_id:'${UID}',record_type:'bank_tx',domain:'money',occurred_at:date+'T12:00:00Z',payload:{date,name,amount,code:'OV',bank:'ING',...extra}});
 const tables={
  hub_records:[tx('a','2026-09-09','SD WORX STAFFING SOLUTIONS B.V.',600,{payslip_numbers:[22]}),tx('b','2026-09-16','SD WORX STAFFING SOLUTIONS B.V.',700,{payslip_numbers:[23]}),
   tx('c','2026-09-23','SD WORX STAFFING SOLUTIONS B.V.',650,{payslip_numbers:[24]}),tx('d','2026-09-25','Belastingdienst toeslag',120,{description:'zorgtoeslag'}),tx('e','2026-09-30','Albert Heijn 1',-80)],
  payroll_payslips:[[22,36,600,'approved'],[23,37,690,'approved'],[24,38,650,'pending'],[25,39,640,'approved']].map(([n,w,net,st])=>({id:'p'+n,user_id:'${UID}',payslip_number:String(n),period_type:'weekly',period_year:2026,period_number:w,period_label:'2026-W'+w,is_correction:false,net_payment:net,review_status:st,validation_status:st==='approved'?'verified':'review_required'}))
 };
 const db={from(table){let filters=[],single=false;const q=new Proxy({}, {get(_,key){if(key==='then')return (ok,bad)=>Promise.resolve().then(()=>{let data=(tables[table]||[]).filter(r=>filters.every(([k,v])=>!(k in r)||r[k]===v));return {data:single?data[0]||null:data,error:null};}).then(ok,bad);return (...args)=>{if(key==='eq')filters.push(args);if(key==='maybeSingle'||key==='single')single=true;return q;};}});return q;},
  channel(){const ch={on(){return ch;},subscribe(){return ch;}};return ch;},removeChannel(){},rpc:async()=>({data:null,error:null}),storage:{from:()=>({download:async()=>({data:null,error:null})})},
  auth:{onAuthStateChange(cb){authCb=cb;return {data:{subscription:{unsubscribe(){}}}};},getSession:async()=>({data:{session:user?{user,access_token:'t'}:null}}),signInWithPassword:async()=>{user={id:'${UID}',email:'demo@example.test'};authCb('SIGNED_IN',{user});return {};},signOut:async()=>{user=null;authCb('SIGNED_OUT',null);return {};}}};
 return db;}`;
const errors=[];
for(const engine of [chromium,webkit]){
 const browser=await engine.launch();const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});const page=await context.newPage();
 page.on('pageerror',e=>errors.push(engine.name()+': '+e.message));
 await context.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({contentType:'text/javascript',body:mock}));
 await context.route(base+'/**',async r=>{
  const path=new URL(r.request().url()).pathname;
  if(path==='/api/supabase-config')return r.fulfill({json:{supabaseUrl:'https://example.supabase.co',publishableKey:'test-public'}});
  if(path==='/api/deployment-info')return r.fulfill({json:{environment:'preview'}});
  if(path.startsWith('/api/'))return r.fulfill({json:{}});
  try{const body=await readFile(resolve(path==='/'?'index.html':'.'+path));const type={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpeg':'image/jpeg'}[extname(path==='/'?'index.html':path)];return r.fulfill({body,contentType:type||'application/octet-stream'});}catch{return r.fulfill({status:404,body:''});}
 });
 await page.goto(base+'/');
 await page.locator('#email').fill('demo@example.test');await page.locator('#password').fill('fake-test-password');await page.locator('#loginForm button[type=submit]').click();
 await page.locator('#authScreen').waitFor({state:'hidden'});
 await page.evaluate(()=>document.querySelector('[data-open="money"]').click());
 const panel=page.locator('[data-fx-income]');await panel.waitFor({timeout:20000});
 const text=await panel.innerText();
 assert.match(text,/Ingresos del mes/);
 assert.match(await page.locator('[data-fx-income-confirmed]').innerText(),/600,00/);
 assert.equal(await page.locator('[data-fx-income-row="confirmed"]').count(),1);
 assert.equal(await page.locator('[data-fx-income-row="difference"]').count(),1);
 assert.equal(await page.locator('[data-fx-income-row="review"]').count(),1);
 assert.equal(await page.locator('[data-fx-income-missing]').count(),1);
 assert.match(text,/690,00.*700,00/s);
 // El total de ingresos del Resumen sigue siendo el del banco (600+700+650+120), sin sumar nóminas.
 assert.match(await page.locator('[data-fx-hero]').innerText(),/2070,00|2\.070,00/);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'scroll horizontal');
 await panel.scrollIntoViewIfNeeded();assert.ok(await panel.isVisible(),"panel visible");await panel.screenshot({path:`/tmp/finance-income-${engine.name()}.png`});
 await browser.close();
}
assert.deepEqual(errors,[]);
console.log('finance-income E2E OK (Chromium y WebKit)');
