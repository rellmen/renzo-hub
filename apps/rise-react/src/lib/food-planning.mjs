// RISE HUB Nocturne · Food: compra mensual base (lista y textos de index.html Classic) y edición de comidas.
// Casillas "comprado": por dispositivo y mes, como Classic (localStorage), con clave por cuenta.
export const SHOPPING_BASE=Object.freeze([
 ["Pollo / pavo","5–6 kg"],["Carne magra","1 kg"],["Pescado","1 kg"],["Huevos","30–40 unidades"],["Quark / skyr","8–10 kg"],
 ["Avena","2 kg"],["Arroz","3–4 kg"],["Patatas","6–8 kg"],["Verduras congeladas","Según consumo"],["Fruta de temporada","Según consumo"],
 ["Legumbres","Según consumo"],["Aceite, especias y salsas","Reponer según uso"]
]);
export const shopKey=(uid,month)=>`rise-food-shop-${uid}-${month}`;
export function readShop(uid,month,storage=globalThis.localStorage){
 try{const v=JSON.parse(storage?.getItem(shopKey(uid,month))||"[]");return Array.isArray(v)?v.filter(x=>SHOPPING_BASE.some(([n])=>n===x)):[];}catch{return [];}
}
export function toggleShop(uid,month,item,on,storage=globalThis.localStorage){
 if(!SHOPPING_BASE.some(([n])=>n===item))throw Error("Artículo desconocido.");
 const set=new Set(readShop(uid,month,storage));on?set.add(item):set.delete(item);
 try{storage?.setItem(shopKey(uid,month),JSON.stringify([...set]));}catch{/* sin almacenamiento: solo esta visita */}
 return [...set];
}
const num=(raw,max,label)=>{if(raw===null||raw===undefined||String(raw).trim()==="")return null;const n=Number(String(raw).replace(",","."));if(!Number.isFinite(n)||n<0||n>max)throw Error(label+" fuera del rango válido.");return n;};
export async function updateMeal(client,uid,row,input){
 if(!row?.id||!row.updated_at)throw Error("Actualiza antes de editar la comida.");
 const meal=String(input.meal||"").trim().slice(0,140);if(!meal)throw Error("Indica el nombre de la comida.");
 const kcal=num(input.kcal,15000,"Calorías"),protein=num(input.protein,1000,"Proteína");
 if(kcal===null&&protein===null)throw Error("Introduce al menos un dato nutricional.");
 const payload={...(row.payload||{}),meal,kcal,protein,editedAt:new Date().toISOString()};
 const {data,error}=await client.from("hub_records").update({title:meal,payload}).eq("id",row.id).eq("owner_id",uid).eq("domain","body").eq("record_type","food_log").eq("updated_at",row.updated_at).select("id").maybeSingle();
 if(error||!data)throw Error("La comida cambió en otro dispositivo o no se pudo guardar. Actualiza.");
 return data;
}
export async function deleteMeal(client,uid,row){
 if(!row?.id||!row.updated_at)throw Error("Actualiza antes de eliminar.");
 const {data,error}=await client.from("hub_records").delete().eq("id",row.id).eq("owner_id",uid).eq("domain","body").eq("record_type","food_log").eq("updated_at",row.updated_at).select("id");
 if(error||!Array.isArray(data)||data.length!==1)throw Error("La comida cambió o ya no existe. Actualiza.");
 return true;
}
export async function loadTodayMeals(client,uid,day){
 const {data,error}=await client.from("hub_records").select("id,owner_id,payload,updated_at,occurred_at").eq("owner_id",uid).eq("domain","body").eq("record_type","food_log")
  .gte("occurred_at",day+"T00:00:00.000Z").limit(100);
 if(error||!Array.isArray(data))throw Error("No se pudieron cargar las comidas.");
 return data.filter(r=>r.owner_id===uid&&r.payload?.date===day);
}
