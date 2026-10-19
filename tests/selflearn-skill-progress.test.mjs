import test from "node:test";
import assert from "node:assert/strict";
import {weeklySkillProgress,skillProgressNotice} from "../microapps/selflearn/skill-progress.js";
test("empty history has no fabricated score",()=>{
 const weeks=weeklySkillProgress([],"nl","2026-10-19",2);
 assert.equal(weeks.length,2);assert.equal(weeks[1].grammar.pct,null);assert.equal(weeks[1].reading.pct,null);assert.equal(weeks[1].writing.submissions,0);
});
test("grammar and reading use only assessed records and isolate courses",()=>{
 const entries=[
 {course:"nl",kind:"learning_assessment",skill:"grammar",correct:1,totalQuestions:1,date:"2026-10-19"},
 {course:"nl",kind:"learning_assessment",skill:"diagnostic",grammarCorrect:2,grammarTotal:3,readingCorrect:1,writing:"Mijn werk",date:"2026-10-20"},
 {course:"en",kind:"learning_assessment",skill:"grammar",correct:0,totalQuestions:1,date:"2026-10-19"},
 {course:"nl",kind:"learning_assessment",skill:"grammar",correct:100,totalQuestions:1,date:"2026-10-19"}
 ];
 const nl=weeklySkillProgress(entries,"nl","2026-10-20",1)[0],en=weeklySkillProgress(entries,"en","2026-10-20",1)[0];
 assert.deepEqual(nl.grammar,{correct:3,total:4,pct:75});assert.equal(nl.reading.pct,100);assert.equal(nl.writing.submissions,1);
 assert.equal(en.grammar.pct,0);assert.equal(en.reading.pct,null);
});
test("tutor submissions are activity, not assessed scores",()=>{
 const w=weeklySkillProgress([{course:"en",kind:"learning",practice:"Offline tutor",skill:"conversation",date:"2026-10-19"},{course:"en",kind:"learning",practice:"Offline tutor",skill:"writing",date:"2026-10-19"}],"en","2026-10-19",1)[0];
 assert.equal(w.conversation.submissions,1);assert.equal(w.writing.submissions,1);assert.equal(w.grammar.pct,null);assert.match(skillProgressNotice("en"),/C1/);
});
test("invalid dates and out-of-window events cannot affect results",()=>{
 const w=weeklySkillProgress([{course:"nl",kind:"learning_assessment",skill:"grammar",correct:1,totalQuestions:1,date:"2026-02-30"}],"nl","2026-10-19",1)[0];
 assert.equal(w.grammar.total,0);assert.throws(()=>weeklySkillProgress([],"fr","2026-10-19"));
});
