// Non-destructive money_rule fixed flag, compatible with Classic and category edits.
async function stableRuleId(uid,key){
 if(!globalThis.crypto?.subtle)throw Error("Se necesita HTTPS.");
 const bytes=new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256",new TextEncoder().encode(uid+":money_fixed_v1:"+key)));
 bytes[6]=(bytes[6]&15)|80;bytes[8]=(bytes[8]&63)|128;
 const h=Array.from(bytes.slice(0,16),x=>x.toString(16).padStart(2,"0")).join("");
 return h.slice(0,8)+"-"+h.slice(8,12)+"-"+h.slice(12,16)+"-"+h.slice(16,20)+"-"+h.slice(20,32);
}
export async function setFixedMerchant(client,uid,merchant,fixed){
 const key=String(merchant||"").trim().toLowerCase();
 if(!uid||!client?.auth?.getUser||!client?.from||key.length<2||key.length>80||typeof fixed!=="boolean")
  throw Error("Sesión, comercio o marca de gasto fijo no válidos.");
 const auth=await client.auth.getUser();
 if(auth.error||auth.data?.user?.id!==uid)throw Error("La sesión cambió; no se ha guardado nada.");
 const {data:existing,error:queryError}=await client.from("hub_records")
  .select("id,owner_id,domain,record_type,updated_at,payload")
  .eq("owner_id",uid).eq("domain","money").eq("record_type","money_rule")
  .contains("payload",{merchant:key}).limit(2);
 if(queryError||!Array.isArray(existing))throw Error("No se pudieron comprobar las reglas del comercio.");
 if(existing.length>1)throw Error("El comercio tiene reglas duplicadas. No se sobrescribirá ninguna.");
 const original=existing[0]||null,payload={...(original?.payload||{}),merchant:key,fixed};
 if(original){
  if(original.owner_id!==uid||!original.updated_at)throw Error("La regla original no pertenece a tu sesión.");
  const {data,error}=await client.from("hub_records").update({payload})
   .eq("id",original.id).eq("owner_id",uid).eq("domain","money").eq("record_type","money_rule")
   .eq("updated_at",original.updated_at).select("id,payload").maybeSingle();
  if(error||!data)throw Error("La regla cambió en otro dispositivo. Actualiza antes de guardarla.");
  return data;
 }
 const timestamp=new Date().toISOString();
 const id=await stableRuleId(uid,key);
 const {data,error}=await client.from("hub_records").insert({
  id,owner_id:uid,domain:"money",record_type:"money_rule",title:key+" · gasto fijo",
  status:"active",source:"manual",requires_review:false,occurred_at:timestamp,payload
 }).select("id,payload").single();
 if(error||!data)throw Error("La regla ya fue creada o no se pudo guardar. Actualiza antes de reintentar.");
 return data;
}
