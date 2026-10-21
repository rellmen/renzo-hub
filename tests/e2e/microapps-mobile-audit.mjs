// E2E · auditoría móvil de TODAS las secciones y microapps (390 px, Chromium y WebKit).
// Supabase SIMULADO y vacío: comprueba que cada pantalla abre sin errores JS, sin scroll horizontal
// y con botones táctiles de al menos 32 px. Trabajo conjunto Claude + ChatGPT (docs/COLABORACION-IA.md).
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
for(const engine of [chromium,webkit]){
 const browser=await engine.launch();
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:!process.env.EDITORIAL_DESKTOP&&engine===chromium,hasTouch:!process.env.EDITORIAL_DESKTOP,serviceWorkers:'block'});
 const page=await context.newPage();
 page.setDefaultTimeout(15000);
 let current='login';
 page.on('pageerror',e=>problems.push(`${engine.name()} · ${current}: error JS ${e.message}`));
 await context.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({contentType:'text/javascript',body:mock}));
 await context.route(base+'/**',async r=>{
  const path=new URL(r.request().url()).pathname;
  if(path==='/api/supabase-config')return r.fulfill({json:{supabaseUrl:'https://example.supabase.co',publishableKey:'test-public'}});
  if(path==='/api/deployment-info')return r.fulfill({json:{environment:'preview'}});
  if(path.startsWith('/api/'))return r.fulfill({json:{}});
  const file=path==='/'?'index.html':'.'+path;
  try{return r.fulfill({body:await readFile(resolve(file)),contentType:TYPES[extname(file)]||'application/octet-stream'});}catch{return r.fulfill({status:404,body:''});}
 });
 await page.goto(base+'/');
 await page.locator('#email').fill('demo@example.test');await page.locator('#password').fill('fake-test-password');
 await page.locator('#loginForm button[type=submit]').click();
 await page.locator('#authScreen').waitFor({state:'hidden'});
 // La presentación y la búsqueda deben usar la navegación real en cualquier tamaño.
 for(const width of [320,390,768,1440]){
  current=`editorial-${width}`;
  await page.setViewportSize({width,height:900});
  await page.locator('#bottomNav [data-open="home"]').click();
  // Nocturne visual regression: background, clipping, and contained artwork at every viewport.
  const visual=await page.evaluate(()=>{
    const cards=[...document.querySelectorAll('#home .rise-home-shortcuts .rise-area')];
    const aligned=cards.every(card=>{
      const box=card.getBoundingClientRect();
      if(box.width<1||box.left < -1 || box.right>innerWidth+1)return false;
      return [...card.querySelectorAll('.rise-area-cover')].every(img=>{
        const ib=img.getBoundingClientRect();
        return ib.left>=box.left-2&&ib.right<=box.right+2&&ib.top>=box.top-2&&ib.bottom<=box.bottom+2;
      });
    });
    return {theme:getComputedStyle(document.documentElement).getPropertyValue('--no-obsidian').trim(),
      clipped:cards.length>=5&&cards.every(c=>getComputedStyle(c).overflow==='hidden'&&getComputedStyle(c).position==='relative'),
      aligned,heroClipped:getComputedStyle(document.querySelector('#home .rise-hero')).overflow==='hidden'};
  });
  if(visual.theme!=='#111116'||!visual.clipped||!visual.aligned||!visual.heroClipped)
    problems.push(`${engine.name()} · Nocturne ${width}px: contención o tokens incorrectos ${JSON.stringify(visual)}`);
  await page.locator('[data-rise-search]').click();
  const search=page.locator('#risePalette input');
  assert.equal(await search.getAttribute('role'),'combobox','La búsqueda debe anunciar su selección');
  for(let n=0;n<14;n++)await search.press('ArrowDown');
  const active=await search.getAttribute('aria-activedescendant');
  assert(active,'La selección de teclado tiene un destino accesible');
  assert(await page.locator(`#${active}`).evaluate(el=>{const b=el.getBoundingClientRect(),p=el.parentElement.getBoundingClientRect();return b.top>=p.top-1&&b.bottom<=p.bottom+1;}),'La selección de teclado permanece visible');
  await search.fill('nomi');
  await search.press('Enter');
  await page.locator('#payroll.page.active').waitFor();
  await page.locator('#bottomNav [data-open="home"]').evaluate(el=>el.click());
  await page.keyboard.press('Control+k');
  assert.equal(await page.getByRole('dialog',{name:'Ares AI',exact:true}).isVisible(),false,'⌘K abre solo la búsqueda');
  await search.fill('zzzzzzzz');
  if(await page.locator('#risePalette .empty').count()!==1)problems.push(`${engine.name()} · ${current}: búsqueda sin resultados`);
  await search.press('ArrowDown');
  await search.fill('gym');
  await search.press('Enter');
  await page.locator('#gym.page.active').waitFor();
  assert(await page.locator('.ares-fab').isVisible(),'Ares permanece disponible en Gym');
  await page.locator('#bottomNav [data-open="home"]').evaluate(el=>el.click());
  await page.locator('#bottomNav [data-open="ares-center"]').click();
  await page.getByRole('dialog',{name:'Ares AI',exact:true}).waitFor();
  await page.keyboard.press('Escape');
  if(process.env.EDITORIAL_DESKTOP)assert(await page.locator('#bottomNav [data-open="ares-center"]').evaluate(el=>document.activeElement===el),'Cerrar Ares devuelve el foco a su botón visible');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  if(overflow>1)problems.push(`${engine.name()} · ${current}: desborde ${overflow}px`);
  if(process.env.EDITORIAL_SCREENSHOTS&&engine===chromium&&(width===390||width===1440))await page.screenshot({path:resolve(process.env.EDITORIAL_SCREENSHOTS,`rise-editorial-${width}.png`),fullPage:true,animations:'disabled'});
 }
 await page.setViewportSize({width:390,height:844});
 for(const id of SECTION_IDS){
  current=id;
  if(id==='ares-center'){ // Ares AI se abre como chat sobre Home, no como sección
   await page.evaluate(()=>{const b=document.createElement('button');b.dataset.open='ares-center';b.hidden=true;document.body.append(b);b.click();b.remove();});
   await page.waitForTimeout(500);
   const open=await page.evaluate(()=>[...document.querySelectorAll('[role=dialog],.ares-chat,#aresChat')].some(el=>el.getBoundingClientRect().height>0&&getComputedStyle(el).display!=='none'));
   if(!open)problems.push(`${engine.name()} · ares-center: el chat no se abre`);
   await page.keyboard.press('Escape');await page.waitForTimeout(300);
   continue;
  }
  await page.evaluate(id=>{const b=document.createElement('button');b.dataset.open=id;b.hidden=true;document.body.append(b);b.click();b.remove();},id);
  await page.waitForTimeout(700);
  const r=await page.evaluate(id=>{
   const sec=document.getElementById(id);
   const visible=el=>{const s=getComputedStyle(el),b=el.getBoundingClientRect();return s.visibility!=='hidden'&&s.display!=='none'&&b.width>0&&b.height>0;};
   // Un elemento dentro de un carril con scroll horizontal propio (pestañas, tablas) no rompe la página.
   const scrollsX=el=>{for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement){const o=getComputedStyle(p).overflowX;if(o==='auto'||o==='scroll'||o==='hidden'||o==='clip')return p.getBoundingClientRect().right<=innerWidth+1;}return false;};
   const overflow=document.documentElement.scrollWidth-innerWidth;
   const wide=sec?[...sec.querySelectorAll('*')].filter(el=>visible(el)&&el.getBoundingClientRect().right>innerWidth+1&&!scrollsX(el)).slice(0,3).map(el=>`${el.tagName.toLowerCase()}${el.className&&typeof el.className==='string'?'.'+el.className.trim().split(/\s+/)[0]:''}`):[];
   const small=sec?[...sec.querySelectorAll('button,[role=button],a[href],select,input[type=checkbox],input[type=radio]')].filter(el=>{if(!visible(el)||el.closest('label'))return false;const b=el.getBoundingClientRect();return b.height<32&&b.width<32;}).slice(0,3).map(el=>(el.textContent||el.getAttribute('aria-label')||el.tagName).trim().slice(0,20)):[];
   return {shown:!!sec&&visible(sec),overflow,wide,small,failed:/No se pudo cargar/.test(sec?.textContent||'')};
  },id);
  if(!r.shown)problems.push(`${engine.name()} · ${id}: la sección no se muestra`);
  if(r.failed)problems.push(`${engine.name()} · ${id}: "No se pudo cargar"`);
  if(r.overflow>1)problems.push(`${engine.name()} · ${id}: scroll horizontal de ${r.overflow}px`);
  if(r.wide.length)problems.push(`${engine.name()} · ${id}: elementos fuera de pantalla ${r.wide.join(', ')}`);
  if(r.small.length)problems.push(`${engine.name()} · ${id}: botones táctiles <32px ${r.small.map(s=>JSON.stringify(s)).join(', ')}`);
 }
 await browser.close();
}
if(problems.length){console.error(problems.join('\n'));process.exit(1);}
console.log(`Auditoría móvil OK: ${SECTION_IDS.length} secciones × Chromium y WebKit a 390 px`);
console.log('Editorial OK: búsqueda, teclado, Ares y diseño a 320/390/768/1440 px × Chromium y WebKit');
