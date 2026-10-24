import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,readdirSync} from 'node:fs';

const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');

test('Academia: contenido válido y salidas generadas al día (build --check)',()=>{
  const out=execFileSync(process.execPath,['tools/academy/build.mjs','--check'],{cwd:root,encoding:'utf8'});
  assert.match(out,/^OK · 120 lecciones/);
});

test('Academia: las claves solo viven en el seed SQL, nunca en el bundle público',()=>{
  const seed=read('supabase/seed/academy_question_keys.sql');
  assert.match(seed,/insert into public\.academy_question_keys/);
  for(const f of readdirSync(new URL('apps/rise-react/src/content/academia/lessons/',root)))
    assert.doesNotMatch(read('apps/rise-react/src/content/academia/lessons/'+f),/correct_choice_id|"accepted"|"key"/,f);
});

test('Academia: respuestas numéricas de salida verificadas por cálculo independiente',()=>{
  const q=id=>{for(const f of readdirSync(new URL('content/academia/questions/',root))){const j=JSON.parse(read('content/academia/questions/'+f));const x=j.questions.find(y=>y.id===id);if(x)return x;}};
  const checks={
    'm00l01-x1':9-3*2+4,'m00l01-x3':-7-(-3)+(-2)*(-5),'m00l01-x4':36/6*2-(1-4)**2,
    'm00l02-x2':14,'m00l02-x3':60,'m00l02-x5':18,'m01l01-x3':3*(-2)**2-2*(-2)+5,
    'b00l01-x1':340*0.15,'b00l01-x2':(46000-40000)/40000*100,'b00l01-x4':605/1.21,'b00l01-x5':6*10/4,
  };
  const gcd=(a,b)=>b?gcd(b,a%b):a,lcm=(a,b)=>a*b/gcd(a,b);
  assert.equal(gcd(42,56),14);assert.equal(lcm(lcm(10,12),15),60);assert.equal(gcd(90,126),18);
  for(const [id,v] of Object.entries(checks))assert.ok(Math.abs(q(id).key.value-v)<1e-9,`${id}: clave ${q(id).key.value} ≠ ${v}`);
  // Opción múltiple con cálculo: saldo −12 + 3·8 − 5 = 7 (opción a)
  assert.equal(q('m00l01-x5').choices.find(c=>c.id===q('m00l01-x5').key.correct_choice_id).text,String(-12+3*8-5));
  // 1,2·0,8 = 0,96 ⇒ 4 % menor (opción b)
  assert.equal(q('b00l01-x3').key.correct_choice_id,'b');assert.ok(Math.abs(1.2*0.8-0.96)<1e-12);
});

test('Academia: migración pendiente, con rollback y nunca en supabase/migrations',()=>{
  const mig=read('supabase/pending/20261024090000_academy_foundation.sql');
  read('supabase/pending/20261024090000_academy_foundation.rollback.sql');
  assert.throws(()=>read('supabase/migrations/20261024090000_academy_foundation.sql'));
  assert.match(mig,/revoke all on public\.academy_question_keys from public, anon, authenticated/);
  assert.doesNotMatch(mig,/grant select on public\.academy_question_keys/);
  for(const fn of ['academy_grade','academy_finish_quiz'])assert.match(mig,new RegExp(`create function public\\.${fn}[\\s\\S]*?security definer set search_path=''`));
});
