// Ajustes · notificaciones con sesión y Supabase SIMULADOS. Comprueba el panel, la instrucción de instalar en iPhone
// (Safari sin pantalla de inicio) y la lista de dispositivos. NO demuestra entrega real de avisos ni iPhone físico.
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_ROOT?resolve(process.env.PLAYWRIGHT_ROOT,'package.json'):import.meta.url);
const {chromium,devices}=require('playwright');

const origin=process.env.REACT_QA_BASE_URL||'http://127.0.0.1:4174';
const shots=process.env.SHOTS||'';
if(shots)mkdirSync(shots,{recursive:true});
const uid='22222222-2222-4222-8222-222222222222';
const email='qa-push@example.invalid';
const user={id:uid,aud:'authenticated',role:'authenticated',email,app_metadata:{provider:'email',providers:['email']},user_metadata:{},created_at:'2026-10-22T00:00:00.000Z'};
const expiry=Math.floor(Date.now()/1000)+3600;
const jwt=[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),
 Buffer.from(JSON.stringify({aud:'authenticated',exp:expiry,iat:expiry-10,sub:uid,role:'authenticated'})).toString('base64url'),
 'mock-signature-not-a-real-token'].join('.');
const session={access_token:jwt,token_type:'bearer',expires_in:3600,expires_at:expiry,refresh_token:'mock-refresh-not-a-real-token',user};
const cors={'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin'};

const browser=await chromium.launch();
try{
 for(const [label,opts] of [['iphone',{...devices['iPhone 13'],defaultBrowserType:undefined}],['desktop',{viewport:{width:1440,height:900}}]]){
  const context=await browser.newContext(opts);
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await context.route('https://ci-placeholder.supabase.co/**',async route=>{
   const req=route.request(),url=new URL(req.url());
   if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:{...cors,'access-control-allow-methods':'GET,POST,PATCH,DELETE,OPTIONS',
    'access-control-allow-headers':req.headers()['access-control-request-headers']||'apikey,authorization,content-type'}});
   if(url.pathname.startsWith('/auth/v1/token'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(session),headers:cors});
   if(url.pathname==='/auth/v1/user')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(user),headers:cors});
   if(url.pathname.startsWith('/auth/v1/'))return route.fulfill({status:200,contentType:'application/json',body:'{}',headers:cors});
   if(url.pathname==='/rest/v1/push_subscriptions')return route.fulfill({status:200,contentType:'application/json',headers:cors,
    body:JSON.stringify([{id:'d1',endpoint:'https://web.push.apple.com/otro',label:'iPhone',created_at:'2026-11-02T00:10:00Z',last_ok_at:'2026-11-02T08:00:05Z'}])});
   if(url.pathname.startsWith('/rest/v1/'))return route.fulfill({status:200,contentType:'application/json',body:'[]',headers:{...cors,'content-range':'0-0/0'}});
   if(url.pathname.startsWith('/storage/v1/')||url.pathname.startsWith('/functions/v1/'))return route.fulfill({status:200,contentType:'application/json',body:'{}',headers:cors});
   throw Error('Petición externa inesperada en mock QA: '+url.pathname);
  });
  await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:'Tu espacio privado.'}).waitFor({timeout:30000});
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill('qa-mock-only-password');
  await page.getByRole('button',{name:'Entrar'}).click();
  await page.getByRole('heading',{name:'Tu espacio privado.'}).waitFor({state:'hidden',timeout:20000});
  await page.goto(origin+'/ajustes',{waitUntil:'domcontentloaded'});
  const panel=page.getByTestId('notifications');await panel.waitFor({timeout:30000});
  await panel.getByText(/iPhone · activado 2026-11-02 · último aviso 2026-11-02 08:00/).waitFor({timeout:10000});
  const txt=await panel.innerText();
  if(label==='iphone'){
   assert.match(txt,/Añadir a pantalla de inicio/);
   assert.ok(!/bloqueadas/.test(txt),'sin aviso de bloqueo mientras no esté instalada');
   assert.ok(await panel.getByRole('button',{name:'Activar en este dispositivo'}).isDisabled(),'en Safari sin instalar no se puede activar');
  }else{
   assert.ok(!/Añadir a pantalla de inicio/.test(txt));
   assert.ok(await panel.getByRole('button',{name:'Activar en este dispositivo'}).isEnabled());
  }
  await panel.scrollIntoViewIfNeeded();
  await page.screenshot({path:`${shots||'/tmp'}/notifications-${label}.png`});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(overflow<=1,'desborde '+overflow);
  assert.deepEqual(errors,[]);
  console.log(`${label}: panel de notificaciones${label==='iphone'?' con instrucción de instalar':' activable'}, lista de dispositivos, sin desborde`);
  await context.close();
 }
}finally{await browser.close();}
