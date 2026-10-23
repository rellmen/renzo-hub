import test from 'node:test';
import assert from 'node:assert/strict';
import {categoryPayload,saveGastosCategory,GASTOS_CATEGORIES} from '../apps/rise-react/src/lib/gastos-editor.mjs';
const owner='11111111-1111-4111-8111-111111111111';
test('categorization preserves original amount, date and bank metadata',()=>{
 const original={amount:-13.45,date:'2026-10-22',bank:'ING',description:'original',sourceRef:'statement-1'};
 const next=categoryPayload(original,'supermercado');
 assert.equal(next.category,'supermercado');
 assert.equal(next.amount,-13.45);
 assert.equal(next.sourceRef,'statement-1');
 assert.equal(original.category,undefined);
 assert.equal(categoryPayload(next,'').category,undefined);
 assert.throws(()=>categoryPayload(original,'made-up'),/Categoría/);
 assert(GASTOS_CATEGORIES.some(c=>c.id==='supermercado'));
});
test('writes use owner, domain, transaction type and stale-version CAS',async()=>{
 const row={id:'tx-one',payload:{amount:-7.5,bank:'ING',date:'2026-10-22'},updated_at:'2026-10-20T12:00:00Z'};
 const reads=[],writes=[];
 const client={from(table){
  assert.equal(table,'hub_records');
  return{
   select(){return{eq(k,v){reads.push([k,v]);return this;},maybeSingle:async()=>({data:row,error:null})};},
   update(next){writes.push(next);return{eq(k,v){writes.push([k,v]);return this;},select(){return{maybeSingle:async()=>({data:{id:row.id,updated_at:'new',payload:next.payload},error:null})};}};}
  };
 }};
 const done=await saveGastosCategory(client,owner,{id:'tx-one',updated_at:row.updated_at},'gasolina');
 assert.equal(done.payload.amount,-7.5);
 assert.equal(done.payload.category,'gasolina');
 for(const field of [['owner_id',owner],['domain','money'],['record_type','bank_tx']]){
  assert(reads.some(x=>x[0]===field[0]&&x[1]===field[1]));
  assert(writes.some(x=>Array.isArray(x)&&x[0]===field[0]&&x[1]===field[1]));
 }
 assert(writes.some(x=>Array.isArray(x)&&x[0]==='updated_at'&&x[1]===row.updated_at));
 await assert.rejects(saveGastosCategory(client,owner,{id:'tx-one',updated_at:'stale'},'gasolina'),/otro dispositivo/);
});
