import test from 'node:test';
import assert from 'node:assert/strict';
import {loadPayrollRecords,payrollTotals} from '../apps/rise-react/src/lib/payroll-records.mjs';
test('payroll loads all own rows and shifts without mutating financial records',async()=>{
 const calls=[];
 const db={from(table){
  const filters={};const q={select(){return q;},eq(k,v){filters[k]=v;return q;},order(){return q;},
   async range(a,b){calls.push({table,filters:{...filters},a,b});
    return {data:table==='payroll_payslips'?Array.from({length:Math.max(0,Math.min(b+1,501)-a)},(_,i)=>({id:String(a+i)})):[],error:null};}};return q;
 }};
 const result=await loadPayrollRecords(db,'owner');
 assert.equal(result.payslips.length,501);
 assert(calls.every(x=>(x.filters.user_id||x.filters.owner_id)==='owner'));
 assert(calls.some(x=>x.filters.record_type==='shift_log'&&x.filters.domain==='work'));
 assert(calls.some(x=>x.filters.record_type==='shift_contract'&&x.filters.domain==='money'));
});
test('payroll totals separate currency, missing amounts and unreviewed records',()=>{
 const rows=[{currency:'EUR',net_payment:'10.12',review_status:'reviewed'},
  {currency:'EUR',net_payment:null},{currency:'EUR',net_payment:'2.01'},
  {currency:'USD',net_payment:30},{currency:'EUR',net_payment:'invalid'}];
 const totals=payrollTotals(rows);
 assert.equal(totals.EUR.amount,12.13);
 assert.equal(totals.EUR.missing,2);
 assert.equal(totals.USD.amount,30);
});
test('payroll fails closed on missing identity and read errors',async()=>{
 await assert.rejects(()=>loadPayrollRecords(null,''),/sesión/i);
 const q={select(){return q;},eq(){return q;},order(){return q;},range:async()=>({error:{message:'RLS failure'}})};
 await assert.rejects(()=>loadPayrollRecords({from:()=>q},'owner'),/RLS failure/);
});
