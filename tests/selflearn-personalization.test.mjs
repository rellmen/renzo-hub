import test from 'node:test';
import assert from 'node:assert/strict';
import {personalization,savePersonalization,grammarAccuracy,checkTyped} from '../microapps/selflearn/engine.js';

test('defaults focus on grammar and pronunciation without altering existing settings',()=>{
 const settings={startingLevel:'A2',focus:'Logística'};
 assert.deepEqual(personalization(settings,'nl').priorities,{grammar:40,pronunciation:30,context:20,review:10});
 assert.equal(settings.courses,undefined);
});
test('personalization is independent for Dutch and English and retains legacy fields',()=>{
 const settings={startingLevel:'A2',courses:{en:{startingLevel:'B1'}}};
 savePersonalization(settings,'nl',{priorities:{grammar:60,pronunciation:30,context:10,review:0}});
 savePersonalization(settings,'en',{priorities:{grammar:20,pronunciation:50,context:20,review:10}});
 assert.equal(personalization(settings,'nl').priorities.grammar,60);
 assert.equal(personalization(settings,'en').priorities.pronunciation,50);
 assert.equal(settings.courses.en.startingLevel,'B1');
 assert.equal(settings.startingLevel,'A2');
});
test('priorities reject negative and non-finite values and normalize',()=>{
 const s={};savePersonalization(s,'nl',{priorities:{grammar:-20,pronunciation:200,context:0,review:0}});
 assert.equal(personalization(s,'nl').priorities.pronunciation,100);
 assert.equal(personalization(s,'nl').priorities.grammar,0);
});
test('grammar score is derived only from assessed grammar attempts',()=>{
 assert.deepEqual(grammarAccuracy([{kind:'learning_assessment',course:'nl',skill:'grammar',correct:3,totalQuestions:5},{kind:'learning_assessment',course:'en',skill:'grammar',correct:5,totalQuestions:5}],'nl'),{correct:3,total:5,pct:60});
 assert.equal(grammarAccuracy([],'nl').pct,null);
});
test('existing typed tolerance must not be used for grammar grading',()=>{
 assert.equal(checkTyped('goes','go','en').ok,false);
});
