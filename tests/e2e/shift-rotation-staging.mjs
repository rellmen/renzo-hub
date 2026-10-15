import {chromium} from 'playwright';
import assert from 'node:assert/strict';

// Real staging QA only. Creates uniquely named records and deletes them in finally.
const {BASE_URL='http://localhost:43489',SUPABASE_URL:u,SUPABASE_PUBLISHABLE_KEY:k,E2E_EMAIL:e,E2E_PASSWORD:pw}=process.env;
assert(u?.includes('zpueziugbezqxompwsol')&&k&&e&&pw,'QA staging credentials required');
const authReply=await fetch(u+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:k,'content-type':'application/json'},body:JSON.stringify({email:e,password:pw})});
const auth=await authReply.json();assert(auth.access_token,'QA login required');
const h={apikey:k,authorization:'Bearer '+auth.access_token,'content-type':'application/json'};
const getRows=async()=>{
 const response=await fetch(u+'/rest/v1/hub_records?select=id,record_type,payload&record_type=in.(shift_contract,shift_log,shift_leave_event)&limit=1000',{headers:h});
 assert(response.ok,'RLS read test records');return response.json();
};
const initialIds=new Set((await getRows()).map(x=>x.id));
const b=await chromium.launch({headless:true});
const agency='RH4 QA TEST '+Date.now();
try{
 for (const width of [390,1440]){
  const p=await b.newPage({viewport:{width,height:844},serviceWorkers:'block'}),errors=[];
  p.on('pageerror',err=>errors.push(err.message));
  await p.goto(BASE_URL+'/?app=payroll',{waitUntil:'networkidle'});
  await p.locator('#email').fill(e);await p.locator('#password').fill(pw);
  await p.locator('#loginForm button[type=submit]').click();
  await p.locator('#payroll.active .pay-tabs [data-tab=shifts]').waitFor({timeout:25000});
  await p.locator('#payroll .pay-tabs [data-tab=shifts]').click();
  await p.locator('#payroll .shift-tracker').waitFor();
  const pane=p.locator('.shift-contract');
  if (!(await pane.evaluate(el=>el.open))) await pane.locator('summary').first().click();
  const contract=p.locator('form[data-shift-contract]');
  await contract.locator('[name=agency]').fill(agency+' '+width);
  await contract.locator('[name=hourlyRate]').fill('15');
  await contract.locator('[name=effectiveFrom]').fill('2026-01-01');
  await contract.locator('[name=bands]').fill('00:00-06:00=100\n06:00-18:00=100\n18:00-00:00=130');
  await contract.locator('button[type=submit]').click();
  await p.waitForFunction(name=>document.querySelector('.shift-contract')?.textContent.includes(name),agency+' '+width,{timeout:20000});
  const shift=p.locator('form[data-shift-log]');await shift.waitFor();
  const shiftDate=width===390?'2026-10-12':'2026-10-20';
  await shift.locator('[name=date]').fill(shiftDate);
  await p.locator('[data-shift-propose]').click();
  assert.equal(await shift.locator('[name=start]').inputValue(),width===390?'06:00':'15:00');
  assert.equal(await shift.locator('[name=end]').inputValue(),width===390?'15:00':'00:00');
  await shift.locator('[name=start]').fill('15:00');await shift.locator('[name=end]').fill('00:00');
  await shift.locator('[name=breaks]').fill('19:00-19:30;sinpago');
  await shift.locator('button[type=submit]').click();
  await p.waitForFunction(()=>document.querySelector('.shift-list')?.textContent.includes('152,25'),null,{timeout:20000});
  assert.match(await p.locator('.shift-tracker').textContent(),/8,5 horas|8,5 h|8,5/);
  assert.deepEqual(errors,[]);
  const overflow=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert(overflow<=0,'horizontal overflow '+overflow);
  console.log('PASS',width,'contract, turn, 8.5h/152.25 EUR, RLS persistence, no errors');
  await p.locator('[data-shift-edit]').first().click();
  assert((await shift.locator('[name=shiftId]').inputValue()).length>0);
  await shift.locator('[name=end]').fill('22:00');
  await shift.locator('button[type=submit]').click();
  await p.waitForFunction(()=>document.querySelector('.shift-tracker')?.textContent?.includes('113,25'),null,{timeout:15000});
  const leave=p.locator('[data-leave-event]');
  await leave.locator('[name=date]').fill(shiftDate);await leave.locator('[name=kind]').selectOption('opening');await leave.locator('[name=hours]').fill('20');
  await leave.locator('button[type=submit]').click();
  await p.waitForFunction(()=>document.querySelector('.shift-holidays')?.textContent?.includes('20 h'),null,{timeout:15000});
  await leave.locator('[name=date]').fill(shiftDate);await leave.locator('[name=kind]').selectOption('used');await leave.locator('[name=reason]').selectOption('holiday');await leave.locator('[name=hours]').fill('8');
  await leave.locator('button[type=submit]').click();
  await p.waitForFunction(()=>document.querySelector('.shift-holidays')?.textContent?.includes('12 h'),null,{timeout:15000});
  console.log('PASS',width,'early exit edited and leave bank 20h -> 12h');
  await p.reload({waitUntil:'networkidle'});await p.locator('#payroll.active .pay-tabs [data-tab=shifts]').waitFor({timeout:25000});
  await p.locator('#payroll [data-tab=shifts]').click();
  await p.waitForFunction(name=>document.querySelector('.shift-contract')?.textContent.includes(name),agency+' '+width,{timeout:20000});
  assert.match(await p.locator('.shift-tracker').textContent(),/113,25/);
  assert.match(await p.locator('.shift-holidays').textContent(),/12 h/);
  const saved=await getRows();assert(saved.some(x=>x.record_type==='shift_log'&&x.payload?.revision===1));
  console.log('PASS',width,'recovered edited shift, audit revision, holiday balance after reload');
  await p.close();
 }
}finally{
 await b.close();
 const after=await getRows();const fresh=after.filter(x=>!initialIds.has(x.id));
 if(fresh.length){const ids=fresh.map(x=>x.id).join(',');
  const resp=await fetch(u+'/rest/v1/hub_records?id=in.('+ids+')',{method:'DELETE',headers:{...h,Prefer:'return=minimal'}});
  assert(resp.ok,'QA cleanup failed: HTTP '+resp.status);
 }
 console.log('QA cleanup:',fresh.length,'new rows deleted');
}
