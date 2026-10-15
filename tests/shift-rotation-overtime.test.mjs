import test from 'node:test';
import assert from 'node:assert/strict';
import {rotationForDate,proposedShift,periodWeeks,weekMonday} from '../microapps/payroll/shift-schedule.js';
import {calculateWeeklyPayroll,leaveBalance} from '../microapps/payroll/weekly-pay.js';
const contract={agency:'Agencia test',hourlyRate:15,bands:[{start:'00:00',end:'06:00',percent:150},{start:'06:00',end:'18:00',percent:100},{start:'18:00',end:'00:00',percent:130}]};
const row=(date,start,end,breaks=[],agency=contract)=>({payload:{date,start,end,breaks,contractSnapshot:agency}});
const unpaid=(start,end)=>[{start,end,paid:false}];
const iso=(date)=>date;
test('rotates from user-confirmed morning Monday 12 Oct 2026, including both sides and year boundary',()=>{
 assert.deepEqual(periodWeeks('2026-10-12').map(x=>x.type),['morning','afternoon','morning','afternoon']);
 assert.equal(rotationForDate('2026-10-14').type,'morning');
 assert.equal(rotationForDate('2026-10-19').type,'afternoon');
 assert.equal(rotationForDate('2026-10-05').type,'afternoon');
 assert.equal(weekMonday('2027-01-01'),'2026-12-28');
 assert.equal(proposedShift('2026-10-16').start,'06:00');
 assert.equal(proposedShift('2026-10-16').expectedUnpaidBreakMinutes,30);
 assert.deepEqual(proposedShift('2026-10-16').breaks,[]); // Must confirm actual break time.
 assert.equal(proposedShift('2026-10-17').workingDay,false);
 assert.equal(proposedShift('2026-10-20').end,'00:00');
});
test('morning Mon-Fri 6–15 less 30min = 42.5 worked: 2.5h at 150%',()=>{
 const dates=['2026-10-12','2026-10-13','2026-10-14','2026-10-15','2026-10-16'];
 const result=calculateWeeklyPayroll(dates.map(date=>row(date,'06:00','15:00',unpaid('10:00','10:30'))));
 assert.equal(result.weeks.length,1);
 assert.equal(result.weeks[0].minutes,2550);
 assert.equal(result.weeks[0].normalMinutes,2400);
 assert.equal(result.weeks[0].overtimeMinutes,150);
 assert.equal(result.weeks[0].gross,656.25);
 assert.equal(result.shifts[4].normalMinutes,360);
 assert.equal(result.shifts[4].overtimeMinutes,150);
 assert.equal(result.weeks[0].byPercentage.find(x=>x.kind==='overtime').percent,150);
});
test('afternoon Mon-Fri: overtime 150% replaces 130%, never 130% + 150%',()=>{
 const dates=['2026-10-19','2026-10-20','2026-10-21','2026-10-22','2026-10-23'];
 const result=calculateWeeklyPayroll(dates.map(date=>row(date,'15:00','00:00',unpaid('19:00','19:30'))));
 const w=result.weeks[0];assert.equal(w.minutes,2550);assert.equal(w.overtimeMinutes,150);
 assert.equal(w.gross,768.75);
 assert.equal(w.byPercentage.filter(x=>x.kind==='overtime').length,1);
 assert.equal(w.byPercentage.find(x=>x.kind==='overtime').percent,150);
});
test('leaving early and taking a day off reduces paid WORK hours; holiday leave is not overtime',()=>{
 const dates=['2026-10-12','2026-10-13','2026-10-14','2026-10-15'];
 const result=calculateWeeklyPayroll([...dates.map(date=>row(date,'06:00','15:00',unpaid('10:00','10:30'))),row('2026-10-16','06:00','12:00',unpaid('10:00','10:30'))]);
 assert.equal(result.weeks[0].minutes,2370);
 assert.equal(result.weeks[0].overtimeMinutes,0);
 const fewer=calculateWeeklyPayroll(dates.map(date=>row(date,'06:00','15:00',unpaid('10:00','10:30'))));
 assert.equal(fewer.weeks[0].minutes,2040);assert.equal(fewer.weeks[0].overtimeMinutes,0);
});
test('week threshold resets every ISO week and does not pool different agencies',()=>{
 const different={...contract,agency:'Otra agencia'};
 const dates=['2026-10-12','2026-10-13','2026-10-14','2026-10-15','2026-10-16'];
 const dates2=['2026-10-19','2026-10-20','2026-10-21','2026-10-22','2026-10-23'];
 const result=calculateWeeklyPayroll([...dates.map(date=>row(date,'06:00','15:00',unpaid('10:00','10:30'))),...dates2.map(date=>row(date,'06:00','15:00',unpaid('10:00','10:30')))]);
 assert.equal(result.weeks.length,2);
 assert.deepEqual(result.weeks.map(w=>w.overtimeMinutes),[150,150]);
 const split=calculateWeeklyPayroll([...dates.slice(0,3).map(date=>row(date,'06:00','15:00',unpaid('10:00','10:30'))),...dates.slice(3).map(date=>row(date,'06:00','15:00',unpaid('10:00','10:30'),different))]);
 assert.equal(split.weeks.length,2);assert.equal(split.weeks.reduce((s,w)=>s+w.overtimeMinutes,0),0);
});
test('paid break counts in worked remunerated minutes, unpaid break does not',()=>{
 const p=calculateWeeklyPayroll([row('2026-10-12','06:00','15:00',[{start:'10:00',end:'10:30',paid:true}])]);
 assert.equal(p.weeks[0].minutes,540);
 const np=calculateWeeklyPayroll([row('2026-10-12','06:00','15:00',unpaid('10:00','10:30'))]);
 assert.equal(np.weeks[0].minutes,510);
});
test('duplicate shifts at same time and agency are rejected',()=>{
 const s=row('2026-10-12','06:00','15:00');assert.throws(()=>calculateWeeklyPayroll([s,s]),/solapados/);
});
test('vacation bank requires an explicit opening balance; accrued and used hours are separate from worked overtime',()=>{
 assert.deepEqual(leaveBalance([]).known,false);
 assert.equal(leaveBalance([{payload:{date:'2026-10-12',kind:'used',minutes:480}}]).minutes,null);
 const bank=leaveBalance([
  {payload:{date:'2026-10-12',kind:'opening',minutes:1200}},
  {payload:{date:'2026-10-13',kind:'accrual',minutes:120}},
  {payload:{date:'2026-10-14',kind:'used',minutes:480,reason:'holiday'}},
  {payload:{date:'2026-10-15',kind:'used',minutes:240,reason:'dayoff'}}]);
 assert.equal(bank.minutes,600);assert.equal(bank.overdrawn,false);
 assert.equal(leaveBalance([{payload:{date:'2026-10-12',kind:'opening',minutes:120}},{payload:{date:'2026-10-13',kind:'used',minutes:480}}]).overdrawn,true);
});
test('does not override a higher ordinary premium when overtime starts; rejects DST',()=>{
 const costly={...contract,bands:[{start:'00:00',end:'06:00',percent:200},{start:'06:00',end:'18:00',percent:100},{start:'18:00',end:'00:00',percent:180}]};
 const dates=['2026-10-12','2026-10-13','2026-10-14','2026-10-15','2026-10-16'];
 const r=calculateWeeklyPayroll(dates.map(date=>row(date,'15:00','00:00',unpaid('19:00','19:30'),costly)));
 assert.equal(r.weeks[0].byPercentage.filter(x=>x.kind==='overtime')[0].percent,180);
 assert.throws(()=>calculateWeeklyPayroll([row('2026-10-25','01:00','06:00')]),/CET\/CEST/);
});
