// Reconocimiento de voz opcional. Una transcripción no mide fonemas ni acento.
export function speechRecognitionSupport(scope=globalThis){
 const Ctor=scope.SpeechRecognition||scope.webkitSpeechRecognition;
 return typeof Ctor==="function"?Ctor:null;
}
export function speechPracticeMessage(transcript,target){
 const heard=String(transcript||"").trim();
 if(!heard)return {transcript:"",message:"No se reconocieron palabras. Puedes escribir o corregir la transcripción.",pronunciationScored:false};
 return {transcript:heard,message:"Transcripción obtenida. Compárala con el modelo y corrígela si hace falta. Reconocer palabras no demuestra que la pronunciación sea correcta.",pronunciationScored:false};
}
export function speechPracticeNotice(){
 return "El micrófono solo se activa cuando pulsas Iniciar dictado y aceptas el permiso del navegador. El reconocimiento puede usar servicios externos del navegador; no es necesariamente local. No se almacena audio ni se calcula una nota de pronunciación.";
}
export function startSpeechPractice({scope=globalThis,course,onResult,onStatus}={}){
 const Ctor=speechRecognitionSupport(scope);
 if(!Ctor)return {supported:false,cancel:()=>{}};
 const recognition=new Ctor();
 recognition.lang=course==="nl"?"nl-NL":"en-US";
 recognition.interimResults=false;
 recognition.maxAlternatives=1;
 let active=true;
 recognition.onresult=e=>{if(!active)return;onResult?.(speechPracticeMessage(e.results?.[0]?.[0]?.transcript||""));};
 recognition.onerror=e=>{if(active)onStatus?.("No se pudo transcribir: "+String(e.error||"error del navegador"));};
 recognition.onend=()=>{if(active)onStatus?.("Dictado finalizado. Puedes editar la transcripción.");};
 try{recognition.start();}catch{active=false;onStatus?.("No se pudo iniciar el micrófono.");}
 return {supported:true,cancel:()=>{active=false;recognition.abort?.();}};
}
