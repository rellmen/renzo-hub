// Gastos · tickets con sesión, Supabase y /api/receipt-items SIMULADOS (ticket ficticio generado aquí).
// Lo que SÍ es real: el lector en el navegador (tesseract.js desde /vendor/tesseract) con la CSP de producción
// aplicada al worker (WebAssembly solo con 'wasm-unsafe-eval'), el enlace al movimiento y el registro que se guarda.
// NO demuestra RLS real, el modelo de OpenRouter, ni la cámara de un iPhone físico.
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync} from 'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_ROOT?resolve(process.env.PLAYWRIGHT_ROOT,'package.json'):import.meta.url);
const {chromium,devices}=require('playwright');

const origin=process.env.REACT_QA_BASE_URL||'http://127.0.0.1:4174';
const shots=process.env.SHOTS||'';
if(shots)mkdirSync(shots,{recursive:true});
const cfg=JSON.parse(readFileSync(new URL('../../apps/rise-react/vercel.json',import.meta.url),'utf8'));
const CSP=cfg.headers.find(h=>h.source==='/(.*)').headers.find(h=>h.key==='Content-Security-Policy').value;
const uid='22222222-2222-4222-8222-222222222222';
const email='qa-receipts@example.invalid';
const user={id:uid,aud:'authenticated',role:'authenticated',email,app_metadata:{provider:'email',providers:['email']},user_metadata:{},created_at:'2026-10-22T00:00:00.000Z'};
const expiry=Math.floor(Date.now()/1000)+3600;
const jwt=[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),
 Buffer.from(JSON.stringify({aud:'authenticated',exp:expiry,iat:expiry-10,sub:uid,role:'authenticated'})).toString('base64url'),'mock-signature-not-a-real-token'].join('.');
const session={access_token:jwt,token_type:'bearer',expires_in:3600,expires_at:expiry,refresh_token:'mock-refresh-not-a-real-token',user};
const iso=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Amsterdam'}).format(d);
const day=iso(new Date(Date.now()-864e5)),[y,m,d]=day.split('-');
const tx=(id,date,bank,amount,name)=>({id:`10000000-0000-4000-8000-${String(id).padStart(12,'0')}`,owner_id:uid,domain:'money',record_type:'bank_tx',title:name,status:'confirmed',
 occurred_at:date+'T12:00:00.000Z',updated_at:date+'T12:00:00.000Z',source:'import',requires_review:false,payload:{bank,account:'…1234',date,amount,name}});
const AH=tx(1,day,'ING',-2.98,'Albert Heijn 1234 WEERT');
const txs=[AH,tx(2,day,'Revolut',-18.5,'Restaurant'),tx(3,day,'ING',-2.98,'Kiosk')];
const cors={'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin'};
const receiptHtml=`<body style="margin:0;background:#fff"><pre id="r" style="font:28px/1.35 'DejaVu Sans Mono',monospace;color:#000;padding:36px;width:620px;margin:0">ALBERT HEIJN
Velden 12 Weert

HALFVOLLE MELK        1,29
BANANEN               2,19
KORTING              -0,50

TOTAAL                2,98
PINNEN                2,98

${d}-${m}-${y} 18:42  KASSA 3</pre></body>`;

