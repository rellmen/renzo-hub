import {completedUnitIds} from "./legacy-selflearn/engine.js";
// RISE HUB React · SelfLearn snapshot reader.
// Preserve the legacy state/FSRS contracts, never seed fake lessons or overwrite progress.
// Read-only: the actual lesson player, merge and save logic must be ported before enabling editing.
const TYPES=["renzo_event","renzo_vocabulary"];
const PAGE=500;
function owner(uid){if(typeof uid!=="string"||!uid.trim())throw new Error("Inicia sesión para consultar tus idiomas.");return uid;}
async function page(client,uid,from){
  const {data,error}=await client.from("hub_records").select("id,record_type,payload,updated_at")
    .eq("owner_id",uid).in("record_type",TYPES).order("updated_at",{ascending:false}).range(from,from+PAGE-1);
  if(error)throw new Error(error.message||"No se pudo recuperar el progreso de SelfLearn.");
  if(!Array.isArray(data))throw new Error("Respuesta de progreso no válida.");
  return data;
}
export function summarizeLearningSnapshot({state={},rows=[]}={}){
  const events=[],vocabulary=[];
  for(const row of Array.isArray(rows)?rows:[]){
    const p=row?.payload;
    if(!p||typeof p!=="object"||Array.isArray(p))continue;
    const record={...p,id:row.id,updatedAt:row.updated_at||p.updatedAt||null};
    if(row.record_type==="renzo_event")events.push(record);
    else if(row.record_type==="renzo_vocabulary")vocabulary.push(record);
  }
  const due={nl:0,en:0},now=new Date(),today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,"0"),String(now.getDate()).padStart(2,"0")].join("-");
  for(const v of vocabulary){
    const c=v.course==="en"?"en":v.course==="nl"?"nl":v.area==="English"?"en":"nl";
    const stamp=Date.parse(v.fsrsCard?.due||"");
    if(Number.isFinite(stamp)?stamp<=now.getTime():!v.nextReview||v.nextReview<=today)due[c]++;
  }
  const safeState=state&&typeof state==="object"&&!Array.isArray(state)?state:{};
  const runs=safeState.learningRuns&&typeof safeState.learningRuns==="object"?safeState.learningRuns:{};
  return {
    entries:events,vocabulary,
    completed:{nl:[...completedUnitIds(events,"nl")],en:[...completedUnitIds(events,"en")]},
    reviewDue:due,
    learningRuns:{nl:runs.nl||null,en:runs.en||null},
    learningSettings:safeState.learningSettings||{},
    goals:{nl:"B2",en:"C1"},
    note:"Estos son registros de aprendizaje; no certifican un nivel MCER."
  };
}
export async function loadLearningSnapshot(client,uid,{maxPages=20}={}){
  const id=owner(uid);
  const state=await client.from("hub_user_state").select("state,updated_at").eq("owner_id",id).maybeSingle();
  if(state?.error)throw new Error(state.error.message||"No se pudo recuperar el estado de SelfLearn.");
  const records=[];
  for(let n=0;n<Math.min(Math.max(1,Math.trunc(maxPages)||20),20);n++){
    const rows=await page(client,id,n*PAGE);
    records.push(...rows);
    if(rows.length<PAGE)break;
    if(n===19)throw new Error("Historial de SelfLearn demasiado grande; necesita paginación adicional.");
  }
  return summarizeLearningSnapshot({state:state?.data?.state||{},rows:records});
}
