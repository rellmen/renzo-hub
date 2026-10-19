import test from "node:test";
import assert from "node:assert/strict";
import { pickVoice, issueText, unlockAudio, initAudio, speakText, _resetAudioForTests } from "../microapps/selflearn/audio.js";

function fakeScope({ speaking = false, voices = [] } = {}) {
  const log = [], timers = [];
  const synth = { speaking, pending: false, paused: false, getVoices: () => voices, speak: u => log.push(["speak", u.text, u.volume]), cancel: () => log.push(["cancel"]), resume: () => log.push(["resume"]), addEventListener() {} };
  class Utt { constructor(t) { this.text = t; } }
  return { log, timers, scope: { speechSynthesis: synth, SpeechSynthesisUtterance: Utt, setTimeout: (f, ms) => timers.push([f, ms]), navigator: {}, document: { addEventListener() {}, removeEventListener() {} } } };
}

test("elige voz local del idioma exacto y, si no, la del mismo idioma", () => {
  const v = [{ lang: "en-US", name: "Samantha", localService: true }, { lang: "nl-BE", name: "Ellen" }, { lang: "nl-NL", name: "Xander", localService: true }, { lang: "nl-NL", name: "Claire (mejorada)", localService: true }];
  assert.equal(pickVoice(v, "nl-NL").name, "Claire (mejorada)");
  assert.equal(pickVoice(v, "en-GB").name, "Samantha");
  assert.equal(pickVoice([{ lang: "nl_NL", name: "Android" }], "nl-NL").name, "Android");
  assert.equal(pickVoice([], "nl-NL"), null);
});

test("desbloqueo: una frase muda y sesión de audio playback, solo una vez", () => {
  _resetAudioForTests();
  const f = fakeScope(); f.scope.navigator.audioSession = { type: "auto" };
  assert.equal(unlockAudio(f.scope), true);
  assert.equal(f.scope.navigator.audioSession.type, "playback");
  assert.deepEqual(f.log, [["speak", " ", 0]]);
  unlockAudio(f.scope);
  assert.equal(f.log.length, 1);
});

test("no hace cancel() antes de hablar si no suena nada (WebKit descartaba la frase)", () => {
  _resetAudioForTests();
  const f = fakeScope();
  speakText("Goedemorgen", "nl-NL", f.scope);
  assert.deepEqual(f.log.map(x => x[0]), ["speak", "speak"]); // desbloqueo + frase
  assert.equal(f.log[1][1], "Goedemorgen");
});

test("si ya suena algo, cancela y habla tras una pausa corta", () => {
  _resetAudioForTests();
  const f = fakeScope({ speaking: true });
  unlockAudio(f.scope); f.log.length = 0;
  speakText("Hello", "en-GB", f.scope);
  assert.deepEqual(f.log, [["cancel"]]);
  const [go, ms] = f.timers[0]; assert.equal(ms, 60); go();
  assert.deepEqual(f.log.at(-1), ["speak", "Hello", 1]);
});

test("avisa con pasos concretos si a los 1,5 s no ha empezado a sonar", () => {
  _resetAudioForTests();
  const f = fakeScope(); let msg = "";
  initAudio(f.scope, { issue: m => { msg = m; } });
  speakText("Dank je wel", "nl-NL", f.scope);
  const watchdog = f.timers.find(t => t[1] === 1500); assert.ok(watchdog); watchdog[0]();
  assert.equal(msg, issueText("nl-NL"));
  assert.match(msg, /modo silencio/); assert.match(msg, /voz de neerlandés/);
});

test("sin voz del navegador lo dice en vez de fallar en silencio", () => {
  _resetAudioForTests(); let msg = "";
  initAudio({}, { issue: m => { msg = m; } });
  assert.equal(speakText("Hi", "en-GB", {}), null);
  assert.match(msg, /no puede leer en voz alta/);
});
