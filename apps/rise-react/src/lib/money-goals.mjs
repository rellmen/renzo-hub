// Money goals use Classic normalized payloads, append-only create, archive without delete.
import {normalizeGoal,GOAL_TYPES,goalProgress} from "./legacy-money/finance/goals.js";
export {GOAL_TYPES,goalProgress};
export function buildFinancialGoal(input){
 const r=normalizeGoal(input);
 if(!r.ok)throw Error(r.error||"Invalid goal");
 return r.goal;
}
async function requireOwner(client,uid){
 if(!uid||!client?.auth?.getUser||!client?.from)throw Error("Sesión necesaria para modificar objetivos.");
 const {data,error}=await client.auth.getUser();
 if(error||data?.user?.id!==uid)throw Error("La sesión cambió. No se ha guardado ningún cambio.");
}
export async function saveFinancialGoal(client,uid,input){
 const goal=buildFinancialGoal(input);
 await requireOwner(client,uid);
 if(!globalThis.crypto?.randomUUID)throw Error("Se necesita un navegador seguro.");
 const stamp=new Date().toISOString();
 const row={id:globalThis.crypto.randomUUID(),owner_id:uid,domain:"money",record_type:"money_goal",
  title:goal.name,status:"active",source:"manual",requires_review:false,occurred_at:stamp,updated_at:stamp,payload:goal};
 const {data,error}=await client.from("hub_records").insert(row).select("id,owner_id,record_type,payload,status").single();
 if(error||!data||data.owner_id!==uid)throw Error("No se pudo guardar el objetivo.");
 return data;
}
export async function archiveFinancialGoal(client,uid,goal){
 if(!goal?.id||!goal?.updated_at||goal.status==="archived")throw Error("Objetivo o versión inválidos.");
 await requireOwner(client,uid);
 const {data,error}=await client.from("hub_records").update({status:"archived",updated_at:new Date().toISOString()})
  .eq("owner_id",uid).eq("domain","money").eq("record_type","money_goal")
  .eq("id",goal.id).eq("updated_at",goal.updated_at).eq("status","active")
  .select("id,status").maybeSingle();
 if(error||!data)throw Error("El objetivo cambió desde otra sesión. Actualiza antes de archivarlo.");
 return data;
}
