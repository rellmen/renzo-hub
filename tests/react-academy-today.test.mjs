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

import {weekRange,reviewQueue,weeklyMinutes,studySlot,nextStep} from '../apps/rise-react/src/lib/academy-today.mjs';
import {readFileSync} from 'node:fs';

test('weekRange va de lunes a domingo en hora local',()=>{
 assert.deepEqual(weekRange(new Date(2026,9,24,23,30)),{start:'2026-10-19',end:'2026-10-25'}); // sábado
 assert.deepEqual(weekRange(new Date(2026,9,25,10)),{start:'2026-10-19',end:'2026-10-25'});    // domingo
 assert.deepEqual(weekRange(new Date(2026,9,26,0,5)),{start:'2026-10-26',end:'2026-11-01'});   // lunes
});

test('Repasos de hoy: una sola cola, UOC vencido primero, y sin total si una fuente cae',()=>{
 const learning={reviewDue:{nl:12,en:3}};
 const uocDue=[{lesson_id:'b',due_on:'2026-10-24',step:2},{lesson_id:'a',due_on:'2026-10-20',step:1}];
 const q=reviewQueue({learning,uocDue,lessonInfo:id=>({title:'Lección '+id,course_title:'Matemáticas'})});
 assert.deepEqual(q.items.map(i=>i.id),['uoc-a','uoc-b','vocab-nl','vocab-en']);
 assert.equal(q.total,17);
 assert.equal(q.items[2].search.idioma,'nl');
 assert.equal(q.items[0].search.leccion,'a');
 const down=reviewQueue({learning,uocDue:null});
 assert.equal(down.total,null);assert.equal(down.partial,true);assert.equal(down.items.length,2);
 // UOC apagado en el entorno (undefined) no es una caída: el total de idiomas vale.
 assert.equal(reviewQueue({learning,uocDue:undefined}).total,15);
});

test('Minutos de la semana: reales de SelfLearn y simulacros, estimado aparte para lecciones UOC',()=>{
 const now=new Date(2026,9,24,12);
 const w=weeklyMinutes({now,goal:600,
  entries:[{kind:'learning',date:'2026-10-20',minutes:25},{kind:'learning',date:'2026-10-18',minutes:40},{kind:'gym',date:'2026-10-21',minutes:60},{kind:'learning',date:'2026-10-22',minutes:-5}],
  mocks:[{started_at:new Date(2026,9,23,10).toISOString(),submitted_at:new Date(2026,9,23,11,30).toISOString(),duration_minutes:90},
         {started_at:new Date(2026,9,23,10).toISOString(),submitted_at:new Date(2026,9,23,16).toISOString(),duration_minutes:60},
         {started_at:new Date(2026,9,23,10).toISOString(),submitted_at:null,duration_minutes:90}],
  exams:[],progress:[{lesson_id:'x',status:'completed',completed_at:new Date(2026,9,21,9).toISOString()},{lesson_id:'y',status:'in_progress',completed_at:null},
   {lesson_id:'z',status:'mastered',completed_at:new Date(2026,9,10).toISOString()}],
  lessonMinutes:id=>id==='x'?35:99});
 assert.equal(w.selflearn,25);
 assert.equal(w.uocTimed,150); // 90 + 60 (tope de duración)
 assert.equal(w.uocLessonsEstimate,35);
 assert.equal(w.total,210);assert.equal(w.pct,35);assert.equal(w.partial,false);
 const partial=weeklyMinutes({now,entries:null,mocks:[],progress:[]});
 assert.equal(partial.selflearn,null);assert.equal(partial.total,0);assert.equal(partial.partial,true);
 assert.equal(weeklyMinutes({now}).total,null);
});

test('Hueco de estudio según el turno de DHL',()=>{
 assert.equal(studySlot('Morning Shift',45).budget,30);
 assert.match(studySlot('Morning Shift').moment,/tarde/);
 assert.match(studySlot('Evening Shift').moment,/mañana/);
 assert.equal(studySlot('Vacation',45).budget,60);
 assert.equal(studySlot('',50).work,null);
 assert.equal(studySlot(undefined).moment,'Turno no disponible');
});

test('Siguiente paso: uno solo, UOC primero hasta abril y ajustado al turno',()=>{
 const lesson=(m)=>[{course:'matematicas',courseTitle:'Matemáticas',lesson:{id:'m1',title:'Derivadas',estimated_minutes:m},inProgress:false}];
 const vocab={items:[{id:'vocab-nl',source:'nl',label:'Vocabulario de neerlandés',detail:'8 tarjetas',count:8,minutes:5,to:'/aprender',search:{idioma:'nl'}}]};
 const uocRev={items:[{id:'uoc-a',source:'uoc',label:'Límites',detail:'',count:1,minutes:10,to:'/academia',search:{leccion:'a'}},...vocab.items]};
 assert.equal(nextStep({queue:uocRev,uocNext:lesson(30)}).kind,'uoc-review');
 const work=studySlot('Morning Shift',45);
 assert.equal(nextStep({queue:vocab,uocNext:lesson(25),slot:work}).kind,'uoc-lesson');
 assert.equal(nextStep({queue:vocab,uocNext:lesson(50),slot:work}).kind,'vocab');
 assert.equal(nextStep({queue:{items:[]},uocNext:lesson(50),slot:work}).kind,'uoc-lesson');
 assert.equal(nextStep({queue:vocab,uocNext:lesson(50),slot:studySlot('Vacation',45)}).kind,'uoc-lesson');
 const met={total:600,goal:600};
 assert.equal(nextStep({queue:vocab,uocNext:lesson(20),weekly:met}).kind,'vocab');
 assert.equal(nextStep({queue:{items:[]},uocNext:lesson(20),weekly:met}).kind,'done');
 const idioma=nextStep({queue:{items:[]},uocNext:[],uocOn:false});
 assert.equal(idioma.kind,'idioma');assert.equal(idioma.search.idioma,'nl');
});

test('Car vive en Gastos y /car redirige allí; Idiomas tiene las tres pestañas',()=>{
 const src=p=>readFileSync(new URL('../apps/rise-react/src/'+p,import.meta.url),'utf8');
 assert.match(src('routes/car.tsx'),/redirect\(\{to:'\/gastos',hash:'coche'/);
 assert.match(src('routes/gastos.tsx'),/<CarPanel month=\{month\}\/>/);
 assert.match(src('components/rise/money/CarPanel.tsx'),/Gastos fijos · Coche/);
 assert.match(src('routes/aprender.tsx'),/Inglés · examen UOC/);
 assert.match(src('routes/academia.tsx'),/search=\{\{idioma:"uoc"\}\}/);
});
