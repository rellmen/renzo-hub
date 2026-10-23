// RISE HUB Nocturne · Notas: historial completo paginado, búsqueda y escrituras con CAS updated_at.
// Mismos registros que Classic (hub_records domain personal, type note).
const COLS="id,owner_id,title,status,occurred_at,payload,created_at,updated_at";
const own=uid=>{if(typeof uid!=="string"||!uid)throw Error("Inicia sesión.");return uid;};
export async function loadAllNotes(client,uid,{max=5000}={}){
 const id=own(uid),rows=[];
 for(let start=0;start<max;start+=500){
  const {data,error}=await client.from("hub_records").select(COLS).eq("owner_id",id).eq("domain","personal").eq("record_type","note")
   .order("occurred_at",{ascending:false}).order("id",{ascending:true}).range(start,start+499);
  if(error||!Array.isArray(data))throw Error("No se pudieron cargar las notas.");
  if(data.some(r=>r.owner_id!==id))throw Error("Respuesta de otra cuenta rechazada.");
  rows.push(...data);if(data.length<500)return {rows,partial:false};
 }
 return {rows,partial:true};
}
export function searchNotes(rows,q){
 const t=String(q||"").trim().toLowerCase();if(!t)return rows;
 return rows.filter(n=>String(n.title||"").toLowerCase().includes(t)||String(n.payload?.body||"").toLowerCase().includes(t));
}
export async function updateNote(client,uid,note,{title,body}){
 const t=String(title||"").trim().slice(0,200);if(!t)throw Error("El título es obligatorio.");
 if(!note?.id||!note.updated_at)throw Error("Actualiza antes de editar.");
 const {data,error}=await client.from("hub_records").update({title:t,payload:{...(note.payload||{}),body:String(body||"").trim().slice(0,5000)}})
  .eq("id",note.id).eq("owner_id",own(uid)).eq("domain","personal").eq("record_type","note").eq("updated_at",note.updated_at).select(COLS).maybeSingle();
 if(error)throw Error(error.message||"No se pudo guardar.");
 if(!data)throw Error("La nota cambió en otro dispositivo. Actualiza antes de guardar; tu texto sigue en el formulario.");
 return data;
}
export async function removeNote(client,uid,note){
 if(!note?.id||!note.updated_at)throw Error("Actualiza antes de eliminar.");
 const {data,error}=await client.from("hub_records").delete().eq("id",note.id).eq("owner_id",own(uid)).eq("domain","personal").eq("record_type","note").eq("updated_at",note.updated_at).select("id");
 if(error)throw Error(error.message||"No se pudo eliminar.");
 if(!Array.isArray(data)||data.length!==1)throw Error("La nota cambió en otro dispositivo o ya no existe. Actualiza.");
 return true;
}
