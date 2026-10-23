import {dateKeyLocal,stepsFor} from './skin-catalog.mjs';
function loggedUser(uid){if(typeof uid!=="string"||!uid.trim())throw Error("Debes iniciar sesión.");return uid;}
function unwrap(x){if(!x||x.error)throw Error(x?.error?.message||"No se pudieron consultar los datos privados.");return x.data;}
function stepIndexes(a,len){
  if(!Array.isArray(a))return [];
  return [...new Set(a.filter(i=>Number.isInteger(i)&&i>=0&&i<len))].sort((a,b)=>a-b);
}
export async function loadSkinState(client,uid,at=new Date()){
  const user_id=loggedUser(uid);
  const today=dateKeyLocal(at);
  const weekStart=new Date(at.getFullYear(),at.getMonth(),at.getDate()-6,12);
  const [logsR,notesR,settingsR]=await Promise.all([
    client.from("skin_routine_logs").select("routine_date,session,completed_steps")
      .eq("user_id",user_id).gte("routine_date",dateKeyLocal(weekStart))
      .lte("routine_date",today),
    client.from("skin_notes").select("note").eq("user_id",user_id).eq("note_date",today).maybeSingle(),
    client.from("user_settings").select("settings").eq("user_id",user_id).maybeSingle(),
  ]);
  const logs=unwrap(logsR)||[];
  const note=unwrap(notesR)?.note||"";
  const settings=unwrap(settingsR)?.settings||{};
  const inventory=settings.skinInventory&&typeof settings.skinInventory==="object"&&!Array.isArray(settings.skinInventory)
    ?settings.skinInventory:{};
  const barrierFirst=settings.skinPhase!=="maintenance";
  const current={am:[],pm:[]};
  for(const log of logs){
    if(log.routine_date===today&&["am","pm"].includes(log.session))
      current[log.session]=stepIndexes(log.completed_steps,stepsFor(at,log.session,barrierFirst).length);
  }
  return {today,barrierFirst,inventory,settings:{skinPhase:settings.skinPhase||"recovery"},note,logs,
    current};
}
export async function setSkinSteps(client,uid,day,session,indices,stepCount){
  const user_id=loggedUser(uid);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day))throw Error("Fecha inválida");
  if(!["am","pm"].includes(session))throw Error("Sesión desconocida");
  if(!Number.isInteger(stepCount)||stepCount<1||stepCount>24)throw Error("Rutina inválida");
  const completed_steps=stepIndexes(indices,stepCount);
  const x=await client.from("skin_routine_logs")
    .upsert({user_id,routine_date:day,session,completed_steps},
      {onConflict:"user_id,routine_date,session"})
    .select("routine_date,session,completed_steps").single();
  const data=unwrap(x);
  if(!data)throw Error("No se confirmó el guardado de la rutina.");
  return {...data,completed_steps:stepIndexes(data.completed_steps,stepCount)};
}
export async function setSkinNote(client,uid,day,value){
  const user_id=loggedUser(uid);
  const note=String(value||"").slice(0,6000);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day))throw Error("Fecha inválida");
  const x=await client.from("skin_notes").upsert({user_id,note_date:day,note},
    {onConflict:"user_id,note_date"}).select("note_date,note").single();
  return unwrap(x);
}
export function weekSkinProgress(logs=[],at=new Date(),barrierFirst=true){
  const days=[];
  for(let i=6;i>=0;i--){
    const date=new Date(at.getFullYear(),at.getMonth(),at.getDate()-i,12);
    const day=dateKeyLocal(date);
    const relevant=logs.filter(x=>x.routine_date===day);
    const done=relevant.reduce((n,x)=>["am","pm"].includes(x.session)
      ?n+stepIndexes(x.completed_steps,stepsFor(date,x.session,barrierFirst).length).length:n,0);
    const total=stepsFor(date,"am",barrierFirst).length+stepsFor(date,"pm",barrierFirst).length;
    days.push({day,display:new Intl.DateTimeFormat("es",{weekday:"short"}).format(date),
      done,total,pct:total?Math.round(done/total*100):0});
  }
  return days;
}

const VALID_SKIN_STATUS=new Set(["unknown","available","paused","finished"]);

/** Native React inventory write: preserve all existing user_settings keys and use
 * an optimistic version gate to reject updates from another device. */
export async function setSkinInventoryStatus(client,uid,productId,status){
 const user_id=loggedUser(uid);
 if(!/^p\d{1,3}$/.test(String(productId))||!VALID_SKIN_STATUS.has(status))
  throw Error("Producto o estado de inventario inválido.");
 const r=await client.from("user_settings").select("settings,updated_at")
  .eq("user_id",user_id).maybeSingle();
 if(r.error)throw Error("No se pudo leer el inventario actualizado.");
 const old=r.data;
 const settings=old?.settings;
 if(settings!==null&&settings!==undefined&&(typeof settings!=="object"||Array.isArray(settings)))
  throw Error("El formato de ajustes es incompatible; no se ha modificado.");
 const current=settings&&typeof settings.skinInventory==="object"&&!Array.isArray(settings.skinInventory)
  ?settings.skinInventory:{};
 const nextSettings={...(settings||{}),skinInventory:{...current,[productId]:status}};
 const updated_at=new Date().toISOString();
 let q;
 if(old){
  if(typeof old.updated_at!=="string"||!old.updated_at)
   throw Error("Falta la versión del inventario; actualiza antes de editar.");
  q=await client.from("user_settings").update({settings:nextSettings,updated_at})
   .eq("user_id",user_id).eq("updated_at",old.updated_at)
   .select("settings,updated_at").maybeSingle();
  if(q.error||!q.data)throw Error("El inventario cambió en otro dispositivo o no se pudo guardar. Actualiza antes de reintentar.");
 }else{
  q=await client.from("user_settings").insert({user_id,settings:nextSettings,updated_at})
   .select("settings,updated_at").single();
  if(q.error||!q.data)throw Error("No se pudieron crear los ajustes de inventario; actualiza antes de reintentar.");
 }
 return q.data.settings.skinInventory;
}
