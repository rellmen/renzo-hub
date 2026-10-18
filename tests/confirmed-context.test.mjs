import test from 'node:test';
import assert from 'node:assert/strict';
import {answerAres} from '../microapps/ares-ai.js';
const record=(section,facts,extra={})=>({record_type:'personal_fact',payload:{section,confirmed:true,confirmedAt:'2026-10-18',facts,...extra}});
const fact=(label,value,verification='user_confirmed')=>({label,value,verification,asOf:'2026-10-18',provenance:'Confirmado por usuario'});
test('private learning answer reads confirmed milestones and distinguishes goals',()=>{
 const r=answerAres('¿Qué estoy estudiando y cuál es mi meta de inglés?',[
  record('learning',[fact('Curso terminado','Curso de ejemplo completado'),fact('Inglés','Meta C1')]),
  record('finance',[fact('Alquiler','1200 €')])]);
 assert.equal(r.topic,'learning');assert.match(r.text,/Curso de ejemplo completado/);assert.match(r.text,/Meta C1/);
 assert.doesNotMatch(r.text,/1200/);assert.match(r.text,/2026-10-18/);assert.match(r.text,/Confirmado por usuario/);
});
test('private financial context labels historical values and does not claim a balance',()=>{
 const r=answerAres('¿Qué sabes de mis finanzas?',[
  record('finance',[fact('Alquiler comunicado','1200 €; vigencia pendiente','historical')])]);
 assert.equal(r.topic,'finance');assert.match(r.text,/Histórico/);assert.match(r.text,/vigencia pendiente/);
});
test('unconfirmed, review drafts and unknown fields never become personal facts',()=>{
 const r=answerAres('¿Qué sabes de mi perfil?',[
  record('profile',[fact('Residencia','City A')],{confirmed:false}),
  record('profile',[fact('Diagnóstico','PRIVATE','inferred')]),
  {record_type:'personal_fact',payload:{section:'profile',confirmed:true,facts:[{label:'X',value:'PRIVATE',verification:'user_confirmed'}]}}
 ]);
 assert.equal(r.topic,'profile');assert.doesNotMatch(r.text,/PRIVATE|City A/);assert.match(r.text,/No hay datos/);
});
test('skincare response preserves uncertain variant and does not turn photos into current stock',()=>{
 const r=answerAres('¿Qué productos tengo en skincare?',[
  record('skincare',[fact('Producto fotografiado','Variante sin confirmar; disponibilidad actual sin confirmar','photo_verified')])]);
 assert.equal(r.topic,'skincare');assert.match(r.text,/Variante sin confirmar/);assert.match(r.text,/disponibilidad actual sin confirmar/);
});
test('ordinary personal phrasings resolve privately, including indirect questions',()=>{
 for(const [q,topic] of [['¿Dónde vivo?','profile'],['¿Cuánto cobro?','finance'],['¿Cuál es mi sueldo?','finance'],['¿Qué sabes sobre mí?','profile']]){
  const r=answerAres(q,[record(topic,[fact('Dato confirmado','Example private value')])]);
  assert.equal(r.topic,topic);assert.match(r.text,/Example private value/);
 }
});
