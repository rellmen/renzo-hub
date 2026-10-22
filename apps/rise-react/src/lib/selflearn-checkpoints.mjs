// RISE HUB / SelfLearn React · immutable checkpoints for loss-resistant lessons.
// Stores each answered step as an append-only hub_records row under RLS; it never
// overwrites hub_user_state.state or another microapp's preferences.
// The lesson player/XP/FSRS finalization remains gated until its atomic contract
// is implemented and tested across two authenticated devices.
import {validRun,newerRun} from "./legacy-selflearn/engine.js";
const MAX_BYTES=160000;
const UID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function logged(uid){
  if(typeof uid!=="string"||!UID.test(uid))throw Error("Inicia sesión para guardar tu progreso.");
  return uid;
}
function course(id){if(id!=="nl"&&id!=="en")throw Error("Curso de idioma no válido.");return id;}
function check(response,label){
  if(!response||response.error)throw Error(response?.error?.message||"No fue posible "+label);
  return response.data;
}
export function safeCheckpoint(run,sessionId){
  if(!validRun(run)||run.mode!=="lesson"||!run.unitId||!course(run.course))
    throw Error("La sesión de aprendizaje no es compatible con el motor original.");
  if(!UID.test(String(sessionId||"")))throw Error("Identificador de sesión inválido.");
  if(run.index>run.queue.length||run.queue.length>250||run.steps.length>250)
    throw Error("Los datos de sesión están fuera del límite permitido.");
  const safe=structuredClone(run);
  const packed=JSON.stringify({sessionId,course:run.course,run:safe});
  if(packed.length>MAX_BYTES)throw Error("Sesión demasiado grande para guardarla.");
  return {sessionId,course:run.course,unitId:run.unitId,run:safe};
}
export async function recentLearningCheckpoints(client,uid,{limit=150}={}){
  const owner_id=logged(uid);
  if(!client?.from)throw Error("Supabase no está disponible.");
  const count=Math.min(Math.max(1,Number.isInteger(limit)?limit:150),200);
  const response=await client.from("hub_records")
    .select("id,created_at,updated_at,payload")
    .eq("owner_id",owner_id).eq("domain","learning").eq("record_type","learning_run")
    .order("created_at",{ascending:false}).limit(count);
  const rows=check(response,"recuperar los checkpoints")||[];
  if(!Array.isArray(rows))throw Error("Historial de aprendizaje inesperado.");
  return rows.filter(x=>x?.payload?.course==="nl"||x?.payload?.course==="en")
    .filter(x=>validRun(x?.payload?.run)&&x.payload.run.mode==="lesson"
      &&UID.test(String(x.payload.sessionId||"")));
}
export function newestStudyRun(rows,courseId){
  course(courseId);
  for(const row of rows||[]){
    if(row?.payload?.course===courseId&&validRun(row.payload.run))
      return {id:row.id,createdAt:row.created_at,sessionId:row.payload.sessionId,run:row.payload.run};
  }
  return null;
}
export async function appendStudyCheckpoint(client,uid,run,sessionId,{previousId=null}={}){
  const owner_id=logged(uid);
  const payload=safeCheckpoint(run,sessionId);
  if(!client?.from)throw Error("Supabase no está disponible.");
  // Optimistic preflight. No mutation of existing checkpoints even on a race.
  // This is not an atomic compare-and-swap, but older progress remains recoverable.
  if(previousId!==null){
    const recent=await recentLearningCheckpoints(client,owner_id,{limit:200});
    const current=recent.find(x=>x.payload.course===run.course&&x.payload.sessionId===sessionId);
    if(!current||current.id!==previousId)throw Error("La sesión cambió en otro dispositivo; actualiza antes de continuar.");
  }
  const row={
    owner_id,domain:"learning",record_type:"learning_run",
    title:"SelfLearn · "+run.course.toUpperCase()+" · "+run.unitId,
    source:"manual",requires_review:false,payload
  };
  const response=await client.from("hub_records").insert(row)
    .select("id,created_at,updated_at,payload").single();
  const data=check(response,"guardar el paso");
  if(!data?.id||data?.payload?.sessionId!==sessionId)
    throw Error("El servidor no confirmó el checkpoint de la sesión.");
  return data;
}
export function resumedStudyRun(legacyRun,checkpoint){
  return newerRun(legacyRun,checkpoint?.run||null);
}
