// Rise / SelfLearn · small pure adapter around the ORIGINAL language engine.
// Graded answers, repeat scheduling and progress remain in the legacy engine.
// Completion here is PRACTICE ONLY until atomic XP/FSRS finalization is migrated.
import {buildLesson,currentStep,answer,advance,isComplete,progressPct,normalize,checkTyped,checkBuild,score,validRun}
 from "./legacy-selflearn/engine.js";
const passive=new Set(["learn","grammar","speak"]);
const textTypes=new Set(["type","build"]);
const choiceTypes=new Set(["choice","listen","gap","dialogue"]);
function shallow(run){
 if(!validRun(run)||run.mode!=="lesson")throw Error("Sesión SelfLearn no válida.");
 return structuredClone(run);
}
export function makePractice(course,unit,{minutes=5,seed=Date.now()}={}){
 if(course!=="nl"&&course!=="en")throw Error("Curso no válido.");
 if(![5,10,20].includes(minutes))throw Error("Duración no válida.");
 const run=buildLesson(course,unit,{minutes,seed});
 if(!run||!validRun(run))throw Error("No pude preparar la unidad solicitada.");
 return run;
}
export function practicePrompt(run){
 const r=shallow(run),step=currentStep(r);
 return {step,progress:progressPct(r),complete:isComplete(r),score:isComplete(r)?score(r):null};
}
export function gradePractice(run,input){
 const r=shallow(run);
 if(isComplete(r))throw Error("La práctica ya terminó.");
 const step=currentStep(r);
 if(!step)throw Error("Este ejercicio ya no existe en la sesión.");
 let correct=true,expected=null;
 if(passive.has(step.type)){
   correct=true;
 }else if(choiceTypes.has(step.type)){
   const typed=String(input??"").trim();
   if(!typed)throw Error("Elige una respuesta antes de continuar.");
   correct=normalize(typed)===normalize(step.answer);
   expected=step.answer;
 }else if(step.type==="type"){
   const typed=String(input??"").trim();
   if(!typed)throw Error("Escribe tu respuesta para continuar.");
   correct=checkTyped(typed,step.answer,r.course).ok;
   expected=step.answer;
 }else if(step.type==="build"){
   const typed=String(input??"").trim();
   if(!typed)throw Error("Completa la frase antes de continuar.");
   correct=checkBuild(typed.split(/\s+/),step.answer);
   expected=step.full||step.answer.join(" ");
 }else if(step.type==="match"){
   const a=Array.isArray(input)?input:[];
   if(!Array.isArray(step.pairs)||a.length!==step.pairs.length||
      a.some(x=>typeof x!=="string"||!x.trim()))throw Error("Completa todas las parejas.");
   correct=step.pairs.every((pair,i)=>normalize(a[i])===normalize(pair[1]));
   expected="Emparejamiento: "+step.pairs.map(p=>p.join(" → ")).join("; ");
 }else{
   throw Error("Ejercicio no disponible en este reproductor. Usa la versión clásica.");
 }
 if(!passive.has(step.type))answer(r,correct);
 advance(r);
 return {run:r,correct,expected,stepType:step.type,complete:isComplete(r),score:isComplete(r)?score(r):null};
}
export const supportedSelfLearnStepTypes=Object.freeze([...passive,...textTypes,...choiceTypes,"match"]);