const browser=await chromium.launch();
try{
 const maker=await browser.newPage();await maker.setContent(receiptHtml);
 const photo=await maker.locator('#r').screenshot({type:'png'});await maker.close();
 for(const [label,opts] of [['iphone',{...devices['iPhone 13'],defaultBrowserType:undefined}],['desktop',{viewport:{width:1440,height:900}}]]){
  const context=await browser.newContext(opts);
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'||process.env.DEBUG)console.error('[console]',m.text().slice(0,300));});
  const saved=[];const uploads=[];let aiBody=null;
  // CSP de producción en el worker del lector: el WebAssembly corre ahí.
  await context.route(origin+'/vendor/tesseract/worker.min.js',async route=>{const r=await route.fetch();await route.fulfill({response:r,headers:{...r.headers(),'content-security-policy':CSP}});});
  await context.route(origin+'/api/receipt-items',async route=>{
   if(route.request().method()==='GET')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({enabled:true})});
   aiBody=route.request().postDataJSON();
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({items:[{name:'HALFVOLLE MELK',qty:1,price:1.29},{name:'BANANEN',qty:1,price:2.19},{name:'KORTING',qty:1,price:-0.5}],total:2.98,model:'mock/free-vision',privacy:'deny'})});
  });
  await context.route('https://ci-placeholder.supabase.co/**',async route=>{
   const req=route.request(),url=new URL(req.url());
   if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:{...cors,'access-control-allow-methods':'GET,POST,PATCH,DELETE,OPTIONS',
    'access-control-allow-headers':req.headers()['access-control-request-headers']||'apikey,authorization,content-type,x-upsert'}});
   if(url.pathname.startsWith('/auth/v1/token'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(session),headers:cors});
   if(url.pathname==='/auth/v1/user')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(user),headers:cors});
   if(url.pathname.startsWith('/auth/v1/'))return route.fulfill({status:200,contentType:'application/json',body:'{}',headers:cors});
   if(url.pathname.startsWith('/storage/v1/object/hub-private/')&&req.method()==='POST'){
    uploads.push({path:decodeURIComponent(url.pathname.slice('/storage/v1/object/hub-private/'.length)),jpeg:(req.postDataBuffer()||Buffer.alloc(0)).includes(Buffer.from([0xff,0xd8,0xff]))});
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({Key:'hub-private/x',Id:'x'}),headers:cors});
   }
   if(url.pathname==='/rest/v1/hub_records'&&req.method()==='POST'){
    const row=req.postDataJSON();saved.push(...(Array.isArray(row)?row:[row]).map(r=>({...r,updated_at:new Date().toISOString()})));
    return route.fulfill({status:201,contentType:'application/json',body:'[]',headers:cors});
   }
   if(url.pathname.startsWith('/rest/v1/')){
    const single=(req.headers().accept||'').includes('vnd.pgrst.object');
    const rt=url.searchParams.get('record_type')||'',off=Number(url.searchParams.get('offset')||0)===0;
    const id=(url.searchParams.get('id')||'').replace('eq.','');
    let body=url.pathname==='/rest/v1/hub_records'&&off?(rt.includes('bank_tx')?txs:rt.includes('money_receipt')?saved:[]):[];
    if(id)body=body.filter(r=>r.id===id);
    return route.fulfill({status:200,contentType:'application/json',body:single?JSON.stringify(body[0]??null):JSON.stringify(body),headers:{...cors,'content-range':`0-${body.length}/${body.length}`}});
   }
   if(url.pathname.startsWith('/storage/v1/'))return route.fulfill({status:200,contentType:'application/json',body:'[]',headers:cors});
   if(url.pathname.startsWith('/functions/v1/'))return route.fulfill({status:200,contentType:'application/json',body:'{}',headers:cors});
   throw Error('Petición externa inesperada en mock QA: '+url.pathname);
  });
  await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:'Tu espacio privado.'}).waitFor({timeout:30000});
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill('qa-mock-only-password');
  await page.getByRole('button',{name:'Entrar'}).click();
  await page.getByRole('heading',{name:'Tu espacio privado.'}).waitFor({state:'hidden',timeout:20000});
  await page.goto(origin+'/gastos',{waitUntil:'domcontentloaded'});
  const panel=page.getByTestId('receipts');await panel.waitFor({timeout:30000});
  await page.getByLabel('Foto del ticket').setInputFiles({name:'ticket.png',mimeType:'image/png',buffer:photo});
  // Lectura real en el navegador.
  await panel.getByLabel('Tienda').waitFor({timeout:15000});
  await page.getByText(/Leyendo en el móvil/).waitFor({state:'hidden',timeout:120000});
  assert.equal(await panel.getByLabel('Tienda').inputValue(),'Albert Heijn');
  assert.equal(await panel.getByLabel('Fecha').inputValue(),day);
  assert.equal(await panel.getByLabel('Total (€)').inputValue(),'2,98');
  // Dos cargos de 2,98: se preselecciona el del mismo comercio.
  assert.ok(await panel.getByRole('radio',{name:/Albert Heijn · ING/}).isChecked(),'enlace automático');
  assert.ok(!(await panel.getByRole('radio',{name:/Kiosk/}).isChecked()));
  await panel.getByLabel(/Enviar esta foto a OpenRouter/).check();
  await panel.getByRole('button',{name:'Leer productos'}).click();
  await panel.getByTestId('receipt-diff').waitFor({timeout:15000});
  assert.match(await panel.getByTestId('receipt-diff').innerText(),/cuadra con el total/);
  assert.match(aiBody.image,/^data:image\/jpeg;base64,/);assert.equal(aiBody.allowCollection,false);
  await panel.getByText('Movimiento del banco').scrollIntoViewIfNeeded();
  await page.screenshot({path:`${shots||'/tmp'}/receipts-bank-${label}.png`});
  await panel.getByText('Guardar ticket').scrollIntoViewIfNeeded();
  await page.screenshot({path:`${shots||'/tmp'}/receipts-review-${label}.png`});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(overflow<=1,'desborde '+overflow);
  await panel.getByRole('button',{name:'Guardar ticket'}).click();
  await page.getByText(/Ticket guardado: Albert Heijn · 2.98 €/).waitFor({timeout:15000});
  assert.equal(uploads.length,1);assert.ok(uploads[0].jpeg,'se sube un JPEG');
  assert.match(uploads[0].path,new RegExp(`^${uid}/receipts/[0-9a-f-]{36}/[0-9a-f]{64}\\.jpg$`));
  const r=saved[0];
  assert.equal(r.domain,'money');assert.equal(r.record_type,'money_receipt');assert.equal(r.status,'reviewed');
  assert.equal(r.payload.bank_tx_id,AH.id);assert.equal(r.payload.total,2.98);assert.equal(r.payload.items.length,3);
  assert.equal(r.payload.items_sum,2.98);assert.equal(r.payload.photo.path,uploads[0].path);assert.equal(r.payload.read.model,'mock/free-vision');
  await panel.getByText(/Enlazado: .*Albert Heijn · ING/).waitFor({timeout:10000});
  assert.deepEqual(errors,[]);
  console.log(`${label}: ticket leído en el navegador (Albert Heijn, ${day}, 2,98), enlazado al cargo de ING, productos cuadran, guardado revisado, sin desborde`);
  await context.close();
 }
}finally{await browser.close();}
