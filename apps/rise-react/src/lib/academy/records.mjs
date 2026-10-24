// RISE HUB Academia +25 · acceso a datos (Supabase). Toda escritura de nota pasa por RPC en servidor.
const own=uid=>{if(typeof uid!=="string"||!uid)throw Error("Inicia sesión.");return uid;};
const MISSING=/(relation|function).*(does not exist)|Could not find the (table|function)|schema cache|PGRST20[02]|42P01|42883/i;
export class AcademyBackendMissing extends Error{constructor(){super("El backend de Academia no está instalado en este entorno.");this.name="AcademyBackendMissing";}}
function rethrow(error,fallback){
  const msg=String(error?.message||"")+" "+String(error?.code||"");
  if(MISSING.test(msg))throw new AcademyBackendMissing();
  if(error?.code==="40001"||/otro dispositivo/.test(msg))throw Error("Cambió en otro dispositivo. Actualiza: tu texto sigue en pantalla.");
  throw Error(error?.message||fallback);
}
const PROGRESS_COLS="lesson_id,status,last_section,draft,revision,best_exit_pct,last_result,completed_at,opened_at,updated_at";
const ATTEMPT_COLS="question_id,lesson_id,course,context,is_correct,skill_ids,created_at,session_id";

export async function loadAcademyState(client,uid){
  const id=own(uid);
  const [p,r,a,pr,e,ed]=await Promise.all([
    client.from("academy_lesson_progress").select(PROGRESS_COLS).eq("user_id",id).limit(1000),
    client.from("academy_reviews").select("lesson_id,step,due_on,last_pct").eq("user_id",id).limit(1000),
    client.from("academy_attempts").select(ATTEMPT_COLS).eq("user_id",id).order("created_at",{ascending:false}).limit(1500),
    client.from("academy_preferences").select("weekly_minutes,session_minutes,elective,show_drafts,revision").eq("user_id",id).maybeSingle(),
    client.from("academy_exam_sessions").select("id,client_session_id,profile_id,course,source_url,source_label,duration_minutes,status,scores,notes,total_score,revision,started_at,submitted_at").eq("user_id",id).order("started_at",{ascending:false}).limit(200),
    client.from("academy_editorial_reviews").select("lesson_id,content_version,decision,comment,created_at").eq("user_id",id).order("created_at",{ascending:false}).limit(500),
  ]);
  for(const x of [p,r,a,pr,e,ed])if(x.error)rethrow(x.error,"No se pudo cargar tu progreso de Academia.");
  return {progress:p.data||[],reviews:r.data||[],attempts:a.data||[],prefs:pr.data||null,exams:e.data||[],editorial:ed.data||[],
    attemptsPartial:(a.data||[]).length>=1500};
}

/** Marca la lección como abierta (en curso). Abrir nunca la completa. */
export async function openLesson(client,uid,lessonId,section="1"){
  own(uid);
  const {error}=await client.from("academy_lesson_progress").insert({lesson_id:lessonId,last_section:String(section).slice(0,80),draft:{}});
  if(error&&error.code!=="23505")rethrow(error,"No se pudo registrar la lección.");
  const {data,error:e2}=await client.from("academy_lesson_progress").select(PROGRESS_COLS).eq("user_id",uid).eq("lesson_id",lessonId).maybeSingle();
  if(e2)rethrow(e2,"No se pudo leer el progreso.");
  return data;
}

/** Autoguardado con CAS por revisión: si otro dispositivo guardó antes, no se pisa. */
export async function saveLessonDraft(client,uid,row,{draft,lastSection}){
  own(uid);
  if(!row||typeof row.revision!=="number")throw Error("Actualiza antes de guardar.");
  const body={revision:row.revision+1};
  if(draft!==undefined)body.draft=draft;
  if(lastSection!==undefined)body.last_section=String(lastSection).slice(0,80);
  const {data,error}=await client.from("academy_lesson_progress").update(body).eq("user_id",uid).eq("lesson_id",row.lesson_id).eq("revision",row.revision).select(PROGRESS_COLS).maybeSingle();
  if(error)rethrow(error,"No se pudo guardar.");
  if(!data)throw Error("Cambió en otro dispositivo. Actualiza: tu texto sigue en pantalla.");
  return data;
}

export async function gradeAnswer(client,{attemptId,questionId,answer,context,sessionId=null}){
  const {data,error}=await client.rpc("academy_grade",{p_client_attempt_id:attemptId,p_question_id:questionId,p_answer:answer,p_context:context,p_session_id:sessionId});
  if(error)rethrow(error,"No se pudo corregir la respuesta.");
  if(!data||typeof data.is_correct!=="boolean")throw Error("Respuesta de corrección no válida.");
  return data;
}

export async function finishQuiz(client,{lessonId,sessionId,context}){
  const {data,error}=await client.rpc("academy_finish_quiz",{p_lesson_id:lessonId,p_session_id:sessionId,p_context:context});
  if(error)rethrow(error,"No se pudo cerrar la evaluación.");
  return data;
}

export async function savePreferences(client,uid,current,next){
  own(uid);
  const body={weekly_minutes:next.weekly_minutes,session_minutes:next.session_minutes,elective:next.elective,show_drafts:next.show_drafts};
  if(!current){
    const {data,error}=await client.from("academy_preferences").insert(body).select("weekly_minutes,session_minutes,elective,show_drafts,revision").maybeSingle();
    if(error)rethrow(error,"No se pudieron guardar las preferencias.");return data;
  }
  const {data,error}=await client.from("academy_preferences").update({...body,revision:current.revision+1}).eq("user_id",uid).eq("revision",current.revision).select("weekly_minutes,session_minutes,elective,show_drafts,revision").maybeSingle();
  if(error)rethrow(error,"No se pudieron guardar las preferencias.");
  if(!data)throw Error("Las preferencias cambiaron en otro dispositivo. Actualiza.");
  return data;
}

export async function startExam(client,uid,{clientSessionId,profileId,course,sourceUrl,sourceLabel,durationMinutes}){
  own(uid);
  const {error}=await client.from("academy_exam_sessions").insert({client_session_id:clientSessionId,profile_id:profileId,course,source_url:sourceUrl||null,source_label:sourceLabel||null,duration_minutes:durationMinutes});
  if(error&&error.code!=="23505")rethrow(error,"No se pudo iniciar el simulacro.");
  const {data,error:e2}=await client.from("academy_exam_sessions").select("*").eq("user_id",uid).eq("client_session_id",clientSessionId).maybeSingle();
  if(e2)rethrow(e2,"No se pudo leer el simulacro.");
  return data;
}

export async function saveExam(client,uid,row,{scores,notes,total,submit=false}){
  own(uid);
  const body={scores,notes:String(notes||"").slice(0,20000),revision:row.revision+1};
  if(total!==undefined)body.total_score=total;
  if(submit)body.status="submitted";
  const {data,error}=await client.from("academy_exam_sessions").update(body).eq("id",row.id).eq("user_id",uid).eq("revision",row.revision).select("*").maybeSingle();
  if(error)rethrow(error,"No se pudo guardar el simulacro.");
  if(!data)throw Error("El simulacro cambió en otro dispositivo o ya está entregado. Actualiza.");
  return data;
}

export async function recordEditorialReview(client,uid,{lessonId,contentVersion,decision,comment}){
  own(uid);
  const {error}=await client.from("academy_editorial_reviews").insert({lesson_id:lessonId,content_version:contentVersion,decision,comment:String(comment||"").slice(0,4000)});
  if(error)rethrow(error,"No se pudo registrar la revisión.");
  return true;
}
