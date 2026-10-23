import test from "node:test";
import assert from "node:assert/strict";
import {summarizeLanguageXP} from "../apps/rise-react/src/lib/language-xp.mjs";
import {summarizeVerifiedXP} from "../apps/rise-react/src/lib/xp-overview.mjs";
const row=(id,lesson,xp)=>({id,record_type:"renzo_event",payload:{kind:"learning",course:"nl",courseLessonId:lesson,xp,date:"2026-10-22"}});
test("SelfLearn XP deduplicated per course and lesson but not double-counted in global Quest",()=>{
 const rows=[row("a","a1-1",20),row("b","a1-1",20),row("c","a1-2",30),
 {id:"d",record_type:"xp_event",payload:{points:50,sourceId:"d"}}];
 const study=summarizeLanguageXP(rows);
 const global=summarizeVerifiedXP(rows);
 assert.equal(study.points,50);assert.equal(study.lessonCount,2);assert.equal(study.duplicates,1);
 assert.equal(global.points,50);
});
test("Unverified or negative study XP never boosts the visible learning counter",()=>{
 const rows=[row("a","a1-1",-10),row("b","a1-2",NaN),{id:"c",record_type:"renzo_event",payload:{kind:"other",course:"nl",courseLessonId:"a1-3",xp:800}}];
 assert.equal(summarizeLanguageXP(rows).points,0);
});
