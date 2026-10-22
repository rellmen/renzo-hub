import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanShiftMode,nextShiftState,nextTemplateState,shiftPreview,saveShiftState} from '../apps/rise-react/src/lib/shift-state.mjs';
import {summarizePayroll,downloadPayrollDocument} from '../apps/rise-react/src/lib/payroll-overview.mjs';
const owner='11111111-1111-4111-8111-111111111111';
const base={profile:{career:'logistics'},sprint:{objective:'done'},learningRuns:{nl:{checkpoint:'keep'}},
 shifts:{'2026-10-22':'Morning Shift'},shiftTemplates:{1:'Evening Shift'}};
test('shift writes preserve unrelated legacy profile, sprint and learning runs',()=>{
 const next=nextShiftState(base,'2026-10-23','Vacation');
 assert.deepEqual(next.profile,base.profile);
 assert.deepEqual(next.learningRuns,base.learningRuns);
 assert.deepEqual(next.sprint,base.sprint);
 assert.equal(next.shifts['2026-10-22'],'Morning Shift');
 assert.equal(next.shifts['2026-10-23'],'Vacation');
 assert.equal(base.shifts['2026-10-23'],undefined);
 const no=nextShiftState(next,'2026-10-23','');
 assert.equal(no.shifts['2026-10-23'],undefined);
});
test('shift template and exceptions select correct weekday and avoid invalid updates',()=>{
 const next=nextTemplateState(base,1,'Morning Shift');
 assert.equal(next.shiftTemplates[1],'Morning Shift');
 assert.equal(shiftPreview({state:next},'2026-10-26'),'Morning Shift');
 assert.equal(shiftPreview({state:next},'2026-10-22'),'Morning Shift');
 assert.throws(()=>cleanShiftMode('Payroll Admin'),/no está permitido/);
 assert.throws(()=>nextTemplateState(next,9,'Vacation'),/Día/);
 assert.throws(()=>nextShiftState(next,'2026-02-30','Vacation'),/Fecha inválida/);
});
test('CAS stale shift edits are rejected instead of silent overwrite',async()=>{
 const orig={owner_id:owner,state:base,updated_at:'2026-10-20T00:00:00Z'};
 const observed={predicates:[]};
 const client={from(name){
  assert.equal(name,'hub_user_state');
  return{update(payload){assert.deepEqual(payload.state,base);
   return{eq(k,v){observed.predicates.push([k,v]);return this;},
    select(){return{maybeSingle:async()=>({data:null,error:null})};}};}};
 }};
 await assert.rejects(saveShiftState(client,owner,orig,base),/cambió en otro dispositivo/);
 assert.deepEqual(observed.predicates,[['owner_id',owner],['updated_at',orig.updated_at]]);
 await assert.rejects(saveShiftState(client,'00000000-0000-4000-8000-000000000000',orig,base),/Propietario/);
});
test('payroll aggregation never sums all historical periods as current income',()=>{
 const pays=[{id:'a',period_end:'2026-09-30',net_payment:1000,review_status:'reviewed',document_id:'doc1'},
  {id:'b',period_end:'2026-10-15',net_payment:2000,document_id:'doc2'}];
 const docs=[{id:'doc1'},{id:'doc2'}];
 const anomalies=[{payslip_id:'b',status:'open'},{payslip_id:'b',status:'resolved'}];
 const rules=[{payslip_id:'b',passed:false},{payslip_id:'a',passed:true}];
 const s=summarizePayroll(pays,docs,anomalies,rules);
 assert.equal(s.rows[0].id,'b');assert.equal(s.latestNet,2000);
 assert.equal(s.unresolvedAnomalies,1);assert.equal(s.failedValidations,1);
 assert.equal(s.approvedCount,1);assert.equal(s.rows[0].unresolved,1);
});
test('private payroll download refuses other owner and invalid storage path',async()=>{
 const client={storage:{from:()=>({download:async()=>({data:new Blob(['pdf']),error:null})})}};
 await assert.rejects(downloadPayrollDocument(client,owner,{user_id:'other',storage_path_raw:'foo.pdf'}),/autorizado/);
 await assert.rejects(downloadPayrollDocument(client,owner,{user_id:owner,storage_path_raw:'../secret'}),/ruta/);
 const x=await downloadPayrollDocument(client,owner,{user_id:owner,storage_path_raw:'test.pdf',original_file_name:'../../secret.pdf'});
 assert.equal(x.name,'.._.._secret.pdf');assert.equal(x.blob.size,3);
});
