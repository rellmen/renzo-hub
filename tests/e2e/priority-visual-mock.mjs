// RISE PRIORITY · QA de interfaz con sesión y Supabase SIMULADOS (sin cuentas reales ni red externa).
// Emula PostgREST en memoria (filtros eq, single/maybeSingle, trigger updated_at) para ejercitar el cliente
// supabase-js real: alta, completar, conflicto CAS, importación con respuesta perdida, sin conexión,
// desbordamiento en anchos de iPhone y capturas. NO demuestra RLS real, iPhone físico ni PWA instalada.
import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';

const origin=process.env.REACT_QA_BASE_URL||'http://127.0.0.1:4174';
const shots=process.env.SHOTS||'';
if(shots)mkdirSync(shots,{recursive:true});
const uid='22222222-2222-4222-8222-222222222222';
const email='qa-priority@example.invalid';
const user={id:uid,aud:'authenticated',role:'authenticated',email,app_metadata:{provider:'email',providers:['email']},user_metadata:{},created_at:'2026-10-22T00:00:00.000Z'};
const expiry=Math.floor(Date.now()/1000)+3600;
const jwt=[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),
 Buffer.from(JSON.stringify({aud:'authenticated',exp:expiry,iat:expiry-10,sub:uid,role:'authenticated'})).toString('base64url'),
 'mock-signature-not-a-real-token'].join('.');
const session={access_token:jwt,token_type:'bearer',expires_in:3600,expires_at:expiry,refresh_token:'mock-refresh-not-a-real-token',user};
const LONG='Revisar-la-discrepancia-de-inventario-del-pasillo-veintitrés-con-un-título-muy-largo-sin-espacios-para-comprobar-que-no-desborda-en-el-iPhone-más-estrecho';

function seed(){
 const t=(id,title,payload,updated)=>({id,owner_id:uid,domain:'work',record_type:'renzo_task',title,status:payload.status,
  occurred_at:'2026-10-20T12:00:00.000Z',payload:{id,title,...payload},source:'manual',requires_review:false,updated_at:updated,created_at:updated});
 return [
  t('10000000-0000-4000-8000-000000000001','Tarea antigua de Work',{status:'This Week',priority:'High',project:'Data'},'2026-10-20T09:00:00.000Z'),
  t('10000000-0000-4000-8000-000000000002',LONG,{status:'Today',priority:'Normal',urgency:'P0',why:'Bloquea el cierre semanal',dueDate:'2026-10-01',deadlineType:'interna'},'2026-10-21T09:00:00.000Z'),
  t('10000000-0000-4000-8000-000000000003','Practicar SQL',{status:'Backlog',priority:'Normal',urgency:'P2',why:'Entrevistas',dueDate:'2026-12-01'},'2026-10-22T09:00:00.000Z'),
  t('10000000-0000-4000-8000-000000000004','Tarea ya hecha',{status:'Completed',priority:'Normal',urgency:'P3',why:'Ordenar',reopenStatus:'Waiting'},'2026-10-23T09:00:00.000Z'),
 ];
}
const cors={'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin'};

