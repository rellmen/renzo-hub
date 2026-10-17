// Safe editor for the existing five-day plan schema; prior workouts remain immutable.
export function validateGymPlan(plan){
 if(!Array.isArray(plan)||plan.length!==5)return false;
 return plan.every(day=>Array.isArray(day)&&day.length>=3&&typeof day[0]==='string'&&day[0].trim().length>0&&day[0].length<=90&&typeof day[1]==='string'&&Array.isArray(day[2])&&day[2].length>=1&&day[2].length<=15&&day[2].every(ex=>Array.isArray(ex)&&typeof ex[0]==='string'&&ex[0].trim().length>0&&ex[0].length<=100&&Number.isInteger(ex[1])&&ex[1]>=1&&ex[1]<=10&&Number.isInteger(ex[2])&&ex[2]>=1&&Number.isInteger(ex[3])&&ex[3]>=ex[2]&&ex[3]<=100&&typeof ex[4]==='string'));
}
export function updateGymExercise(plan,day,index,patch){
 const next=structuredClone(plan);
 if(!Number.isInteger(day)||!Number.isInteger(index)||!next[day]?.[2]?.[index])throw Error('Ejercicio inexistente');
 const ex=next[day][2][index];
 if(patch.name!==undefined)ex[0]=String(patch.name).trim();
 if(patch.sets!==undefined)ex[1]=Number(patch.sets);
 if(patch.minReps!==undefined)ex[2]=Number(patch.minReps);
 if(patch.maxReps!==undefined)ex[3]=Number(patch.maxReps);
 if(patch.muscle!==undefined)ex[4]=String(patch.muscle);
 if(!validateGymPlan(next))throw Error('Comprueba ejercicio, series y repeticiones');
 return next;
}
export function moveGymExercise(plan,day,index,direction){
 const next=structuredClone(plan),list=next[day]?.[2],destination=index+direction;
 if(!list||index<0||index>=list.length||destination<0||destination>=list.length)return null;
 [list[index],list[destination]]=[list[destination],list[index]];
 return next;
}
export function replaceGymExercise(plan,day,index,exercise){
 return updateGymExercise(plan,day,index,{name:exercise.name,muscle:exercise.muscle});
}
export const GYM_LIBRARY=[
 {name:'Leg Press',muscle:'Piernas'}, {name:'Romanian Deadlift',muscle:'Piernas'},
 {name:'Leg Curl',muscle:'Piernas'},{name:'Leg Extension',muscle:'Piernas'},
 {name:'Calf Raise',muscle:'Piernas'},{name:'Hip Thrust',muscle:'Glúteos'},
 {name:'Chest Press',muscle:'Pecho'},{name:'Incline Dumbbell Press',muscle:'Pecho'},
 {name:'Cable Fly',muscle:'Pecho'},{name:'Lat Pulldown',muscle:'Espalda'},
 {name:'Chest Supported Row',muscle:'Espalda'},{name:'Single Arm Row',muscle:'Espalda'},
 {name:'Seated Cable Row',muscle:'Espalda'},{name:'Lateral Raise',muscle:'Hombros'},
 {name:'Shoulder Press',muscle:'Hombros'},{name:'Reverse Pec Deck',muscle:'Hombros'},
 {name:'EZ Bar Curl',muscle:'Bíceps'},{name:'Hammer Curl',muscle:'Bíceps'},
 {name:'Preacher Curl',muscle:'Bíceps'},{name:'Triceps Pushdown',muscle:'Tríceps'},
 {name:'Overhead Cable Extension',muscle:'Tríceps'},{name:'Cable Crunch',muscle:'Core'}
];
