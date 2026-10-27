import {describe,it,expect,vi,afterEach} from "vitest";
import {existsSync} from "node:fs";
import {join} from "node:path";
import {speak,stopSpeaking,voiceFor,recordedAudioUrl} from "../lib/speech";
import {audioKey} from "../lib/selflearn-audio-key.mjs";
import {spokenTexts} from "../../scripts/selflearn-audio.mjs";
import index from "../lib/selflearn-audio-index.json";

const V=(lang:string,localService=true)=>({lang,localService,default:false,name:lang,voiceURI:lang});
describe("voz en el móvil",()=>{
 afterEach(()=>{stopSpeaking();vi.unstubAllGlobals();});
 it("elige una voz del idioma, mejor local y del país correcto",()=>{
  expect(voiceFor("nl",[V("en-US"),V("nl-BE"),V("nl-NL",false),V("nl-NL")])?.lang).toBe("nl-NL");
  expect(voiceFor("nl",[V("en-US"),V("nl_BE")])?.lang).toBe("nl_BE");
  expect(voiceFor("nl",[V("en-US")])).toBe(null);
 });
 it("sin MP3: pasa el iPhone a modo reproducción, no cancela si no suena nada y avisa si falta la voz",()=>{
  const spoken:any[]=[];const synth={speaking:false,pending:false,cancel:vi.fn(),resume:vi.fn(),speak:(u:any)=>spoken.push(u),getVoices:()=>[V("en-GB")]};
  class U{text:string;lang="";rate=1;voice:any=null;onend:any;onerror:any;constructor(t:string){this.text=t;}}
  vi.stubGlobal("speechSynthesis",synth);vi.stubGlobal("SpeechSynthesisUtterance",U);
  const session={type:"auto"};Object.defineProperty(navigator,"audioSession",{value:session,configurable:true});
  expect(speak("Frase inventada sin audio","nl")).toBe("no-voice");
  expect(session.type).toBe("playback");
  expect(synth.cancel).not.toHaveBeenCalled();
  expect(spoken[0].lang).toBe("nl-NL");
  expect(speak("Another invented line","en")).toBe("ok");
  expect(spoken[1].voice.lang).toBe("en-GB");
 });
 it("con MP3: lo reproduce con <audio> (suena en silencio) y no usa la voz del navegador",()=>{
  const synth={speaking:false,pending:false,cancel:vi.fn(),resume:vi.fn(),speak:vi.fn(),getVoices:()=>[]};
  vi.stubGlobal("speechSynthesis",synth);
  const made:any[]=[];
  class A{src:string;preload="";playbackRate=1;onended:any;onerror:any;pause=vi.fn();
   constructor(s:string){this.src=s;made.push(this);} play(){return Promise.resolve();}}
  vi.stubGlobal("Audio",A);
  const onEnd=vi.fn();
  expect(speak("goedemorgen","nl",{onEnd})).toBe("ok");
  expect(made[0].src).toBe(`/audio/selflearn/nl/${audioKey("nl","goedemorgen")}.mp3`);
  expect(synth.speak).not.toHaveBeenCalled();
  made[0].onended();
  expect(onEnd).toHaveBeenCalledTimes(1);
 });
 it("si el MP3 falla, cae a la voz del navegador",()=>{
  const synth={speaking:false,pending:false,cancel:vi.fn(),resume:vi.fn(),speak:vi.fn(),getVoices:()=>[]};
  class U{text:string;lang="";rate=1;voice:any=null;onend:any;onerror:any;constructor(t:string){this.text=t;}}
  vi.stubGlobal("speechSynthesis",synth);vi.stubGlobal("SpeechSynthesisUtterance",U);
  const made:any[]=[];
  class A{src:string;preload="";playbackRate=1;onended:any;onerror:any;pause=vi.fn();
   constructor(s:string){this.src=s;made.push(this);} play(){return Promise.resolve();}}
  vi.stubGlobal("Audio",A);
  speak("goedemorgen","nl");
  made[0].onerror();
  expect(synth.speak).toHaveBeenCalledTimes(1);
 });
});

describe("audios pregenerados de SelfLearn",()=>{
 it("la clave es estable (cambiarla obliga a regenerar todos los MP3)",()=>{
  expect(audioKey("nl","goedemorgen")).toBe(audioKey("nl","  goedemorgen "));
  expect(audioKey("nl","goedemorgen")).not.toBe(audioKey("en","goedemorgen"));
  expect(audioKey("nl","goedemorgen")).toMatch(/^[0-9a-f]{8}$/);
 });
 it("cada palabra y frase de los cursos tiene su MP3 en el índice y en public/",()=>{
  for(const lang of ["nl","en"] as const){
   const items=spokenTexts(lang);
   const missing=items.filter(x=>!recordedAudioUrl(x.text,lang)).map(x=>x.text);
   expect(missing,`Ejecuta scripts/selflearn-audio (faltan ${missing.length} en ${lang})`).toEqual([]);
   expect(index[lang].length).toBe(items.length);
   for(const x of items) expect(existsSync(join(__dirname,"..","..","public","audio","selflearn",lang,`${x.key}.mp3`))).toBe(true);
  }
 });
});
