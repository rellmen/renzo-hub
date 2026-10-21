import test from 'node:test';
import assert from 'node:assert/strict';
import {WORK_STATUSES,statusColumn,columnTargetStatus,mapTaskRow,loadWorkRecords,createWorkTask,updateWorkTaskStatus}
 from '../apps/rise-react/src/lib/work-records.mjs';

const uid='22222222-2222-4222-8222-222222222222';
const old='2026-10-20T08:00:00.000Z';
const row=(id,status='Blocked')=>({id,owner_id:uid,domain:'work',record_type:'renzo_task',
 title:'Revisar integración',status,updated_at:old,occurred_at:old,
 payload:{id,title:'Revisar integración',status,priority:'Strategic',
 project:'RISE HUB',blocker:'Revisión QA pendiente',nextAction:'Verificar staging',updatedAt:old}});
function fakeDb({tasks=[],projects=[],conflict=false,fail=false}={}){
 const log=[];
 const client={from(table){
   assert.equal(table,'hub_records');
   const filters={};
   let operation='read',inserted=null,patch=null;
   const builder={
     select(fields){log.push({op:'select',fields,filters:{...filters}});return builder;},
     eq(field,value){filters[field]=value;return builder;},
     order(field,opts){log.push({op:'order',field,opts});return builder;},
     limit(n){
       log.push({op:'limit',n,filters:{...filters}});
       if(fail)return Promise.resolve({data:null,error:{message:'simulated RLS failure'}});
       const d=filters.record_type==='renzo_task'?tasks:projects;
       return Promise.resolve({data:d,error:null});
     },
     insert(value){operation='insert';inserted=value;log.push({op:'insert',value});return builder;},
     update(value){operation='update';patch=value;log.push({op:'update',value});return builder;},
     single(){
       if(operation!=='insert')throw Error('unexpected single');
       return Promise.resolve({data:{...inserted,updated_at:old},error:null});
     },
     maybeSingle(){
       if(operation!=='update')throw Error('unexpected maybeSingle');
       log.push({op:'conditional',filters:{...filters}});
       const data=conflict?null:{...tasks[0],status:patch.status,payload:patch.payload,updated_at:'2026-10-22T10:00:00.000Z'};
       return Promise.resolve({data,error:null});
     }
   };
   return builder;
 }};
 return {client,log};
}

test('Real Work overview reads only own work records, no demo seed',async()=>{
 const {client,log}=fakeDb({tasks:[row('a')],projects:[]});
 const result=await loadWorkRecords(client,uid);
 assert.equal(result.tasks.length,1);
 assert.deepEqual(result.projects,[]);
 assert.equal(result.tasks[0].status,'Blocked');
 assert.equal(result.tasks[0].priority,'Strategic');
 assert.equal(result.tasks[0].blocker,'Revisión QA pendiente');
 assert.equal(log.filter(x=>x.op==='limit').length,2);
 for(const call of log.filter(x=>x.op==='limit')){
   assert.equal(call.filters.owner_id,uid);
   assert.equal(call.filters.domain,'work');
   assert(['renzo_task','renzo_project'].includes(call.filters.record_type));
 }
});

test('Actual legacy statuses remain reversible through the Kanban view',()=>{
 assert.deepEqual(WORK_STATUSES,["Today","This Week","Blocked","Waiting","Backlog","Completed"]);
 assert.equal(statusColumn('Blocked'),'doing');
 assert.equal(statusColumn('Waiting'),'todo');
 assert.equal(statusColumn('Completed'),'done');
 assert.equal(columnTargetStatus('doing'),'Today');
 assert.equal(columnTargetStatus('done'),'Completed');
 assert.throws(()=>columnTargetStatus('unknown'));
});

test('A Cloud row preserves all legacy fields after rendering',()=>{
 const mapped=mapTaskRow(row('b'));
 assert.equal(mapped.project,'RISE HUB');
 assert.equal(mapped.nextAction,'Verificar staging');
 assert.equal(mapped.status,'Blocked');
 assert.equal(mapped._cloudUpdatedAt,old);
});

test('New tasks use real Supabase insert with owner, type, approval metadata and a UUID',async()=>{
 const {client,log}=fakeDb();
 const task=await createWorkTask(client,uid,{title:'   Preparar QA  ',status:'Today',priority:'High',project:'RISE HUB'});
 const w=log.find(x=>x.op==='insert').value;
 assert.equal(w.owner_id,uid);
 assert.equal(w.domain,'work');
 assert.equal(w.record_type,'renzo_task');
 assert.equal(w.source,'manual');
 assert.equal(w.requires_review,false);
 assert.equal(w.payload.title,'Preparar QA');
 assert.equal(w.payload.status,'Today');
 assert.match(w.id,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
 assert.equal(task.status,'Today');
});

test('Task change uses compare-and-swap updated_at and preserves hidden legacy fields',async()=>{
 const oldTask=mapTaskRow(row('c'));
 const {client,log}=fakeDb({tasks:[row('c')]});
 const result=await updateWorkTaskStatus(client,uid,oldTask,'Completed');
 const operation=log.find(x=>x.op==='update');
 const cond=log.find(x=>x.op==='conditional');
 assert.equal(operation.value.status,'Completed');
 assert.equal(operation.value.payload.blocker,'Revisión QA pendiente');
 assert.equal(operation.value.payload.nextAction,'Verificar staging');
 assert.equal(cond.filters.owner_id,uid);
 assert.equal(cond.filters.record_type,'renzo_task');
 assert.equal(cond.filters.updated_at,old);
 assert.equal(result.status,'Completed');
});

test('Rejects stale edits, missing authentication, invalid status and failed RLS',async()=>{
 await assert.rejects(loadWorkRecords(fakeDb().client,''),/Inicia sesión/);
 await assert.rejects(loadWorkRecords(fakeDb({fail:true}).client,uid),/RLS failure/);
 await assert.rejects(createWorkTask(fakeDb().client,uid,{title:' '}),/obligatorio/);
 await assert.rejects(createWorkTask(fakeDb().client,uid,{title:'ok',status:'untrusted'}),/no permitidos/);
 await assert.rejects(updateWorkTaskStatus(fakeDb({conflict:true,tasks:[row('c')]}).client,uid,mapTaskRow(row('c')),'Today'),/cambió en otro dispositivo/);
});