async function run(label,engine,opts){
 const browser=await engine.launch();
 const db=seed();
 const log=[];          // writes observed by the fake PostgREST
 const faults={dropNextInsertResponse:false};
 try{
  const context=await browser.newContext(opts);
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('https://ci-placeholder.supabase.co/**',async route=>{
   const req=route.request(),url=new URL(req.url()),method=req.method();
   if(method==='OPTIONS'){await route.fulfill({status:204,headers:{...cors,'access-control-allow-methods':'GET,POST,PATCH,DELETE,OPTIONS',
     'access-control-allow-headers':req.headers()['access-control-request-headers']||'*','access-control-max-age':'0'}});return;}
   if(url.pathname.startsWith('/auth/v1/token')){await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(session),headers:cors});return;}
   if(url.pathname==='/auth/v1/user'){await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(user),headers:cors});return;}
   if(url.pathname.startsWith('/auth/v1/')){await route.fulfill({status:200,contentType:'application/json',body:'{}',headers:cors});return;}
   if(url.pathname.startsWith('/storage/v1/')){await route.fulfill({status:200,contentType:'application/json',body:'[]',headers:cors});return;}
   if(!url.pathname.startsWith('/rest/v1/'))throw Error('Unexpected external request in mock QA: '+url.pathname);
   const object=(req.headers().accept||'').includes('vnd.pgrst.object');
   const reply=async rows=>{
    if(object){
     if(rows.length!==1){await route.fulfill({status:406,contentType:'application/json',headers:cors,
       body:JSON.stringify({code:'PGRST116',details:`The result contains ${rows.length} rows`,hint:null,message:'JSON object requested, multiple (or no) rows returned'})});return;}
     await route.fulfill({status:method==='POST'?201:200,contentType:'application/vnd.pgrst.object+json',headers:cors,body:JSON.stringify(rows[0])});return;
    }
    await route.fulfill({status:200,contentType:'application/json',headers:{...cors,'content-range':`0-${Math.max(rows.length-1,0)}/${rows.length}`},body:JSON.stringify(rows)});
   };
   if(url.pathname!=='/rest/v1/hub_records'){await reply([]);return;}
   const filters=[...url.searchParams].filter(([k,v])=>v.startsWith('eq.'));
   const match=r=>filters.every(([k,v])=>String(r[k])===decodeURIComponent(v.slice(3)));
   if(method==='GET'){
    let rows=db.filter(match).sort((a,b)=>b.updated_at.localeCompare(a.updated_at));
    const limit=Number(url.searchParams.get('limit')||0);if(limit)rows=rows.slice(0,limit);
    await reply(rows);return;
   }
   const body=JSON.parse(req.postData()||'null');
   if(method==='POST'){
    const rows=(Array.isArray(body)?body:[body]);
    for(const r of rows){
     if(r.owner_id!==uid){await route.fulfill({status:403,contentType:'application/json',headers:cors,body:JSON.stringify({code:'42501',message:'new row violates row-level security policy'})});return;}
     if(db.some(x=>x.id===r.id)){await route.fulfill({status:409,contentType:'application/json',headers:cors,body:JSON.stringify({code:'23505',message:'duplicate key value violates unique constraint "hub_records_pkey"'})});return;}
    }
    const now=new Date().toISOString();
    const inserted=rows.map(r=>({...r,updated_at:now,created_at:now}));
    db.push(...inserted);log.push(['POST',...inserted.map(r=>r.id)]);
    if(faults.dropNextInsertResponse){faults.dropNextInsertResponse=false;await route.abort('connectionreset');return;}
    await reply(inserted);return;
   }
   if(method==='PATCH'){
    const rows=db.filter(match);
    // BEFORE UPDATE trigger: updated_at := now()
    for(const r of rows){Object.assign(r,body,{updated_at:new Date(Date.now()+1).toISOString()});}
    log.push(['PATCH',filters.map(([k,v])=>k+'='+decodeURIComponent(v)).join('&'),rows.length]);
    await reply(rows);return;
   }
   throw Error('Unexpected method '+method);
  });

  await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:'Tu espacio privado.'}).waitFor({timeout:20000});
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill('qa-mock-only-password');
  await page.getByRole('button',{name:'Entrar'}).click();
  const board=page.getByRole('region',{name:'RISE PRIORITY · tareas prioritarias'});
  await board.getByText('Practicar SQL').waitFor({timeout:20000});

  // Orden y ubicación: el panel va antes del roadmap; P0 vencida primero; completada oculta por defecto.
  const before=await page.evaluate(()=>{const b=document.querySelector('section[aria-label^="RISE PRIORITY"]');
   const r=document.querySelector('a[aria-label="Abrir roadmap completo"]');
   return !!(b&&r&&(b.compareDocumentPosition(r)&Node.DOCUMENT_POSITION_FOLLOWING));});
  assert.ok(before,label+': el panel debe ir antes del roadmap');
  const titles=await board.locator('ul > li p.font-semibold').allInnerTexts();
  assert.deepEqual(titles,[LONG,'Tarea antigua de Work','Practicar SQL'],label+': orden');
  await board.getByText('Motivo pendiente de definir').waitFor();
  await board.getByText('P1 · Alta').waitFor();

  // Desbordamiento horizontal en anchos de iPhone.
  if(label.includes('iPhone')){
   for(const width of [360,390,430]){
    await page.setViewportSize({width,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' overflow at '+width);
    const box=await board.boundingBox();assert.ok(box&&box.x>=0&&box.x+box.width<=width+1,label+' board fits '+width);
   }
  }
  if(shots)await board.screenshot({path:`${shots}/${label.replace(/\W+/g,'-')}-01-panel.png`});

  // Alta: sin motivo no llama al servidor; con motivo, POST confirmado y aparece en la lista.
  await board.getByRole('button',{name:'Nueva tarea'}).click();
  await board.getByRole('textbox',{name:'Tarea',exact:true}).fill('Tarea creada en QA');
  const posts=()=>log.filter(x=>x[0]==='POST').length;
  const p0=posts();
  await board.getByRole('button',{name:'Guardar',exact:true}).click();
  assert.equal(posts(),p0,label+': sin motivo no debe escribir');
  await board.getByLabel(/Por qué es importante/).fill('Validar el flujo de alta');
  await board.getByRole('button',{name:'Guardar',exact:true}).click();
  await board.getByText('Tarea creada en QA').waitFor();
  assert.equal(posts(),p0+1);

  // Completar envía CAS con updated_at y la tarea sale de pendientes.
  await board.getByLabel('Completar: Practicar SQL').click();
  await board.getByLabel('Completar: Practicar SQL').waitFor({state:'detached'});
  const patch=log.filter(x=>x[0]==='PATCH').at(-1);
  assert.ok(patch[1].includes('updated_at=')&&patch[1].includes('owner_id=eq.'+uid)&&patch[1].includes('record_type=eq.renzo_task')&&patch[1].includes('domain=eq.work'),label+': filtros CAS');
  assert.equal(patch[2],1);

  // Conflicto: otro dispositivo guarda primero; el borrador se conserva y se reaplica solo al pulsar.
  const legacy=db.find(r=>r.title==='Tarea antigua de Work');
  const row=board.locator('li').filter({hasText:'Tarea antigua de Work'});
  await row.getByRole('button',{name:'Editar'}).click();
  Object.assign(legacy,{title:'Cambiada en el móvil',payload:{...legacy.payload,title:'Cambiada en el móvil'},updated_at:new Date(Date.now()+5000).toISOString()});
  await board.getByRole('textbox',{name:'Tarea',exact:true}).fill('Mi borrador del portátil');
  await board.getByLabel(/Por qué es importante/).fill('Motivo nuevo');
  await board.getByRole('button',{name:'Guardar',exact:true}).click();
  await board.getByText(/Tu borrador sigue aquí/).waitFor();
  await board.getByText(/«Cambiada en el móvil»/).waitFor();
  assert.equal(await board.getByRole('textbox',{name:'Tarea',exact:true}).inputValue(),'Mi borrador del portátil');
  assert.equal(legacy.title,'Cambiada en el móvil',label+': el remoto no debe pisarse sin confirmar');
  if(shots)await board.screenshot({path:`${shots}/${label.replace(/\W+/g,'-')}-02-conflicto.png`});
  await board.getByRole('button',{name:'Guardar mi borrador sobre la versión nueva'}).click();
  await board.getByText('Mi borrador del portátil').waitFor();
  assert.equal(legacy.payload.priority,'High',label+': prioridad Work intacta');
  assert.equal(legacy.payload.project,'Data',label+': campos Work intactos');

  // Importación: respuesta perdida en la 2ª alta; el reintento consulta el UUID y no duplica.
  await board.getByRole('button',{name:'Importar propuesta'}).click();
  await board.getByLabel('JSON de tareas sugeridas').fill(JSON.stringify({tasks:[
   {title:'Propuesta uno',urgency:'P2',dueDate:'2026-11-08',why:'Práctica',origin:'claude',proposalId:'qa-1'},
   {title:'Propuesta dos',urgency:'P1',dueDate:'2026-11-09',why:'Entrevista',origin:'chatgpt',proposalId:'qa-2'},
   {title:'Plazo externo',urgency:'P0',dueDate:'2026-10-31',deadlineType:'real',why:'Recargo',origin:'claude',evidenceCheckedAt:'2026-10-27T09:00:00Z'}]}));
  await board.getByRole('button',{name:'Revisar propuestas'}).click();
  await board.getByText(/no cuenta como revisión/).waitFor();
  if(shots)await board.screenshot({path:`${shots}/${label.replace(/\W+/g,'-')}-03-revision.png`});
  await board.getByLabel('Incluir propuesta: Plazo externo').click();
  let inserts=0;
  const orig=faults;page.on('request',r=>{if(r.method()==='POST'&&r.url().includes('/hub_records')){inserts++;if(inserts===2)orig.dropNextInsertResponse=true;}});
  await board.getByRole('button',{name:'Aprobar y guardar 2'}).click();
  await board.getByText(/No guardada/).waitFor();
  await board.getByRole('button',{name:'Reintentar pendientes (1)'}).click();
  await board.getByText(/Guardada y confirmada/).nth(1).waitFor();
  assert.equal(db.filter(r=>r.title==='Propuesta dos').length,1,label+': sin duplicados tras respuesta perdida');
  assert.equal(db.filter(r=>r.title==='Plazo externo').length,0,label+': descartada no se guarda');
  await board.getByRole('button',{name:'Cerrar'}).click();

  // Sin conexión: ningún éxito falso ni escritura.
  await context.setOffline(true);
  await board.getByRole('button',{name:'Nueva tarea'}).click();
  assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('maxlength')),'180',label+': el editor recibe el foco');
  await board.getByRole('textbox',{name:'Tarea',exact:true}).fill('Offline');
  await board.getByLabel(/Por qué es importante/).fill('Sin red');
  const pOff=posts();
  await board.getByRole('button',{name:'Guardar',exact:true}).click();
  await board.getByText(/Sin conexión: no se ha guardado nada/).waitFor();
  assert.equal(posts(),pOff);
  await context.setOffline(false);
  // Al volver la red no se reenvía solo: hace falta pulsar Guardar otra vez.
  await page.waitForTimeout(1500);
  assert.equal(posts(),pOff,label+': no debe reenviarse solo al recuperar la red');
  assert.equal(await board.getByRole('textbox',{name:'Tarea',exact:true}).inputValue(),'Offline',label+': borrador conservado');

  // Teclado: el editor recibe el foco y los controles tienen nombre accesible.
  const unnamed=await board.locator('input,select,textarea,button').evaluateAll(els=>els.filter(e=>{
   const id=e.id&&document.querySelector(`label[for="${e.id}"]`);return !(e.getAttribute('aria-label')||e.closest('label')||id||(e.tagName==='BUTTON'&&e.textContent.trim()));}).length);
  assert.equal(unnamed,0,label+': controles sin nombre accesible');
  assert.deepEqual(errors,[],label+': errores de página');
  console.log(`PASS ${label}: orden, alta, CAS, conflicto, importación con respuesta perdida, offline, a11y${label.includes('iPhone')?', 360/390/430 sin desbordar':''}. Escrituras simuladas: ${log.length}`);
 }finally{await browser.close();}
}
await run('Chromium desktop',chromium,{viewport:{width:1440,height:900}});
// CI uses WebKit. QA_IPHONE_ENGINE=chromium only where WebKit is not installed (layout check, not Safari).
const iphoneEngine=process.env.QA_IPHONE_ENGINE==='chromium'?chromium:webkit;
const {defaultBrowserType:_bt,...iphone}=devices['iPhone 13'];
await run((iphoneEngine===webkit?'WebKit':'Chromium')+' iPhone 13',iphoneEngine,iphone);
