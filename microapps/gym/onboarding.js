import {validateGymPlan} from './plan-editor.js';

// The database currently stores exactly five plan slots. For 2–4 training days,
// remaining slots are explicitly optional, not mandatory weekly sessions.
const EXERCISES = {
  push:[['Chest Press',3,8,12,'Pecho'],['Shoulder Press',3,8,12,'Hombros'],['Lateral Raise',3,12,20,'Hombros'],['Triceps Pushdown',3,10,15,'Tríceps']],
  pull:[['Lat Pulldown',3,8,12,'Espalda'],['Seated Cable Row',3,8,12,'Espalda'],['Reverse Pec Deck',3,12,20,'Hombros'],['Hammer Curl',3,10,15,'Bíceps']],
  legs:[['Leg Press',3,8,12,'Piernas'],['Romanian Deadlift',3,8,12,'Piernas'],['Leg Curl',3,10,15,'Piernas'],['Calf Raise',3,12,20,'Piernas']],
  full:[['Leg Press',3,8,12,'Piernas'],['Chest Press',3,8,12,'Pecho'],['Lat Pulldown',3,8,12,'Espalda'],['Cable Crunch',2,12,20,'Core']],
  upper:[['Chest Press',3,8,12,'Pecho'],['Seated Cable Row',3,8,12,'Espalda'],['Shoulder Press',2,8,12,'Hombros'],['EZ Bar Curl',2,10,15,'Bíceps']],
  lower:[['Leg Press',3,8,12,'Piernas'],['Hip Thrust',3,8,12,'Glúteos'],['Leg Curl',3,10,15,'Piernas'],['Calf Raise',3,12,20,'Piernas']]
};
const MACHINE_SWAP={'Romanian Deadlift':'Leg Extension','Shoulder Press':'Lateral Raise','EZ Bar Curl':'Preacher Curl'};

export function gymOnboardingOptions({days=3,equipment='gym',goal='hypertrophy'}={}){
 const n=Number(days);
 if(!Number.isInteger(n)||n<2||n>5)throw Error('Selecciona entre 2 y 5 días');
 if(!['gym','machines'].includes(equipment))throw Error('Equipamiento no válido');
 if(!['hypertrophy','strength','general'].includes(goal))throw Error('Objetivo no válido');
 return {days:n,equipment,goal};
}

export function buildOnboardingPlan(options={}){
 const {days,equipment,goal}=gymOnboardingOptions(options);
 const types=days===2?['full','full']:days===3?['push','pull','legs']:days===4?['upper','lower','upper','lower']:['push','pull','legs','upper','lower'];
 const result=Array.from({length:5},(_,i)=>{
   const optional=i>=days;
   const type=optional?'full':types[i];
   const exercises=EXERCISES[type].map(([name,sets,min,max,muscle])=>{
     const resolved=equipment==='machines'?(MACHINE_SWAP[name]||name):name;
     if(goal==='strength' && !optional && min===8)return [resolved,sets,5,8,muscle];
     if(goal==='general' && !optional)return [resolved,2,min,max,muscle];
     return [resolved,sets,min,max,muscle];
   });
   return [optional?'Opcional · movilidad / sesión ligera':`Día ${i+1} · ${type.toUpperCase()}`,optional?'No cuenta para tu objetivo semanal':goal,exercises];
 });
 if(!validateGymPlan(result))throw Error('No se pudo generar el plan');
 return result;
}

// Onboarding is opt-in: caller must ask for confirmation and explicitly persist
// the returned plan. Never overwrite an existing plan automatically.
