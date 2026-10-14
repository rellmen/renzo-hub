import test from 'node:test';
import assert from 'node:assert/strict';
import {leaveBalance} from '../microapps/payroll/weekly-pay.js';
const snapshot={as_of:'2026-08-09',leave_minutes:1215,keuzebudget_cents:12345,payslip_id:'qa'};
test('documented closing balance includes earlier and same-day events exactly once',()=>{
 const rows=[{date:'2026-08-08',kind:'used',minutes:480},{date:'2026-08-09',kind:'accrual',minutes:120},{date:'2026-08-10',kind:'used',minutes:60}];
 const balance=leaveBalance(rows,snapshot);
 assert.equal(balance.minutes,1155);
 assert.equal(balance.history.filter(x=>x.includedInSnapshot).length,2);
 assert.equal(balance.asOf,'2026-08-09');
});
test('money snapshot never enters vacation arithmetic',()=>{
 assert.equal(leaveBalance([],snapshot).minutes,1215);
 assert.equal(leaveBalance([],{...snapshot,keuzebudget_cents:999999}).minutes,1215);
});
test('rejects multiple opening balances rather than silently replacing',()=>{
 assert.throws(()=>leaveBalance([{date:'2026-08-01',kind:'opening',minutes:60},{date:'2026-08-02',kind:'opening',minutes:120}]),/inicial/);
 assert.throws(()=>leaveBalance([{date:'2026-08-01',kind:'opening',minutes:60}],snapshot),/inicial/);
});
test('requires explicit confirmation and separate whole hours/minutes and euro cents',async()=>{
 const {parseBalanceConfirmation}=await import('../microapps/payroll/balance-import.js');
 const values={hours:'20',minutes:'15',euros:'123,45',confirmed:'on'};
 assert.deepEqual(parseBalanceConfirmation(values),{leaveMinutes:1215,keuzebudgetCents:12345});
 for(const bad of [{confirmed:''},{minutes:'60'},{hours:'20.5'},{euros:'1.001'},{hours:''},{euros:''},{hours:'-1'}])assert.throws(()=>parseBalanceConfirmation({...values,...bad}));
 assert.deepEqual(parseBalanceConfirmation({hours:'0',minutes:'0',euros:'0',confirmed:'on'}),{leaveMinutes:0,keuzebudgetCents:0});
});
