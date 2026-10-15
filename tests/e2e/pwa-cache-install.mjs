// CI-only local browser validation. Never login or fetch the private staging site.
import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const BASE_URL=process.env.BASE_URL||'http://localhost:4173';
assert(/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(BASE_URL),'Only a local test server is permitted.');
const sw=readFileSync(new URL('../../sw.js',import.meta.url),'utf8');
const cacheName=sw.match(/const CACHE='([^']+)'/)?.[1];
const assets=[...sw.match(/const CORE=\[([^\]]*)\]/s)?.[1]?.matchAll(/'([^']+)'/g)||[]].map(m=>m[1]);
assert(cacheName&&assets.length>10);
assert.equal(new Set(assets).size,assets.length,'Cache.addAll duplicate resource list');
for(const browserType of [chromium,webkit]){
 const browser=await browserType.launch({headless:true});
 try{
  const ctx=await browser.newContext({serviceWorkers:'allow'});const page=await ctx.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(BASE_URL+'/?app=payroll',{waitUntil:'networkidle'});
  // WebKit may resolve navigator.serviceWorker.ready while active.state is still
  // 'activating'. Wait for the actual state transition before asserting.
  await page.waitForFunction(async()=>{
   const reg=await navigator.serviceWorker.getRegistration();
   return reg?.active?.state==='activated';
  },null,{timeout:20000});
  const result=await page.evaluate(async cacheName=>{
   const timeout=new Promise((_,reject)=>setTimeout(()=>reject(Error('PWA worker activation exceeded 18 seconds')),18000));
   const reg=await Promise.race([navigator.serviceWorker.ready,timeout]);
   const actual=(await (await caches.open(cacheName)).keys()).map(r=>new URL(r.url).pathname);
   return {state:reg.active?.state,paths:actual,cacheName};
  },cacheName);
  // WebKit can transiently report 'activating' from a second ready lookup even
  // after the explicit 'activated' poll above has passed. Cache contents are
  // the important durable assertion, so avoid this instantaneous false negative.
  assert(['activated','activating'].includes(result.state),browserType.name()+' Service Worker missing');
  for(const pathname of assets)assert(result.paths.includes(pathname),`${browserType.name()} missing precache path ${pathname}`);
  assert.equal(new Set(result.paths).size,result.paths.length);
  assert.deepEqual(errors,[],browserType.name()+' page JavaScript errors');
  console.log(`PASS ${browserType.name()}: SW activated, ${assets.length} unique CORE assets cached (${cacheName})`);
 }finally{await browser.close();}
}
