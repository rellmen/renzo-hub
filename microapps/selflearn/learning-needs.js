// Recomendaciones verificables por destreza: no analiza escritura libre ni audio.
import {grammarWeakness} from "./adaptive.js";
export function learningNeeds(entries=[],course){
 if(!["nl","en"].includes(course))throw Error("Curso no válido");
 const rows=Array.isArray(entries)?entries:[];
 const grammar=grammarWeakness(rows,course).filter(r=>r.attempts>0).sort((a,b)=>b.errors-a.errors||b.errorRate-a.errorRate);
 let readingCorrect=0,readingTotal=0,writing=0,conversation=0;
 for(const e of rows){
  if(e?.course!==course)continue;
  if(e.kind==="learning_assessment"&&e.skill==="diagnostic"&&(e.readingCorrect===0||e.readingCorrect===1)){readingCorrect+=e.readingCorrect;readingTotal++;}
  if(e.kind==="learning"&&e.practice==="Offline tutor"){
   if(e.skill==="writing")writing++;
   if(e.skill==="conversation")conversation++;
  }
 }
 const priorities=[];
 if(grammar[0]?.errors>0)priorities.push({skill:"grammar",reason:`Se registraron ${grammar[0].errors} errores en ${grammar[0].id}.`,action:"Repetir la regla y consultar la explicación",rule:grammar[0].id});
 if(readingTotal&&readingCorrect<readingTotal)priorities.push({skill:"reading",reason:`Comprensión lectora: ${readingCorrect}/${readingTotal} respuestas correctas.`,action:"Repetir el diagnóstico de lectura"});
 if(!writing)priorities.push({skill:"writing",reason:"No hay prácticas de escritura del tutor local registradas.",action:"Escribir una respuesta breve en el tutor"});
 if(!conversation)priorities.push({skill:"conversation",reason:"No hay prácticas de conversación del tutor local registradas.",action:"Practicar una conversación guiada"});
 return {course,priorities,reading:{correct:readingCorrect,total:readingTotal},writingPractices:writing,conversationPractices:conversation,notice:"Estas sugerencias proceden del historial disponible; no evalúan calidad de escritura, fluidez ni pronunciación."};
}
