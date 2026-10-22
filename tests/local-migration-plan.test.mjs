import test from 'node:test';
import assert from 'node:assert/strict';
import {planLocalMigration} from '../tools/nocturne-local-data-audit.mjs';
const snapshot=(rows,extra={})=>({format:'renzo-hub-export',version:1,user_id:'owner',project:'https://same.supabase.co',tables:{hub_records:rows},errors:[],...extra});
test('offline comparison preserves IDs and treats every changed row as a conflict',()=>{
 const local=snapshot([{id:'same',payload:{body:'unchanged'}},{id:'conflict',payload:{body:'local newer'}},{id:'missing',payload:{body:'only local'}}]);
 const cloud=snapshot([{id:'same',payload:{body:'unchanged'}},{id:'conflict',payload:{body:'confirmed'}},{id:'cloud-only',payload:{body:'cloud'}}]);
 const before=JSON.stringify([local,cloud]);
 const p=planLocalMigration(local,cloud);
 assert.deepEqual(p.tables.hub_records,{identical:1,localOnly:['missing'],conflicts:['conflict'],cloudOnly:['cloud-only']});
 assert.equal(p.canAutoApply,false);assert.equal(p.requiresReview,true);
 assert.equal(JSON.stringify([local,cloud]),before);
 assert(!JSON.stringify(p).includes('confirmed'));assert(!JSON.stringify(p).includes('local newer'));
});
test('comparison fails closed on wrong owner, environment, partial exports and repeated IDs',()=>{
 const s=snapshot([{id:'a'}]);
 for(const other of [snapshot([],{user_id:'other'}),snapshot([],{project:'https://other.supabase.co'}),snapshot([],{errors:['partial']}),snapshot([{id:'a'},{id:'a'}])])
  assert.throws(()=>planLocalMigration(s,other));
 assert.throws(()=>planLocalMigration({...s,project:''},s));
});
