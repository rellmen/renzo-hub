import test from 'node:test';
import assert from 'node:assert/strict';
import {loadRealMoney,summarizeMoney,moneyMonthView} from '../apps/rise-react/src/lib/money-records.mjs';

const owner='22222222-2222-4222-8222-222222222222';
const tx=(id,amount,date='2026-10-21')=>({id,owner_id:owner,occurred_at:date+'T12:00:00Z',
 payload:{date,amount,bank:'ING',account:'test-account',merchant:'SUPERMARKET',description:'Groceries',balance:100+amount}});
function clientFactory(rows=[]){
 const calls=[];
 const db={from(table){
  assert.equal(table,'hub_records');
  const q={filters:[],type:'',select(){return q},eq(k,v){calls.push([k,v]);if(k==='record_type')q.type=v;return q},
    order(){return q},range(from,to){calls.push(['range',[from,to]]);return Promise.resolve({data:q.type==='bank_tx'?rows:[],error:null})},
    limit(){return Promise.resolve({data:[],error:null})}};
  return q;
 }};
 return {db,calls};
}
test('Real Money ignores fake UI constants and fails closed without session',async()=>{
 const {db}=clientFactory();
 await assert.rejects(loadRealMoney(db,''),/iniciar sesión/);
 const empty=await loadRealMoney(db,owner,{at:new Date(2026,9,22,12)});
 assert.equal(empty.txCount,0);
 assert.equal(empty.worth.total,null);
 assert.deepEqual(empty.months,[]);
 assert.equal(empty.monthSummary,null);
 assert.equal(empty.noRevolutStatement,false);
});
test('Real Money retrieves only owner-scoped bank records, budgets and rules',async()=>{
 const {db,calls}=clientFactory([tx('a',-25)]);
 const result=await loadRealMoney(db,owner,{at:new Date(2026,9,22,12)});
 assert.equal(result.txCount,1);
 assert(calls.some(([k,v])=>k==='owner_id'&&v===owner));
 assert(calls.some(([k,v])=>k==='record_type'&&v==='bank_tx'));
 assert(calls.some(([k,v])=>k==='record_type'&&v==='money_rule'));
 assert(calls.some(([k,v])=>k==='record_type'&&v==='money_asset'));
 assert(calls.some(([k,v])=>k==='record_type'&&v==='money_goal'));
 assert.equal(result.month,'2026-10');
 assert.equal(result.noRevolutStatement,true);
});
test('Monthly summaries reuse the legacy categoriser and ignore unverified net worth',()=>{
 const fin={txs:[],items:[
  {id:'a',date:'2026-10-20',amount:-50,category:'supermercado',merchant:'Example',bank:'ING'},
  {id:'b',date:'2026-10-20',amount:1200,category:'nomina',merchant:'Employer',bank:'ING'},
  {id:'c',date:'2026-10-20',amount:-75,category:'traspaso',merchant:'Transfer',bank:'ING'}
 ],budget:null};
 const report=summarizeMoney(fin,[],[],{at:new Date(2026,9,22,12)});
 assert.equal(report.monthSummary?.earned,1200);
 assert.equal(report.monthSummary?.spent,50);
 assert.equal(report.monthSummary?.savings,1150);
 assert.equal(report.worth.total,null);
 assert.equal(moneyMonthView(report,'2025-01'),null);
});
test('Financial summary never fabricates bank accounts or manually valued goals',()=>{
 const report=summarizeMoney({items:[],txs:[],budget:null},[],[{id:'g',payload:{type:'target',name:'Emergency'}}]);
 assert.equal(report.worth.total,null);
 assert.equal(report.worth.accounts.length,0);
 assert.equal(report.goals.length,1);
 assert.equal(report.goals[0].title,'Emergency');
 assert(!('current' in report.goals[0]));
});
