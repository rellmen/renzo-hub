import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as ed from "../apps/rise-react/src/lib/shift-editor.mjs";
import * as classic from "../microapps/payroll/shift-tracker.js";
import {leaveFormData as classicLeave} from "../microapps/payroll/shift-extras.js";

const uid="11111111-1111-4111-8111-111111111111";
const contractRow={id:"c1",owner_id:uid,title:"Agencia QA",status:"active",payload:{agency:"Agencia QA",employerId:null,hourlyRate:20,
 bands:[{start:"00:00",end:"06:00",percent:100},{start:"06:00",end:"18:00",percent:100},{start:"18:00",end:"00:00",percent:130}],
 overtimeThresholdHours:40,overtimePercent:150,effectiveFrom:"2026-01-01",effectiveTo:null}};
const form={contractId:"c1",date:"2026-10-20",start:"15:00",end:"00:00",breaks:"19:00-19:30;sinpago",startInstant:"",endInstant:""};

test("Legacy payroll copies used by the editor are byte-identical to Classic",()=>{
 for(const f of ["shift-schedule","shifts","weekly-pay","dst-timeline","amsterdam-time"])
  assert.equal(readFileSync(new URL(`../apps/rise-react/src/lib/legacy-payroll/${f}.js`,import.meta.url),"utf8"),
   readFileSync(new URL(`../microapps/payroll/${f}.js`,import.meta.url),"utf8"),f);
});

test("Parsers match Classic results and error messages",()=>{
 const bands="00:00-06:00=100\n06:00-18:00=100\n18:00-00:00=130,5";
 assert.deepEqual(ed.parseBands(bands),classic.parseBands(bands));
 const br="19:00-19:30;sinpago\n02:15-02:45;sinpago;2026-10-25T02:15+02:00;2026-10-25T02:45+01:00";
 assert.deepEqual(ed.parseBreaks(br),classic.parseBreaks(br));
 assert.deepEqual(ed.parseBreaks(ed.breaksToText(ed.parseBreaks(br))),classic.parseBreaks(br));
 for(const bad of ["","18-00=130","08:00-09:00"]){
  let a,b;try{ed.parseBands(bad);}catch(e){a=e.message;}try{classic.parseBands(bad);}catch(e){b=e.message;}
  assert.equal(a,b);assert.ok(a);
 }
 const leave={date:"2026-10-20",kind:"used",hours:"8",reason:"holiday",note:" x "};
 assert.deepEqual(ed.leaveFormData(leave),classicLeave(leave));
 assert.throws(()=>ed.leaveFormData({...leave,kind:"adjustment",hours:"0"}),/cero/);
});

test("Contract validation: 24h coverage, vigencia, employer ownership and overtime rules",()=>{
 const v={agency:" Agencia ",hourlyRate:"20",bands:"00:00-18:00=100\n18:00-00:00=130",overtimeThresholdHours:"40",overtimePercent:"150",effectiveFrom:"2026-01-01",effectiveTo:""};
 const c=ed.buildContract(v,[]);
 assert.equal(c.agency,"Agencia");assert.equal(c.hourlyRate,20);assert.equal(c.effectiveTo,null);
 assert.throws(()=>ed.buildContract({...v,bands:"00:00-12:00=100"}),/24 horas/);
 assert.throws(()=>ed.buildContract({...v,effectiveTo:"2025-01-01"}),/Vigencia/);
 assert.throws(()=>ed.buildContract({...v,employerId:"x"},[{id:"y"}]),/no pertenece/);
 assert.throws(()=>ed.buildContract({...v,overtimePercent:"90"}),/extra/);
});

test("Shift build: snapshot copy, ORT across midnight, vigencia and revision history",()=>{
 const {fields,summary}=ed.buildShift(form,[contractRow]);
 assert.equal(summary.paidMinutes,510);
 assert.equal(fields.payload.contractSnapshot.hourlyRate,20);
 assert.notEqual(fields.payload.contractSnapshot,contractRow.payload,"must be a copy, not a reference");
 assert.equal(fields.occurred_at,"2026-10-20T12:00:00Z");
 assert.throws(()=>ed.buildShift({...form,date:"2025-12-31"},[contractRow]),/vigente/);
 assert.throws(()=>ed.buildShift({...form,contractId:"zz"},[contractRow]),/contrato/);
 const old={id:"s1",payload:{...fields.payload,revision:2,priorRevisions:Array.from({length:12},(_,i)=>({i}))}};
 const rev=ed.buildShift({...form,end:"23:00"},[contractRow],old,()=>new Date("2026-10-21T00:00:00Z")).fields.payload;
 assert.equal(rev.revision,3);assert.equal(rev.priorRevisions.length,9);
 assert.equal(rev.priorRevisions.at(-1).previous.end,"00:00");
});

