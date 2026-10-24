// Academia +25 · QA visual con sesión y datos SINTÉTICOS interceptados (nunca toca Supabase real).
// Uso: REACT_QA_BASE_URL=http://127.0.0.1:4174 SHOTS=/tmp/academia BROWSER=chromium|webkit node tests/e2e/academia-visual-mock.mjs
// No verifica RLS ni persistencia real: eso lo cubre tools/db-replica/academy_test.sh y la QA en staging.
import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';

const origin=process.env.REACT_QA_BASE_URL||'http://127.0.0.1:4174';
const shots=process.env.SHOTS||'/tmp/academia-shots';mkdirSync(shots,{recursive:true});
const engine=process.env.BROWSER==='webkit'?webkit:chromium;
const uid='22222222-2222-4222-8222-222222222222';const email='qa-academia@example.invalid';
const user={id:uid,aud:'authenticated',role:'authenticated',email,app_metadata:{provider:'email'},user_metadata:{},created_at:'2026-10-22T00:00:00.000Z'};
const exp=Math.floor(Date.now()/1000)+3600;
const jwt=[{alg:'HS256',typ:'JWT'},{aud:'authenticated',exp,iat:exp-10,sub:uid,role:'authenticated'}].map(o=>Buffer.from(JSON.stringify(o)).toString('base64url')).join('.')+'.mock';
const session={access_token:jwt,token_type:'bearer',expires_in:3600,expires_at:exp,refresh_token:'mock',user};
const today=new Date();const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const DATA={
  academy_lesson_progress:[
    {lesson_id:'matematicas-m00-l01',status:'completed',last_section:'9',draft:{notes:'Recordar: −2² = −4'},revision:4,best_exit_pct:80,last_result:null,completed_at:'2026-10-23T10:00:00Z',opened_at:'2026-10-22T10:00:00Z',updated_at:'2026-10-23T10:00:00Z'},
    {lesson_id:'castellano-c01-l01',status:'in_progress',last_section:'4',draft:{},revision:1,best_exit_pct:null,last_result:null,completed_at:null,opened_at:'2026-10-23T18:00:00Z',updated_at:'2026-10-23T18:00:00Z'}],
  academy_reviews:[{lesson_id:'matematicas-m00-l01',step:0,due_on:iso(today),last_pct:80}],
  academy_attempts:[...Array(14)].map((_,i)=>({question_id:'mat-00'+(i%4+1),lesson_id:'matematicas-m00-l01',course:i%3?'matematicas':'economia',context:'diagnostic',is_correct:i%4!==0,
    skill_ids:[i%3?['operation_order','signed_powers','fraction_add'][i%3]:'percentages'],created_at:new Date(Date.now()-i*3600e3).toISOString(),session_id:null})),
  academy_exam_sessions:[{id:'e1',client_session_id:'c1',profile_id:'math_2026_cat_ref',course:'matematicas',source_url:'https://universitats.gencat.cat/',source_label:'x',duration_minutes:90,status:'submitted',scores:{},notes:'',total_score:4.5,revision:3,started_at:'2026-10-20T09:00:00Z',submitted_at:'2026-10-20T10:30:00Z'}],
  academy_editorial_reviews:[],
};
const cors={'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin'};
const browser=await engine.launch();
const errors=[];
try{
  for(const [label,opts] of [['desktop',{viewport:{width:1440,height:1000}}],['iphone',{...devices['iPhone 13'],...(engine===chromium?{defaultBrowserType:undefined}:{})}],['ipad',{...devices['iPad (gen 7)'],...(engine===chromium?{defaultBrowserType:undefined}:{})}]]){
    const ctx=await browser.newContext(opts);const page=await ctx.newPage();
    page.on('pageerror',e=>errors.push(label+': '+e.message));
    await ctx.route('https://ci-placeholder.supabase.co/**',async route=>{
      const req=route.request();const url=new URL(req.url());
      if(req.method()==='OPTIONS'){await route.fulfill({status:204,headers:{...cors,'access-control-allow-methods':'GET,POST,PATCH,DELETE,OPTIONS','access-control-allow-headers':req.headers()['access-control-request-headers']||'*'}});return;}
      const json=(b,s=200)=>route.fulfill({status:s,contentType:'application/json',body:JSON.stringify(b),headers:{...cors,'content-range':'0-0/0'}});
      if(url.pathname.startsWith('/auth/v1/token'))return json(session);
      if(url.pathname==='/auth/v1/user')return json(user);
      if(url.pathname.startsWith('/auth/v1/'))return json({});
      if(url.pathname==='/rest/v1/rpc/academy_grade'){const b=req.postDataJSON();const ok=b.p_answer?.choice==='b'||b.p_answer?.value==='7';
        return json({attempt_id:'a',question_id:b.p_question_id,is_correct:ok,score:ok?1:0,max_score:1,correct:'7',explanation_md:'$3\\cdot 2=6$; $9-6=3$; $3+4=7$.',duplicate:false,session_id:b.p_session_id});}
      if(url.pathname.startsWith('/rest/v1/')){
        const t=url.pathname.split('/').pop();const single=(req.headers().accept||'').includes('vnd.pgrst.object');
        if(req.method()!=='GET')return json(single?null:[]);
        const rows=DATA[t]||[];
        const lesson=url.searchParams.get('lesson_id');
        const filtered=lesson?rows.filter(r=>'eq.'+r.lesson_id===lesson):rows;
        return json(single?(filtered[0]||null):filtered);
      }
      return json({});
    });
    await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
    await page.getByLabel('Correo electrónico').fill(email);await page.getByLabel('Contraseña').fill('mock');
    await page.getByRole('button',{name:'Entrar'}).click();
    await page.getByRole('heading',{name:'Tu espacio privado.'}).waitFor({state:'hidden',timeout:20000});
    const snap=async(path,name,wait)=>{
      await page.goto(origin+path,{waitUntil:'domcontentloaded'});
      await page.getByText(wait).first().waitFor({timeout:20000});
      await page.waitForTimeout(600);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${label} ${path}: scroll horizontal`);
      await page.screenshot({path:`${shots}/${label}-${name}.png`,fullPage:name!=='leccion'});
    };
    await snap('/academia','plan','Qué estudiar ahora');
    await page.getByText('Repasos vencidos (1)').waitFor();
    await snap('/academia?v=cursos&curso=matematicas','cursos','Sin redactar');
    await snap('/academia?leccion=matematicas-m00-l01','leccion','Borrador sin revisión académica humana');
    await page.locator('#sec-9').scrollIntoViewIfNeeded();
    const first=page.getByRole('listitem').filter({hasText:'Calcula $9-3'}).first();
    await page.locator('input[inputmode="decimal"]').first().fill('7');
    await page.getByRole('button',{name:'Comprobar'}).first().click();
    await page.getByText('Correcto').first().waitFor();
    void first;
    await page.screenshot({path:`${shots}/${label}-quiz.png`});
    // Lecciones nuevas: matemáticas en bloque ($$ cases $$) y texto citado largo (lectura de Castellano).
    await snap('/academia?leccion=matematicas-m08-l01','leccion-m08','Límites intuitivos y continuidad');
    assert.ok(await page.locator('.katex-display').count()>=1,`${label}: falta la fórmula en bloque (cases) en M08`);
    await snap('/academia?leccion=castellano-c06-l01','leccion-c06','Comprender un texto');
    await snap('/academia?v=examenes','examenes','Simulacros entregados');
    await snap('/academia?v=resultados','resultados','Cobertura real del contenido');
    await snap('/academia?v=practicar','practicar','Diagnóstico completo');
    await ctx.close();
  }
}finally{await browser.close();}
const relevant=errors.filter(e=>!/ResizeObserver/.test(e));
if(relevant.length){console.error(relevant.join('\n'));process.exit(1);}
console.log('OK academia visual mock →',shots);
