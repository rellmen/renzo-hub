// Training-volume insights from actual completed sets; never a measurement of physical symmetry.
export const MUSCLE_GROUPS=['Pecho','Espalda','Hombros','Bíceps','Tríceps','Cuádriceps','Isquiotibiales','Glúteos','Gemelos','Core'];
const aliases={
 'Pecho':'Pecho','Espalda':'Espalda','Hombros':'Hombros','Bíceps':'Bíceps','Tríceps':'Tríceps',
 'Piernas':'Piernas','Core':'Core','Cuádriceps':'Cuádriceps','Isquiotibiales':'Isquiotibiales',
 'Glúteos':'Glúteos','Gemelos':'Gemelos'
};
const startOfWeek=iso=>{
 const d=new Date(iso+'T12:00:00');
 if(Number.isNaN(d.getTime()))return null;
 d.setDate(d.getDate()-((d.getDay()+6)%7));
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
};
export function muscleOfExercise(ex){
 const assigned=aliases[ex?.muscle];
 if(assigned&&assigned!=='Piernas')return assigned;
 const name=String(ex?.name||'').toLowerCase();
 if(/calf/.test(name))return 'Gemelos';
 if(/curl/.test(name)&&/leg|hamstring/.test(name))return 'Isquiotibiales';
 if(/romanian|rdl|deadlift/.test(name))return 'Isquiotibiales';
 if(/hip thrust|glute/.test(name))return 'Glúteos';
 if(/leg extension|leg press|squat|lunge/.test(name))return 'Cuádriceps';
 return assigned||'Otros';
}
export function muscleInsights(sessions, referenceDate=new Date()){
 const today=new Date(referenceDate);today.setHours(12,0,0,0);
 const iso=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
 const week=startOfWeek(iso);
 const counts=Object.fromEntries(MUSCLE_GROUPS.map(m=>[m,0]));
 const previous=Object.fromEntries(MUSCLE_GROUPS.map(m=>[m,0]));
 let sessionsThisWeek=0,completedSets=0,tonnage=0;
 for(const session of sessions||[]){
  if(!session?.completed_at||!session.workout_date)continue;
  const w=startOfWeek(session.workout_date);
  if(!w||w>week)continue;
  const current=w===week;
  if(current)sessionsThisWeek++;
  if(!current) {
   const end=new Date(week+'T12:00:00');end.setDate(end.getDate()-7);
   if(w!==startOfWeek([end.getFullYear(),String(end.getMonth()+1).padStart(2,'0'),String(end.getDate()).padStart(2,'0')].join('-')))continue;
  }
  for(const exercise of session.exercises||[]){
   const muscle=muscleOfExercise(exercise);
   for(const set of exercise.sets||[]){
    if(!set.completed)continue;
    if(!Number.isFinite(Number(set.reps))||Number(set.reps)<=0)continue;
    if(current){completedSets++;tonnage+=Math.max(0,Number(set.weight)||0)*Number(set.reps);}
    const target=current?counts:previous;
    target[muscle]=(target[muscle]||0)+1;
   }
  }
 }
 const tracked=Object.entries(counts).filter(([,count])=>count>0).sort((a,b)=>b[1]-a[1]);
 const max=Math.max(1,...Object.values(counts));
 const balance=[
  {label:'Empuje / tirón',a:'Pecho',b:'Espalda'},
  {label:'Bíceps / tríceps',a:'Bíceps',b:'Tríceps'},
  {label:'Cuádriceps / isquiotibiales',a:'Cuádriceps',b:'Isquiotibiales'}
 ].map(x=>({...x,left:counts[x.a],right:counts[x.b],
  note:counts[x.a]+counts[x.b]<4?'Datos insuficientes esta semana':
   Math.min(counts[x.a],counts[x.b])/Math.max(counts[x.a],counts[x.b])<.5?'Volumen muy desigual':'Distribución relativamente equilibrada'
 }));
 return {week,sessions:sessionsThisWeek,completedSets,tonnage,counts,previous,tracked,max,balance};
}
