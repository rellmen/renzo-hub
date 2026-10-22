import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const pending=new URL('../supabase/pending/20261022090000_selflearn_transactions.sql',import.meta.url);
const uid='22222222-2222-4222-8222-222222222222',other='44444444-4444-4444-8444-444444444444';
const cp='33333333-3333-4333-8333-333333333333',eventId='55555555-5555-4555-8555-555555555555',cardId='66666666-6666-4666-8666-666666666666';
test('Postgres SelfLearn transactions: owner isolation, retry, stale review, legacy XP and rollback',async()=>{
 const db=new PGlite();
 try{
  await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
  grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);
  await db.exec(await readFile(new URL('../supabase/migrations/20261007000206_add_shared_hub_records.sql',import.meta.url),'utf8'));
  await db.exec(`create table public.hub_user_state(owner_id uuid primary key references auth.users(id),state jsonb default '{}');alter table public.hub_user_state enable row level security;grant select,insert,update on public.hub_user_state to authenticated;create policy own on public.hub_user_state to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());`);
  await db.query('insert into auth.users values($1),($2)',[uid,other]);
  // Pre-existing duplicate historical cards must both remain editable by ID.
  await db.query(`insert into hub_records(id,owner_id,domain,record_type,payload) values
   ('99999999-9999-4999-8999-999999999999',$1,'learning','renzo_vocabulary','{"id":"99999999-9999-4999-8999-999999999999","front":"historic","back":"histórico","course":"nl","repetitions":0}'),
   ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',$1,'learning','renzo_vocabulary','{"id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","front":"historic","back":"histórico","course":"nl","repetitions":0}')`,[uid]);
  await db.exec('alter default privileges revoke execute on functions from public');
  await db.exec(await readFile(pending,'utf8'));
  await db.exec(`set role authenticated;set request.jwt.claim.sub='${uid}'`);
  const run={version:2,mode:'lesson',course:'nl',unitId:'a1-legacy-1',index:1,queue:['s1'],steps:[{id:'s1',type:'choice'}],attempts:{s1:1},firstTry:{s1:true}};
  await db.query(`insert into hub_records(id,owner_id,domain,record_type,payload) values($1,$2,'learning','learning_run',$3)`,[cp,uid,{sessionId:cp,course:'nl',run}]);
  const event={id:eventId,owner_id:uid,payload:{id:eventId,kind:'learning',course:'nl',practice:'Study path',courseLessonId:run.unitId,passed:true,score:1,totalQuestions:1,xp:10,date:'2026-10-22'}};
  const card={id:cardId,owner_id:uid,payload:{id:cardId,course:'nl',area:'Dutch',unitId:'a1-legacy-1',front:'de winkel',back:'la tienda',repetitions:0}};
  const finish=(e=event,cards=[card])=>db.query('select selflearn_finalize_lesson($1,$2,$3) as result',[cp,e,cards]);
  await assert.rejects(finish(event,[{...card,owner_id:other}]),/Tarjeta/);
  assert.equal((await db.query("select count(*)::int n from hub_records where record_type='renzo_event'")).rows[0].n,0);
  const first=(await finish()).rows[0].result;
  assert.equal(first.xp,10);assert.equal(first.addedCards,1);
  const retry=(await finish()).rows[0].result;
  assert.equal(retry.already,true);assert.equal(retry.xp,0);assert.equal(retry.addedCards,0);
  const legacy={...event.payload,id:cp,xp:10};
  // A random classic ID is allowed as history but cannot pay again.
  await db.query(`insert into hub_records(owner_id,domain,record_type,payload) values($1,'system','renzo_event',$2)`,[uid,legacy]);
  assert.equal((await db.query(`select sum((payload->>'xp')::int)::int n from hub_records where record_type='renzo_event'`)).rows[0].n,10);
  await db.query(`insert into hub_records(owner_id,domain,record_type,payload) values($1,'learning','renzo_vocabulary',$2)`,[uid,{...card.payload,front:'DE WINKEL'}]);
  assert.equal((await db.query(`select count(*)::int n from hub_records where record_type='renzo_vocabulary'`)).rows[0].n,3);
  // Classic periodically upserts unchanged winners even after a repeat was saved.
  await db.query(`insert into hub_records(id,owner_id,domain,record_type,payload) values($1,$2,'system','renzo_event',$3) on conflict(id) do update set payload=excluded.payload`,[eventId,uid,event.payload]);
  assert.equal((await db.query("select payload->>'xp' xp from hub_records where id=$1",[eventId])).rows[0].xp,'10');
  const historical={id:'99999999-9999-4999-8999-999999999999',front:'historic',back:'histórico',course:'nl',repetitions:1,fsrsCard:{due:'2027-01-01T00:00:00Z'}};
  await db.query(`insert into hub_records(id,owner_id,domain,record_type,payload) values($1,$2,'learning','renzo_vocabulary',$3) on conflict(id) do update set payload=excluded.payload`,[historical.id,uid,historical]);
  assert.equal((await db.query("select payload->>'repetitions' n from hub_records where id=$1",[historical.id])).rows[0].n,'1');
  // Old Study path records without courseLessonId also use lessonDay.
  assert.equal((await db.query("select selflearn_unit($1) as unit",[{kind:'learning',practice:'Study path',lessonDay:2}])).rows[0].unit,'a1-legacy-2');
  await assert.rejects(db.query("update hub_records set record_type='renzo_note' where id=$1",[eventId]),/inmutable/);
  const stamp=(await db.query('select updated_at from hub_records where id=$1',[cardId])).rows[0].updated_at;
  const reviewId='77777777-7777-4777-8777-777777777777';
  const payload={...card.payload,repetitions:1,fsrsCard:{due:'2026-10-23T12:00:00Z'},reviewHistory:[{grade:'good'}]};
  const review=(id=reviewId,stampArg=stamp)=>db.query('select selflearn_review_vocabulary($1,$2,$3,$4,$5) as result',[cardId,stampArg,id,payload,'good']);
  assert.equal((await review()).rows[0].result.repetitions,1);
  assert.equal((await review()).rows[0].result.repetitions,1);
  await assert.rejects(review('88888888-8888-4888-8888-888888888888'),/cambiado|versión/i);
  await assert.rejects(db.query('update hub_records set payload=$1 where id=$2',[
    {...payload,updatedAt:'2099-01-01T00:00:00Z',fsrsCard:{due:'2099-01-01T00:00:00Z'}},cardId]),/cambiado|cambió/);
  // Legacy lesson errors only tighten due; they must not replace the FSRS state.
  await db.query('update hub_records set payload=$1 where id=$2',[
    {...payload,updatedAt:'2026-10-22T12:00:00Z',fsrsCard:{due:'2026-10-22T12:00:00Z'}},cardId]);
  assert.equal((await db.query("select payload->'fsrsCard'->>'due' due from hub_records where id=$1",[cardId])).rows[0].due,'2026-10-22T12:00:00Z');
  await db.exec(`set request.jwt.claim.sub='${other}'`);
  await assert.rejects(finish(),/checkpoint|propietario/);
  await assert.rejects(review(),/tarjeta|propietario/);
  await db.exec('reset role;set role anon');
  await assert.rejects(finish(),/permission/);
  await db.exec('reset role');
  const before=(await db.query('select count(*)::int n from hub_records')).rows[0].n;
  await db.exec(await readFile(new URL('../supabase/pending/20261022090000_selflearn_transactions.rollback.sql',import.meta.url),'utf8'));
  assert.equal((await db.query('select count(*)::int n from hub_records')).rows[0].n,before);
  await assert.rejects(finish(),/does not exist/);
 }finally{await db.close()}
});
