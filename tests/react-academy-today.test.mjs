import test from 'node:test';
import assert from 'node:assert/strict';
import {academyToday} from '../apps/rise-react/src/lib/academy-today.mjs';

test('Academy Hoy suma repasos de Idiomas y UOC +25 solo si ambas fuentes respondieron',()=>{
 const learning={reviewDue:{nl:4,en:2},completed:{nl:['a','b'],en:['c']}};
 const uoc={due:[{},{},{}],next:[1,2,3,4].map(i=>({course:'matematicas',lesson:{id:'l'+i,title:'L'+i},inProgress:false}))};
 const t=academyToday({learning,uoc});
 assert.equal(t.totalDue,9);
 assert.equal(t.partial,false);
 assert.deepEqual(t.languages,{nlDue:4,enDue:2,nlDone:2,enDone:1});
 assert.equal(t.exam.next.length,3);
});

test('Academy Hoy no convierte una fuente caída en cero',()=>{
 const t=academyToday({learning:{reviewDue:{nl:1,en:0},completed:{nl:[],en:[]}},uoc:null});
 assert.equal(t.totalDue,null);
 assert.equal(t.partial,true);
 assert.equal(t.exam,null);
 assert.equal(academyToday({learning:{reviewDue:{nl:-3,en:NaN},completed:{nl:[],en:[]}},uoc:{due:[],next:[]}}).totalDue,0);
});