test("CSV export identical to Classic for the same rows",()=>{
 const rows=[{id:"s1",payload:ed.buildShift(form,[contractRow]).fields.payload},{id:"s2",payload:ed.buildShift({...form,date:"2026-10-21",start:"06:00",end:"15:00",breaks:""},[contractRow]).fields.payload}];
 assert.equal(ed.shiftCSV(rows),classic.shiftCSV(rows));
 assert.match(ed.shiftCSV(rows),/^﻿"fecha";"agencia"/);
});

test("Rotation proposal comes from the original schedule",()=>{
 const p=ed.proposedShift("2026-10-12");assert.equal(p.rotation,"morning");assert.equal(p.start,"06:00");
 assert.equal(ed.proposedShift("2026-10-19").rotation,"afternoon");
 assert.equal(ed.proposedShift("2026-10-18").workingDay,false);
});

function fakeClient(result){
 const calls=[];
 const chain={calls,filters:[],
  from(t){calls.push(["from",t]);return chain;},
  update(f){calls.push(["update",f]);return chain;},delete(){calls.push(["delete"]);return chain;},
  insert(r){calls.push(["insert",r]);return chain;},
  eq(k,v){calls.push(["eq",k,v]);return chain;},
  select(){return chain;},
  maybeSingle:async()=>result,single:async()=>result,
  then(res,rej){return Promise.resolve(result).then(res,rej);}
 };
 return chain;
}
test("Edits and deletes are CAS-scoped to owner, type and updated_at; stale versions are rejected",async()=>{
 const old={id:"s1",updated_at:"2026-10-20T10:00:00.1+00:00",payload:{}};
 const ok=fakeClient({data:{id:"s1"},error:null});
 await ed.updateShift(ok,uid,old,{title:"t"});
 for(const [k,v] of [["id","s1"],["owner_id",uid],["record_type","shift_log"],["updated_at",old.updated_at]])
  assert.ok(ok.calls.some(c=>c[0]==="eq"&&c[1]===k&&c[2]===v),k);
 await assert.rejects(ed.updateShift(fakeClient({data:null,error:null}),uid,old,{}),/otro dispositivo/);
 await assert.rejects(ed.updateShift(ok,uid,{id:"s1"},{}),/Actualiza/);
 const del=fakeClient({data:[{id:"s1"}],error:null});
 assert.equal(await ed.deleteShift(del,uid,old),true);
 assert.ok(del.calls.some(c=>c[0]==="eq"&&c[1]==="updated_at"));
 await assert.rejects(ed.deleteShift(fakeClient({data:[],error:null}),uid,old),/cambió/);
 const ins=fakeClient({data:{id:"n"},error:null});
 await ed.addShift(ins,uid,{title:"x",payload:{}});
 const row=ins.calls.find(c=>c[0]==="insert")[1];
 assert.match(row.id,/^[0-9a-f-]{36}$/);assert.equal(row.owner_id,uid);assert.equal(row.domain,"work");assert.equal(row.record_type,"shift_log");
});

test("Leave guard: documented snapshot and single opening balance",()=>{
 const state={balanceAvailable:true,balanceImport:{as_of:"2026-10-01",leave_minutes:600},leave:[]};
 assert.throws(()=>ed.addLeaveGuard({date:"2026-09-30",kind:"used",minutes:60},state),/incluido/);
 assert.throws(()=>ed.addLeaveGuard({date:"2026-10-10",kind:"opening",minutes:60},state),/saldo inicial/);
 assert.throws(()=>ed.addLeaveGuard({date:"2026-10-10",kind:"used",minutes:60},{...state,balanceAvailable:false}),/Actualiza/);
 assert.equal(ed.addLeaveGuard({date:"2026-10-10",kind:"used",minutes:60},state).kind,"used");
});

test("Turnos page uses the native editor and no longer sends users to the Classic Shift Tracker",()=>{
 const page=readFileSync(new URL("../apps/rise-react/src/routes/turnos.tsx",import.meta.url),"utf8");
 assert.match(page,/<ShiftTrackerEditor\/>/);
 assert.doesNotMatch(page,/Shift Tracker clásico|LEGACY_FALLBACK_URL/);
 const ui=readFileSync(new URL("../apps/rise-react/src/components/rise/ShiftTrackerEditor.tsx",import.meta.url),"utf8");
 assert.match(ui,/SectionCard/);assert.match(ui,/Eliminar definitivamente/);
});
