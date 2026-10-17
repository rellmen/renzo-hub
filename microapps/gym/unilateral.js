// Comparación descriptiva de entrenamiento unilateral registrado, no diagnóstico de simetría física.
const LABELS={left:'Izquierda',right:'Derecha'};
export function unilateralSummary(sessions){
 const byExercise=new Map();
 for(const row of sessions||[]){
  if(!row?.completed_at)continue;
  for(const exercise of row.exercises||[])for(const set of exercise.sets||[]){
   if(!set?.completed||!Object.hasOwn(LABELS,set.side))continue;
   const weight=Number(set.weight),reps=Number(set.reps);
   if(!Number.isFinite(weight)||weight<0||!Number.isFinite(reps)||reps<=0)continue;
   if(!byExercise.has(exercise.name))byExercise.set(exercise.name,{name:exercise.name,left:{sets:0,tonnage:0,reps:0},right:{sets:0,tonnage:0,reps:0}});
   const part=byExercise.get(exercise.name)[set.side];part.sets++;part.reps+=reps;part.tonnage+=weight*reps;
  }
 }
 return [...byExercise.values()].sort((a,b)=>a.name.localeCompare(b.name,'es')).map(r=>{
  const both=r.left.sets>0&&r.right.sets>0;
  const difference=both&&Math.max(r.left.tonnage,r.right.tonnage)>0?Math.round((r.right.tonnage-r.left.tonnage)/Math.max(r.left.tonnage,r.right.tonnage)*1000)/10:null;
  return {...r,comparable:both,differencePercent:difference};
 });
}
