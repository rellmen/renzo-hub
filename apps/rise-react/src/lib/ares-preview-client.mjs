// RISE HUB React · Ares optional preview-only model transport.
// The backend alone decides availability/consent to share limited project data.
// This frontend never includes API provider credentials or finance/notes payloads.
function textOf(x,max){return typeof x==="string"?x.trim().slice(0,max):"";}
export async function aresPreviewStatus({fetcher=globalThis.fetch}={}){
  if(typeof fetcher!=="function")return {enabled:false,reason:"No hay red disponible"};
  try{
    const resp=await fetcher("/api/ares-ai",{method:"GET",cache:"no-store",credentials:"same-origin"});
    if(!resp?.ok)return {enabled:false,reason:"Servicio de IA no disponible en este entorno"};
    const data=await resp.json();
    if(!data||data.enabled!==true)return {enabled:false,reason:"Modelo externo desactivado en este entorno"};
    return {enabled:true,provider:"OpenRouter",model:"openrouter/free",sharing:"Solo títulos y estados de proyectos y tareas"};
  }catch{return {enabled:false,reason:"No se pudo comprobar el modo IA"};}
}
export function isPrivateAresPrompt(value){
  const q=textOf(value,500).toLowerCase();
  return /(?:n[oó]minas?|salario|iban|cuenta bancaria|contraseñ|password|token|clave secreta|\b\d{8,}[a-z]\b|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b|€|\$\s*\d)/i.test(q);
}
export async function askAresPreview(question,accessToken,{fetcher=globalThis.fetch,timeoutMs=26000}={}){
  const q=textOf(question,350);
  if(q.length<2)throw new Error("La pregunta debe contener al menos dos caracteres.");
  if(isPrivateAresPrompt(q))throw new Error("Esta consulta parece sensible: utiliza el modo privado local de Ares.");
  const token=textOf(accessToken,5000);
  if(!token)throw new Error("No hay una sesión autorizada.");
  if(typeof fetcher!=="function")throw new Error("Servicio de red no disponible.");
  const abort=new AbortController();
  const t=setTimeout(()=>abort.abort(),timeoutMs);
  try{
    const res=await fetcher("/api/ares-ai",{
      method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},
      credentials:"same-origin",cache:"no-store",signal:abort.signal,
      body:JSON.stringify({question:q})
    });
    let data;
    try{data=await res.json();}catch{throw new Error("El servidor no devolvió una respuesta válida.");}
    if(!res.ok)throw new Error(textOf(data?.error,200)||"El modelo externo no está disponible.");
    if(!data||typeof data.text!=="string"||!data.text.trim())throw new Error("El modelo externo no devolvió una respuesta.");
    return {text:data.text.trim().slice(0,4500),source:data.source||"Ares · consulta externa"};
  }finally{clearTimeout(t);}
}
