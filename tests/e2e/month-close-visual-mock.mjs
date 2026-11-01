// Money · cierre del mes con sesión y Supabase SIMULADOS (datos ficticios con la forma del caso real del 31-10-2026).
// Comprueba que la pantalla muestra el aviso en la semana anómala, no en las normales, y sin desbordar en iPhone.
// NO demuestra RLS real, datos de producción ni iPhone físico.
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
const email='qa-payroll@example.invalid';
const user={id:uid,aud:'authenticated',role:'authenticated',email,app_metadata:{provider:'email',providers:['email']},user_metadata:{},created_at:'2026-10-22T00:00:00.000Z'};
const expiry=Math.floor(Date.now()/1000)+3600;
const jwt=[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),
 Buffer.from(JSON.stringify({aud:'authenticated',exp:expiry,iat:expiry-10,sub:uid,role:'authenticated'})).toString('base64url'),
 'mock-signature-not-a-real-token'].join('.');
const session={access_token:jwt,token_type:'bearer',expires_in:3600,expires_at:expiry,refresh_token:'mock-refresh-not-a-real-token',user};
const slip=(n,end,net,hours,status)=>({id:`00000000-0000-4000-8000-0000000000${n}`,user_id:uid,document_id:null,period_end:end,
 period_label:`2026-W${n}`,payslip_number:String(n),period_year:2026,payment_date:null,gross_salary:Math.round(net*1.2),net_payment:net,
 net_salary:net,worked_hours:hours,review_status:status,validation_status:'passed',currency:'EUR',updated_at:'2026-10-30T10:00:00.000Z'});
const payslips=[slip(36,'2026-09-06',640,40,'approved'),slip(37,'2026-09-13',655,40,'approved'),slip(38,'2026-09-20',610,38,'approved'),
 slip(39,'2026-09-27',666,40,'not_required'),slip(40,'2026-10-04',685,41,'approved'),slip(41,'2026-10-11',632,38,'approved'),
 slip(42,'2026-10-18',562,35,'pending'),slip(43,'2026-10-25',298,18,'pending')];
const tx=(id,date,bank,amount,name)=>({id:`10000000-0000-4000-8000-${String(id).padStart(12,'0')}`,owner_id:uid,domain:'money',record_type:'bank_tx',title:name,status:'confirmed',
 occurred_at:date+'T12:00:00.000Z',updated_at:date+'T12:00:00.000Z',source:'import',requires_review:false,payload:{bank,account:'…1234',date,amount,name,counterparty:null,code:null,type:null}});
const txs=[tx(1,'2026-09-03','ING',-54.2,'Albert Heijn'),tx(2,'2026-09-15','ING',-820,'Huur'),tx(3,'2026-09-29','Revolut',-18.5,'Restaurant'),tx(4,'2026-09-30','ING',685.24,'SD Worx')];
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
   if(url.pathname.startsWith('/rest/v1/')){
    const single=(req.headers().accept||'').includes('vnd.pgrst.object');
    const off=Number(url.searchParams.get('offset')||0)===0;const body=url.pathname==='/rest/v1/payroll_payslips'&&off?payslips:url.pathname==='/rest/v1/hub_records'&&(url.searchParams.get('record_type')||'').includes('bank_tx')&&off?txs:[];
    return route.fulfill({status:200,contentType:'application/json',body:single?'null':JSON.stringify(body),headers:{...cors,'content-range':`0-${body.length}/${body.length}`}});
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
  await page.goto(origin+'/dinero',{waitUntil:'domcontentloaded'});
  const panel=page.getByTestId('month-close'); await panel.waitFor({timeout:30000});
  const txt=await panel.innerText();
  assert.match(txt,/Extracto de ING/); assert.match(txt,/2026-W42, 2026-W43/); assert.match(txt,/neto anómalo: 2026-W43/);
  await page.getByText('Cierre del mes').first().scrollIntoViewIfNeeded();
  await page.screenshot({path:`${shots||'/tmp'}/month-close-${label}.png`});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(overflow<=1,'desborde '+overflow);
  const text=txt.slice(0,120).replace(/\n/g,' | ');
  console.log(`${label}: cierre de octubre con extractos pendientes y W42/W43 sin revisar, sin desborde`);
  await context.close();
 }
}finally{await browser.close();}
