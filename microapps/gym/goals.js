// User-controlled local settings. Saved account values always take priority over suggested defaults.
export const GYM_USER_REFERENCE={heightCm:170,lastReportedWeightKg:84,initialTargetKg:78,laterTargetRangeKg:[74,75],trainingFocus:'Hipertrofia y reducción gradual de grasa',shiftPattern:'Semanas alternas 06:00–15:00 y 15:00–00:00; descansos no remunerados de 30 minutos',dataStatus:'Autodeclarado previamente; confirmar cambios recientes'};
export const GYM_GOALS_DEFAULT={priority:'Brazos y pérdida de grasa',sessionsPerWeek:4,targetWeight:null};
export function validateGymGoals(raw){
 const sessions=Number(raw?.sessionsPerWeek),weight=raw?.targetWeight;
 if(!Number.isInteger(sessions)||sessions<2||sessions>5)throw Error('Sesiones semanales: introduce de 2 a 5');
 const targetWeight=weight===null||weight===undefined||weight===''?null:Number(weight);
 if(targetWeight!==null&&(!Number.isFinite(targetWeight)||targetWeight<30||targetWeight>300))throw Error('Meta de peso: introduce entre 30 y 300 kg');
 const priority=String(raw?.priority??'').trim().slice(0,120);
 if(!priority)throw Error('Introduce una prioridad de entrenamiento');
 return {priority,sessionsPerWeek:sessions,targetWeight};
}
export function getGymGoals(owner,userMetadata){
 if(!owner)return {...GYM_GOALS_DEFAULT};
 try{if(userMetadata?.gym_goals)return validateGymGoals({...GYM_GOALS_DEFAULT,...userMetadata.gym_goals});
  const data=globalThis.localStorage?.getItem('rise-hub-gym-goals-'+owner);
  return data?validateGymGoals({...GYM_GOALS_DEFAULT,...JSON.parse(data)}):{...GYM_GOALS_DEFAULT};
 }catch{return {...GYM_GOALS_DEFAULT};}
}
export function putGymGoals(owner,raw){
 if(!owner)throw Error('Debes iniciar sesión');
 const value=validateGymGoals(raw);
 if(!globalThis.localStorage)throw Error('El almacenamiento local no está disponible');
 globalThis.localStorage.setItem('rise-hub-gym-goals-'+owner,JSON.stringify(value));
 return value;
}
