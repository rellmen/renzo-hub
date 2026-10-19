// Diagnóstico por destreza: no confundir cuestionarios con certificación MCER.
import { grammarDrills, checkGrammar } from "./grammar.js";
export const READING = Object.freeze({
 nl:{text:"Morgen begint de ochtendploeg om zes uur. De levering komt om acht uur. Sara controleert eerst de voorraad.",question:"Wanneer komt de levering?",options:["Om zes uur","Om acht uur","Om tien uur"],answer:1},
 en:{text:"The shipment arrives on Tuesday, but the stock report is due on Monday. The team will prepare the report before receiving the goods.",question:"When is the stock report due?",options:["Monday","Tuesday","Wednesday"],answer:0}
});
export const WRITING = Object.freeze({
 nl:"Schrijf twee zinnen over een probleem met de voorraad en wat je gaat doen.",
 en:"Write two sentences explaining a stock discrepancy and the next action."
});
export function diagnosticQuestions(course){
 if(!READING[course]) throw Error("Curso no válido");
 return {grammar:grammarDrills(course).slice(0,3),reading:READING[course],writing:WRITING[course]};
}
export function evaluateDiagnostic(course,answers={}){
 const q=diagnosticQuestions(course);
 const grammar=q.grammar.map((item,i)=>({id:item.id,correct:checkGrammar(item,answers.grammar?.[i]),rule:item.rule}));
 const reading=Number.isInteger(answers.reading) && answers.reading===q.reading.answer;
 const writing=String(answers.writing||"").trim().slice(0,1200);
 return {course,grammar:{correct:grammar.filter(x=>x.correct).length,total:grammar.length,details:grammar},reading:{correct:reading?1:0,total:1},writing:{submitted:writing.length>0,text:writing,assessed:false},notice:"Resultado orientativo de gramática y lectura; la producción escrita queda pendiente de revisión. No certifica nivel MCER."};
}
