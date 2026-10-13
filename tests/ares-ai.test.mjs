import test from "node:test";
import assert from "node:assert/strict";
import {answerAres,aresNormalize,ARES_QUERY_TYPES} from "../microapps/ares-ai.js";
const rows=[
 {id:"p1",record_type:"renzo_project",title:"Dutch Academy",status:"active",payload:{output:"B1"}},
 {id:"p2",record_type:"renzo_project",title:"RISE HUB",status:"active",payload:{output:"Ares AI"}},
 {id:"t1",record_type:"renzo_task",title:"Repasar verbos",status:"Today",payload:{project:"Dutch Academy"}},
 {id:"t2",record_type:"renzo_task",title:"Práctica diaria",status:"Completed",payload:{project:"Dutch Academy"}},
 {id:"a1",record_type:"ares_operation",title:"Validar staging",status:"pending_approval",payload:{agent:"Claude"}},
 {id:"e1",record_type:"renzo_event",title:"Jarvis webhook",status:"completed",source:"automation",payload:{source:"jarvis"}}
];
test("normalize accent-marked Spanish correctly",()=>assert.equal(aresNormalize("Nóminas"),"nominas"));
test("project summary is grounded in actual rows",()=>{const r=answerAres("¿Cómo van mis proyectos?",rows);assert.equal(r.topic,"projects");assert.match(r.text,/Dutch Academy/);assert.match(r.text,/RISE HUB/);});
test("named projects include linked task progress and no fabricated result",()=>{const r=answerAres("¿Cómo va Dutch Academy?",rows);assert.match(r.text,/1\/2 completadas/);assert.match(r.text,/B1/);});
test("tasks exclude completed records",()=>{const r=answerAres("Qué tareas tengo pendientes",rows);assert.match(r.text,/Repasar verbos/);assert.doesNotMatch(r.text,/Práctica diaria/);});
test("inbox includes only pending approvals and provides review action",()=>{const r=answerAres("¿Qué debo aprobar?",rows);assert.match(r.text,/Validar staging/);assert.equal(r.actions[0].id,"a1");});
test("agent status mentions non-live nature of recorded events",()=>{const r=answerAres("Qué han hecho mis agentes",rows);assert.match(r.text,/Jarvis webhook/);assert.match(r.text,/No son indicadores de estado en tiempo real/);});
test("fallback is explicit about unavailable financial integration",()=>{const r=answerAres("¿Cuánto he cobrado?",rows);assert.equal(r.topic,"finance");assert.match(r.text,/no inventar/i);});
test("queries without data don't fabricate a project",()=>{const r=answerAres("¿Cómo van mis proyectos?",[]);assert.match(r.text,/No hay registros/);});
test("Ares query scope is an explicit allowlist",()=>{assert.equal(ARES_QUERY_TYPES.includes("renzo_money"),false);assert.equal(ARES_QUERY_TYPES.includes("ares_operation"),true);});
