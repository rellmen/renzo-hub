import test from "node:test";
import assert from "node:assert/strict";
import {speechRecognitionSupport,speechPracticeMessage,speechPracticeNotice,startSpeechPractice} from "../microapps/selflearn/speech-practice.js";
test("unsupported browser cannot activate recognition",()=>{assert.equal(speechRecognitionSupport({}),null);assert.equal(startSpeechPractice({scope:{},course:"nl"}).supported,false);});
test("transcript is not a pronunciation score",()=>{const r=speechPracticeMessage("goedemorgen","goedemorgen");assert.equal(r.transcript,"goedemorgen");assert.equal(r.pronunciationScored,false);assert.match(r.message,/no demuestra/);});
test("recognition requires explicit start and can be aborted",()=>{
 let started=0,aborted=0,instance;
 class FakeRecognition{constructor(){instance=this;}start(){started++;}abort(){aborted++;}}
 const session=startSpeechPractice({scope:{SpeechRecognition:FakeRecognition},course:"nl",onResult:()=>{throw Error("should not emit after cancel");}});
 assert.equal(instance.lang,"nl-NL");assert.equal(started,1);session.cancel();assert.equal(aborted,1);
 instance.onresult({results:[[{transcript:"hallo"}]]});
});
test("privacy disclosure identifies potential external browser service",()=>{assert.match(speechPracticeNotice(),/servicios externos/);assert.match(speechPracticeNotice(),/No se almacena audio/);});
