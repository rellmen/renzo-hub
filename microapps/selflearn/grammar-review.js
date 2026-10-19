// Repaso espaciado de gramática derivado del historial persistido, sin nueva tabla.
import { grammarDrills } from "./grammar.js";
const INTERVALS=[1,3,7,14,30];
const day=s=>{const n=Date.parse(String(s||"").slice(0,10)+"T00:00:00Z");return Number.isFinite(n)?n:null;};
export function grammarReviewSchedule(entries=[],course,today=new Date().toISOString().slice(0,10)){
 const drills=new Map(grammarDrills(course).map(d=>[d.id,d]));
 const events=[];
 for(const e of entries){
  if(e?.kind!=="learning_assessment"||e.course!==course)continue;
  if(e.skill==="grammar" && drills.has(e.rule) && e.totalQuestions===1 && (e.correct===0||e.correct===1)){
   events.push({id:e.rule,ok:e.correct===1,date:e.date});
  }
  if(e.skill==="diagnostic"&&Array.isArray(e.grammarDetails)){
   for(const d of e.grammarDetails)if(drills.has(d?.id)&&typeof d.correct==="boolean")events.push({id:d.id,ok:d.correct,date:e.date});
  }
 }
 const byId=new Map();
 // Preserve chronological order for same-day events using original entry order.
 for(const event of events.sort((a,b)=>(day(a.date)??0)-(day(b.date)??0))){
  const timestamp=day(event.date);if(timestamp===null)continue;
  const prev=byId.get(event.id)||{id:event.id,streak:0};
  const streak=event.ok?prev.streak+1:0;
  const interval=event.ok?INTERVALS[Math.min(streak-1,INTERVALS.length-1)]:1;
  byId.set(event.id,{id:event.id,streak,interval,lastAttempt:event.date,dueDate:new Date(timestamp+interval*86400000).toISOString().slice(0,10)});
 }
 const now=day(today);
 return [...byId.values()].map(r=>({...r,drill:drills.get(r.id),due:now!==null&&day(r.dueDate)<=now})).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
}
export function dueGrammarReviews(entries=[],course,today){
 return grammarReviewSchedule(entries,course,today).filter(r=>r.due);
}
