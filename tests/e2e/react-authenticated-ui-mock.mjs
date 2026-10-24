// Mocked signed-in UI navigation only. NEVER authenticates to staging or
// claims to verify real RLS, persistent backend data, or physical iPhone PWA.
// Every Supabase response is served from Playwright's local route interceptors.
import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';

const origin=process.env.REACT_QA_BASE_URL||'http://127.0.0.1:4174';
const routes=['/','/roadmap','/ares','/academy','/aprender','/gym','/dinero','/gastos','/piel','/proyectos','/notas','/body','/food','/ajustes','/nominas','/turnos','/migracion','/apps','/quest','/news','/agentes','/career','/car','/inbox','/academia','/academia?v=cursos','/academia?leccion=matematicas-m00-l01'];
const uid='22222222-2222-4222-8222-222222222222';
const email='qa-nocturne@example.invalid';
const user={id:uid,aud:'authenticated',role:'authenticated',email,
  app_metadata:{provider:'email',providers:['email']},user_metadata:{},created_at:'2026-10-22T00:00:00.000Z'};
const expiry=Math.floor(Date.now()/1000)+3600;
const jwt=[
  Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),
  Buffer.from(JSON.stringify({aud:'authenticated',exp:expiry,iat:expiry-10,sub:uid,role:'authenticated'})).toString('base64url'),
  'mock-signature-not-a-real-token'
].join('.');
const session={access_token:jwt,token_type:'bearer',expires_in:3600,expires_at:expiry,
  refresh_token:'mock-refresh-not-a-real-token',user};

