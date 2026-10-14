// Run only with a synthetic payslip provisioned for the existing QA account.
// Schema/fixture cleanup is privileged and must be performed by the staging runner.
import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
const {BASE_URL='http://localhost:43512',SUPABASE_URL:u,SUPABASE_PUBLISHABLE_KEY:k,E2E_EMAIL:e,E2E_PASSWORD:pw,QA_PAYSLIP_ID:pid}=process.env;
assert(u?.includes('zpueziugbezqxompwsol')&&pid&&e&&pw,'Staging QA config required');
const auth=await fetch(u+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:k,'content-type':'application/json'},body:JSON.stringify({email:e,password:pw})}).then(r=>r.json());
assert(auth.access_token,'QA login failed');
const headers={apikey:k,authorization:'Bearer '+auth.access_token,'content-type':'application/json'};
const rest=async(path,method='GET',body)=>{const r=await fetch(u+'/rest/v1/'+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,body:await r.json().catch(()=>null)};};
const p=(await rest('payroll_payslips?id=eq.'+pid+'&select=id,updated_at,period_end,user_id')).body[0];
assert.equal(p.user_id,auth.user.id);
const args={p_payslip_id:pid,p_expected_updated_at:p.updated_at,p_leave_minutes:1215,p_keuzebudget_cents:12345,p_confirmed:true,p_document_sha256:'b'.repeat(64)};
assert((await rest('rpc/payroll_import_balances','POST',{...args,p_confirmed:false})).status>=400,'reject no confirmation');
assert((await rest('rpc/payroll_import_balances','POST',{...args,p_expected_updated_at:'2020-01-01T00:00:00Z'})).status>=400,'reject stale document');
const existing=(await rest('payroll_balance_imports?select=id')).body;assert.equal(existing.length,0,'QA must start without imports');
const created=[];
const addLeave=async(date)=>{const id=crypto.randomUUID();const r=await rest('hub_records','POST',{id,owner_id:auth.user.id,domain:'money',record_type:'shift_leave_event',payload:{kind:'used',minutes:60,date}});if(r.status===201)created.push(id);return r;};
assert.equal((await addLeave('2026-08-09')).status,201);
try{
 for(const [engine,width] of [[chromium,390],[webkit,1440]]){
  const b=await engine.launch();
  try{
   const page=await b.newPage({viewport:{width,height:844},serviceWorkers:'block'}),errors=[];
   page.on('pageerror',err=>errors.push(err.message));
   await page.goto(BASE_URL+'/?app=payroll&payslip='+pid,{waitUntil:'networkidle'});
   await page.locator('#email').fill(e);await page.locator('#password').fill(pw);await page.locator('#loginForm button[type=submit]').click();
   if(engine===chromium){
    const form=page.locator('[data-balance-import]');await form.waitFor({state:'attached',timeout:30000});
    await form.locator('..').locator('summary').click();
    await form.locator('[name=hours]').fill('20');await form.locator('[name=minutes]').fill('15');await form.locator('[name=euros]').fill('123,45');
    await page.route('**/storage/v1/object/**',r=>r.fulfill({status:200,contentType:'application/pdf',body:'%PDF-1.4 QA synthetic document'}));
    await page.locator('[data-pdf]').click();
    await page.getByRole('link',{name:'Abrir PDF',exact:true}).waitFor();
    assert.equal(await form.locator('[name=hours]').inputValue(),'20','PDF opening must preserve balance draft');
    assert.equal(await form.locator('[name=euros]').inputValue(),'123,45');
    await form.locator('button[type=submit]').click();
    assert.equal((await rest('payroll_balance_imports?select=id')).body.length,0,'unchecked checkbox must not save');
    await form.locator('[name=confirmed]').check();
    await form.locator('button[type=submit]').click();
    await page.locator('[data-balance-snapshot]').waitFor({timeout:20000});
    const stored=(await rest('payroll_balance_imports?select=*')).body;
    assert.equal(stored.length,1);assert.equal(stored[0].leave_minutes,1215);assert.equal(stored[0].keuzebudget_cents,12345);assert.equal(stored[0].payslip_id,pid);assert.equal(stored[0].as_of,p.period_end);assert.equal(stored[0].owner_id,auth.user.id);
    // Concurrent repeats must never produce a second snapshot.
    const repeats=await Promise.all([rest('rpc/payroll_import_balances','POST',args),rest('rpc/payroll_import_balances','POST',args)]);
    assert(repeats.every(r=>r.status===409),'duplicate retries rejected');
    assert((await addLeave('2026-08-09')).status>=400,'closing-day write rejected');
    assert((await addLeave('2026-08-08')).status>=400,'earlier write rejected');
    assert.equal((await addLeave('2026-08-10')).status,201);
   }
   await page.locator('[data-balance-snapshot]').waitFor({timeout:20000});
   assert.match(await page.locator('[data-balance-snapshot]').textContent(),/20 h 15 min/);
   assert.match(await page.locator('[data-balance-snapshot]').textContent(),/123,45/);
   await page.locator('#payroll [data-tab=shifts]').click();
   await page.locator('.shift-holidays').waitFor({timeout:15000});
   assert.match(await page.locator('.shift-holidays').textContent(),/19,25 h/);
   assert.match(await page.locator('.shift-holidays').textContent(),/incluido/);
   await page.reload({waitUntil:'networkidle'});await page.locator('#payroll [data-tab=shifts]').waitFor({timeout:25000});await page.locator('#payroll [data-tab=shifts]').click();
   await page.locator('.shift-holidays').waitFor({timeout:15000});
   assert.match(await page.locator('.shift-holidays').textContent(),/19,25 h/);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.deepEqual(errors,[]);
   console.log('PASS',engine.name(),width,'confirmation, separate balances, persistence, historical cutoff, no overflow/errors');
  }finally{await b.close();}
 }
 console.log('PASS API: no confirmation, stale payslip, duplicate retries, retroactive guard, subsequent movement');
}finally{
 for(const id of created){const r=await rest('hub_records?id=eq.'+id,'DELETE');assert.equal(r.status,204,'remove own QA movement');}
 console.log('QA movement cleanup:',created.length,'rows; snapshot/source fixture require privileged scoped cleanup');
}
