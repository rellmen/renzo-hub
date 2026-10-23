import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {summarizePayroll} from "../apps/rise-react/src/lib/payroll-overview.mjs";

test("read-only payroll detail associates lines, validations and anomalies by payslip without mixing users",()=>{
 const s=[{id:"a",user_id:"one",document_id:"d",period_end:"2026-10-01",net_payment:100}];
 const d=[{id:"d",user_id:"one"}];
 const a=[{id:"anom",payslip_id:"a",status:"open",anomaly_type:"delta"}];
 const v=[{id:"valid",payslip_id:"a",passed:false,rule_code:"gross_sum"}];
 const l=[{id:"line",payslip_id:"a",amount:5,code:"regular_pay"}];
 const r=summarizePayroll(s,d,a,v,l);
 assert.equal(r.rows[0].lineItems.length,1);
 assert.equal(r.rows[0].anomalies[0].anomaly_type,"delta");
 assert.equal(r.rows[0].validations[0].rule_code,"gross_sum");
 assert.equal(r.unresolvedAnomalies,1);
 assert.equal(r.failedValidations,1);
 assert.equal(r.latestNet,100);
});
test("React payroll details stay read-only and all per-user lists are RLS-scoped",()=>{
 const api=readFileSync(new URL("../apps/rise-react/src/lib/payroll-overview.mjs",import.meta.url),"utf8");
 const view=readFileSync(new URL("../apps/rise-react/src/routes/nominas.tsx",import.meta.url),"utf8");
 assert.match(api,/all\(client,"payroll_line_items"/);
 assert.match(api,/\.eq\("user_id",uid\)/);
 assert.match(view,/Desglose y auditoría/);
 assert.match(view,/p\.lineItems\.map/);
});
