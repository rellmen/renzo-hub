import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync,readFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {PGlite} from '@electric-sql/pglite';

function convert(tables,extra={}){
 const dir=mkdtempSync(join(tmpdir(),'rise-restore-'));
 try{
  const file=join(dir,'snapshot.json');
  writeFileSync(file,JSON.stringify({format:'renzo-hub-export',version:1,taken_at:'2026-10-22',project:'fixture',tables,errors:[],...extra}));
  return spawnSync('python3',['-I','tools/backup/snapshot_to_sql.py',file],{encoding:'utf8'});
 }finally{rmSync(dir,{recursive:true,force:true});}
}
test('restore preserves literal delimiters, Unicode, quotes and existing rows',async()=>{
 const db=new PGlite();
 try{
  await db.exec('create table hub_records(id text primary key,payload jsonb);');
  await db.query('insert into hub_records values ($1,$2)',['keep',{body:'confirmed'}]);
  const payload={body:"$snap$ y $restore_0$ · nómina ' 你好\n\\ fin"};
  const result=convert({hub_records:[{id:'new',payload},{id:'keep',payload:{body:'offline stale'}}]});
  assert.equal(result.status,0,result.stderr);
  await db.exec(result.stdout);
  await db.exec(result.stdout);
  assert.deepEqual((await db.query("select payload from hub_records where id='new'")).rows[0].payload,payload);
  assert.equal((await db.query("select payload from hub_records where id='keep'")).rows[0].payload.body,'confirmed');
  assert.equal((await db.query('select count(*)::int as n from hub_records')).rows[0].n,2);
 }finally{await db.close();}
});
test('restore rejects unsafe table identifiers before emitting any SQL',()=>{
 const result=convert({'hub_records; select 1;--':[{id:'x'}]});
 assert.notEqual(result.status,0);
 assert.equal(result.stdout,'');
});
test('partial exports cannot be presented as complete restore input',()=>{
 const result=convert({hub_records:[]},{errors:['payroll: unavailable']});
 assert.notEqual(result.status,0);
 assert.equal(result.stdout,'');
});
test('file extraction refuses bucket traversal and never overwrites existing files',()=>{
 const dir=mkdtempSync(join(tmpdir(),'rise-files-'));
 try{
  const file=join(dir,'snapshot.json'),out=join(dir,'files');
  const run=()=>spawnSync('python3',['-I','tools/backup/extract_files.py',file,out],{encoding:'utf8'});
  writeFileSync(file,JSON.stringify({files:[{bucket:'../outside',path:'secret.pdf',base64:'eA=='}]}));
  assert.notEqual(run().status,0);
  assert(!existsSync(join(dir,'outside','secret.pdf')));
  writeFileSync(file,JSON.stringify({files:[{bucket:'payroll',path:'owner/file.pdf',base64:'eA=='}]}));
  assert.equal(run().status,0);
  writeFileSync(file,JSON.stringify({files:[{bucket:'payroll',path:'owner/file.pdf',base64:'eQ=='}]}));
  assert.notEqual(run().status,0);
  assert.equal(readFileSync(join(out,'payroll','owner','file.pdf'),'utf8'),'x');
 }finally{rmSync(dir,{recursive:true,force:true});}
});
