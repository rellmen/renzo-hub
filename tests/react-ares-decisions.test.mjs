import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewAresRequest} from '../apps/rise-react/src/lib/ares-decisions.mjs';
const row={id:'request',owner_id:'owner',domain:'system',record_type:'ares_operation',status:'pending_approval',updated_at:'2026-10-22T10:00:00Z',payload:{agent:'Jarvis',details:'Preserve me'}};
function db(conflict=false){const filters={};let patch;const q={update(p){patch=p;return q;},eq(k,v){filters[k]=v;return q;},select(){return q;},async maybeSingle(){return {data:conflict?null:{...row,...patch},error:null};}};return {from:()=>q,filters,get patch(){return patch;}};}
test('review records an owner decision atomically without executing an agent',async()=>{
 const client=db();
 const result=await reviewAresRequest(client,'owner',row,'approved');
 assert.equal(result.status,'approved');assert.equal(client.patch.payload.executed,false);
 assert.equal(client.patch.payload.executionStatus,'not_connected');
 assert.equal(client.patch.payload.details,'Preserve me');
 assert.equal(client.filters.owner_id,'owner');assert.equal(client.filters.status,'pending_approval');
 assert.equal(client.filters.updated_at,row.updated_at);assert.equal(client.filters.domain,'system');
});
test('stale requests, foreign owners and financial Inbox items cannot be approved',async()=>{
 await assert.rejects(()=>reviewAresRequest(db(true),'owner',row,'approved'),/cambiado/i);
 await assert.rejects(()=>reviewAresRequest(db(),'other',row,'approved'),/cuenta/i);
 await assert.rejects(()=>reviewAresRequest(db(),'owner',{...row,record_type:'renzo_inbox'},'approved'),/permitida/i);
 await assert.rejects(()=>reviewAresRequest(db(),'owner',{...row,status:'approved'},'rejected'),/permitida/i);
 await assert.rejects(()=>reviewAresRequest(db(),'owner',row,'executed'),/permitida/i);
});
