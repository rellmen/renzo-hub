// Mocked signed-in UI navigation only. NEVER authenticates to staging or
// claims to verify real RLS, persistent backend data, or physical iPhone PWA.
// Every Supabase response is served from Playwright's local route interceptors.
import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';

const origin=process.env.REACT_QA_BASE_URL||'http://127.0.0.1:4174';
const routes=['/','/ares','/aprender','/gym','/dinero','/piel','/proyectos','/notas','/body','/food','/ajustes'];
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
  await page.route('https://ci-placeholder.supabase.co/**',async route=>{
    const url=new URL(route.request().url());
    if(route.request().method()==='OPTIONS'){
      await route.fulfill({status:204,headers:{'access-control-allow-origin':'*',
        'access-control-allow-methods':'GET,POST,PATCH,DELETE,OPTIONS',
        'access-control-allow-headers':'apikey,authorization,x-client-info,content-type,prefer',
        'access-control-max-age':'0'}});return;
    }
    if(url.pathname.startsWith('/auth/v1/token')){
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(session),
        headers:{'access-control-allow-origin':'*'}});return;
    }
    if(url.pathname==='/auth/v1/user'){
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(user),
        headers:{'access-control-allow-origin':'*'}});return;
    }
    if(url.pathname.startsWith('/auth/v1/')){
      await route.fulfill({status:200,contentType:'application/json',body:'{}',
        headers:{'access-control-allow-origin':'*'}});return;
    }
    if(url.pathname.startsWith('/rest/v1/')){
      const accept=route.request().headers().accept||'';
      const singleton=accept.includes('vnd.pgrst.object');
      await route.fulfill({status:200,contentType:'application/json',body:singleton?'null':'[]',
        headers:{'access-control-allow-origin':'*','content-range':'0-0/0'}});return;
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

  for(const path of routes){
    const res=await page.goto(new URL(path,origin).href,{waitUntil:'domcontentloaded'});
    assert.equal(res?.status(),200,label+' '+path+' HTTP failure');
    await page.getByRole('heading',{name:'Tu espacio privado.'}).waitFor({state:'hidden',timeout:20000});
    await page.getByRole('heading',{level:1}).first().waitFor({timeout:20000});
    assert.equal(await page.getByRole('button',{name:'Entrar'}).count(),0,label+' '+path+' dropped mock session');
    visited.push(path);
  }
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
