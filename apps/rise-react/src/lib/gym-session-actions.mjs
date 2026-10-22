// RISE HUB React / Gym draft actions.
// Reuse the original gym_sessions schema. Never delete completed workouts.
// The application must remain in staging until tested with authenticated accounts.
function logged(uid){if(typeof uid!=="string"||!uid.trim())throw Error("Debes iniciar sesión.");return uid;}
function result(x){if(!x||x.error)throw Error(x?.error?.message||"No se pudo sincronizar la sesión.");return x.data;}
function localDay(at){return [at.getFullYear(),String(at.getMonth()+1).padStart(2,"0"),String(at.getDate()).padStart(2,"0")].join("-");}
function finite(v,min,max,required=false){
  if(v===null||v===undefined||v===""){if(required)throw Error("Completa los valores de todas las series marcadas.");return null;}
  const n=Number(v);if(!Number.isFinite(n)||n<min||n>max)throw Error("Valor de serie fuera del rango permitido.");return n;
}
function sessionsEqual(a,b){return JSON.stringify(a||[])===JSON.stringify(b||[]);}
export function planToSession(plan,day,uid,at=new Date()){
  const user_id=logged(uid);
  if(!Array.isArray(plan)||!Number.isInteger(day)||day<0||day>=plan.length)throw Error("Día de plan inválido.");
  const item=plan[day];
  if(!Array.isArray(item)||typeof item[0]!=="string"||!Array.isArray(item[2])||!item[2].length)throw Error("Plan de entrenamiento no disponible.");
  const exercises=item[2].map(entry=>{
    if(!Array.isArray(entry)||typeof entry[0]!=="string"||!entry[0].trim())throw Error("Ejercicio inválido.");
    const [name,rawCount,min,max,muscle,compound,superset,opts]=entry;
    const count=Number(rawCount);
    if(!Number.isInteger(count)||count<1||count>20)throw Error("Número de series no permitido.");
    const opt=opts&&typeof opts==="object"&&!Array.isArray(opts)?opts:{};
    return {
      name,min,max,muscle,compound:!!compound,superset:!!superset,
      ...(opt.rest?{rest:opt.rest}:{}),...(opt.rir!=null?{rir:opt.rir}:{}),
      ...(opt.note?{tip:opt.note}:{}),...(opt.unit?{unit:opt.unit}:{}),
      notes:"",sets:Array.from({length:count},()=>({weight:null,reps:null,rir:null,completed:false}))
    };
  });
  return {
    id:crypto.randomUUID(),user_id,workout_date:localDay(at),day,title:item[0],cardio_target:String(item[1]||""),
    started_at:at.toISOString(),completed_at:null,duration_minutes:null,cardio_type:"",
    cardio_minutes:0,body_weight:null,energy:null,fatigue:null,notes:"",exercises
  };
}
export async function startGymDraft(client,uid,plan,day,at=new Date()){
  const user_id=logged(uid);
  const existing=result(await client.from("gym_sessions").select("id").eq("user_id",user_id)
    .is("completed_at",null).limit(1));
  if(existing?.length)throw Error("Ya existe una sesión abierta. Reanúdala en lugar de crear otra.");
  const record=planToSession(plan,day,user_id,at);
  const saved=result(await client.from("gym_sessions").insert(record).select("*").single());
  if(!saved||saved.id!==record.id)throw Error("La creación de la sesión no se ha confirmado.");
  return saved;
}
export function prepareGymSave(base,updates,{finish=false,at=new Date()}={}){
  if(!base?.id||base?.completed_at)throw Error("Solo se pueden modificar sesiones abiertas.");
  if(!Array.isArray(base.exercises)||!Array.isArray(updates))throw Error("Ejercicios de sesión inválidos.");
  if(base.exercises.length!==updates.length)throw Error("El plan de la sesión cambió en otro dispositivo.");
  let setsDone=0;
  const exercises=base.exercises.map((ex,i)=>{
    const old=Array.isArray(ex?.sets)?ex.sets:[];
    const next=updates[i];
    if(!Array.isArray(next)||next.length!==old.length)throw Error("Número de series distinto del registro.");
    return {...ex,sets:old.map((original,j)=>{
      const x=next[j]||{};
      const completed=x.completed===true;
      if(completed)setsDone++;
      return {...original,
        weight:finite(x.weight,0,1000,completed),
        reps:finite(x.reps,1,500,completed),
        rir:finite(x.rir,0,10,completed),
        completed,
        notes:String(x.notes??original.notes??"").slice(0,1500),
        side:["left","right"].includes(x.side)?x.side:null
      };
    })};
  });
  if(finish&&!setsDone)throw Error("No hay series terminadas. Guarda como borrador.");
  const startMs=Date.parse(base.started_at||"");
  const duration=Number.isFinite(startMs)?Math.round((at.getTime()-startMs)/60000):null;
  return {...base,exercises,notes:String(base.notes||"").slice(0,4000),
    duration_minutes:finish?(duration!==null&&duration>=0&&duration<=300?duration:null):base.duration_minutes,
    completed_at:finish?at.toISOString():null};
}
export async function saveGymDraft(client,uid,base,updates,{finish=false,at=new Date()}={}){
  const user_id=logged(uid);
  if(base?.user_id!==user_id)throw Error("La sesión no pertenece a la cuenta activa.");
  // Preflight detects stale edits. The DB currently has no revision or updated_at
  // column on gym_sessions: truly atomic CAS requires a schema/RPC migration.
  // Do NOT claim cross-device conflict safety from this non-atomic check.
  const fresh=result(await client.from("gym_sessions").select("*").eq("id",base.id)
    .eq("user_id",user_id).maybeSingle());
  if(!fresh||fresh.completed_at)throw Error("La sesión ya no está abierta.");
  if(!sessionsEqual(fresh.exercises,base.exercises))throw Error("Esta sesión cambió en otro dispositivo. Actualiza antes de guardar.");
  const next=prepareGymSave(fresh,updates,{finish,at});
  const saved=result(await client.from("gym_sessions")
    .update({exercises:next.exercises,completed_at:next.completed_at,duration_minutes:next.duration_minutes})
    .eq("id",base.id).eq("user_id",user_id).is("completed_at",null).select("*").maybeSingle());
  if(!saved)throw Error("No se pudo confirmar el guardado de la sesión.");
  return saved;
}
