import test from "node:test";
import assert from "node:assert/strict";
import {loadSavedShifts,buildContractualReport} from "../apps/rise-react/src/lib/shift-payroll-report.mjs";
import {calculateShift} from "../apps/rise-react/src/lib/legacy-payroll/shifts.js";

const uid="11111111-1111-4111-8111-111111111111";
const contract={agency:"Contrato de prueba",hourlyRate:20,
 bands:[{start:"00:00",end:"12:00",percent:100},{start:"12:00",end:"00:00",percent:100}],
 overtimeThresholdHours:40,overtimePercent:150};
const shift={date:"2026-10-20",start:"06:00",end:"15:00",
 breaks:[{start:"12:00",end:"12:30",paid:false}],contractSnapshot:contract};
const row={id:"shift1",owner_id:uid,domain:"work",record_type:"shift_log",payload:shift};
function clientFor(rows=[]) {
 const seen=[];
 return {
  seen,
  from(table){
   seen.push(["table",table]);
   return {select(){
    return {eq(k,v){seen.push([k,v]);return this;},
      order(k){seen.push(["order",k]);return this;},
      async range(from,to){seen.push(["range",from,to]);return {data:rows.slice(from,to+1),error:null};}
    };
   }};
  }
 };
}
test("same classic shift engine calculates paid breaks and ORT without assumed premiums",()=>{
 const x=calculateShift(shift,contract);
 assert.equal(x.paidMinutes,510);
 assert.equal(x.unpaidBreakMinutes,30);
 assert.equal(x.estimatedGross,170);
 const report=buildContractualReport([row]);
 assert.equal(report.count,1);
 assert.equal(report.weeks.length,1);
 assert.equal(report.weeks[0].gross,170);
 assert.equal(report.weeks[0].overtimeMinutes,0);
 assert.match(report.warning,/estimación/i);
});
test("shift history is owner-scoped and rejects rows that do not belong to that owner",async()=>{
 const client=clientFor([row]);
 assert.deepEqual(await loadSavedShifts(client,uid),[row]);
 assert(client.seen.some(([k,v])=>k==="owner_id"&&v===uid));
 assert(client.seen.some(([k,v])=>k==="domain"&&v==="work"));
 const other={...row,owner_id:"another"};
 await assert.rejects(loadSavedShifts(clientFor([other]),uid),/no corresponde/);
});
test("weekly report does not show a partial wage when an archived contract is missing",()=>{
 assert.throws(()=>buildContractualReport([row,{...row,id:"shift2",payload:{...shift,contractSnapshot:null}}]),/sin copia de su contrato/);
 assert.deepEqual(buildContractualReport([]).weeks,[]);
});
