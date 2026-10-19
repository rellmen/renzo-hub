// Priorización determinista por regla; utiliza exclusivamente registros del curso activo.
import { grammarDrills } from "./grammar.js";
export function grammarWeakness(entries=[],course){
 const stats=new Map(grammarDrills(course).map(d=>[d.id,{id:d.id,attempts:0,errors:0,lastError:null}]));
 for(const entry of entries){
  if(entry?.course!==course || entry.kind!=="learning_assessment")continue;
  if(entry.skill==="grammar" && stats.has(entry.rule)){
   const row=stats.get(entry.rule),n=Number(entry.totalQuestions)||0;
   if(n<=0 || !Number.isFinite(entry.correct))continue;
   row.attempts+=n;row.errors+=Math.max(0,Math.min(n,n-entry.correct));
   if(entry.correct<n)row.lastError=entry.date||row.lastError;
  }
  if(entry.skill==="diagnostic" && Array.isArray(entry.grammarDetails)){
   for(const detail of entry.grammarDetails){
    const row=stats.get(detail?.id);if(!row||typeof detail.correct!=="boolean")continue;
    row.attempts++;if(!detail.correct){row.errors++;row.lastError=entry.date||row.lastError;}
   }
  }
 }
 return [...stats.values()].map(row=>({...row,errorRate:row.attempts?row.errors/row.attempts:0}));
}
export function adaptiveGrammarDrills(entries=[],course){
 const weakness=new Map(grammarWeakness(entries,course).map(row=>[row.id,row]));
 return [...grammarDrills(course)].sort((a,b)=>{
  const x=weakness.get(a.id),y=weakness.get(b.id);
  const score=z=>z.errors?100+z.errorRate*50+Math.min(z.errors,20):z.attempts?0:25;
  return score(y)-score(x);
 });
}
export function nextGrammarFocus(entries=[],course){
 const ranked=adaptiveGrammarDrills(entries,course),stats=new Map(grammarWeakness(entries,course).map(x=>[x.id,x]));
 const first=ranked[0];if(!first)return null;
 return {id:first.id,rule:first.rule,reason:stats.get(first.id)?.errors?"Errores previos detectados":"Regla pendiente de practicar"};
}
