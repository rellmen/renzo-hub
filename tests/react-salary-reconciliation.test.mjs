import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {incomeBreakdown} from "../microapps/finance/income.js";
import {summarizeMoney} from "../apps/rise-react/src/lib/money-records.mjs";
test("Income matching never double-counts payroll and warns only with bank coverage",()=>{
 const raw={id:"bank1",payload:{bank:"ING",date:"2026-10-20",amount:550,payslip_numbers:[15],name:"SD WORX",balance:1300}};
 const fin={txs:[raw],items:[{id:"bank1",date:"2026-10-20",amount:550,category:"nomina",name:"SD WORX",bank:"ING"}],rules:[],budget:null};
 const sum=summarizeMoney(fin,[],[],{at:new Date(2026,9,22)});
 assert.equal(sum.salaryBankTxs.length,1);
 assert.equal(sum.monthSummary.earned,550);
 const slips=[{id:"pay1",period_year:2026,payslip_number:"15",net_payment:550,payment_date:"2026-10-20",review_status:"approved",validation_status:"ok"}];
 const result=incomeBreakdown({items:fin.items,txs:sum.salaryBankTxs,payslips:slips,month:"2026-10",expectedDate:p=>p.payment_date,lastImport:"2026-10-21"});
 assert.equal(result.confirmed,550);
 assert.equal(result.salary,550);
 assert.equal(result.earned,550);
 assert.equal(result.rows[0].status,"confirmed");
});
test("Reconciliation UI is read-only and uses latest verified import coverage",()=>{
 const money=readFileSync(new URL("../apps/rise-react/src/routes/dinero.tsx",import.meta.url),"utf8");
 const comp=readFileSync(new URL("../apps/rise-react/src/components/rise/SalaryReconciliation.tsx",import.meta.url),"utf8");
 assert.match(money,/<SalaryReconciliation moneyData=\{data\}/);
 assert.match(comp,/lastImport:moneyData\.bankUpdatedThrough\["ING"\]/);
 assert.doesNotMatch(comp,/\.insert\(|\.update\(|\.delete\(/);
});
