import test from 'node:test';
import assert from 'node:assert/strict';
import {captureRow,captureStatus,captureReviewAvailable,changeCaptureStatus,privateCapturePath,downloadCaptureFile,attachCaptureFile,reviewCapture,createCapture,loadInbox} from '../apps/rise-react/src/lib/inbox-records.mjs';
import {carSnapshot} from '../apps/rise-react/src/lib/car-records.mjs';
const uid='22222222-2222-4222-8222-222222222222',id='33333333-3333-4333-8333-333333333333';
const row={...captureRow(uid,{id,title:'Keep',category:'Note',note:'Original'}),updated_at:'2026-10-23T12:00:00Z'};
function db({conflict=false}={}){
 const filters={},patches=[];let saved=row;
 const q={select(){return q;},eq(k,v){filters[k]=v;return q;},update(p){patches.push(p);saved={...row,...p};return q;},upsert(p,o){patches.push({p,o});return Promise.resolve({data:[],error:null});},maybeSingle:async()=>({data:conflict?null:saved,error:null}),single:async()=>({data:saved,error:null})};
 return {from:()=>q,filters,patches};
}
test('Capture validation and idempotent retry use stable IDs without overwriting legacy payload',async()=>{
 assert.throws(()=>captureRow('',{id,title:'Private'}),/sesión/);
 assert.throws(()=>captureRow(uid,{id,title:'',category:'Note'}),/Revisa/);
 assert.throws(()=>captureRow(uid,{id,title:'Private',category:'payslip'}),/Revisa/);
 const client=db();await createCapture(client,uid,{id,title:'Private'});
 assert.equal(client.patches[0].o.ignoreDuplicates,true);assert.equal(client.patches[0].p.id,id);
});
test('Archive/restore are CAS changes preserving attachment and pending flags; stale and foreign changes fail',async()=>{
 const client=db();const original={...row,payload:{...row.payload,attachment:{path:uid+'/existing.pdf'}}};
 const archived=await changeCaptureStatus(client,uid,original,'archived');
 assert.equal(captureStatus(archived),'archived');assert.equal(client.patches[0].payload.attachment.path,uid+'/existing.pdf');
 assert.equal(client.filters.updated_at,row.updated_at);assert.equal(client.filters.owner_id,uid);
 await changeCaptureStatus(client,uid,{...archived,updated_at:row.updated_at},'needs_review');
 await assert.rejects(()=>changeCaptureStatus(db({conflict:true}),uid,row,'archived'),/otro dispositivo/);
 await assert.rejects(()=>changeCaptureStatus(db(),'foreign',row,'archived'),/sesión/);
 await assert.rejects(()=>changeCaptureStatus(db(),uid,{...row,status:'reviewed',payload:{status:'reviewed'}},'archived'),/permitida/);
});
test('Private download rejects cross-owner, traversal and URL paths before touching Storage',async()=>{
 for(const path of ['other/file.pdf',uid+'/../file',uid+'/%2e%2e/file',uid+'/folder\\file',uid+'//file','https://external.test/file'])assert.throws(()=>privateCapturePath(uid,path),/privada/);
 const path=uid+'/capture/file.pdf';assert.equal(privateCapturePath(uid,path),path);
 let requested='';const blob=new Blob(['synthetic']);
 const client={storage:{from(bucket){assert.equal(bucket,'hub-private');return{download:async p=>{requested=p;return {data:blob};}};}}};
 assert.equal((await downloadCaptureFile(client,uid,{...row,payload:{attachment:{path,name:'test.pdf'}}})).blob,blob);assert.equal(requested,path);
 await assert.rejects(()=>attachCaptureFile({},uid,row,{type:'text/html',size:100}),/admitido/);
 await assert.rejects(()=>reviewCapture({},uid,{...row,payload:{category:'payslip'}}),/Nóminas/);
 assert.equal(captureReviewAvailable({...row,payload:{category:'receipt',source:'jarvis',extracted:{amount:50,currency:'EUR'}}}),true);
 for(const amount of [null,'50',-1,NaN,Infinity,1000001])assert.equal(captureReviewAvailable({...row,payload:{category:'receipt',source:'jarvis',extracted:{amount}}}),false);
 assert.equal(captureReviewAvailable({...row,payload:{category:'receipt',source:'jarvis',extracted:{amount:50,currency:'USD'}}}),false);
});
test('Private file retry is content-addressed, never overwrites existing files and attaches with CAS',async()=>{
 const client=db();let seenPath='';
 client.storage={from:bucket=>{assert.equal(bucket,'hub-private');return{upload:async(path,file,opts)=>{assert.equal(opts.upsert,false);seenPath=path;return{error:{statusCode:'409'}};}};}};
 const blob=new Blob(['%PDF-synthetic'],{type:'application/pdf'});blob.name='capture.pdf';
 const saved=await attachCaptureFile(client,uid,row,blob);
 assert.match(seenPath,new RegExp('^'+uid+'/'+id+'/[a-f0-9]{64}-capture.pdf$'));
 assert.equal(saved.payload.attachment.path,seenPath);assert.equal(client.filters.updated_at,row.updated_at);
});
test('Inbox loads all pages with owner filter; Car preserves receipts, bank fuel and pending without a combined total',async()=>{
 let page=0;const q={select(){return q;},eq(k,v){if(k==='owner_id')assert.equal(v,uid);return q;},order(){return q;},range:async()=>({data:++page===1?Array.from({length:1000},()=>row):[row]})};
 assert.equal((await loadInbox({from:()=>q},uid)).length,1001);
 const car=carSnapshot([{id,title:'Receipt',payload:{kind:'expense',category:'Car',amount:50,date:'2026-10-23'}}],
  [{id:'bank',category:'gasolina',amount:-50},{id:'parking',category:'coche',amount:-4},{id:'refund',category:'coche',amount:4}],
  [{...row,payload:{status:'needs_review',extracted:{category:'Car'}}},{...row,payload:{status:'archived',extracted:{category:'Car'}}}]);
 assert.equal(car.expenses.length,1);assert.equal(car.movements.length,2);assert.equal(car.pending.length,1);assert.equal('total' in car,false);
});
