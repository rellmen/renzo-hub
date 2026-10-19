// Feedback basado exclusivamente en intentos verificados, sin inferir nivel MCER.
import { grammarDrills } from "./grammar.js";
import { grammarWeakness } from "./adaptive.js";
import { grammarReviewSchedule } from "./grammar-review.js";
export function grammarFeedbackReport(entries=[],course,today=new Date().toISOString().slice(0,10)){
 const drills=new Map(grammarDrills(course).map(d=>[d.id,d]));
 const reviews=new Map(grammarReviewSchedule(entries,course,today).map(r=>[r.id,r]));
 return grammarWeakness(entries,course).filter(r=>r.attempts>0).map(r=>{
  const drill=drills.get(r.id),review=reviews.get(r.id);
  return {id:r.id,rule:drill.rule,level:drill.level,attempts:r.attempts,errors:r.errors,errorRate:r.errorRate,
   recurrent:r.errors>=2,explanation:drill.explanation,exercise:drill.prompt,correctAnswer:drill.answer,
   recommendation:r.errors>=2?"Repite esta regla y revisa la explicación antes de responder":r.errors===1?"Revisa el ejemplo y vuelve a intentarlo":"Continúa practicando para consolidar la regla",
   dueDate:review?.dueDate||null,due:review?.due||false};
 }).sort((a,b)=>Number(b.recurrent)-Number(a.recurrent)||b.errorRate-a.errorRate||b.errors-a.errors||a.id.localeCompare(b.id));
}
export function grammarAnswerFeedback(drill,choice){
 if(!drill)return null;
 const correct=typeof choice==="string"&&choice.trim()===drill.answer;
 return {correct,selected:choice,answer:drill.answer,rule:drill.rule,explanation:drill.explanation,
  suggestion:correct?"Respuesta correcta. Continúa con el siguiente ejercicio.":"Revisa la regla y compara tu respuesta con la solución antes de repetir."};
}
