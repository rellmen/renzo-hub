// Nocturne Body/Food · validated, append-only entry points to existing RLS records.
// Never invent nutritional metrics, silently replace another device's entry, or
// write to unrelated domain data. Production frontend remains untouched.
import {createRecords} from "./legacy-records.mjs";
import {localDay} from "./legacy-body-food/overview.js";

const TOLERANCE_DAYS=1;
function owner(uid) {
  if(typeof uid!=="string"||!uid.trim())throw new Error("Inicia sesión para guardar tus registros.");
  return uid;
}
function dateForEntry(at){
  if(!(at instanceof Date)||!Number.isFinite(at.valueOf()))throw new Error("Fecha no válida.");
  const delta=Math.abs(Date.now()-at.getTime());
  if(delta>1000*60*60*24*TOLERANCE_DAYS)throw new Error("Los nuevos registros deben ser de hoy. No se reescribe el historial antiguo.");
  return localDay(at);
}
function positiveValue(raw,{name,min,max,optional=false}){
  if(raw===null||raw===undefined||String(raw).trim()===""){
    if(optional)return null;
    throw new Error(name+" es obligatorio.");
  }
  const num=Number(raw);
  if(!Number.isFinite(num)||num<min||num>max)throw new Error(name+" fuera del rango válido.");
  return num;
}
function dbStore(client,uid,type){
  const id=owner(uid);
  if(!client||typeof client.from!=="function")throw new Error("No hay conexión segura a Supabase.");
  return createRecords(client,()=>({id}),{domain:"body",type});
}
export async function saveBodyWeight(client,uid,raw,{at=new Date()}={}){
  const value=positiveValue(raw,{name:"Peso",min:20,max:500});
  const date=dateForEntry(at);
  return dbStore(client,uid,"body_weight").add({
    title:"Peso corporal",
    occurred_at:date+"T12:00:00.000Z",
    payload:{date,value}
  });
}
export async function saveFoodMeal(client,uid,input,{at=new Date()}={}){
  const date=dateForEntry(at);
  const meal=typeof input?.meal==="string"?input.meal.trim().slice(0,140):"";
  if(!meal)throw new Error("Indica el nombre de la comida.");
  const kcal=positiveValue(input?.kcal,{name:"Calorías",min:0,max:15000,optional:true});
  const protein=positiveValue(input?.protein,{name:"Proteína",min:0,max:1000,optional:true});
  if(kcal===null&&protein===null)
    throw new Error("Introduce al menos un dato nutricional registrado.");
  return dbStore(client,uid,"food_log").add({
    title:meal,
    occurred_at:date+"T12:00:00.000Z",
    payload:{date,meal,kcal,protein}
  });
}
