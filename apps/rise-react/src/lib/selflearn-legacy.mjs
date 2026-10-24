// SelfLearn · cerrar la lección a medias que dejó el reproductor clásico (hub_user_state.state.learningRuns).
// Classic es solo respaldo (decisión 23-10-2026), así que esa sesión bloqueaba Idiomas para siempre.
// «Continuar aquí»: copia la sesión como checkpoint de Nocturne (mismo motor) y DESPUÉS la quita del estado
// compartido con control de versión (updated_at). Si algo falla a mitad, la sesión sigue recuperable.
import {validRun,isComplete} from "./legacy-selflearn/engine.js";
import {appendStudyCheckpoint} from "./selflearn-checkpoints.mjs";
const UID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function owner(uid){if(!UID.test(String(uid||"")))throw Error("Inicia sesión para continuar.");return uid;}
function course(c){if(c!=="nl"&&c!=="en")throw Error("Curso no válido.");return c;}

/** Resumen de la sesión clásica pendiente, o null si no hay. */
export function legacyRunInfo(run){
  if(!run||typeof run!=="object")return null;
  const ok=validRun(run)&&run.mode==="lesson"&&!!run.unitId;
  const total=Array.isArray(run.queue)?run.queue.length:0;
  const index=Number.isInteger(run.index)?run.index:0;
  return {resumable:ok&&!isComplete(run),complete:ok&&isComplete(run),valid:ok,unitId:run.unitId||null,step:Math.min(index+1,total),total};
}

async function clearRun(client,id,c){
  const {data:row,error}=await client.from("hub_user_state").select("owner_id,state,updated_at").eq("owner_id",id).maybeSingle();
  if(error)throw Error("No se pudo leer tu estado de SelfLearn.");
  const runs=row?.state?.learningRuns;
  if(!row||!runs||typeof runs!=="object"||!(c in runs))return {cleared:false,run:null};
  const run=runs[c];
  const nextRuns={...runs};delete nextRuns[c];
  const {data,error:e2}=await client.from("hub_user_state")
    .update({state:{...row.state,learningRuns:nextRuns},updated_at:new Date().toISOString()})
    .eq("owner_id",id).eq("updated_at",row.updated_at).select("owner_id,updated_at").maybeSingle();
  if(e2)throw Error("No se pudo cerrar la sesión clásica.");
  if(!data)throw Error("Tu estado cambió en otro dispositivo. Actualiza y vuelve a intentarlo.");
  return {cleared:true,run};
}

/** Lee la sesión clásica actual (siempre de la base de datos, no de la caché). */
async function currentRun(client,id,c){
  const {data,error}=await client.from("hub_user_state").select("state").eq("owner_id",id).maybeSingle();
  if(error)throw Error("No se pudo leer tu estado de SelfLearn.");
  return data?.state?.learningRuns?.[c]??null;
}

/** Continúa aquí la lección clásica: checkpoint nuevo con el mismo progreso y se retira del estado clásico. */
export async function adoptLegacyRun(client,uid,courseId){
  const id=owner(uid),c=course(courseId);
  if(!client?.from)throw Error("Supabase no está disponible.");
  const run=await currentRun(client,id,c);
  const info=legacyRunInfo(run);
  if(!info)return {adopted:null,cleared:false};
  let adopted=null;
  if(info.resumable){
    const sessionId=globalThis.crypto.randomUUID();
    const saved=await appendStudyCheckpoint(client,id,run,sessionId);
    adopted={id:saved.id,sessionId,run};
  }
  const res=await clearRun(client,id,c);
  return {adopted,cleared:res.cleared};
}

/** Descarta la sesión clásica sin copiarla (por ejemplo, si estaba rota o ya terminada). */
export async function discardLegacyRun(client,uid,courseId){
  const id=owner(uid),c=course(courseId);
  if(!client?.from)throw Error("Supabase no está disponible.");
  return clearRun(client,id,c);
}
