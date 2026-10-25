// Rise Nocturne: weekly budget compatible with the classic Wednesday-Tuesday cycle.
// Only edits money_budget; never mutates bank imports or records income from estimates.
import {CATEGORIES} from "./legacy-money/gastos/categories.js";
import {FIXED_HINT} from "./legacy-money/finance/insights.js";
export const VARIABLE_BUDGET_CATEGORIES=CATEGORIES
 .filter(c=>c.kind==="expense"&&c.id!=="sin_categoria"&&!FIXED_HINT.has(c.id))
 .map(c=>({id:c.id,name:c.name}));
const allowed=new Set(VARIABLE_BUDGET_CATEGORIES.map(c=>c.id));
export async function loadWeeklyBudget(client,uid){
 if(!client?.from||!uid)throw Error("Inicia sesión para consultar el presupuesto.");
 const r=await client.from("hub_records")
  .select("id,owner_id,domain,record_type,payload,updated_at")
  .eq("owner_id",uid).eq("domain","money").eq("record_type","money_budget")
  .order("updated_at",{ascending:false}).limit(2);
 if(r.error||!Array.isArray(r.data))throw Error("No se pudo comprobar el presupuesto original.");
 if(r.data.length>1)throw Error("Hay más de un presupuesto semanal guardado; revisa los registros antes de editar.");
 const row=r.data[0]||null;
 if(row&&(row.owner_id!==uid||row.domain!=="money"||row.record_type!=="money_budget"))
  throw Error("El presupuesto no corresponde a tu cuenta.");
 return row;
}
export function cleanWeeklyLimits(values,previous={}){
 if(!values||typeof values!=="object"||Array.isArray(values))throw Error("Límites semanales inválidos.");
 const result={...(previous&&typeof previous==="object"&&!Array.isArray(previous)?previous:{})};
 for(const [key,value] of Object.entries(values)){
  if(!allowed.has(key))throw Error("Categoría de presupuesto desconocida.");
  if(value===""||value===null||value===undefined){delete result[key];continue;}
  const number=Number(value);
  if(!Number.isFinite(number)||number<0||number>50000||Math.abs(Math.round(number*100)-number*100)>0.000001)
   throw Error("Importe semanal inválido: usa euros no negativos con dos decimales como máximo.");
  result[key]=number;
 }
 return result;
}
async function stableBudgetId(uid){
 if(!globalThis.crypto?.subtle)throw Error("Se necesita HTTPS para crear un presupuesto sin duplicados.");
 const bytes=new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256",new TextEncoder().encode(uid+":rise-budget-v1")));
 bytes[6]=(bytes[6]&15)|80;bytes[8]=(bytes[8]&63)|128;
 const hex=Array.from(bytes.slice(0,16),n=>n.toString(16).padStart(2,"0")).join("");
 return hex.slice(0,8)+"-"+hex.slice(8,12)+"-"+hex.slice(12,16)+"-"+hex.slice(16,20)+"-"+hex.slice(20,32);
}
export async function saveWeeklyBudget(client,uid,original,values){
 if(!client?.from||!uid)throw Error("Sesión no disponible.");
 if(original&&(original.owner_id!==uid||original.domain!=="money"||original.record_type!=="money_budget"||
    !original.id||!original.updated_at))throw Error("El presupuesto original no es válido para tu cuenta.");
 const weekly=cleanWeeklyLimits(values,original?.payload?.weekly);
 const payload={...(original?.payload||{}),weekly,week_starts:"wednesday"};
 const updated_at=new Date().toISOString();
 if(original){
  const r=await client.from("hub_records").update({payload,updated_at})
   .eq("id",original.id).eq("owner_id",uid).eq("domain","money").eq("record_type","money_budget")
   .eq("updated_at",original.updated_at).select("id,owner_id,domain,record_type,payload,updated_at").maybeSingle();
  if(r.error||!r.data)throw Error("El presupuesto cambió en otro dispositivo o no se pudo guardar. Actualiza y vuelve a intentarlo.");
  return r.data;
 }
 const id=await stableBudgetId(uid);
 const r=await client.from("hub_records").insert({id,owner_id:uid,domain:"money",record_type:"money_budget",
  title:"Presupuesto semanal",status:"active",source:"manual",requires_review:false,
  occurred_at:updated_at,updated_at,payload}).select("id,owner_id,domain,record_type,payload,updated_at").single();
 if(r.error||!r.data)throw Error("El presupuesto ya se creó en otro dispositivo o no se pudo guardar. Actualiza.");
 return r.data;
}
