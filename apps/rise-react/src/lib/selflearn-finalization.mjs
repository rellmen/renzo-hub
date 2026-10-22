// SelfLearn: idempotent React-to-legacy graduation using the existing RLS data model.
// One atomic Supabase hub_records upsert writes the lesson event and NEW vocabulary.
// Existing FSRS cards are NEVER overwritten by an incomplete/stale client.
// The legacy frontend uses random IDs; concurrent graduation across both clients
// remains a release gate until an authenticated cross-client test is complete.
import {validRun,isComplete,findUnit,areaFor,score,mistakeWords,normalize}
  from "./legacy-selflearn/engine.js";
import {loadLearningSnapshot} from "./selflearn-snapshot.mjs";
import {recentLearningCheckpoints} from "./selflearn-checkpoints.mjs";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function owner(uid){if(!UUID.test(String(uid||"")))throw Error("Inicia sesión para acreditar la unidad.");return uid;}
function dateKey(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
function check(r){if(!r||r.error)throw Error(r?.error?.message||"Supabase no confirmó la finalización.");return r.data;}
export async function stableRecordId(key){
  if(!globalThis.crypto?.subtle)throw Error("Este navegador no admite identificadores criptográficos seguros.");
  const bytes=new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256",new TextEncoder().encode("RISE HUB SelfLearn v1:"+key)));
  const n=bytes.slice(0,16);
  // RFC 4122 layout, version 8 = custom hash-derived UUID.
  n[6]=(n[6]&0x0f)|0x80;n[8]=(n[8]&0x3f)|0x80;
  const h=[...n].map(x=>x.toString(16).padStart(2,"0")).join("");
  return [h.slice(0,8),h.slice(8,12),h.slice(12,16),h.slice(16,20),h.slice(20)].join("-");
}
export function lessonAward(run,existing,{at=new Date(),uid}={}){
  owner(uid);
  if(!validRun(run)||run.mode!=="lesson"||!isComplete(run))
    throw Error("Solo se acreditan lecciones válidas y terminadas.");
  const unit=findUnit(run.course,run.unitId);
  if(!unit)throw Error("La unidad ya no existe.");
  if(!(at instanceof Date)||!Number.isFinite(at.valueOf()))throw Error("Fecha de lección inválida.");
  const graded=run.steps.filter(s=>["choice","type","build","match","gap","dialogue","listen"].includes(s.type));
  if(graded.length===0||graded.some(s=>!Number.isInteger(run.attempts?.[s.id])
     ||run.attempts[s.id]<1||typeof run.firstTry?.[s.id]!=="boolean"))
    throw Error("Falta confirmar una o más respuestas de la lección.");
  const d=dateKey(at),tomorrow=dateKey(new Date(at.getFullYear(),at.getMonth(),at.getDate()+1));
  const sc=score(run);
  if(sc.total!==graded.length)throw Error("Puntuación incoherente con el motor original.");
  const already=(existing?.completed?.[run.course]||[]).includes(run.unitId)||
    (existing?.entries||[]).some(e=>e.course===run.course&&e.courseLessonId===run.unitId
      &&e.practice==="Study path"&&e.passed!==false);
  const area=areaFor(run.course);
  const wrong=new Set(mistakeWords(run).map(w=>normalize(w[0])));
  const vocab=existing?.vocabulary||[];
  const known=new Set(vocab.filter(v=>(v.course|| (v.area==="English"?"en":"nl"))===run.course)
    .map(v=>normalize(v.front)));
  const newWords=[];
  const planned=new Set(known);
  for(const word of unit.words){
    if(!Array.isArray(word)||!word[0]||!word[1])continue;
    const fingerprint=normalize(word[0]);
    if(!fingerprint||planned.has(fingerprint))continue;
    planned.add(fingerprint);
    newWords.push(word);
  }
  const start=Number(run.startedAt);
  const minutes=Number.isFinite(start)&&start>0
    ?Math.max(1,Math.min(1440,Math.round((at.getTime()-start)/60000))):1;
  const event={
    kind:"learning",area,course:run.course,title:area+" · "+unit.title,
    stage:"Application",practice:"Study path",courseLessonId:unit.id,
    level:unit.level,passed:true,score:sc.correct,totalQuestions:sc.total,
    xp:already?0:sc.correct*10,minutes,date:d
  };
  return {unit,area,event,already,newWords,newVocabulary:newWords.map(([front,back])=>({
    course:run.course,front,back,area,unitId:unit.id,date:d,
    nextReview:wrong.has(normalize(front))?d:tomorrow,
    intervalDays:0,repetitions:0
  }))};
}
export async function finalizeOfficialLesson(client,uid,checkpoint,{at=new Date(),legacyActive=false}={}){
  const user=owner(uid);
  if(legacyActive)throw Error("Termina o descarta primero tu sesión activa en SelfLearn clásico.");
  if(!client?.from)throw Error("Supabase no está disponible.");
  if(!checkpoint?.id||!UUID.test(String(checkpoint.sessionId||"")))
    throw Error("No hay un checkpoint verificable para esta unidad.");
  const {run}=checkpoint;
  if(!validRun(run)||!isComplete(run)||run.mode!=="lesson")
    throw Error("La lección no ha finalizado.");
  // Verify the last confirmed checkpoint, not merely the client-side state.
  const checkpoints=await recentLearningCheckpoints(client,user,{limit:200});
  const newest=checkpoints.find(x=>x.payload.course===run.course&&x.payload.sessionId===checkpoint.sessionId);
  if(!newest||newest.id!==checkpoint.id||JSON.stringify(newest.payload.run)!==JSON.stringify(run))
    throw Error("El progreso ha cambiado en otro dispositivo. Recarga antes de acreditar.");
  const existing=await loadLearningSnapshot(client,user);
  const reward=lessonAward(run,existing,{at,uid:user});
  if(reward.already)return {already:true,xp:0,addedCards:0,unitId:run.unitId};
  const eventId=await stableRecordId(user+"/lesson/"+run.course+"/"+run.unitId);
  const day=dateKey(at),occurred_at=day+"T12:00:00.000Z";
  const records=[{
    id:eventId,owner_id:user,domain:"system",record_type:"renzo_event",
    title:reward.event.title,status:"active",occurred_at,
    payload:{...reward.event,id:eventId},source:"manual",requires_review:false
  }];
  for(const card of reward.newVocabulary){
    const id=await stableRecordId(user+"/vocabulary/"+run.course+"/"+normalize(card.front));
    records.push({
      id,owner_id:user,domain:"learning",record_type:"renzo_vocabulary",
      title:card.front,status:"active",occurred_at,
      payload:{...card,id},source:"manual",requires_review:false
    });
  }
  // Single PostgREST UPSERT statement = transactional for this batch.
  // ignoreDuplicates protects deterministic IDs against retries in this React path.
  check(await client.from("hub_records").upsert(records,{onConflict:"id",ignoreDuplicates:true}));
  const confirmed=check(await client.from("hub_records").select("id,payload")
    .eq("id",eventId).eq("owner_id",user).maybeSingle());
  if(!confirmed||confirmed.payload?.courseLessonId!==run.unitId
    ||confirmed.payload?.practice!=="Study path")
    throw Error("No se ha confirmado la acreditación en Supabase.");
  return {already:false,xp:Number(confirmed.payload.xp)||0,addedCards:reward.newVocabulary.length,
    unitId:run.unitId};
}
