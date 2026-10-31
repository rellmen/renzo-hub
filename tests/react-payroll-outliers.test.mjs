import test from 'node:test';
import assert from 'node:assert/strict';
import {payrollOutlier,payrollOutliers} from '../apps/rise-react/src/lib/payroll-outliers.mjs';

// Historial ficticio con la forma real de payroll_payslips (sin datos personales).
const week=(id,end,net,hours,status='approved')=>({id,period_label:id,period_end:end,net_payment:net,worked_hours:hours,review_status:status});
const history=[
 week('W36','2026-09-06',640,40),week('W37','2026-09-13',655,40),week('W38','2026-09-20','610.10',38),
 week('W39','2026-09-27',666.48,40,'not_required'),week('W40','2026-10-04',685.24,41),week('W41','2026-10-11',632.54,38),
];

test('Neto muy bajo con menos horas: aviso con pregunta de vacaciones/baja',()=>{
 const rows=[...history,week('W43','2026-10-25',297.94,18,'pending')];
 const o=payrollOutlier(rows.at(-1),rows);
 assert.equal(o.cause,'fewer_hours');
 assert.equal(o.references,6);
 assert.ok(o.ratio<0.7);
 assert.match(o.question,/vacaciones/);
});

test('Neto bajo con horas normales: apunta a deducciones',()=>{
 const rows=[...history,week('W44','2026-11-01',300,40,'pending')];
 assert.equal(payrollOutlier(rows.at(-1),rows).cause,'deductions');
});

test('Semana algo más baja pero dentro de lo normal: sin aviso',()=>{
 const rows=[...history,week('W42','2026-10-18',562.23,35,'pending')];
 assert.equal(payrollOutlier(rows.at(-1),rows),null);
});

test('Sin historial suficiente o nómina rechazada: nunca avisa',()=>{
 const few=[...history.slice(0,3),week('W43','2026-10-25',100,10,'pending')];
 assert.equal(payrollOutlier(few.at(-1),few),null);
 const rej=[...history,week('W43','2026-10-25',100,10,'rejected')];
 assert.equal(payrollOutlier(rej.at(-1),rej),null);
});

test('Pendientes y rechazadas no cuentan como referencia; solo nóminas anteriores',()=>{
 const rows=[week('P1','2026-09-01',50,5,'pending'),week('P2','2026-09-02',50,5,'rejected'),...history,
  week('FUT','2026-12-01',5000,40),week('W43','2026-10-25',297.94,18,'pending')];
 const o=payrollOutlier(rows.at(-1),rows);
 assert.equal(o.references,6);
 assert.equal(o.usualNet,647.5);
 assert.deepEqual(payrollOutliers(rows).map(x=>x.id),['W43']);
});

test('No modifica las filas',()=>{
 const rows=structuredClone([...history,week('W43','2026-10-25',297.94,18,'pending')]);
 const before=JSON.stringify(rows);payrollOutliers(rows);
 assert.equal(JSON.stringify(rows),before);
});
