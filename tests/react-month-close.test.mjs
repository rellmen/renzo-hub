import test from 'node:test';
import assert from 'node:assert/strict';
import {monthClose,previousMonth,lastDayOf,bankStatus} from '../apps/rise-react/src/lib/month-close.mjs';

// Escenario ficticio con la forma del caso real del 31-10-2026: extractos solo hasta septiembre y W42/W43 sin revisar.
const slip=(id,end,net,hours,status)=>({id,period_label:id,period_end:end,net_payment:net,worked_hours:hours,review_status:status});
const payroll=[slip('W36','2026-09-06',640,40,'approved'),slip('W37','2026-09-13',655,40,'approved'),slip('W38','2026-09-20',610,38,'approved'),
 slip('W39','2026-09-27',666,40,'not_required'),slip('W40','2026-10-04',685,41,'approved'),slip('W41','2026-10-11',632,38,'approved'),
 slip('W42','2026-10-18',562,35,'pending'),slip('W43','2026-10-25',298,18,'pending')];

test('Mes a cerrar = mes anterior, con fin de mes correcto (bisiesto y enero)',()=>{
 assert.equal(previousMonth('2026-11-01'),'2026-10');
 assert.equal(previousMonth('2027-01-15'),'2026-12');
 assert.equal(lastDayOf('2026-10'),'2026-10-31');
 assert.equal(lastDayOf('2028-02'),'2028-02-29');
 assert.throws(()=>previousMonth('ayer'));
});

test('Estado de banco: completo, parcial, sin movimientos del mes y nunca importado',()=>{
 assert.equal(bankStatus('ING','2026-10','2026-10-31').status,'complete');
 assert.equal(bankStatus('ING','2026-10','2026-11-02').status,'complete');
 assert.equal(bankStatus('ING','2026-10','2026-10-25').status,'partial');
 assert.equal(bankStatus('ING','2026-10','2026-09-30').status,'missing');
 assert.equal(bankStatus('ING','2026-10',null).status,'never');
});

test('Caso real de octubre: faltan extractos y hay dos nóminas sin revisar, una con aviso',()=>{
 const r=monthClose({items:[{date:'2026-09-30',bank:'ING',amount:-10,category:'super'}],bankUpdatedThrough:{ING:'2026-09-30',Revolut:'2026-09-29'},payrollRows:payroll,today:'2026-11-01'});
 assert.equal(r.month,'2026-10');
 assert.deepEqual(r.banks.map(b=>b.status),['missing','missing']);
 assert.equal(r.payrollPending,2);
 assert.equal(r.payrollFlagged,1);
 assert.equal(r.complete,false);
 assert.equal(r.done,1); // categorías: no hay gastos de octubre sin categoría
 const p=r.steps.find(s=>s.id==='payroll');
 assert.match(p.detail,/2 de \d+ sin revisar: W42, W43/);
 assert.match(p.detail,/neto anómalo: W43/);
});

test('Mes completo: extractos hasta fin de mes, todo categorizado y nóminas revisadas',()=>{
 const rows=payroll.map(r=>({...r,review_status:'approved'}));
 const items=[{date:'2026-10-05',bank:'ING',amount:-40,category:'super'},{date:'2026-10-20',bank:'Revolut',amount:-12,category:'restaurantes'}];
 const r=monthClose({items,bankUpdatedThrough:{ING:'2026-10-31',Revolut:'2026-11-01'},payrollRows:rows,today:'2026-11-03'});
 assert.equal(r.complete,true);
 assert.equal(r.done,r.total);
 assert.equal(r.transactions,2);
});

test('Gastos sin categoría del mes cuentan; ingresos y otros meses no',()=>{
 const items=[{date:'2026-10-02',bank:'ING',amount:-25.5,category:'sin_categoria'},{date:'2026-10-03',bank:'ING',amount:-4.5,category:'sin_categoria'},
  {date:'2026-10-04',bank:'ING',amount:300,category:'sin_categoria'},{date:'2026-09-28',bank:'ING',amount:-9,category:'sin_categoria'}];
 const r=monthClose({items,bankUpdatedThrough:{ING:'2026-10-31',Revolut:'2026-10-31'},payrollRows:[],today:'2026-11-01'});
 const c=r.steps.find(s=>s.id==='categories');
 assert.equal(r.uncategorized,2);
 assert.match(c.detail,/2 gasto\(s\).*30 €/);
 assert.match(r.steps.find(s=>s.id==='payroll').detail,/No hay nóminas/);
});

test('No modifica los datos de entrada',()=>{
 const input={items:[{date:'2026-10-02',bank:'ING',amount:-1,category:'sin_categoria'}],bankUpdatedThrough:{ING:'2026-10-10'},payrollRows:structuredClone(payroll),today:'2026-11-01'};
 const before=JSON.stringify(input);monthClose(input);
 assert.equal(JSON.stringify(input),before);
});
