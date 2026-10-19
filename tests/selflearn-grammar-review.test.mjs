import test from "node:test";
import assert from "node:assert/strict";
import {grammarReviewSchedule,dueGrammarReviews} from "../microapps/selflearn/grammar-review.js";
const entry=(course,rule,correct,date)=>({kind:"learning_assessment",course,skill:"grammar",rule,correct,totalQuestions:1,date});
test("mistake schedules next-day review",()=>{
 const rows=[entry("nl","nl-v2",0,"2026-10-01")];
 assert.equal(dueGrammarReviews(rows,"nl","2026-10-01").length,0);
 assert.equal(dueGrammarReviews(rows,"nl","2026-10-02")[0].id,"nl-v2");
});
test("correct repetitions extend interval, mistake resets it",()=>{
 const rows=[entry("en","en-conditional",1,"2026-10-01"),entry("en","en-conditional",1,"2026-10-02")];
 assert.equal(grammarReviewSchedule(rows,"en","2026-10-03")[0].dueDate,"2026-10-05");
 rows.push(entry("en","en-conditional",0,"2026-10-03"));
 assert.equal(grammarReviewSchedule(rows,"en","2026-10-03")[0].dueDate,"2026-10-04");
});
test("diagnostic errors participate; courses are isolated",()=>{
 const rows=[{kind:"learning_assessment",course:"nl",skill:"diagnostic",date:"2026-10-01",grammarDetails:[{id:"nl-v2",correct:false}]}];
 assert.equal(dueGrammarReviews(rows,"nl","2026-10-02").length,1);
 assert.equal(dueGrammarReviews(rows,"en","2026-10-02").length,0);
});
