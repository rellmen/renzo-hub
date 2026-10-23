// Nocturne · edits existing bank categorization only. Never rewrites amounts,
// dates, ownership, importer provenance, or inferred transaction identifiers.
import {loadFinance} from "./legacy-money/finance/data.js";
import {CATEGORIES,CATEGORY,monthsOf,monthSummary} from "./legacy-money/gastos/categories.js";

export const GASTOS_CATEGORIES=CATEGORIES;
export async function loadGastos(client,uid){
 if(!client?.from||!uid)throw Error("Sesión necesaria.");
 const fin=await loadFinance(client,uid);
 return {items:fin.items,transactions:fin.txs,rules:fin.rules||[],categories:CATEGORIES,
  months:monthsOf(fin.items),summary:month=>monthSummary(fin.items,month)};
}
export function categoryPayload(original,category){
 if(!original||typeof original!=="object"||Array.isArray(original))throw Error("Movimiento bancario inválido.");
 if(category!==""&&!CATEGORY[category])throw Error("Categoría desconocida.");
 const payload={...original};
 if(category)payload.category=category;
 else delete payload.category;
 return payload;
}
export async function saveGastosCategory(client,uid,{id,updated_at},category){
 if(!client?.from||!uid||!id||!updated_at)throw Error("Movimiento y versión originales necesarios.");
 if(category!==""&&!CATEGORY[category])throw Error("Categoría no reconocida.");
 const {data:current,error:readError}=await client.from("hub_records")
  .select("id,payload,updated_at").eq("id",id).eq("owner_id",uid)
  .eq("domain","money").eq("record_type","bank_tx").maybeSingle();
 if(readError)throw Error("No se pudo comprobar la versión del movimiento.");
 if(!current||current.updated_at!==updated_at)
  throw Error("El movimiento cambió en otro dispositivo. Actualiza antes de guardar.");
 const payload=categoryPayload(current.payload,category);
 const {data,error}=await client.from("hub_records").update({payload})
  .eq("id",id).eq("owner_id",uid).eq("domain","money")
  .eq("record_type","bank_tx").eq("updated_at",updated_at)
  .select("id,updated_at,payload").maybeSingle();
 if(error)throw Error("No se pudo guardar la categoría.");
 if(!data)throw Error("Otro dispositivo ha modificado el movimiento. Actualiza.");
 return data;
}

// Regla por comercio (Classic gastos.js setCategory scope "merchant"): aplica a todos los movimientos
// de ese comercio, también a los que se importen después. Mismo registro money/money_rule.
// Nocturne: actualización con CAS updated_at; al crearla, ID estable. Como Classic, si el movimiento
// tenía una categoría manual se retira para que siga la regla.
export async function saveMerchantRule(client,uid,{merchant,txRow},category,rules=[],{id=globalThis.crypto.randomUUID()}={}){
 if(!client?.from||!uid)throw Error("Sesión necesaria.");
 if(!CATEGORY[category])throw Error("Categoría no reconocida.");
 const key=String(merchant||"").trim().toLowerCase().slice(0,200);
 if(!key)throw Error("Movimiento sin comercio identificable: usa 'solo este movimiento'.");
 const existing=rules.find(r=>r.payload?.merchant===key);
 const fields={title:`${merchant} → ${CATEGORY[category].name}`.slice(0,500),payload:{...(existing?.payload||{}),merchant:key,category}};
 if(existing){
  if(!existing.updated_at)throw Error("Actualiza antes de cambiar la regla.");
  const {data,error}=await client.from("hub_records").update(fields).eq("id",existing.id).eq("owner_id",uid).eq("domain","money").eq("record_type","money_rule").eq("updated_at",existing.updated_at).select("id").maybeSingle();
  if(error||!data)throw Error("La regla cambió en otro dispositivo. Actualiza.");
 }else{
  const {error}=await client.from("hub_records").insert({id,owner_id:uid,domain:"money",record_type:"money_rule",occurred_at:new Date().toISOString(),...fields}).select("id").single();
  if(error)throw Error("No se pudo crear la regla.");
 }
 if(txRow?.payload&&txRow.payload.category)await saveGastosCategory(client,uid,txRow,"");
 return key;
}
export async function deleteMerchantRule(client,uid,rule){
 if(!rule?.id||!rule.updated_at)throw Error("Actualiza antes de eliminar la regla.");
 const {data,error}=await client.from("hub_records").delete().eq("id",rule.id).eq("owner_id",uid).eq("domain","money").eq("record_type","money_rule").eq("updated_at",rule.updated_at).select("id");
 if(error||!Array.isArray(data)||data.length!==1)throw Error("La regla cambió o ya no existe. Actualiza.");
 return true;
}
