import test from "node:test";
import assert from "node:assert/strict";
import {grammarFeedbackReport,grammarAnswerFeedback} from "../microapps/selflearn/grammar-feedback.js";
const attempt=(course,rule,correct)=>({kind:"learning_assessment",skill:"grammar",course,rule,correct,totalQuestions:1,date:"2026-10-17"});
test("two mistakes trigger targeted recommendation without claiming CEFR level",()=>{
 const report=grammarFeedbackReport([attempt("nl","nl-v2",0),attempt("nl","nl-v2",0)],"nl","2026-10-19");
 assert.equal(report[0].recurrent,true);assert.equal(report[0].errors,2);
 assert.match(report[0].recommendation,/Repite/);assert.ok(report[0].explanation);
 assert.equal(report[0].due,true);
});
test("feedback identifies answer and explanation without inventing analysis",()=>{
 const report=grammarFeedbackReport([],"en");assert.equal(report.length,0);
 const drill={answer:"an",rule:"Articles",explanation:"Sound rule"};
 const feedback=grammarAnswerFeedback(drill,"a");assert.equal(feedback.correct,false);
 assert.equal(feedback.answer,"an");assert.equal(feedback.explanation,"Sound rule");
});
test("course boundaries exclude unrelated attempts",()=>{
 assert.equal(grammarFeedbackReport([attempt("en","en-articles",0)],"nl").length,0);
});
