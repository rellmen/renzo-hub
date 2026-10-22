import test from 'node:test';
import assert from 'node:assert/strict';
import {MIGRATION_TABLES,MIGRATION_BUCKETS,verifyMigrationOwner,auditPrivateTables,buildMigrationBackup,legacyLocalKeys,comparisonAgainstExport,compareMigrationRows} from '../apps/rise-react/src/lib/migration-audit.mjs';

const uid='11111111-1111-4111-8111-111111111111';
const other='22222222-2222-4222-8222-222222222222';
function fake({user=uid,rows={},unavailable=new Set(),objects={},listError=false}={}){
 const calls=[],orders=[];
 return{
  calls,orders,
  auth:{getUser:async()=>({data:{user:{id:user}},error:null})},
  from(table){return{
    select(fields,opts){return{
      eq(column,wanted){
       calls.push({table,fields,uid:wanted,column});
       if(wanted!==uid)return Promise.reject(Error('wrong owner'));
       if(opts?.head){return Promise.resolve(unavailable.has(table)?{count:null,error:{message:'rls'}}:{count:(rows[table]||[]).length,error:null});}
       return{order(column){orders.push({table,column});return{range(from,to){return Promise.resolve(unavailable.has(table)?{data:null,error:{message:'unavailable'}}:{data:(rows[table]||[]).slice(from,to+1),error:null});}}}};
      }
    };}
  };},
  storage:{from(bucket){return{
   list:async(prefix)=>({data:objects[bucket]||[],error:listError?{message:'unavailable'}:null}),
   download:async(path)=>({data:new Blob(['secret-test-data']),error:null})
  };}}
 };
}
test('complete inventory covers all legacy export tables and payroll balance imports',()=>{
 assert.equal(Object.keys(MIGRATION_TABLES).length>=21,true);
 assert.equal(MIGRATION_TABLES.payroll_balance_imports,'owner_id');
 assert.deepEqual(MIGRATION_BUCKETS,['payroll','hub-private','portfolio-files','progress-photos']);
});
test('wrong user cannot even start a migration inventory or backup',async()=>{
 const db=fake({user:other});
 await assert.rejects(verifyMigrationOwner(db,uid),/no coincide/);
 await assert.rejects(auditPrivateTables(db,uid),/no coincide/);
 await assert.rejects(buildMigrationBackup(db,uid),/no coincide/);
 assert.equal(db.calls.length,0);
});
test('inventory strictly tracks inaccessible tables instead of reporting a false zero',async()=>{
 const db=fake({rows:{hub_records:[{id:'known'}]},unavailable:new Set(['payroll_documents'])});
 const result=await auditPrivateTables(db,uid);
 assert.equal(result.complete,false);
 assert.equal(result.counts.hub_records,1);
 assert.equal(result.counts.payroll_documents,undefined);
 assert(result.errors.some(r=>r.table==='payroll_documents'));
 assert(db.calls.every(x=>x.uid===uid));
});
test('backup is owner-scoped, includes all tables and storage with legacy snapshot shape',async()=>{
 const db=fake({rows:{hub_records:[{id:'known',owner_id:uid,record_type:'renzo_project'}]},
  objects:{'portfolio-files':[{id:'file1',name:'café.pdf'}]}});
 const doc=await buildMigrationBackup(db,uid,{now:()=>new Date('2026-10-22T12:00:00Z')});
 assert.equal(doc.format,'renzo-hub-export');
 assert.equal(doc.version,1);
 assert.equal(doc.counts.hub_records,1);
 assert.equal(doc.counts.files,1);
 assert.equal(doc.files[0].path,uid+'/café.pdf');
 assert.equal(doc.files[0].base64,'c2VjcmV0LXRlc3QtZGF0YQ==');
 assert.equal(Object.keys(doc.tables).length,Object.keys(MIGRATION_TABLES).length);
 assert.equal(db.calls.find(c=>c.table==='payroll_balance_imports')?.column,'owner_id');
 assert.equal(db.orders.find(o=>o.table==='gym_plans')?.column,'user_id');
 assert.equal(doc.errors.length,0);
});
test('storage errors abort the entire export instead of silently omitting files',async()=>{
 const db=fake({listError:true});
 await assert.rejects(buildMigrationBackup(db,uid),/No se pudo leer/);
});
test('inspect only identity-scoped historical keys, never exposes local values',()=>{
 const storage={getItem:key=>key==='renzo-world-v2:'+uid?
  JSON.stringify({_modifiedAt:'2026-10-20',projects:[{title:'classified'}],learningRuns:{nl:{}}}):null};
 const result=legacyLocalKeys(uid,storage);
 assert.equal(result.length,2);
 assert.equal(result[0].present,true);
 assert.equal(result[0].counts.projects,1);
 assert.equal(JSON.stringify(result).includes('classified'),false);
});
test('comparison fails closed on wrong owner and incomplete inventories',()=>{
 const backup={format:'renzo-hub-export',version:1,user_id:uid,
  tables:Object.fromEntries(Object.keys(MIGRATION_TABLES).map(k=>[k,[]]))};
 const audit={counts:Object.fromEntries(Object.keys(MIGRATION_TABLES).map(k=>[k,0])),errors:[],complete:true};
 assert.equal(comparisonAgainstExport(backup,audit,uid).equal,true);
 assert.throws(()=>comparisonAgainstExport({...backup,user_id:other},audit,uid),/no corresponde/);
 assert.equal(comparisonAgainstExport(backup,{...audit,counts:{}},uid).equal,false);
 assert.equal(comparisonAgainstExport(backup,{...audit,complete:false},uid).equal,false);
});

test('content reconciliation detects same-count edits without exposing private values',async()=>{
 const original={id:'row1',owner_id:uid,title:'private',payload:{details:{first:1,second:2}}};
 const db=fake({rows:{hub_records:[original]}});
 const tables=Object.fromEntries(Object.keys(MIGRATION_TABLES).map(t=>[t,[]]));
 tables.hub_records=[{payload:{details:{second:2,first:1}},title:'private',owner_id:uid,id:'row1'}];
 const copy={format:'renzo-hub-export',version:1,user_id:uid,tables};
 const equal=await compareMigrationRows(db,uid,copy);
 assert.equal(equal.equal,true);
 assert.equal(equal.comparisons.find(x=>x.table==='hub_records').changed,0);
 tables.hub_records=[{...original,payload:{details:{first:9,second:2}}}];
 const edited=await compareMigrationRows(db,uid,copy);
 assert.equal(edited.equal,false);
 assert.equal(edited.comparisons.find(x=>x.table==='hub_records').changed,1);
 assert.equal(JSON.stringify(edited).includes('private'),false);
 tables.hub_records=[];
 const missing=await compareMigrationRows(db,uid,copy);
 assert.equal(missing.comparisons.find(x=>x.table==='hub_records').added,1);
});
test('content reconciliation fails closed on missing table and foreign identity',async()=>{
 const db=fake();
 const tables=Object.fromEntries(Object.keys(MIGRATION_TABLES).map(t=>[t,[]]));
 const copy={format:'renzo-hub-export',version:1,user_id:uid,tables};
 delete tables.payroll_balance_imports;
 assert.equal((await compareMigrationRows(db,uid,copy)).equal,false);
 tables.payroll_balance_imports=[{id:'x',owner_id:other}];
 await assert.rejects(compareMigrationRows(db,uid,copy),/no corresponden/);
 await assert.rejects(compareMigrationRows(db,other,copy),/no coincide/);
});
