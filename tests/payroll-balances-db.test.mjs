import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('..',import.meta.url).pathname;
import test from 'node:test';
test('Postgres balance import authorization, cutoff, immutable provenance and safe rollback',async()=>{
const db=new PGlite();
try{
await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
create table payroll_documents(id uuid primary key,user_id uuid,file_sha256 text,storage_path_raw text,storage_path_archive text);
create table payroll_payslips(id uuid primary key,user_id uuid,document_id uuid,employer_id uuid,period_end date,updated_at timestamptz,review_status text,validation_status text);
grant select,update on payroll_payslips,payroll_documents to authenticated;`);
await db.exec(await readFile(root+'/supabase/migrations/20261007000206_add_shared_hub_records.sql','utf8'));
try{await db.exec(await readFile(root+'/supabase/pending/20261014090000_payroll_balance_import.sql','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
await db.exec(`insert into auth.users values('11111111-1111-4111-8111-111111111111'); insert into payroll_documents values('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111',repeat('a',64),'qa.pdf',null); insert into payroll_payslips values('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','44444444-4444-4444-8444-444444444444','2026-08-09','2026-08-10T12:00:00Z','pending','review_required'); set role authenticated; set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';`);
const call=(confirm=true,minutes=1215,cents=12345,stamp='2026-08-10T12:00:00Z',id='33333333-3333-4333-8333-333333333333')=>db.query('select public.payroll_import_balances($1,$2,$3,$4,$5,$6)',[id,stamp,minutes,cents,confirm,'a'.repeat(64)]);
await assert.rejects(call(false),/confirm/i);
await assert.rejects(call(true,1215,12345,'2026-08-09T00:00:00Z'),/cambiado/i);
await assert.rejects(call(true,1215,12345,undefined,'55555555-5555-4555-8555-555555555555'),/nómina/i);
await assert.rejects(call(true,-1),/saldo|check/i);
await call();
assert.equal((await db.query('select count(*)::int n from payroll_balance_imports')).rows[0].n,1);
await assert.rejects(call(),/unique|duplicate/i);
const movement=(date,kind)=>db.query(`insert into hub_records(owner_id,domain,record_type,payload) values(auth.uid(),'money','shift_leave_event',$1)`,[{date,kind,minutes:60}]);
await assert.rejects(movement('2026-08-10','opening'),/inicial/i);
await assert.rejects(movement('2026-08-09','used'),/incluid/i);
await assert.rejects(movement('2026-08-08','accrual'),/incluid/i);
await movement('2026-08-10','used');
await assert.rejects(db.query(`update hub_records set payload=jsonb_set(payload,'{date}','"2026-08-09"')`),/incluid/i);
await assert.rejects(db.query('delete from payroll_balance_imports'),/permission denied/i);
await db.exec(`set request.jwt.claim.sub='66666666-6666-4666-8666-666666666666';`);
assert.equal((await db.query('select count(*)::int n from payroll_balance_imports')).rows[0].n,0);
await assert.rejects(call(),/nómina/i);
await db.exec('reset role');
await assert.rejects(db.exec(await readFile(root+'/supabase/rollbacks/20261014090000_payroll_balance_import.rollback.sql','utf8')),/Rollback bloqueado/);
await db.exec('rollback');
await db.exec('delete from public.payroll_balance_imports');
await db.exec(await readFile(root+'/supabase/rollbacks/20261014090000_payroll_balance_import.rollback.sql','utf8'));
assert.equal((await db.query("select to_regclass('public.payroll_balance_imports') as t")).rows[0].t,null);
assert.equal((await db.query('select count(*)::int n from hub_records')).rows[0].n,1);
await db.exec(await readFile(root+'/supabase/pending/20261014090000_payroll_balance_import.sql','utf8'));
console.log('PASS: confirmation, stale source, missing/foreign payslip, numeric validation, unique import, retroactive guard, opening guard, RLS, immutable snapshot, rollback preserves existing tables, reapply');
}finally{await db.close();}
});
