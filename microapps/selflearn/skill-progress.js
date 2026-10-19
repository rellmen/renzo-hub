// Métricas semanales basadas exclusivamente en intentos evaluados.
const DATE=/^\d{4}-\d{2}-\d{2}$/;
function monday(value){
 if(typeof value!=="string"||!DATE.test(value))return null;
 const date=new Date(value+"T00:00:00Z");
 if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==value)return null;
 date.setUTCDate(date.getUTCDate()-(date.getUTCDay()+6)%7);
 return date.toISOString().slice(0,10);
}
export function weeklySkillProgress(entries=[],course,today=new Date().toISOString().slice(0,10),weeks=6){
 if(!["nl","en"].includes(course))throw Error("Curso no válido");
 const current=monday(today);if(!current)throw Error("Fecha no válida");
 const count=Math.max(1,Math.min(12,Math.floor(weeks)||6));
 const buckets=Array.from({length:count},(_,i)=>{
  const date=new Date(current+"T00:00:00Z");date.setUTCDate(date.getUTCDate()-7*(count-1-i));
  return {week:date.toISOString().slice(0,10),grammar:{correct:0,total:0},reading:{correct:0,total:0},writing:{submissions:0,graded:false},conversation:{submissions:0,graded:false},pronunciation:{attempts:0,graded:false}};
 });
 const byWeek=new Map(buckets.map(b=>[b.week,b]));
 for(const e of Array.isArray(entries)?entries:[]){
  if(e?.course!==course)continue;
  const b=byWeek.get(monday(e.date));if(!b)continue;
  if(e.kind==="learning_assessment"&&e.skill==="grammar"&&Number.isInteger(e.correct)&&Number.isInteger(e.totalQuestions)&&e.totalQuestions>0&&e.correct>=0&&e.correct<=e.totalQuestions){
   b.grammar.correct+=e.correct;b.grammar.total+=e.totalQuestions;
  }else if(e.kind==="learning_assessment"&&e.skill==="diagnostic"){
   if(Number.isInteger(e.grammarCorrect)&&Number.isInteger(e.grammarTotal)&&e.grammarTotal>0&&e.grammarCorrect>=0&&e.grammarCorrect<=e.grammarTotal){b.grammar.correct+=e.grammarCorrect;b.grammar.total+=e.grammarTotal;}
   if((e.readingCorrect===0||e.readingCorrect===1)&&e.grammarTotal>=0)b.reading.correct+=e.readingCorrect,b.reading.total++;
   if(typeof e.writing==="string"&&e.writing.trim())b.writing.submissions++;
  }else if(e.kind==="learning"&&e.practice==="Offline tutor"){
   if(e.skill==="writing")b.writing.submissions++;
   if(e.skill==="conversation")b.conversation.submissions++;
  }
 }
 return buckets.map(b=>({...b,grammar:{...b.grammar,pct:b.grammar.total?Math.round(b.grammar.correct/b.grammar.total*100):null},reading:{...b.reading,pct:b.reading.total?Math.round(b.reading.correct/b.reading.total*100):null}}));
}
export function skillProgressNotice(course){return `Objetivo de estudio: ${course==="nl"?"B2":"C1"}. Los porcentajes reflejan solo respuestas evaluadas; no equivalen a un nivel MCER certificado. Escritura, conversación y pronunciación no tienen nota automática.`;}
