import test from "node:test";
import assert from "node:assert/strict";
import {diagnosticQuestions,evaluateDiagnostic} from "../microapps/selflearn/diagnostic.js";
for(const course of ["nl","en"]){
 test(`${course}: diagnostic separates grammar, reading and ungraded writing`,()=>{
  const q=diagnosticQuestions(course);
  assert.equal(q.grammar.length,3);
  const result=evaluateDiagnostic(course,{grammar:q.grammar.map(x=>x.answer),reading:q.reading.answer,writing:"A written response."});
  assert.equal(result.grammar.correct,3);
  assert.equal(result.reading.correct,1);
  assert.equal(result.writing.assessed,false);
  assert.equal(result.writing.submitted,true);
 });
 test(`${course}: invalid or missing answers cannot inflate score`,()=>{
  const result=evaluateDiagnostic(course,{grammar:[],reading:null,writing:""});
  assert.equal(result.grammar.correct,0);
  assert.equal(result.reading.correct,0);
  assert.equal(result.writing.submitted,false);
 });
}
