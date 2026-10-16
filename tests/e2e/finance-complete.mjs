// E2E · My Finance completo (Fase 2: ingresos, patrimonio y objetivos) con Supabase SIMULADO y datos FICTICIOS.
// Chromium y WebKit, 390 px. Sirve los ficheros locales a través de la URL de staging, sin pedir nada real.
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium,webkit}=require('playwright');
const base='https://renzo-hub-2-1-staging.vercel.app';
const UID='11111111-1111-4111-8111-111111111111';
const mock=`export function createClient(){
 let user=null,authCb,seq=0;
 const tx=(id,date,name,amount,balance,extra={})=>({id,owner_id:'${UID}',record_type:'bank_tx',domain:'money',occurred_at:date+'T12:00:00Z',payload:{date,name,amount,balance,code:'OV',bank:'ING',account:'…0001',...extra}});
 const tables={
  hub_records:[tx('a','2026-09-02','Huurbaas',-900,600,{description:'huur'}),tx('b','2026-09-09','SD WORX STAFFING SOLUTIONS B.V.',600,1200,{payslip_numbers:[22]}),
   tx('c','2026-09-15','Trade Republic Bank GmbH',-100,1100),tx('d','2026-09-20','Albert Heijn 1',-80,1020),
   tx('e','2026-08-02','Huurbaas',-900,700,{description:'huur'}),tx('f','2026-08-09','SD WORX STAFFING SOLUTIONS B.V.',1600,1600,{payslip_numbers:[18]})],
  payroll_payslips:[{id:'p22',user_id:'${UID}',payslip_number:'22',period_type:'weekly',period_year:2026,period_number:36,is_correction:false,net_payment:600,review_status:'approved',validation_status:'verified'}]
 };
 const db={from(table){let filters=[],single=false,op=null,payload=null;const run=()=>{const rows=tables[table]||(tables[table]=[]);
   if(op==='insert'){const row={id:'r'+(++seq),created_at:new Date().toISOString(),updated_at:new Date().toISOString(),...payload};rows.push(row);window.inserts=(window.inserts||[]).concat(row);return {data:single?row:[row],error:null};}
   let data=rows.filter(r=>filters.every(([k,v])=>!(k in r)||r[k]===v));
   if(op==='update'){data.forEach(r=>Object.assign(r,payload));}
   return {data:single?data[0]||null:data,error:null};};
  const q=new Proxy({}, {get(_,key){if(key==='then')return (ok,bad)=>Promise.resolve().then(run).then(ok,bad);return (...args)=>{if(key==='eq')filters.push(args);if(key==='maybeSingle'||key==='single')single=true;if(key==='insert'){op='insert';payload=args[0];}if(key==='update'){op='update';payload=args[0];}return q;};}});return q;},
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
 // Patrimonio: saldo del extracto (1020) sin inversiones todavía
 const nw=page.locator('[data-fx-networth]');await nw.waitFor({timeout:20000});
 assert.match(await page.locator('[data-fx-networth-total]').innerText(),/1020,00/);
 // Añadir inversión con coma decimal y deuda
 await nw.locator('summary',{hasText:'Añadir o actualizar'}).click();
 const form=nw.locator('[data-fx-asset-form]');
 await form.locator('[name=name]').fill('Trade Republic');await form.locator('[name=value]').fill('1.500,50');await form.locator('[name=date]').fill('2026-09-30');
 await form.locator('button[type=submit]').click();
 await page.waitForFunction(()=>/2520,50/.test(document.querySelector('[data-fx-networth-total]')?.innerText||''));
 const form2=page.locator('[data-fx-asset-form]');
 if(!await form2.isVisible())await page.locator('[data-fx-networth] summary',{hasText:'Añadir o actualizar'}).click();
 await form2.locator('[name=kind]').selectOption('debt');await form2.locator('[name=name]').fill('Aplazamiento');await form2.locator('[name=value]').fill('200');await form2.locator('[name=date]').fill('2026-09-30');
 await form2.locator('button[type=submit]').click();
 await page.waitForFunction(()=>/2320,50/.test(document.querySelector('[data-fx-networth-total]')?.innerText||''));
 const assetRows=await page.evaluate(()=>window.inserts.filter(r=>r.record_type==='money_asset').map(r=>[r.payload.kind,r.payload.value]));
 assert.deepEqual(assetRows,[['investment',1500.5],['debt',200]]);
 // Objetivos: errores visibles y tres tipos
 const goals=page.locator('[data-fx-goals]');
 const gform=goals.locator('[data-fx-goal-form]');
 await gform.locator('[name=type]').selectOption('emergency');await gform.locator('button[type=submit]').click();
 await goals.getByText('Meses de fondo: entre 1 y 24.').waitFor();
 await gform.locator('[name=months]').fill('3');await gform.locator('button[type=submit]').click();
 await page.locator('[data-fx-goal="emergency"]').waitFor();
 const add=async(fields)=>{const f=page.locator('[data-fx-goal-form]');if(!await f.isVisible())await page.locator('[data-fx-goals] summary',{hasText:'Nuevo objetivo'}).click();
  for(const [k,v] of Object.entries(fields)){if(k==='type')await f.locator('[name=type]').selectOption(v);else await f.locator(`[name=${k}]`).fill(v);}await f.locator('button[type=submit]').click();};
 await add({type:'target',name:'Viaje',amount:'2000',date:'2026-12-31',start:'2026-08',months:''});await page.locator('[data-fx-goal="target"]').waitFor();
 await add({type:'invest',name:'Inversión mensual',monthly:'150',amount:'',date:'',start:'2026-08'});await page.locator('[data-fx-goal="invest"]').waitFor();
 const goalText=await goals.innerText();
 assert.match(goalText,/Aportado 100,00\s€ de 150,00\s€/);
 assert.match(goalText,/Ahorrado/);
 assert.equal(await page.locator('[data-fx-goal]').count(),3);
 // Archivar oculta sin borrar
 await page.locator('[data-fx-goal="invest"] [data-fx-goal-archive]').click();
 await page.waitForFunction(()=>document.querySelectorAll('[data-fx-goal]').length===2);
 // El aporte a inversión no cuenta como gasto (alquiler 900 + súper 80)
 assert.match(await page.locator('[data-fx-hero]').innerText(),/980,00/);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'scroll horizontal');
 for(const sel of ['[data-fx-networth]','[data-fx-goals]']){await page.locator(sel).scrollIntoViewIfNeeded();await page.locator(sel).screenshot({path:`/tmp/finance-${sel.slice(9,-1)}-${engine.name()}.png`});}
 await browser.close();
}
assert.deepEqual(errors,[]);
console.log('finance-complete E2E OK (Chromium y WebKit)');
