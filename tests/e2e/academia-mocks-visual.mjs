// Academia +25 · QA visual de simulacros con sesión y datos SINTÉTICOS (nunca toca Supabase real).
// Uso: REACT_QA_BASE_URL=http://127.0.0.1:4174 SHOTS=/tmp/mocks BROWSER=chromium|webkit node tests/e2e/academia-mocks-visual.mjs
// La corrección real (penalizaciones, unidades, tiempo, RLS) la cubre tools/db-replica/academy_mocks_test.sh.
import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync} from 'node:fs';

const origin=process.env.REACT_QA_BASE_URL||'http://127.0.0.1:4174';
const shots=process.env.SHOTS||'/tmp/academia-mocks';mkdirSync(shots,{recursive:true});
const engine=process.env.BROWSER==='webkit'?webkit:chromium;
const MOCKS=JSON.parse(readFileSync(new URL('../../apps/rise-react/src/content/academia/mocks.json',import.meta.url),'utf8')).mocks;
const uid='22222222-2222-4222-8222-222222222222';const email='qa-academia@example.invalid';
const user={id:uid,aud:'authenticated',role:'authenticated',email,app_metadata:{provider:'email'},user_metadata:{},created_at:'2026-10-22T00:00:00.000Z'};
const exp=Math.floor(Date.now()/1000)+3600;
const jwt=[{alg:'HS256',typ:'JWT'},{aud:'authenticated',exp,iat:exp-10,sub:uid,role:'authenticated'}].map(o=>Buffer.from(JSON.stringify(o)).toString('base64url')).join('.')+'.mock';
const session={access_token:jwt,token_type:'bearer',expires_in:3600,expires_at:exp,refresh_token:'mock',user};
const cors={'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin'};

// Resultado sintético con la forma real: objetivas alternan correcta/incorrecta; abiertas a autocorregir.
function fakeResult(s){
  const def=MOCKS.find(m=>m.mock_id===s.mock_id);const items={};const groups=[];let auto=0,open=0;
  for(const sec of def.sections)for(const g of sec.groups){
    const chosen=!sec.choose||(s.chosen[sec.id]||[]).includes(g.id);let ga=0,gm=0,go=0;
    g.items.forEach((it,i)=>{
      if(it.kind==='open'){go+=it.points;items[it.id]={group_id:g.id,kind:'open',status:chosen?'open':'not_chosen',max:it.points,solution_md:'Solución modelo de **'+it.id+'** con $x^2$.',rubric_md:'Rúbrica de ejemplo: 0,5 por cada idea.',
        ...(it.words?{word_count:120,word_min:it.words[0],word_max:it.words[1],word_penalty:def.word_rules[it.id]?.penalty??0}:{})};return;}
      gm+=it.points;const st=!chosen?'not_chosen':i%3===2?'unit':i%2?'wrong':'correct';
      const sc=st==='correct'?it.points:st==='unit'?Math.max(0,it.points-0.5):st==='wrong'?-it.penalty:0;if(chosen)ga+=sc;
      items[it.id]={group_id:g.id,kind:it.kind,status:it.kind!=='numeric'&&st==='unit'?'correct':st,score:sc,max:it.points,correct:it.choices?.[0]?.id||'2,5',solution_md:'Solución de **'+it.id+'**: $\\dfrac{8}{3}$.'};
    });
    if(chosen){auto+=Math.max(0,ga);open+=go;}
    groups.push({section_id:sec.id,group_id:g.id,chosen,auto_score:chosen?Math.max(0,ga):0,auto_max:gm,open_max:go});
  }
  return {session_id:s.id,mock_id:s.mock_id,auto_score:Math.round(auto*100)/100,open_max:open,late_answers_ignored:false,groups,items,needs_self_score:open>0};
}