for(const [label,engine,opts] of [
  ['Chromium desktop',chromium,{viewport:{width:1440,height:900}}],
  ['WebKit iPhone emulation',webkit,{...devices['iPhone 13']}],
]){
 const browser=await engine.launch();
 try{
  const context=await browser.newContext(opts);
  const page=await context.newPage();
  const errors=[];
  const visited=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('https://ci-placeholder.supabase.co/**',async route=>{
    const url=new URL(route.request().url());
    if(route.request().method()==='OPTIONS'){
      const requestedHeaders=route.request().headers()['access-control-request-headers']||'apikey,authorization,x-client-info,content-type,prefer';
      await route.fulfill({status:204,headers:{'access-control-allow-origin':origin,
        'access-control-allow-credentials':'true',
        'access-control-allow-methods':'GET,POST,PATCH,DELETE,OPTIONS',
        'access-control-allow-headers':requestedHeaders,
        'access-control-max-age':'0','vary':'Origin'}});return;
    }
    if(url.pathname.startsWith('/auth/v1/token')){
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(session),
        headers:{'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin'}});return;
    }
    if(url.pathname==='/auth/v1/user'){
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(user),
        headers:{'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin'}});return;
    }
    if(url.pathname.startsWith('/auth/v1/')){
      await route.fulfill({status:200,contentType:'application/json',body:'{}',
        headers:{'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin'}});return;
    }
    if(url.pathname.startsWith('/rest/v1/')){
      const accept=route.request().headers().accept||'';
      const singleton=accept.includes('vnd.pgrst.object');
      await route.fulfill({status:200,contentType:'application/json',body:singleton?'null':'[]',
        headers:{'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin','content-range':'0-0/0'}});return;
    }
    // Private Storage (progress photos, evidence): empty folder listings / no signed URLs in mock QA.
    if(url.pathname.startsWith('/storage/v1/object/list/')||url.pathname.startsWith('/storage/v1/object/sign/')){
      await route.fulfill({status:200,contentType:'application/json',body:'[]',
        headers:{'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin'}});return;
    }
    throw Error('Unexpected external request in mock QA: '+url.pathname);
  });
  const first=await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
  assert.equal(first?.status(),200);
  await page.getByRole('heading',{name:'Tu espacio privado.'}).waitFor({timeout:20000});
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill('qa-mock-only-password');
  await page.getByRole('button',{name:'Entrar'}).click();
  await page.getByRole('heading',{name:'Tu espacio privado.'}).waitFor({state:'hidden',timeout:20000});
  await page.getByRole('heading',{level:1}).first().waitFor({timeout:20000});

  // Production navigation adapter: all data remains intercepted and synthetic.
  const openLauncher=async()=>{
    await page.getByRole('button',{name:'Buscar apps…',exact:false}).click();
    await page.getByRole('dialog').waitFor();
  };
  await openLauncher();
  const dialog=page.getByRole('dialog');
  await dialog.getByRole('searchbox',{name:'Buscar apps'}).fill('NOMINA');
  await dialog.getByRole('link').filter({hasText:'Nóminas'}).click();
  await page.waitForURL('**/nominas');
  await openLauncher();
  await dialog.getByRole('searchbox',{name:'Buscar apps'}).fill('Car');
  // Car is native in Nocturne (#150): the launcher must link to /car, never to Classic.
  const car=dialog.locator('a[href="/car"]');
  assert.equal(await car.getAttribute('href'),'/car');
  assert.equal(await dialog.locator('a[href*="?app=car"]').count(),0);
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({state:'hidden'});
  await page.keyboard.press('Control+k');
  await dialog.waitFor();
  await dialog.getByRole('searchbox',{name:'Buscar apps'}).fill('Notas');
  await dialog.getByRole('button',{name:'Añadir Notas a favoritos'}).click();
  await dialog.getByRole('searchbox',{name:'Buscar apps'}).fill('');
  await dialog.getByLabel('Atajo del dock').selectOption('notas');
  await page.keyboard.press('Escape');
  await page.reload({waitUntil:'domcontentloaded'});
  await openLauncher();
  await dialog.getByRole('button',{name:'Quitar Notas de favoritos'}).waitFor();
  assert.equal(await dialog.getByLabel('Atajo del dock').inputValue(),'notas');
  await page.keyboard.press('Escape');
  if(label.includes('WebKit')){
    for(const width of [360,390,430]){
      await page.setViewportSize({width,height:844});
      const dock=page.getByRole('navigation',{name:'Navegación inferior'});
      await dock.getByRole('button',{name:'Apps: abrir lanzador'}).click();
      await dialog.waitFor();
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), 'mobile horizontal overflow');
      const bounds=await dialog.boundingBox();assert.ok(bounds && bounds.width<=width);
      await dialog.getByRole('searchbox',{name:'Buscar apps'}).fill('quests');
      await dialog.getByRole('link').filter({hasText:'Quests'}).click();
      await page.waitForURL('**/quest');
      // Quests vive dentro del hub Inicio: el dock marca Inicio y las pestañas del hub marcan "XP y Quests".
      await dock.locator('a[aria-current="page"]').filter({hasText:'Inicio'}).waitFor();
      await page.getByRole('navigation',{name:'Secciones de Inicio'}).locator('a[aria-current="page"]').filter({hasText:'XP y Quests'}).waitFor();
    }
  }

  for(const path of routes){
    const res=await page.goto(new URL(path,origin).href,{waitUntil:'domcontentloaded'});
    assert.equal(res?.status(),200,label+' '+path+' HTTP failure');
    await page.getByRole('heading',{name:'Tu espacio privado.'}).waitFor({state:'hidden',timeout:20000});
    await page.getByRole('heading',{level:1}).first().waitFor({timeout:20000});
    assert.equal(await page.getByRole('button',{name:'Entrar'}).count(),0,label+' '+path+' dropped mock session');
    // WebKit informa como error de página las peticiones que siguen en vuelo cuando se navega a la
    // siguiente ruta («due to access control checks»). Esperar a que la red se calme evita ese falso
    // positivo sin ocultar excepciones reales de la app (siguen registrándose en `errors`).
    await page.waitForLoadState('networkidle',{timeout:5000}).catch(()=>{});
    visited.push(path);
  }
  // Hubs: Money agrupa Resumen, Gastos y Nóminas (Car vive dentro de Gastos); Academy agrupa los estudios.
  await page.goto(new URL('/nominas',origin).href,{waitUntil:'domcontentloaded'});
  const moneyTabs=page.getByRole('navigation',{name:'Secciones de Money'});
  await moneyTabs.waitFor();
  assert.deepEqual((await moneyTabs.getByRole('link').allInnerTexts()).map(t=>t.trim()),['Resumen','Gastos','Nóminas']);
  await page.goto(new URL('/academy',origin).href,{waitUntil:'domcontentloaded'});
  const academyTabs=page.getByRole('navigation',{name:'Secciones de Academy'});
  await academyTabs.waitFor();
  assert.deepEqual((await academyTabs.getByRole('link').allInnerTexts()).map(t=>t.trim()),['Hoy','UOC +25','Idiomas','Data & Carrera','Biblioteca']);
  await page.getByRole('heading',{name:'Lo que toca estudiar'}).waitFor();
  await page.getByText('Siguiente paso',{exact:true}).waitFor();
  // Inicio muestra el roadmap por defecto.
  await page.goto(new URL('/',origin).href,{waitUntil:'domcontentloaded'});
  await page.getByText(/^Roadmap · Fase \d\/6/).first().waitFor({timeout:15000});
  // /car lleva a Gastos → «Gastos fijos · Coche».
  await page.goto(new URL('/car',origin).href,{waitUntil:'domcontentloaded'});
  await page.waitForURL(/\/gastos#coche$/,{timeout:15000});
  await page.getByText('Gastos fijos · Coche').waitFor();
  // Idiomas: un solo apartado con las tres pestañas.
  await page.goto(new URL('/aprender?idioma=uoc',origin).href,{waitUntil:'domcontentloaded'});
  await page.getByRole('tab',{name:'Inglés · examen UOC'}).waitFor();
  assert.deepEqual((await page.getByRole('tablist',{name:'Idioma'}).getByRole('tab').allInnerTexts()).map(t=>t.trim()),['Neerlandés · B2','Inglés · C1','Inglés · examen UOC']);
  assert.equal(await page.getByRole('tab',{name:'Inglés · examen UOC'}).getAttribute('aria-selected'),'true');
  // The route matrix no longer ends at Ajustes; the account email lives there.
  // Visit it explicitly so this test verifies session persistence instead of
  // accidentally depending on the order of the route array.
  const settingsResponse=await page.goto(new URL('/ajustes',origin).href,{waitUntil:'domcontentloaded'});
  assert.equal(settingsResponse?.status(),200);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByText(email,{exact:true}).waitFor({timeout:20000});
  await page.getByRole('button',{name:'Cerrar sesión',exact:true}).click();
  await page.getByRole('heading',{name:'Tu espacio privado.'}).waitFor({timeout:20000});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:'Tu espacio privado.'}).waitFor({timeout:20000});
  assert.deepEqual(errors,[],label+' JS exceptions');
  await context.close();
  console.log(label+': mock login, '+visited.length+' authenticated route views, reload, sign-out OK');
 }finally{await browser.close();}
}
