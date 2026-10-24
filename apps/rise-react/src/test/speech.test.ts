import {describe,it,expect,vi,afterEach} from "vitest";
import {speak,voiceFor} from "../lib/speech";

const V=(lang:string,localService=true)=>({lang,localService,default:false,name:lang,voiceURI:lang});
describe("voz en el móvil",()=>{
 afterEach(()=>{vi.unstubAllGlobals();});
 it("elige una voz del idioma, mejor local y del país correcto",()=>{
  expect(voiceFor("nl",[V("en-US"),V("nl-BE"),V("nl-NL",false),V("nl-NL")])?.lang).toBe("nl-NL");
  expect(voiceFor("nl",[V("en-US"),V("nl_BE")])?.lang).toBe("nl_BE");
  expect(voiceFor("nl",[V("en-US")])).toBe(null);
 });
 it("pasa el iPhone a modo reproducción, no cancela si no suena nada y avisa si falta la voz",()=>{
  const spoken:any[]=[];const synth={speaking:false,pending:false,cancel:vi.fn(),resume:vi.fn(),speak:(u:any)=>spoken.push(u),getVoices:()=>[V("en-GB")]};
  class U{text:string;lang="";rate=1;voice:any=null;onend:any;onerror:any;constructor(t:string){this.text=t;}}
  vi.stubGlobal("speechSynthesis",synth);vi.stubGlobal("SpeechSynthesisUtterance",U);
  const session={type:"auto"};Object.defineProperty(navigator,"audioSession",{value:session,configurable:true});
  expect(speak("Goedemorgen","nl")).toBe("no-voice");
  expect(session.type).toBe("playback");
  expect(synth.cancel).not.toHaveBeenCalled();
  expect(spoken[0].lang).toBe("nl-NL");
  expect(speak("Hello","en")).toBe("ok");
  expect(spoken[1].voice.lang).toBe("en-GB");
 });
});
