// One new valuation per save, same hub_records money_asset schema as Classic.
// Never mutate a bank transaction or rewrite a previous investment/debt valuation.
import {parseEuro} from "./legacy-money/finance/networth.js";
export function cleanAssetValuation(input,{today=new Date()}={}){
 const kind=input?.kind==="debt"?"debt":input?.kind==="investment"?"investment":null;
 const name=String(input?.name||"").trim().slice(0,60);
 const value=parseEuro(input?.value);
 const date=String(input?.date||"");
 const d=new Date(today.getFullYear(),today.getMonth(),today.getDate());
 const todayIso=[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
 const validDay=/^\d{4}-\d{2}-\d{2}$/.test(date)&&!Number.isNaN(new Date(date+"T00:00:00Z").valueOf())&&new Date(date+"T00:00:00Z").toISOString().slice(0,10)===date;
 if(!kind||!name||!Number.isFinite(value)||value<0||value>1e9||!validDay||date>todayIso)
  throw Error("Revisa el tipo, nombre, valor en euros y fecha no futura.");
 return{kind,name,value:Math.round(value*100)/100,date};
}
export async function saveAssetValuation(client,uid,input,{today=new Date()}={}){
 if(!uid||!client?.auth?.getUser||!client?.from)throw Error("Inicia sesión para registrar esta valoración.");
 const valuation=cleanAssetValuation(input,{today});
 const auth=await client.auth.getUser();
 if(auth.error||auth.data?.user?.id!==uid)throw Error("La sesión cambió. No se ha guardado la valoración.");
 if(!globalThis.crypto?.randomUUID)throw Error("Este navegador no admite identificadores seguros.");
 const stamp=new Date().toISOString();
 const row={
  id:globalThis.crypto.randomUUID(),owner_id:uid,domain:"money",record_type:"money_asset",
  title:(valuation.kind==="debt"?"Deuda":"Inversión")+" · "+valuation.name,
  status:"active",source:"manual",requires_review:false,
  occurred_at:valuation.date+"T12:00:00.000Z",created_at:stamp,updated_at:stamp,
  payload:valuation
 };
 const res=await client.from("hub_records").insert(row).select("id,owner_id,domain,record_type,payload").single();
 if(res.error||!res.data||res.data.owner_id!==uid)throw Error("No se pudo guardar esta valoración. Comprueba la conexión antes de volver a intentarlo.");
 return res.data;
}
