// Pure exercise trend calculations; never a clinical or body-symmetry measurement.
export function exerciseTrends(sessions, exerciseName) {
 const entries=[];
 for(const session of sessions||[]){
  if(!session?.completed_at||!/^\d{4}-\d{2}-\d{2}$/.test(session.workout_date||''))continue;
  for(const exercise of session.exercises||[]){
   if(exercise.name!==exerciseName)continue;
   const valid=(exercise.sets||[]).filter(s=>s.completed&&Number.isFinite(Number(s.weight))&&Number(s.weight)>=0&&Number.isFinite(Number(s.reps))&&Number(s.reps)>0);
   if(!valid.length)continue;
   entries.push({
    date:session.workout_date,
    tonnage:valid.reduce((a,s)=>a+Number(s.weight)*Number(s.reps),0),
    sets:valid.length,
    maxWeight:Math.max(...valid.map(s=>Number(s.weight))),
    estimated1RM:Math.max(...valid.filter(s=>Number(s.reps)<=12).map(s=>Number(s.weight)*(1+Number(s.reps)/30)),0),
    maxReps:Math.max(...valid.map(s=>Number(s.reps)))
   });
  }
 }
 entries.sort((a,b)=>a.date.localeCompare(b.date));
 const recent=entries.slice(-12);
 const last=entries.at(-1)||null;
 const previous=entries.at(-2)||null;
 const pct=(a,b)=>b>0?Math.round((a-b)/b*1000)/10:null;
 return {
  name:exerciseName,entries,recent,last,previous,
  deltaTonnage:last&&previous?pct(last.tonnage,previous.tonnage):null,
  deltaStrength:last&&previous?pct(last.estimated1RM,previous.estimated1RM):null,
  best1RM:Math.max(0,...entries.map(e=>e.estimated1RM)),
  hasComparableHistory:entries.length>=2
 };
}
export function exercisesWithHistory(sessions){
 const names=new Set();
 for(const session of sessions||[])if(session?.completed_at)for(const exercise of session.exercises||[])if((exercise.sets||[]).some(s=>s.completed))names.add(exercise.name);
 return [...names].sort((a,b)=>a.localeCompare(b,'es'));
}
