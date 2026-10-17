// User-reported measurements only. No estimations are created from goals or historical profile suggestions.
export function validateBodyMeasurement(input){
 const date=String(input?.date||'').trim();
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||new Date(date+'T12:00:00').toISOString().slice(0,10)!==date)throw Error('Fecha inválida');
 const decimal=(value,min,max,label)=>{
  if(value===null||value===undefined||value==='')return null;
  const num=Number(String(value).replace(',','.'));
  if(!Number.isFinite(num)||num<min||num>max)throw Error(label+' fuera de rango');
  return Math.round(num*10)/10;
 };
 const weightKg=decimal(input.weightKg,30,300,'Peso');
 const waistCm=decimal(input.waistCm,30,250,'Cintura');
 if(weightKg===null&&waistCm===null)throw Error('Indica al menos una medida real');
 return {date,weightKg,waistCm,note:String(input.note||'').trim().slice(0,240)};
}
export function mergeBodyMeasurements(previous,newMeasurement){
 const valid=validateBodyMeasurement(newMeasurement);
 const before=Array.isArray(previous)?previous.filter(x=>x&&x.date!==valid.date):[];
 return [...before,valid].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,365);
}
