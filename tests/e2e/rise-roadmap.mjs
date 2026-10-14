// Verifies phase 0 with the existing test-only Staging account; makes no writes.
// BASE_URL=http://localhost:43488 E2E_EMAIL=... E2E_PASSWORD=... node tests/e2e/rise-roadmap.mjs
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const {BASE_URL='http://localhost:43488',SUPABASE_URL,E2E_EMAIL,E2E_PASSWORD}=process.env;
if (!SUPABASE_URL?.includes('zpueziugbezqxompwsol')||!E2E_EMAIL||!E2E_PASSWORD) throw Error('Requires test-only staging Supabase configuration');
const b=await chromium.launch({headless:true});
try {
 for(const width of [390,1440]){
  const p=await b.newPage({viewport:{width,height:844}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto(BASE_URL,{waitUntil:'networkidle'});
  await p.locator('#email').fill(E2E_EMAIL);await p.locator('#password').fill(E2E_PASSWORD);
  await p.locator('#loginForm button[type=submit]').click();
  await p.locator('#appShell:not(.hidden)').waitFor({timeout:15000});
  await p.locator('[data-open="work"]:visible').first().click();
  const root=p.locator('#work .rise-roadmap');await root.waitFor();
  assert.match(await root.textContent(),/382–626/);
  await root.locator('summary').first().click();
  assert.equal(await root.locator('details:first-of-type li').count(),11);
  assert.deepEqual(errors,[]);
  assert((await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=0,'Horizontal overflow');
  console.log(`OK: RISE HUB 4.0 roadmap at ${width}px, 11 phases, no JS errors`);
  await p.close();
 }
}finally{await b.close();}
