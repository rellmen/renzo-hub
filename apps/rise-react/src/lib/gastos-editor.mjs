// Nocturne · edits existing bank categorization only. Never rewrites amounts,
// dates, ownership, importer provenance, or inferred transaction identifiers.
import {loadFinance} from "./legacy-money/finance/data.js";
import {CATEGORIES,CATEGORY,monthsOf,monthSummary} from "./legacy-money/gastos/categories.js";

export const GASTOS_CATEGORIES=CATEGORIES;
export async function loadGastos(client,uid){
 if(!client?.from||!uid)throw Error("Sesión necesaria.");
 const fin=await loadFinance(client,uid);
 return {items:fin.items,transactions:fin.txs,categories:CATEGORIES,
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
