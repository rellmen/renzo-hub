import test from "node:test";
import assert from "node:assert/strict";
import {learningNeeds} from "../microapps/selflearn/learning-needs.js";
test("missing evidence produces practice prompts but no invented scores",()=>{
 const r=learningNeeds([],"nl");assert.equal(r.reading.total,0);assert.equal(r.priorities.some(p=>p.skill==="grammar"),false);assert.equal(r.priorities.some(p=>p.skill==="writing"),true);
});
test("reading errors produce targeted recommendation per course",()=>{
 const entries=[{course:"nl",kind:"learning_assessment",skill:"diagnostic",readingCorrect:0},{course:"en",kind:"learning_assessment",skill:"diagnostic",readingCorrect:1}];
 assert.equal(learningNeeds(entries,"nl").priorities.some(p=>p.skill==="reading"),true);
 assert.equal(learningNeeds(entries,"en").priorities.some(p=>p.skill==="reading"),false);
});
test("recorded tutor activities remove absence-based recommendations",()=>{
 const rows=[{course:"en",kind:"learning",practice:"Offline tutor",skill:"writing"},{course:"en",kind:"learning",practice:"Offline tutor",skill:"conversation"}];
 const r=learningNeeds(rows,"en");assert.equal(r.writingPractices,1);assert.equal(r.conversationPractices,1);assert.equal(r.priorities.length,0);
});
test("invalid course rejected",()=>assert.throws(()=>learningNeeds([],"fr")));
