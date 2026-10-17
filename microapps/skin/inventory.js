// Inventory is a local, account-scoped UI preference; it is not sent to external AI services.
export const SKIN_STATES=Object.freeze(['unknown','available','paused','finished']);
export function inventoryKey(userId){if(typeof userId!=='string'||!userId)throw Error('Cuenta necesaria');return 'rise-skin-inventory-v1:'+userId;}
export function readSkinInventory(userId,storage=globalThis.localStorage){
 if(!userId||!storage)return {};
 try{const saved=JSON.parse(storage.getItem(inventoryKey(userId))||'{}');if(!saved||typeof saved!=='object'||Array.isArray(saved))return {};
 return Object.fromEntries(Object.entries(saved).filter(([id,value])=>/^p\d{1,3}$/.test(id)&&SKIN_STATES.includes(value)));}catch{return {};}
}
export function updateSkinInventory(userId,productId,state,storage=globalThis.localStorage){
 if(!/^p\d{1,3}$/.test(productId)||!SKIN_STATES.includes(state)||!storage)throw Error('Estado de inventario inválido');
 const next={...readSkinInventory(userId,storage),[productId]:state};
 storage.setItem(inventoryKey(userId),JSON.stringify(next));return next;
}
