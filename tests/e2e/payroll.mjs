import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(process.env.PLAYWRIGHT_ROOT?resolve(process.env.PLAYWRIGHT_ROOT,'package.json'):import.meta.url);
const {chromium,webkit}=require('playwright');
const base='https://renzo-hub-2-1-staging.vercel.app';
const mock=`import {createPayrollDemo} from '${base}/payroll-demo.js';
export function createClient(){
 let user=null,authCb;const f=createPayrollDemo('11111111-1111-4111-8111-111111111111');window.fixture=f;window.calls=[];window.queries=[];window.removed=0;
 const map={payroll_documents:'documents',payroll_payslips:'payslips',payroll_employers:'employers',payroll_anomalies:'anomalies',payroll_events:'events',payroll_line_items:'lines',payroll_validations:'validations',payroll_payslip_versions:'versions',payroll_v_ytd:'ytd',payroll_v_monthly:'monthly',payroll_v_monthly_nl:'monthly_nl',payroll_v_jaaropgave_nl:'year_nl',payroll_v_confirmed:'confirmed',payroll_v_rate_history:'rates',payroll_v_queue:'queue'};
 const db={from(table){let filters=[],orders=[],single=false,mutation=null;const q=new Proxy({}, {get(_,key){if(key==='then')return (ok,bad)=>Promise.resolve().then(()=>{window.queries.push({table,filters,orders});if(table==='payroll_v_jaaropgave_nl'&&window.failYear)return {data:null,error:{message:'Fallo anual simulado'}};if(table==='payroll_v_monthly_nl'&&window.failMonthly)return {data:null,error:{message:'Fallo mensual simulado'}};let data=(f[map[table]]||[]).filter(r=>filters.every(([k,v])=>r[k]===v));if(mutation)data.forEach(r=>Object.assign(r,mutation));return {data:single?data[0]||null:data,error:null};}).then(ok,bad);return (...args)=>{if(key==='eq')filters.push(args);if(key==='order')orders.push(args);if(key==='maybeSingle'||key==='single')single=true;if(key==='update')mutation=args[0];return q;};}});return q;},
 channel(){let handlers=[];const ch={on(_,filter,cb){handlers.push(cb);return ch;},subscribe(cb){window.rtStatus=cb;window.emitPayroll=()=>handlers.forEach(fn=>fn());setTimeout(()=>cb('SUBSCRIBED'),0);return ch;}};return ch;},removeChannel(){window.removed++;},
 rpc:async(name,args)=>{window.calls.push({name,args});f.applyReview(args.p_payslip_id,args.p_changes,args.p_decision);return {data:null,error:null};},storage:{from:()=>({download:async()=>({data:new Blob([f.pdf],{type:'application/pdf'}),error:null})})},
 auth:{onAuthStateChange(cb){authCb=cb;return {data:{subscription:{unsubscribe(){}}}};},getSession:async()=>({data:{session:user?{user}:null}}),signInWithPassword:async()=>{user={id:'11111111-1111-4111-8111-111111111111',email:'demo@example.test'};authCb('SIGNED_IN',{user});return {};},signOut:async()=>{user=null;authCb('SIGNED_OUT',null);return {};}}};window.testDb=db;return db;}`;
