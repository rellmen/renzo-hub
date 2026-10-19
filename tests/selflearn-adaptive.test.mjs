import test from "node:test";
import assert from "node:assert/strict";
import {adaptiveGrammarDrills,grammarWeakness,nextGrammarFocus} from "../microapps/selflearn/adaptive.js";
test("prioritizes a failed diagnostic rule",()=>{
 const entries=[{kind:"learning_assessment",course:"nl",skill:"diagnostic",grammarDetails:[{id:"nl-inversion",correct:false},{id:"nl-v2",correct:true}]}];
 assert.equal(adaptiveGrammarDrills(entries,"nl")[0].id,"nl-inversion");
 assert.equal(nextGrammarFocus(entries,"nl").id,"nl-inversion");
});
test("uses subsequent grammar mistakes and separates courses",()=>{
 const entries=[{kind:"learning_assessment",course:"en",skill:"grammar",rule:"en-conditional",correct:0,totalQuestions:1}];
 assert.equal(adaptiveGrammarDrills(entries,"en")[0].id,"en-conditional");
 assert.equal(grammarWeakness(entries,"nl").reduce((n,x)=>n+x.errors,0),0);
});
test("does not mutate input or score invalid records",()=>{
 const entries=[{kind:"learning_assessment",course:"nl",skill:"grammar",rule:"nl-v2",correct:1,totalQuestions:0}];
 const before=JSON.stringify(entries);
 assert.equal(grammarWeakness(entries,"nl").find(x=>x.id==="nl-v2").attempts,0);
 adaptiveGrammarDrills(entries,"nl");assert.equal(JSON.stringify(entries),before);
});
