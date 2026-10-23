import test from 'node:test';
import assert from 'node:assert/strict';
import {peopleReceived,withRealIncome} from '../apps/rise-react/src/lib/money-income.mjs';
import {monthInsights} from '../apps/rise-react/src/lib/legacy-money/finance/insights.js';

const items=[
 {id:'n1',date:'2026-09-02',category:'nomina',amount:856.09,description:'Betreft loonslipnummers 19-20'},
 {id:'n2',date:'2026-09-30',category:'nomina',amount:666.48,description:'Betreft loonslipnummer 25'},
 {id:'t',date:'2026-09-21',category:'toeslagen',amount:129,description:'VOORSCHOT ZORGTOESLAG'},
 {id:'p1',date:'2026-09-09',category:'personas_recibido',amount:590,description:'Cantidad prestada'},
 {id:'p2',date:'2026-09-19',category:'personas_recibido',amount:20,name:'Cantidad prestada'},
 {id:'p3',date:'2026-09-05',category:'personas_recibido',amount:40,description:'Gasolina'},
 {id:'p4',date:'2026-10-01',category:'personas_recibido',amount:99,description:'otro mes'},
 {id:'x',date:'2026-09-10',category:'traspaso',amount:500,description:'Top up'},
 {id:'g',date:'2026-09-11',category:'supermercado',amount:-300,description:'AH'}
];

test('People received separates loans and only counts the month',()=>{
 assert.deepEqual(peopleReceived(items,'2026-09'),{total:650,loans:610,count:3});
});

test('Real income excludes money from people; cash balance stays the bank reality',()=>{
 const legacy=monthInsights(items,'2026-09');
 const r=withRealIncome(legacy,items,'2026-09');
 assert.equal(r.earned,1651.57);         // nómina + toeslag
 assert.equal(r.received,650);
 assert.equal(r.loans,610);
 assert.equal(r.cash,round(legacy.earned-legacy.spent));
 assert.equal(r.savings,r.cash);
 assert.equal(withRealIncome(null,items,'2026-09'),null);
});
function round(n){return Math.round(n*100)/100;}
