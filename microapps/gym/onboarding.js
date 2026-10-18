import {validateGymPlan} from './plan-editor.js';

// Plan inicial por preguntas (días, equipamiento, objetivo). Base de ChatGPT, corregida en 2.37.0:
// el 2.º campo del día es el cardio en minutos (no el objetivo) y los compuestos llevan la marca 1
// para que la progresión use RIR 2, +2,5 kg y 150 s de descanso.
// El esquema guarda siempre cinco días: con 2–4 días, los restantes son sesiones opcionales ligeras.
// Formato de ejercicio: [nombre, series, repsMin, repsMax, músculo, compuesto]
const C = 1;
const DAYS = {
  push: ['Empuje · pecho, hombro y tríceps', [['Chest Press',3,6,10,'Pecho',C],['Incline Dumbbell Press',3,8,12,'Pecho',C],['Shoulder Press',3,8,12,'Hombros',C],['Lateral Raise',3,12,20,'Hombros'],['Triceps Pushdown',3,10,15,'Tríceps'],['Overhead Cable Extension',2,10,15,'Tríceps']]],
  pull: ['Tirón · espalda y bíceps', [['Lat Pulldown',3,6,10,'Espalda',C],['Seated Cable Row',3,8,12,'Espalda',C],['Chest Supported Row',3,8,12,'Espalda',C],['Reverse Pec Deck',3,12,20,'Hombros'],['EZ Bar Curl',3,8,12,'Bíceps'],['Hammer Curl',2,10,15,'Bíceps']]],
  legs: ['Pierna + core', [['Leg Press',3,8,12,'Piernas',C],['Romanian Deadlift',3,8,12,'Piernas',C],['Leg Curl',3,10,15,'Piernas'],['Leg Extension',3,10,15,'Piernas'],['Calf Raise',3,10,15,'Piernas'],['Cable Crunch',3,10,15,'Core']]],
  full: ['Cuerpo completo', [['Leg Press',3,8,12,'Piernas',C],['Chest Press',3,8,12,'Pecho',C],['Lat Pulldown',3,8,12,'Espalda',C],['Seated Cable Row',2,10,12,'Espalda',C],['Lateral Raise',2,12,20,'Hombros'],['Cable Crunch',2,10,15,'Core']]],
  upper: ['Torso', [['Chest Press',3,6,10,'Pecho',C],['Lat Pulldown',3,6,10,'Espalda',C],['Shoulder Press',3,8,12,'Hombros',C],['Seated Cable Row',3,8,12,'Espalda',C],['EZ Bar Curl',2,8,12,'Bíceps'],['Triceps Pushdown',2,10,15,'Tríceps']]],
  lower: ['Pierna + glúteo', [['Leg Press',3,8,12,'Piernas',C],['Romanian Deadlift',3,8,12,'Piernas',C],['Hip Thrust',3,8,12,'Glúteos',C],['Leg Curl',3,10,15,'Piernas'],['Calf Raise',3,10,15,'Piernas'],['Cable Crunch',2,10,15,'Core']]]
};
const MACHINE_SWAP = {'Romanian Deadlift':'Seated Leg Curl','Incline Dumbbell Press':'Incline Chest Press','EZ Bar Curl':'Machine Curl','Hammer Curl':'Cable Curl','Lateral Raise':'Machine/Cable Lateral Raise'};
const SPLITS = {2:['full','full'],3:['push','pull','legs'],4:['upper','lower','upper','lower'],5:['push','pull','legs','upper','lower']};
const CARDIO = {hypertrophy:'20-30',strength:'15-20',general:'30-40'};
export const ONBOARDING_LABELS = {
  equipment:{gym:'Gimnasio completo',machines:'Solo máquinas y poleas'},
  goal:{hypertrophy:'Ganar músculo',strength:'Ganar fuerza',general:'Salud y forma general'}
};

export function gymOnboardingOptions({days=3,equipment='gym',goal='hypertrophy'}={}){
 const n=Number(days);
 if(!Number.isInteger(n)||n<2||n>5)throw Error('Selecciona entre 2 y 5 días');
 if(!['gym','machines'].includes(equipment))throw Error('Equipamiento no válido');
 if(!['hypertrophy','strength','general'].includes(goal))throw Error('Objetivo no válido');
 return {days:n,equipment,goal};
}

function adapt([name,sets,min,max,muscle,compound],{equipment,goal},optional){
 const resolved=equipment==='machines'?(MACHINE_SWAP[name]||name):name;
 // Un cambio a máquina de un compuesto de bisagra (RDL → curl femoral) deja de ser compuesto.
 const isCompound=compound===C&&!(equipment==='machines'&&MACHINE_SWAP[name]&&/curl/i.test(resolved));
 if(optional)return [resolved,2,10,15,muscle,...(isCompound?[C]:[])];
 if(goal==='strength'&&isCompound)return [resolved,Math.min(sets+1,5),4,6,muscle,C];
 if(goal==='general')return [resolved,2,Math.max(min,10),Math.max(max,15),muscle,...(isCompound?[C]:[])];
 return [resolved,sets,min,max,muscle,...(isCompound?[C]:[])];
}

export function buildOnboardingPlan(options={}){
 const opts=gymOnboardingOptions(options);
 const split=SPLITS[opts.days];
 const plan=Array.from({length:5},(_,i)=>{
   const optional=i>=opts.days,type=optional?'full':split[i],[title,exercises]=DAYS[type];
   return [optional?'Opcional · cuerpo completo ligero':title,optional?'20-30':CARDIO[opts.goal],exercises.map(ex=>adapt(ex,opts,optional))];
 });
 if(!validateGymPlan(plan))throw Error('No se pudo generar el plan');
 return plan;
}

// El onboarding es opcional: quien lo llame debe enseñar la propuesta y guardarla solo si Renzo la confirma.
// Nunca sobrescribe un plan existente de forma automática.
