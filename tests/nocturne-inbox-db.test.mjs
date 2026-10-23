import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const uid='22222222-2222-4222-8222-222222222222',other='44444444-4444-4444-8444-444444444444',id='33333333-3333-4333-8333-333333333333';
const file=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
test('Inbox review is RLS-owned, transactional, stale-safe, never credits salary, and rollback preserves history',async()=>{
 const db=new PGlite();
 try{
  await db.exec(await file('tools/db-replica/bootstrap.sql'));
  await db.exec(await file('supabase/migrations/20261007000206_add_shared_hub_records.sql'));
  await db.exec(await file('supabase/pending/20261023155335_nocturne_capture_review.sql'));
  await db.query('insert into auth.users(id) values($1),($2)',[uid,other]);
  await db.query(`insert into hub_records(id,owner_id,domain,record_type,title,status,payload,requires_review)
   values($1,$2,'system','renzo_inbox','Synthetic capture','needs_review','{"category":"Note","status":"needs_review","note":"Preserve","attachment":{"path":"private-existing"}}',true)`,[id,uid]);
  await db.exec(`set role authenticated; set request.jwt.claim.sub='${uid}'`);
  const stamp=(await db.query('select updated_at::text stamp from hub_records where id=$1',[id])).rows[0].stamp;
  const review=(version=stamp)=>db.query('select nocturne_review_capture($1,$2) result',[id,version]);
  await assert.rejects(review(null),/version required/);
  await assert.rejects(review('2000-01-01'),/changed/);
  await db.exec(`set request.jwt.claim.sub='${other}'`);
  await assert.rejects(review(),/not found/);
  await db.exec(`set request.jwt.claim.sub='${uid}'`);
  for(const category of ['expense','receipt','payslip','income','invoice','money']){
   await db.query(`update hub_records set payload=jsonb_set(payload,'{category}',to_jsonb($1::text)) where id=$2`,[category,id]);
   const current=(await db.query('select updated_at::text stamp from hub_records where id=$1',[id])).rows[0].stamp;
   await assert.rejects(review(current),/Financial document/);
  }
  await db.query(`update hub_records set payload=jsonb_set(payload,'{category}','"Note"') where id=$1`,[id]);
  const current=(await db.query('select updated_at::text stamp from hub_records where id=$1',[id])).rows[0].stamp;
  // Force audit insertion failure to prove capture status cannot be partly committed.
  await db.exec("reset role; create function public.reject_capture_event() returns trigger language plpgsql as $$ begin if new.record_type='renzo_event' then raise exception 'Synthetic failure'; end if; return new; end $$; create trigger reject_capture_event before insert on hub_records for each row execute function public.reject_capture_event(); set role authenticated");
  await assert.rejects(review(current),/Synthetic failure/);
  assert.equal((await db.query('select status from hub_records where id=$1',[id])).rows[0].status,'needs_review');
  await db.exec('reset role; drop trigger reject_capture_event on hub_records; drop function public.reject_capture_event(); set role authenticated');
  assert.equal((await review(current)).rows[0].result.ok,true);
  await assert.rejects(review(current),/changed|not pending/);
  const saved=(await db.query('select * from hub_records where id=$1',[id])).rows[0];
  assert.equal(saved.payload.note,'Preserve');assert.equal(saved.payload.attachment.path,'private-existing');assert.equal(saved.requires_review,false);
  assert.equal((await db.query("select count(*)::int n from hub_records where record_type='renzo_event'")).rows[0].n,1);
  assert.equal((await db.query("select count(*)::int n from hub_records where record_type='renzo_money'")).rows[0].n,0);
  const expense='55555555-5555-4555-8555-555555555555';
  await db.query(`insert into hub_records(id,owner_id,domain,record_type,title,status,payload) values($1,$2,'money','renzo_inbox','Synthetic fuel','needs_review',
   '{"category":"receipt","source":"jarvis","date":"2026-10-23","status":"needs_review","extracted":{"amount":50,"currency":"EUR","category":"Car"}}')`,[expense,uid]);
  const expenseStamp=(await db.query('select updated_at::text stamp from hub_records where id=$1',[expense])).rows[0].stamp;
  await db.query('select nocturne_review_capture($1,$2)',[expense,expenseStamp]);
  await assert.rejects(db.query('select nocturne_review_capture($1,$2)',[expense,expenseStamp]),/changed|not pending/);
  const money=(await db.query("select payload from hub_records where record_type='renzo_money'")).rows;
  assert.equal(money.length,1);assert.equal(money[0].payload.amount,50);assert.equal(money[0].payload.sourceInboxId,expense);assert.equal(money[0].payload.category,'Car');
  assert.equal((await db.query("select count(*)::int n from hub_records where record_type='bank_tx'")).rows[0].n,0);
  await db.exec('reset role; set role anon');await assert.rejects(review(),/permission denied/);
  await db.exec('reset role');
  await db.exec(await file('supabase/pending/20261023155335_nocturne_capture_review.rollback.sql'));
  assert.equal((await db.query('select count(*)::int n from hub_records')).rows[0].n,5);
 }finally{await db.close();}
});
