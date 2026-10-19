import test from "node:test";
import assert from "node:assert/strict";
import {TUTOR_LIMITS,tutorPrompt,localTutorResponse,tutorPrivacyNotice} from "../microapps/selflearn/tutor.js";
test("offline tutor never authorizes remote calls",()=>{
 assert.equal(TUTOR_LIMITS.maxRemoteRequests,0);
 assert.match(tutorPrivacyNotice(),/no se envía texto/);
});
test("language prompts and modes are isolated",()=>{
 assert.match(tutorPrompt("nl","conversation"),/Hallo/);
 assert.match(tutorPrompt("en","conversation"),/Hello/);
 assert.throws(()=>tutorPrompt("fr"));
});
test("empty response is not accepted; no fabricated grammar score",()=>{
 assert.equal(localTutorResponse({course:"nl",answer:" "}).accepted,false);
 const response=localTutorResponse({course:"en",mode:"writing",answer:"I work in logistics."});
 assert.equal(response.accepted,true);
 assert.equal(response.automated,false);
 assert.match(response.feedback,/no verifica/);
});
test("response length is capped",()=>{
 const response=localTutorResponse({course:"en",answer:"word ".repeat(600)});
 assert.ok(response.words<=TUTOR_LIMITS.maxChars);
});
