// Rise Nocturne · Body: perfil corporal, objetivos e historial de peso editable.
// Mismo almacenamiento que Classic: user_settings.settings.bodyProfile (profile.js),
// auth user_metadata.gym_goals (gym.js) y hub_records body_weight. Mejoras: CAS en ajustes
// y en cada corrección de peso; las correcciones conservan el valor previo en el payload.
import {validateGymGoals} from "./legacy-gym/goals.js";
export {validateGymGoals};
const FIELDS=["startWeight","height","kcalMin","kcalMax","proteinMin","proteinMax","budgetMin","budgetMax"];
// Copia literal de sanitizeBodyProfile (profile.js, Classic).
export function sanitizeBodyProfile(input={}){
 const out={};
 for(const key of FIELDS){
  const raw=input[key];
  if(raw===""||raw===null||raw===undefined)continue;
  const n=Number(String(raw).replace(",","."));
  if(Number.isFinite(n)&&n>=0)out[key]=Math.round(n*100)/100;
 }
 const phases=String(input.phases??"").split(",").map(s=>s.trim()).filter(Boolean).slice(0,5)
  .map(s=>s.replace(/[^0-9.,–-]/g,"").slice(0,12)).filter(Boolean);
 if(phases.length)out.phases=phases;
 return out;
}
export function checkRanges(p){
 for(const [a,b,l] of [["kcalMin","kcalMax","kcal"],["proteinMin","proteinMax","proteína"],["budgetMin","budgetMax","presupuesto"]])
  if(Number.isFinite(p[a])&&Number.isFinite(p[b])&&p[a]>p[b])throw Error(`Rango de ${l}: el mínimo supera al máximo.`);
 if(Number.isFinite(p.height)&&(p.height<1||p.height>2.5))throw Error("Altura en metros (p. ej. 1,70).");
 if(Number.isFinite(p.startWeight)&&(p.startWeight<30||p.startWeight>300))throw Error("Peso inicial entre 30 y 300 kg.");
 return p;
}
const own=uid=>{if(typeof uid!=="string"||!uid)throw Error("Inicia sesión.");return uid;};
export async function loadSettings(client,uid){
 const {data,error}=await client.from("user_settings").select("settings,updated_at").eq("user_id",own(uid)).maybeSingle();
 if(error)throw Error("No se pudieron leer tus ajustes.");
 const s=data?.settings;
 if(s!==null&&s!==undefined&&(typeof s!=="object"||Array.isArray(s)))throw Error("Formato de ajustes incompatible.");
 return {settings:s||{},updated_at:data?.updated_at||null,exists:!!data};
}
// Sustituye UNA clave de settings conservando el resto; rechaza si otro dispositivo cambió los ajustes.
export async function saveSettingsKey(client,uid,snap,key,value){
 const next={...(snap.settings||{}),[key]:value};const updated_at=new Date().toISOString();
 if(snap.exists){
  if(!snap.updated_at)throw Error("Falta la versión de los ajustes; actualiza.");
  const {data,error}=await client.from("user_settings").update({settings:next,updated_at}).eq("user_id",own(uid)).eq("updated_at",snap.updated_at).select("settings,updated_at").maybeSingle();
  if(error||!data)throw Error("Los ajustes cambiaron en otro dispositivo. Actualiza antes de guardar.");
  return data;
 }
 const {data,error}=await client.from("user_settings").insert({user_id:own(uid),settings:next,updated_at}).select("settings,updated_at").single();
 if(error||!data)throw Error("No se pudieron crear tus ajustes; actualiza y reintenta.");
 return data;
}
export const saveBodyProfile=(client,uid,snap,input)=>saveSettingsKey(client,uid,snap,"bodyProfile",checkRanges(sanitizeBodyProfile(input)));
export async function saveGymGoals(client,raw){
 const goals=validateGymGoals(raw);
 const {error}=await client.auth.updateUser({data:{gym_goals:goals}});
 if(error)throw Error("No se pudieron sincronizar los objetivos.");
 return goals;
}
export async function loadWeightHistory(client,uid,limit=60){
 const {data,error}=await client.from("hub_records").select("id,owner_id,payload,occurred_at,updated_at").eq("owner_id",own(uid))
  .eq("domain","body").eq("record_type","body_weight").order("occurred_at",{ascending:false}).limit(limit);
 if(error||!Array.isArray(data))throw Error("No se pudo cargar el historial de peso.");
 if(data.some(r=>r.owner_id!==uid))throw Error("Respuesta de otra cuenta rechazada.");
 return data;
}
export async function correctWeight(client,uid,row,raw,at=new Date()){
 const value=Number(String(raw).replace(",","."));
 if(!Number.isFinite(value)||value<20||value>500)throw Error("Peso fuera del rango válido.");
 if(!row?.id||!row.updated_at)throw Error("Actualiza antes de corregir.");
 const prev=row.payload||{};
 const payload={...prev,value:Math.round(value*10)/10,corrections:[...(Array.isArray(prev.corrections)?prev.corrections.slice(-9):[]),{at:at.toISOString(),previous:prev.value}]};
 const {data,error}=await client.from("hub_records").update({payload}).eq("id",row.id).eq("owner_id",own(uid)).eq("domain","body").eq("record_type","body_weight").eq("updated_at",row.updated_at).select("id").maybeSingle();
 if(error||!data)throw Error("El registro cambió en otro dispositivo o no se pudo guardar. Actualiza.");
 return data;
}
export async function deleteWeight(client,uid,row){
 if(!row?.id||!row.updated_at)throw Error("Actualiza antes de eliminar.");
 const {data,error}=await client.from("hub_records").delete().eq("id",row.id).eq("owner_id",own(uid)).eq("domain","body").eq("record_type","body_weight").eq("updated_at",row.updated_at).select("id");
 if(error||!Array.isArray(data)||data.length!==1)throw Error("El registro cambió o ya no existe. Actualiza.");
 return true;
}