const browser=await engine.launch();
const errors=[];
try{
  for(const [label,opts] of [['desktop',{viewport:{width:1440,height:1000}}],['iphone',{...devices['iPhone 13'],...(engine===chromium?{defaultBrowserType:undefined}:{})}]]){
    const sessions=[];const rpcLog=[];
    const ctx=await browser.newContext(opts);const page=await ctx.newPage();
    page.on('pageerror',e=>errors.push(label+': '+e.message));
    await ctx.route('https://ci-placeholder.supabase.co/**',async route=>{
      const req=route.request();const url=new URL(req.url());
      if(req.method()==='OPTIONS'){await route.fulfill({status:204,headers:{...cors,'access-control-allow-methods':'GET,POST,PATCH,DELETE,OPTIONS','access-control-allow-headers':req.headers()['access-control-request-headers']||'*'}});return;}
      const json=(b,s=200)=>route.fulfill({status:s,contentType:'application/json',body:JSON.stringify(b),headers:{...cors,'content-range':'0-0/0'}});
      if(url.pathname.startsWith('/auth/v1/token'))return json(session);
      if(url.pathname==='/auth/v1/user')return json(user);
      if(url.pathname.startsWith('/auth/v1/'))return json({});
      if(url.pathname.startsWith('/rest/v1/rpc/academy_mock_')){
        const fn=url.pathname.split('/').pop();const b=req.postDataJSON();rpcLog.push(fn);
        const now=new Date();
        if(fn==='academy_mock_start'){const def=MOCKS.find(m=>m.mock_id===b.p_mock_id);
          const s={id:'s'+(sessions.length+1),client_session_id:b.p_client_session_id,mock_id:def.mock_id,course:def.course,content_version:def.content_version,duration_minutes:def.duration_minutes,
            started_at:now.toISOString(),deadline_at:new Date(now.getTime()+def.duration_minutes*60e3).toISOString(),server_now:now.toISOString(),status:'in_progress',answers:{},chosen:{},revision:1,
            submitted_at:null,late_answers_ignored:false,auto_score:null,result:null,self_scores:null,total_score:null,graded_at:null};
          sessions.unshift(s);return json({...s,duplicate:false});}
        const s=sessions.find(x=>x.id===b.p_session_id);
        if(fn==='academy_mock_save'){s.answers=b.p_answers;s.chosen=b.p_chosen;s.revision++;return json({revision:s.revision,saved_at:now.toISOString(),server_now:now.toISOString()});}
        if(fn==='academy_mock_submit'){s.answers=b.p_answers;s.chosen=b.p_chosen;s.result=fakeResult(s);s.auto_score=s.result.auto_score;s.status='submitted';s.submitted_at=now.toISOString();return json(s.result);}
        if(fn==='academy_mock_self_score'){const tot=Math.min(10,s.auto_score+Object.values(b.p_scores).reduce((a,v)=>a+v,0));s.status='graded';s.total_score=Math.round(tot*100)/100;
          s.self_scores=Object.fromEntries(Object.entries(b.p_scores).map(([k,v])=>[k,{given:v,penalty:0,final:v}]));return json({total_score:s.total_score,self_scores:s.self_scores,duplicate:false});}
      }
      if(url.pathname.startsWith('/rest/v1/')){
        const t=url.pathname.split('/').pop();const single=(req.headers().accept||'').includes('vnd.pgrst.object');
        if(req.method()!=='GET')return json(single?null:[]);
        const rows=t==='academy_mock_sessions'?sessions:[];
        return json(single?(rows[0]||null):rows);
      }
      return json({});
    });
    await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
    await page.getByLabel('Correo electrónico').fill(email);await page.getByLabel('Contraseña').fill('mock');
    await page.getByRole('button',{name:'Entrar'}).click();
    await page.getByRole('heading',{name:'Tu espacio privado.'}).waitFor({state:'hidden',timeout:20000});
    const noScroll=async what=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${label} ${what}: scroll horizontal`);
    await page.goto(origin+'/academia?v=examenes',{waitUntil:'domcontentloaded'});
    await page.getByRole('heading',{name:'Simulacros RISE HUB'}).waitFor({timeout:20000});
    await page.waitForTimeout(500);await noScroll('lista');
    await page.screenshot({path:`${shots}/${label}-lista.png`,fullPage:true});
    for(const id of ['s1-matematicas','s1-fisica','s1-comentario','s1-castellano','s1-ingles']){
      const def=MOCKS.find(m=>m.mock_id===id);
      await page.locator('section',{has:page.getByRole('heading',{name:'Simulacros RISE HUB'})}).getByRole('button',{name:/Empezar/}).nth(['matematicas','fisica','castellano','comentario','ingles'].indexOf(def.course)).click();
      await page.getByRole('timer').waitFor({timeout:15000});
      await page.getByText(def.title).first().waitFor();
      await page.waitForTimeout(400);await noScroll(id+' en curso');
      const katexErr=await page.locator('.katex-error').count();assert.equal(katexErr,0,`${label} ${id}: fórmulas con error`);
      // Responder algo de cada tipo y elegir lo necesario.
      const boxes=page.getByRole('checkbox',{name:'Elegir'});
      const nb=await boxes.count();
      for(let i=0;i<nb;i++){if(await boxes.nth(i).isEnabled()&&!(await boxes.nth(i).isChecked()))await boxes.nth(i).check();}
      const radios=page.getByRole('radio');if(await radios.count())await radios.first().check();
      const vals=page.getByRole('textbox',{name:'Valor'});if(await vals.count())await vals.first().fill('2,5');
      const units=page.getByRole('textbox',{name:'Unidad'});if(await units.count())await units.first().fill('m/s²');
      const open=page.getByRole('textbox',{name:'Respuesta abierta'});if(await open.count())await open.last().fill('Texto de prueba con unas cuantas palabras para el contador.');
      await page.getByText('Guardado').waitFor({timeout:10000});
      await page.screenshot({path:`${shots}/${label}-${id}-curso.png`,fullPage:id==='s1-matematicas'});
      await page.getByRole('button',{name:'Entregar'}).click();
      await page.getByRole('button',{name:'Sí, entregar'}).click();
      await page.getByRole('button',{name:/Autocorregir/}).first().waitFor({timeout:15000});
      await page.getByRole('button',{name:/Autocorregir/}).first().click();
      await page.getByRole('button',{name:/Guardar mi nota/}).waitFor();
      await page.waitForTimeout(300);await noScroll(id+' corrección');
      assert.equal(await page.locator('.katex-error').count(),0,`${label} ${id}: fórmulas con error en corrección`);
      const notes=page.getByRole('textbox',{name:/Tu nota/});const nn=await notes.count();
      for(let i=0;i<nn;i++)await notes.nth(i).fill('0,5');
      await page.screenshot({path:`${shots}/${label}-${id}-correccion.png`,fullPage:id==='s1-fisica'});
      await page.getByRole('button',{name:/Guardar mi nota/}).click();
      await page.getByText(/\/ 10/).first().waitFor();
      await page.getByRole('button',{name:'← Volver a simulacros'}).click();
      await page.getByRole('heading',{name:'Simulacros RISE HUB'}).waitFor();
    }
    await page.waitForTimeout(300);await noScroll('historial');
    await page.screenshot({path:`${shots}/${label}-historial.png`,fullPage:true});
    for(const fn of ['academy_mock_start','academy_mock_save','academy_mock_submit','academy_mock_self_score'])assert.ok(rpcLog.includes(fn),`${label}: no se llamó ${fn}`);
    await ctx.close();
  }
}finally{await browser.close();}
const relevant=errors.filter(e=>!/ResizeObserver/.test(e));
if(relevant.length){console.error(relevant.join('\n'));process.exit(1);}
console.log('OK academia simulacros visual mock →',shots);
