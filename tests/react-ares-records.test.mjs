import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeAresRecords,loadAresRecords,answerAresFromRecords}
 from '../apps/rise-react/src/lib/ares-records.mjs';
const uid='22222222-2222-4222-8222-222222222222';
const rows=[
 {id:'a',record_type:'renzo_project',title:'RISE HUB',status:'active',payload:{status:'active'}},
 {id:'b',record_type:'renzo_task',title:'Validar la PWA',status:'Blocked',payload:{status:'Blocked'}},
 {id:'c',record_type:'renzo_task',title:'Terminada',status:'Completed',payload:{status:'Completed'}},
 {id:'d',record_type:'ares_operation',title:'Publicar',status:'pending_approval'},
 {id:'e',record_type:'renzo_inbox',title:'Recibo',status:'reviewed'},
 {id:'f',record_type:'ares_agent_run',title:'Ejecución registrada',status:'success'}
];
const stub=(data,error=null)=>{
 const called=[];
 const q={select(v){called.push(['select',v]);return q},eq(k,v){called.push(['eq',k,v]);return q},
  in(k,v){called.push(['in',k,v]);return q},order(k,v){called.push(['order',k,v]);return q},
  limit(v){called.push(['limit',v]);return Promise.resolve({data,error});}};
 return {db:{from(k){called.push(['from',k]);return q}},called};
};
test('Ares only reads RLS-scoped private records with an owner id',async()=>{
 const {db,called}=stub(rows);
 const v=await loadAresRecords(db,uid);
 assert.equal(v.projects.length,1);
 assert.equal(v.tasks.length,1);
 assert.equal(v.approvals.length,1);
 assert.equal(v.agents.length,1);
 assert(called.some(x=>x[0]==='eq'&&x[1]==='owner_id'&&x[2]===uid));
 assert(called.some(x=>x[0]==='from'&&x[1]==='hub_records'));
 assert(called.some(x=>x[0]==='limit'&&x[1]===300));
});
test('Ares does not claim live agents, approve actions or invent project balances',()=>{
 const summary=summarizeAresRecords(rows);
 const approval=answerAresFromRecords('¿Qué aprobaciones pendientes tengo?',summary);
 assert.match(approval,/Revisiones pendientes/);
 assert.match(approval,/No se ha ejecutado ni aprobado ninguna acción/);
 assert.doesNotMatch(approval,/Tareas abiertas registradas:/);
 const agent=answerAresFromRecords('¿Qué agentes han trabajado?',summary);
 assert.match(agent,/no prueba de que los agentes estén conectados ahora/);
 const money=answerAresFromRecords('¿Cuánto dinero tengo en el banco?',summary);
 assert.match(money,/no consulta finanzas/);
 assert.doesNotMatch(money,/€|\$[0-9]/);
});
test('Ares fails securely when the authenticated user is missing or RLS denies access',async()=>{
 await assert.rejects(loadAresRecords(stub(rows).db,''),/Sesión necesaria/);
 await assert.rejects(loadAresRecords(stub(null,{message:'RLS denied'}).db,uid),/RLS denied/);
 await assert.rejects(loadAresRecords(stub(null).db,uid),/no disponibles/);
});
test('Ares summary acknowledges partial datasets and empty records honestly',()=>{
 const full=summarizeAresRecords(Array.from({length:300},()=>({record_type:'renzo_event',title:'Evento'})));
 assert.equal(full.partial,true);
 assert.match(answerAresFromRecords('proyectos',full),/m[aá]s/);
 const empty=summarizeAresRecords();
 assert.match(answerAresFromRecords('proyectos',empty),/No hay proyectos abiertos en los registros consultados/);
});
