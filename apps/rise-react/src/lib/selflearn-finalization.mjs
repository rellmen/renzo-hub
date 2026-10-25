// SelfLearn: idempotent React-to-legacy graduation using the existing RLS data model.
// An authenticated RPC transaction writes the event and NEW vocabulary.
// Existing FSRS cards are NEVER overwritten by an incomplete/stale client.
// Requires the pending database guard and authenticated security QA before enabling.
import {validRun,isComplete,findUnit,areaFor,score,mistakeWords,normalize,buildLesson,completedUnitIds}
  from "./legacy-selflearn/engine.js";
import {loadLearningSnapshot} from "./selflearn-snapshot.mjs";
import {recentLearningCheckpoints} from "./selflearn-checkpoints.mjs";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function packed(value){
  if(Array.isArray(value))return '['+value.map(packed).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+packed(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
function owner(uid){if(!UUID.test(String(uid||"")))throw Error("Inicia sesión para acreditar la unidad.");return uid;}
function dateKey(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
function check(r){if(!r||r.error)throw Error(r?.error?.message||"Supabase no confirmó la finalización.");return r.data;}
export async function stableRecordId(key){
  if(!globalThis.crypto?.subtle)throw Error("Este navegador no admite identificadores criptográficos seguros.");
  const bytes=new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256",new TextEncoder().encode("Rise SelfLearn v1:"+key)));
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
  const canonical=buildLesson(run.course,run.unitId,{minutes:run.minutes,seed:run.seed});
  if(!canonical||packed(run.steps)!==packed(canonical.steps))
    throw Error("La lección no corresponde al motor original.");
  if(run.index!==run.queue.length||run.queue.length>250||
     JSON.stringify(run.queue.slice(0,run.steps.length))!==JSON.stringify(canonical.queue))
    throw Error("La cola de respuestas no corresponde al motor original.");
  const unit=findUnit(run.course,run.unitId);
  if(!unit)throw Error("La unidad ya no existe.");
  if(!(at instanceof Date)||!Number.isFinite(at.valueOf()))throw Error("Fecha de lección inválida.");
  const graded=run.steps.filter(s=>["choice","type","build","match","gap","dialogue","listen"].includes(s.type));
  if(graded.length===0||graded.some(s=>!Number.isInteger(run.attempts?.[s.id])
     ||run.attempts[s.id]<1||typeof run.firstTry?.[s.id]!=="boolean"))
    throw Error("Falta confirmar una o más respuestas de la lección.");
  if(graded.some(s=>run.queue.filter(id=>id===s.id).length!==run.attempts[s.id]))
    throw Error("La cola de respuestas no corresponde al motor original.");
  const d=dateKey(at),tomorrow=dateKey(new Date(at.getFullYear(),at.getMonth(),at.getDate()+1));
  const sc=score(run);
  if(sc.total!==graded.length)throw Error("Puntuación incoherente con el motor original.");
  const already=completedUnitIds(existing?.entries||[],run.course).has(run.unitId)||
    (existing?.completed?.[run.course]||[]).includes(run.unitId);
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
  if(!newest||newest.id!==checkpoint.id||packed(newest.payload.run)!==packed(run))
    throw Error("El progreso ha cambiado en otro dispositivo. Recarga antes de acreditar.");
  const existing=await loadLearningSnapshot(client,user);
  const reward=lessonAward(run,existing,{at,uid:user});
  if(existing.learningRuns?.[run.course])
    throw Error("Termina o descarta primero tu sesión activa en SelfLearn clásico.");
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
  // A missing/unapproved RPC fails closed. Never fall back to direct inserts.
  if(!client.rpc)throw Error("La acreditación atómica aún no está disponible.");
  const result=check(await client.rpc("selflearn_finalize_lesson",{
    p_checkpoint:checkpoint.id,p_event:records[0],p_cards:records.slice(1)
  }));
  if(!result||typeof result.already!=="boolean"||result.unitId!==run.unitId||
     !Number.isFinite(result.xp)||!Number.isInteger(result.addedCards))
    throw Error("No se ha confirmado la acreditación en Supabase.");
  return result;
}
