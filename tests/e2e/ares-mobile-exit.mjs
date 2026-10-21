// E2E · entrar y salir de Ares AI con facilidad en el móvil (2.40.0) y comprobación de las microapps con más aire.
// Supabase SIMULADO y vacío, misma base que microapps-mobile-audit.mjs. Chromium y WebKit.
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {SECTION_IDS} from '../../microapps/registry.js';
const require=createRequire(import.meta.url);
const {chromium,webkit}=require('playwright');
const base='https://renzo-hub-2-1-staging.vercel.app';
const UID='22222222-2222-4222-8222-222222222222';
const mock=`export function createClient(){
 let user=null,authCb;
 const db={from(){let single=false;const q=new Proxy({}, {get(_,key){if(key==='then')return (ok,bad)=>Promise.resolve({data:single?null:[],error:null,count:0}).then(ok,bad);return (...a)=>{if(key==='maybeSingle'||key==='single')single=true;return q;};}});return q;},
  channel(){const ch={on(){return ch;},subscribe(){return ch;}};return ch;},removeChannel(){},rpc:async()=>({data:null,error:null}),
  storage:{from:()=>({download:async()=>({data:null,error:null}),upload:async()=>({data:null,error:null}),list:async()=>({data:[],error:null})})},
  functions:{invoke:async()=>({data:null,error:null})},
  auth:{onAuthStateChange(cb){authCb=cb;return {data:{subscription:{unsubscribe(){}}}};},getSession:async()=>({data:{session:user?{user,access_token:'t'}:null}}),getUser:async()=>({data:{user}}),
   updateUser:async()=>({data:{user},error:null}),signInWithPassword:async()=>{user={id:'${UID}',email:'demo@example.test',user_metadata:{}};authCb('SIGNED_IN',{user});return {};},signOut:async()=>{user=null;authCb('SIGNED_OUT',null);return {};}}};
 return db;}`;
