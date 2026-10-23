import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const uid='22222222-2222-4222-8222-222222222222';
const other='44444444-4444-4444-8444-444444444444';
const id='33333333-3333-4333-8333-333333333333';
const file=name=>readFile(new URL('../'+name,import.meta.url),'utf8');
test('Payroll CAS: real baseline, stale rejection, owner RLS, audit atomicity and data-preserving rollback',async()=>{
 const db=new PGlite();
 try{
  await db.exec(await file('tools/db-replica/bootstrap.sql'));
  await db.exec('create publication supabase_realtime');
  await db.exec(await file('supabase/migrations/20261007200000_payroll_schema_baseline.sql'));
  await db.exec(await file('supabase/pending/20261023124512_payroll_review_cas.sql'));
  await db.query('insert into auth.users(id) values($1),($2)',[uid,other]);
  // Synthetic minimum payslip; no production records or files.
  await db.query(`insert into payroll_employers(id,user_id,name,normalized_code) values($1,$2,'QA Synthetic','QA')`,[id,uid]);
  await db.query(`insert into payroll_documents(id,user_id,original_file_name,file_sha256,status) values($1,$2,'synthetic.pdf',repeat('a',64),'processed')`,[id,uid]);
  await db.query(`insert into payroll_payslips(id,user_id,employer_id,document_id,period_type,period_year,period_number,period_label,review_status,net_payment)
   values($1,$2,$1,$1,'weekly',2026,43,'QA 43','pending',500)`,[id,uid]);
  await db.exec(`set role authenticated; set request.jwt.claim.sub='${uid}'`);
  const stamp=(await db.query('select updated_at::text stamp from payroll_payslips where id=$1',[id])).rows[0].stamp;
  const review=(stampArg=stamp,changes={net_payment:501},decision='approved')=>db.query(
   'select payroll_apply_review_cas($1,$2,$3,$4) result',[id,stampArg,changes,decision]);
  await assert.rejects(review(null),/version required/);
  await assert.rejects(review('2000-01-01T00:00:00Z'),/changed/);
  await assert.rejects(review(stamp,{net_payment:501},'rejected'),/cannot change/);
  await db.exec(`set request.jwt.claim.sub='${other}'`);
  await assert.rejects(review(),/not found/);
  assert.equal((await db.query('select count(*)::int n from payroll_payslips')).rows[0].n,0);
  await db.exec(`set request.jwt.claim.sub='${uid}'`);
  await assert.rejects(review(stamp,{user_id:other}),/not editable/);
  assert.equal((await db.query('select count(*)::int n from payroll_corrections')).rows[0].n,0);
  assert.equal((await review()).rows[0].result.ok,true);
  await assert.rejects(review(),/changed/);
  assert.equal((await db.query('select net_payment::text n from payroll_payslips where id=$1',[id])).rows[0].n,'501.00');
  assert.equal((await db.query('select count(*)::int n from payroll_corrections')).rows[0].n,1);
  await db.exec('reset role; set role anon');
  await assert.rejects(review(),/permission denied/);
  await db.exec('reset role');
  const before=(await db.query('select count(*)::int n from payroll_events')).rows[0].n;
  await db.exec(await file('supabase/pending/20261023124512_payroll_review_cas.rollback.sql'));
  assert.equal((await db.query('select count(*)::int n from payroll_events')).rows[0].n,before);
  assert.equal((await db.query('select count(*)::int n from payroll_payslips')).rows[0].n,1);
  assert.ok((await db.query("select to_regprocedure('public.payroll_apply_review(uuid,jsonb,text,jsonb,text)') f")).rows[0].f);
 }finally{await db.close();}
});
