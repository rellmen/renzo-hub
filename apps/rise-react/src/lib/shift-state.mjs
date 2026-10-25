// Rise React shift editor. The source of truth remains legacy
// hub_user_state.state; optimistic version checks prevent silent overwrite.
export const SHIFT_MODES=Object.freeze(["Morning Shift","Evening Shift","Vacation"]);
function dateOK(value){
 if(typeof value!=="string"||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value))return false;
 const t=new Date(value+"T12:00:00Z");return !Number.isNaN(t.valueOf())&&t.toISOString().slice(0,10)===value;
}
export function cleanShiftMode(mode){
 if(mode==="")return "";
 if(!SHIFT_MODES.includes(mode))throw Error("El turno indicado no está permitido.");
 return mode;
}
export function nextShiftState(state,date,mode){
 if(!dateOK(date))throw Error("Fecha inválida");
 const cleaned=cleanShiftMode(mode);
 const output={...(state||{}),shifts:{...(state?.shifts||{})}};
 if(cleaned)output.shifts[date]=cleaned;
 else delete output.shifts[date];
 return output;
}
export function nextTemplateState(state,day,mode){
 const idx=Number(day);
 if(!Number.isInteger(idx)||idx<0||idx>6)throw Error("Día de plantilla inválido");
 const cleaned=cleanShiftMode(mode);
 const out={...(state||{}),shiftTemplates:{...(state?.shiftTemplates||{})}};
 if(cleaned)out.shiftTemplates[idx]=cleaned;
 else delete out.shiftTemplates[idx];
 return out;
}
export function shiftPreview(snapshot,date){
 const day=new Date(date+"T12:00:00Z").getUTCDay();
 return snapshot?.state?.shifts?.[date]||snapshot?.state?.shiftTemplates?.[day]||"";
}
export async function loadShiftState(client,uid){
 if(!client||!uid)throw Error("Sesión no disponible");
 const {data,error}=await client.from("hub_user_state")
  .select("owner_id,state,updated_at").eq("owner_id",uid).maybeSingle();
 if(error)throw Error("No se pudieron leer los turnos guardados");
 return data||{owner_id:uid,state:{shifts:{},shiftTemplates:{}},updated_at:null};
}
export async function saveShiftState(client,uid,original,newState){
 if(!uid||original?.owner_id!==uid)throw Error("Propietario no autorizado");
 if(!newState||typeof newState!=="object"||Array.isArray(newState))throw Error("Estado inválido");
 const payload={state:newState,updated_at:new Date().toISOString()};
 if(original.updated_at){
  const {data,error}=await client.from("hub_user_state").update(payload)
   .eq("owner_id",uid).eq("updated_at",original.updated_at).select("owner_id,state,updated_at").maybeSingle();
  if(error)throw Error("No se pudieron guardar los turnos");
  if(!data)throw Error("El calendario cambió en otro dispositivo. Actualiza antes de guardar.");
  return data;
 }
 // First-time account: never replace an existing row from another device.
 const {data,error}=await client.from("hub_user_state")
  .insert({owner_id:uid,...payload}).select("owner_id,state,updated_at").single();
 if(error||!data)throw Error("El calendario se creó en otro dispositivo o no se pudo guardar. Actualiza.");
 return data;
}
