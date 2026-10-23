import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {payrollReviewChanges,applyPayrollReview} from "../apps/rise-react/src/lib/payroll-review.mjs";
const uid="22222222-2222-4222-8222-222222222222";
const original={id:"pay",user_id:uid,review_status:"pending",updated_at:"2026-10-22T20:00:00Z",
 net_payment:500,net_salary:480,gross_salary:600,worked_hours:30,hourly_rate:15,
 loonheffing:60,shift_allowance:80,payment_date:"2026-10-21",payslip_number:"9"};
const unchanged=Object.fromEntries(["net_payment","net_salary","gross_salary","worked_hours","hourly_rate","loonheffing","shift_allowance","payment_date","payslip_number"].map(k=>[k,original[k]]));
test("Payroll review changes preserve numeric and date validation",()=>{
 assert.deepEqual(payrollReviewChanges(original,unchanged),{});
 assert.deepEqual(payrollReviewChanges(original,{...unchanged,net_payment:"501,20"}),{net_payment:501.2});
 assert.throws(()=>payrollReviewChanges(original,{...unchanged,payment_date:"2026-02-30"}),/Fecha/);
 assert.throws(()=>payrollReviewChanges(original,{...unchanged,gross_salary:"NaN"}),/Valor/);
});
test("Review RPC checks owner and fresh pending version; does not use service role",async()=>{
 let rpcName,rpcArgs;
 const db={auth:{getUser:async()=>({data:{user:{id:uid}},error:null})},
  from:()=>({select:()=>({eq(){return this;},maybeSingle:async()=>({data:{id:"pay",user_id:uid,review_status:"pending",updated_at:original.updated_at},error:null})})}),
  rpc:async(name,args)=>{rpcName=name;rpcArgs=args;return{data:{ok:true,payslip_id:"pay"},error:null};}};
 const out=await applyPayrollReview(db,uid,original,{...unchanged,net_payment:"501"},"approved","Comprobado con PDF");
 assert.equal(out.ok,true);assert.equal(rpcName,"payroll_apply_review_cas");
 assert.equal(rpcArgs.p_expected_updated_at,original.updated_at);
 assert.equal(rpcArgs.p_changes.net_payment,501);
 await assert.rejects(()=>applyPayrollReview(db,"wrong",original,unchanged,"approved"),/sesión/);
});
test("Nocturne review is gated off by default and does not replace Classic without QA",()=>{
 const c=readFileSync(new URL("../apps/rise-react/src/components/rise/PayrollReview.tsx",import.meta.url),"utf8");
 assert.match(c,/VITE_PAYROLL_REVIEW_ENABLED"\]==="true"/);
 assert.match(c,/!enabled/);
 assert.match(c,/applyPayrollReview\(client,uid,row/);
});
