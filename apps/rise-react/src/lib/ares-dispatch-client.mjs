// Rise React · cliente del contrato de herramientas de Ares. El servidor decide;
// el navegador solo muestra el estado y envía el ID de una operación aprobada.
export async function aresToolContract({fetcher=globalThis.fetch}={}){
  if(typeof fetcher!=="function")return {enabled:false,tools:[]};
  try{
    const res=await fetcher("/api/ares-dispatch",{method:"GET",cache:"no-store",credentials:"same-origin"});
    if(!res?.ok)return {enabled:false,tools:[]};
    const data=await res.json();
    const tools=Array.isArray(data?.tools)?data.tools:[];
    return {enabled:tools.some(t=>t?.id==="jarvis.capture_task"&&t.enabled===true),tools};
  }catch{return {enabled:false,tools:[]};}
}
export function canHandOff(row){
  return row?.record_type==="ares_operation"&&row.status==="approved"&&row.payload?.agent==="Jarvis"
    &&row.payload?.executed===false&&row.payload?.executionStatus==="not_connected";
}
export async function dispatchAresOperation(operationId,accessToken,{fetcher=globalThis.fetch}={}){
  if(!/^[0-9a-f-]{36}$/i.test(String(operationId||"")))throw new Error("Solicitud inválida.");
  if(!accessToken)throw new Error("Sesión necesaria.");
  let res;
  try{
    res=await fetcher("/api/ares-dispatch",{method:"POST",credentials:"same-origin",
      headers:{"Content-Type":"application/json",Authorization:"Bearer "+accessToken},
      body:JSON.stringify({operationId})});
  }catch{throw new Error("Estado del envío sin verificar. Actualiza antes de volver a intentarlo.");}
  let data={};try{data=await res.json();}catch{}
  if(!res.ok)throw new Error(typeof data?.error==="string"?data.error:"No se pudo entregar la solicitud.");
  return data;
}