const TYPES={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpeg':'image/jpeg','.jpg':'image/jpeg'};

const problems=[];
const check=(ok,msg)=>{if(!ok)problems.push(msg);};
for(const engine of [chromium,webkit]){
 const browser=await engine.launch();
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:engine===chromium,hasTouch:true,serviceWorkers:'block'});
 const page=await context.newPage();page.setDefaultTimeout(15000);
 const tag=engine.name();
 page.on('pageerror',e=>problems.push(`${tag}: error JS ${e.message}`));
 await context.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({contentType:'text/javascript',body:mock}));
 await context.route(base+'/**',async r=>{
  const path=new URL(r.request().url()).pathname;
  if(path==='/api/supabase-config')return r.fulfill({json:{supabaseUrl:'https://example.supabase.co',publishableKey:'test-public'}});
  if(path==='/api/deployment-info')return r.fulfill({json:{environment:'preview'}});
  if(path==='/api/ares-ai')return r.fulfill({json:{enabled:false}});
  if(path.startsWith('/api/'))return r.fulfill({json:{}});
  const file=path==='/'?'index.html':'.'+path;
  try{return r.fulfill({body:await readFile(resolve(file)),contentType:TYPES[extname(file)]||'application/octet-stream'});}catch{return r.fulfill({status:404,body:''});}
 });
 await page.goto(base+'/');
 await page.locator('#email').fill('demo@example.test');await page.locator('#password').fill('fake-test-password');
 await page.locator('#loginForm button[type=submit]').click();
 await page.locator('#authScreen').waitFor({state:'hidden'});
 const chat=page.getByRole('dialog',{name:'Ares AI',exact:true});
 const navAres=page.locator('#bottomNav [data-open="ares-center"]');
 const openFromNav=async()=>{await navAres.click();await chat.waitFor();};
 const isClosed=async(how)=>{await page.waitForFunction(()=>document.querySelector('.ares-chat')?.hidden===true);check(!(await page.evaluate(()=>document.body.classList.contains('ares-chat-open'))),`${tag} · ${how}: body sigue bloqueado`);};

 await openFromNav();
 // El botón Salir está a la vista, arriba a la izquierda, con tamaño táctil y dentro de la pantalla.
 const back=page.getByRole('button',{name:'Salir de Ares AI',exact:true});
 check(await back.isVisible(),`${tag}: falta el botón Salir`);
 const bb=await back.boundingBox();
 check(bb&&bb.height>=44&&bb.width>=44&&bb.y>=0&&bb.x<120,`${tag}: botón Salir mal colocado ${JSON.stringify(bb)}`);
 // La barra inferior sigue visible y por encima del chat; el formulario no queda tapado.
 const nb=await navAres.boundingBox();
 const onTop=await page.evaluate(({x,y})=>!!document.elementFromPoint(x,y)?.closest('#bottomNav'),{x:nb.x+nb.width/2,y:nb.y+nb.height/2});
 check(onTop,`${tag}: la barra inferior queda tapada por Ares`);
 const formBottom=await page.locator('.ares-chat-form').evaluate(el=>el.getBoundingClientRect().bottom);
 const navTop=await page.locator('#bottomNav').evaluate(el=>el.getBoundingClientRect().top);
 check(formBottom<=navTop+1,`${tag}: la barra tapa el campo de texto (${formBottom} > ${navTop})`);
 check((await navAres.getAttribute('aria-expanded'))==='true',`${tag}: el botón central no anuncia que Ares está abierto`);
 await back.click();await isClosed('Salir');

 // El botón central es un interruptor.
 await openFromNav();await navAres.click();await isClosed('botón central');
 check((await navAres.getAttribute('aria-expanded'))==='false',`${tag}: aria-expanded no vuelve a false`);
 // Ir a otra sección desde la barra cierra Ares y abre la sección.
 await openFromNav();await page.locator('#bottomNav [data-open="more"]').click();await isClosed('barra → Más');
 await page.locator('#more.page.active').waitFor();
 await page.locator('#more .rise-more-link[data-open="work"]').click();
 await page.locator('#work.page.active').waitFor();
 // ✕, Escape y atrás del navegador siguen funcionando.
 await openFromNav();await page.getByRole('button',{name:'Cerrar Ares AI',exact:true}).click();await isClosed('✕');
 await openFromNav();await page.keyboard.press('Escape');await isClosed('Escape');
 await openFromNav();await page.goBack();await isClosed('atrás');
 check(page.url().startsWith(base),`${tag}: atrás salió de la app`);
 // Los mensajes se conservan al salir y volver.
 await openFromNav();const before=await page.locator('.ares-msg').count();await back.click();await isClosed('Salir 2');await openFromNav();
 check((await page.locator('.ares-msg').count())===before,`${tag}: se pierden los mensajes al salir`);
 await back.click();await isClosed('Salir 3');

 // Microapps con más aire: textos ≥ 12 px, campos ≥ 48 px de alto y sin scroll horizontal.
 for(const id of ['work','money','study','skin','food','settings']){
  await page.evaluate(id=>{const b=document.createElement('button');b.dataset.open=id;b.hidden=true;document.body.append(b);b.click();b.remove();},id);
  await page.waitForTimeout(400);
  const r=await page.evaluate(id=>{const sec=document.getElementById(id);const vis=el=>{const s=getComputedStyle(el),b=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&b.width>0&&b.height>0;};
   const small=[...sec.querySelectorAll('small,.small,label,.ey,.worldhint')].filter(vis).filter(e=>parseFloat(getComputedStyle(e).fontSize)<12).length;
   const fields=[...sec.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]):not([type=color]),select')].filter(vis).filter(e=>e.getBoundingClientRect().height<47.5).length;
   return {small,fields,overflow:document.documentElement.scrollWidth-innerWidth};},id);
  check(r.small===0,`${tag} · ${id}: ${r.small} textos < 12 px`);
  check(r.fields===0,`${tag} · ${id}: ${r.fields} campos < 48 px`);
  check(r.overflow<=1,`${tag} · ${id}: scroll horizontal ${r.overflow}px`);
 }
 await browser.close();
}
if(problems.length){console.error(problems.join('\n'));process.exit(1);}
console.log('Ares móvil OK: Salir, botón central (interruptor), barra → sección, ✕, Escape, atrás y mensajes conservados · microapps con más aire · Chromium y WebKit a 390 px');