const errors=[];
const securityHeaders=Object.fromEntries(JSON.parse(await readFile('vercel.json','utf8')).headers.find(x=>x.source==='/(.*)').headers.map(x=>[x.key,x.value]));
for(const engine of [chromium,webkit]){
 const browser=await engine.launch();const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({contentType:'text/javascript',body:mock}));
 await page.route(base+'/**',async r=>{
  const path=new URL(r.request().url()).pathname;
  if(path==='/api/supabase-config')return r.fulfill({json:{supabaseUrl:'https://example.supabase.co',publishableKey:'test-public'}});
  if(path==='/api/deployment-info')return r.fulfill({json:{environment:'preview'}});
  try{const body=await readFile(resolve(path==='/'?'index.html':'.'+path));const type={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpeg':'image/jpeg'}[extname(path==='/'?'index.html':path)];return r.fulfill({body,contentType:type||'application/octet-stream',headers:securityHeaders});}catch{return r.fulfill({status:404,body:''});}
 });
 await page.goto(base+'/?app=payroll&payslip=00000000-0000-4000-8000-000000000112');
 await page.locator('#email').fill('demo@example.test');await page.locator('#password').fill('fake-test-password');await page.locator('#loginForm button[type=submit]').click();
 await page.locator('[data-review]').waitFor();assert.ok(!page.url().includes('payslip='));
 assert.equal(await page.locator('#payroll.active').count(),1);assert.equal(await page.locator('[name=net_salary]').inputValue(),'555');
 await page.locator('[name=net_salary]').fill('612.34');
 await page.evaluate(()=>window.emitPayroll());await page.waitForTimeout(700);
 assert.equal(await page.locator('[name=net_salary]').inputValue(),'612.34');
 await page.locator('button[value=correct]').click();await page.locator('[data-review]').waitFor({state:'detached'});
 const call=await page.evaluate(()=>window.calls[0]);assert.equal(call.name,'payroll_apply_review');assert.deepEqual(call.args.p_changes,{net_salary:612.34});
 await page.locator('[data-pdf]').click();await page.locator('a.pay-button').waitFor();assert.match(await page.locator('a.pay-button').getAttribute('href'),/^blob:/);
 await page.locator('[data-tab=summary]').click();assert.ok((await page.locator('#payroll').innerText()).includes(new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(6387.34)));
 await page.locator('.pay-tabs [data-tab=inbox]').click();await page.evaluate(()=>{window.fixture.documents[0].status='processed';window.emitPayroll();});await page.waitForTimeout(800);assert.equal(await page.locator('[data-document="00000000-0000-4000-8000-000000000800"] .pay-processed').count(),1);
 await page.locator('[data-document="00000000-0000-4000-8000-000000000012"]').click();await page.locator('#payroll h3').filter({hasText:'Seguimiento'}).waitFor();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:'/tmp/payroll-'+engine.name()+'.png',fullPage:true});
 await page.locator('#payroll [data-home]').click();assert.ok(await page.evaluate(()=>window.removed>0));
 for(const section of ['home','skin','gym','food','news','system']){await page.evaluate(id=>document.querySelector('[data-open="'+id+'"]').click(),section);assert.equal(await page.locator('#'+section+'.active').count(),1);}
 await page.evaluate(()=>window.testDb.auth.signOut());await page.locator('#authScreen:not(.hidden)').waitFor();assert.equal(await page.locator('#payroll').innerHTML(),'');
 // Demo follows the same deep link and never invokes the real RPC adapter.
 await page.goto(base+'/?demo=1&app=payroll&payslip=00000000-0000-4000-8000-000000000112');await page.locator('#email').fill('demo@example.test');await page.locator('#password').fill('fake-test-password');await page.locator('#loginForm button[type=submit]').click();await page.locator('[data-review]').waitFor();await page.locator('button[value=approve]').click();await page.locator('[data-review]').waitFor({state:'detached'});assert.equal(await page.evaluate(()=>window.calls.length),0);
 await page.locator('.pay-tabs [data-tab=monthly]').click();
 assert.match(await page.locator('[data-monthly-total]').innerText(),/Total del año/);
 assert.match(await page.locator('[data-month]').first().innerText(),/Ingresado en el banco/);
 assert.equal(await page.locator('[data-month]').count(),3);
 assert.match(await page.locator('[data-month]').first().innerText(),/1 corrección.*1 por revisar/s);
 await page.locator('[data-month]').first().locator('summary').filter({hasText:'Desglose del bruto'}).click();
 assert.ok(!(await page.locator('[data-month]').first().locator('details').first().innerText()).includes('Baja'));
 assert.equal(await page.locator('[data-month]').first().locator('.pay-month-mobile[open]').count(),2);
 assert.equal(await page.locator('[data-month]').nth(1).locator('.pay-month-mobile[open]').count(),0);
 const olderHours=page.locator('[data-month]').nth(1).locator('.pay-month-mobile').first();
 await olderHours.locator('summary').click();assert.equal(await olderHours.getAttribute('open'),'');await olderHours.locator('summary').click();
 await mkdir('docs/screenshots' ,{recursive:true});
 for(const [label,width,height] of [['mobile',390,844],['desktop',1440,1000]]){
  await page.setViewportSize({width,height});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const undersized=await page.locator('.pay-tabs button, [data-monthly-year], .pay-monthly summary').filter({visible:true}).evaluateAll(els=>els.filter(el=>el.getBoundingClientRect().height<44).map(el=>({text:el.textContent,height:el.getBoundingClientRect().height})));assert.deepEqual(undersized,[]);
  assert.equal(await page.locator('.pay-month-desktop:visible').count(),width>640?6:0);
  await page.screenshot({path:`docs/screenshots/payroll-monthly-${engine.name()}-${label}.png`,fullPage:true});
 }
 // Annual demo: official figures must remain separate from the registered totals.
 await page.locator('.pay-tabs [data-tab=year]').click();
 assert.equal(await page.locator('[data-year-card]').count(),2);
 const annual=page.locator('[data-year-card]').first();
 assert.match(await annual.locator('[data-official]').innerText(),/8350,00/);
 assert.match(await annual.locator('[data-official]').innerText(),/1085,00/);
 assert.match(await annual.locator('[data-recorded]').innerText(),/8100,00/);
 assert.match(await annual.locator('[data-completeness]').innerText(),/Faltan nóminas.*250,00/s);
 assert.equal(await page.locator('[data-completeness=complete]').count(),1);
 assert.match(await annual.innerText(),/La jaaropgave oficial la emite SD Worx/);
 for(const [label,width,height] of [['mobile',390,844],['desktop',1440,1000]]){
  await page.setViewportSize({width,height});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.ok(await page.locator('.pay-tabs button').evaluateAll(els=>els.every(el=>el.getBoundingClientRect().height>=44)));
  await page.screenshot({path:`docs/screenshots/payroll-year-${engine.name()}-${label}.png`,fullPage:true});
 }
 // Exercise the actual view-loading adapter (mocked transport), including isolated failure.
 await page.goto(base+'/?app=payroll');await page.locator('#email').fill('demo@example.test');await page.locator('#password').fill('fake-test-password');await page.locator('#loginForm button[type=submit]').click();
 await page.locator('.pay-tabs [data-tab=monthly]').click();await page.locator('[data-month]').first().waitFor();
 await page.evaluate(()=>{const m=window.fixture.monthly_nl[0];window.fixture.monthly_nl.push({...m,mes:(Number(m.mes.slice(0,4))-1)+'-12-01',bruto:123});});await page.locator('[data-refresh]').click();
 await page.locator('[data-monthly-year] option').nth(1).waitFor({state:'attached'});
 const previousYear=await page.locator('[data-monthly-year] option').nth(1).getAttribute('value');await page.locator('[data-monthly-year]').selectOption(previousYear);assert.equal(await page.locator('[data-month]').count(),1);assert.match(await page.locator('[data-monthly-total]').innerText(),/123,00/);
 await page.evaluate(()=>{window.fixture.monthly_nl=[];});await page.locator('[data-refresh]').click();await page.getByText('Sin datos mensuales.',{exact:true}).waitFor();
 await page.evaluate(()=>{window.failMonthly=true;});await page.locator('[data-refresh]').click();await page.getByText('No se pudieron cargar los datos mensuales. Pulsa Actualizar para reintentar.',{exact:true}).waitFor();
 await page.locator('.pay-tabs [data-tab=summary]').click();assert.ok(await page.getByText('Evolución mensual',{exact:true}).isVisible());
 await page.locator('.pay-tabs [data-tab=year]').click();await page.locator('[data-year-card]').first().waitFor();
 const yearQuery=await page.evaluate(()=>window.queries.find(q=>q.table==='payroll_v_jaaropgave_nl'));
 assert.deepEqual(yearQuery.filters,[['user_id','11111111-1111-4111-8111-111111111111']]);assert.deepEqual(yearQuery.orders,[['jaar',{ascending:false}]]);
 const yearIds=await page.locator('[data-year-card]').evaluateAll(els=>els.map(el=>Number(el.dataset.yearCard)));assert.ok(yearIds[0]>yearIds[1]);
 await page.evaluate(()=>{window.failYear=true;});await page.locator('[data-refresh]').click();await page.getByText(/year_nl: Fallo anual simulado/).waitFor();assert.equal(await page.locator('[data-year-card]').count(),2);
 await page.locator('.pay-tabs [data-tab=payslips]').click();assert.ok(await page.locator('[data-payslip]').count()>0);
 await page.evaluate(()=>{window.failYear=false;window.fixture.year_nl=[{jaar:2000,user_id:'11111111-1111-4111-8111-111111111111',completo:null,bruto_registrado:999}];});await page.locator('[data-refresh]').click();await page.locator('.pay-tabs [data-tab=year]').click();await page.locator('[data-year-card="2000"]').waitFor();
 assert.match(await page.locator('[data-official]').innerText(),/Sin datos/);assert.ok(!(await page.locator('[data-official]').innerText()).includes('999'));
 assert.equal(await page.locator('[data-completeness=unknown]').count(),1);
 await page.evaluate(()=>{window.fixture.year_nl=[];});await page.locator('[data-refresh]').click();await page.getByText('Sin datos anuales.',{exact:true}).waitFor();
 await page.evaluate(()=>{window.failYear=true;});await page.locator('[data-refresh]').click();await page.getByText('No se pudieron cargar los datos anuales. Pulsa Actualizar para reintentar.',{exact:true}).waitFor();
 await browser.close();console.log(engine.name()+': login, deep link, review RPC, realtime, PDF, KPIs, mobile, modules, logout isolated demo, monthly folds and annual statements OK');
}
assert.deepEqual(errors,[]);
