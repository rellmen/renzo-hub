// Tutor seguro por defecto: sin red ni API keys. Solo contenido local explícito.
const PROMPTS={
 nl:{conversation:["Hallo! Hoe gaat het vandaag?","Wat doe je meestal op je werk?","Kun je een probleem met een levering uitleggen?"],writing:"Schrijf 2–4 zinnen over een taak op je werk. Gebruik een tijdsaanduiding."},
 en:{conversation:["Hello! How was your day?","What is one task you completed at work?","How would you explain a stock discrepancy to a colleague?"],writing:"Write 2–4 sentences explaining a task, a problem, and your next step."}
};
export const TUTOR_LIMITS=Object.freeze({maxChars:1200,maxTurns:6,maxRemoteRequests:0});
export function tutorPrompt(course,mode="conversation",turn=0){
 if(!PROMPTS[course])throw Error("Curso no válido");
 if(mode==="writing")return PROMPTS[course].writing;
 if(mode!=="conversation")throw Error("Modo no válido");
 return PROMPTS[course].conversation[Math.max(0,Math.min(PROMPTS[course].conversation.length-1,Math.floor(turn)||0))];
}
export function localTutorResponse({course,mode="conversation",answer="",turn=0}={}){
 const text=String(answer).trim().slice(0,TUTOR_LIMITS.maxChars);
 if(!PROMPTS[course]||!["conversation","writing"].includes(mode))throw Error("Sesión no válida");
 if(!text)return {accepted:false,feedback:"Escribe una respuesta para continuar.",nextPrompt:tutorPrompt(course,mode,turn),automated:false};
 const words=text.split(/\s+/).filter(Boolean).length;
 return {accepted:true,feedback:(words<5?"Intenta ampliar tu respuesta con más detalles. ":"Respuesta guardada para practicar. ")+"Revísala: el modo local no verifica automáticamente gramática ni pronunciación.",nextPrompt:mode==="conversation"&&turn+1<TUTOR_LIMITS.maxTurns?tutorPrompt(course,mode,turn+1):null,automated:false,words};
}
export function tutorPrivacyNotice(){
 return "Modo local: no se envía texto a una API de IA. El texto se guarda en tu historial de aprendizaje al pulsar Guardar. Evita introducir nombres reales, datos de clientes o información confidencial.";
}
