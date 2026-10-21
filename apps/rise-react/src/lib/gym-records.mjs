// React Nocturne / Gym: read-only bridge to existing private workout history.
// Preserves legacy gym_sessions.exercises JSON and gym_plans.plan tuple format.
function requireUser(uid){if(typeof uid!=="string"||!uid.trim())throw Error("Inicia sesión para consultar tus entrenamientos.");return uid;}
function checkResult(x){if(!x||x.error)throw Error(x?.error?.message||"No se pudieron consultar los entrenamientos.");return x.data;}
export function completedWorkout(row){return !!row?.completed_at;}
export function workoutVolume(row){
  return (Array.isArray(row?.exercises)?row.exercises:[]).reduce((total,e)=>{
    const sets=Array.isArray(e?.sets)?e.sets:[];
    return total+sets.reduce((sum,s)=>{
      const kg=Number(s?.weight),reps=Number(s?.reps);
      return sum+(s?.completed&&Number.isFinite(kg)&&kg>=0&&Number.isFinite(reps)&&reps>=0?kg*reps:0);
    },0);
  },0);
}
export function workoutSetCount(row){
  return (Array.isArray(row?.exercises)?row.exercises:[]).reduce((n,e)=>
    n+(Array.isArray(e?.sets)?e.sets.filter(s=>s?.completed).length:0),0);
}
export function summariseGymRecords(sessions=[],plan=null,now=new Date()){
  const rows=Array.isArray(sessions)?sessions:[];
  const completed=rows.filter(completedWorkout);
  const monday=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
  monday.setDate(monday.getDate()-((monday.getDay()+6)%7));
  const weekBeginning=[monday.getFullYear(),String(monday.getMonth()+1).padStart(2,"0"),String(monday.getDate()).padStart(2,"0")].join("-");
  const current=rows.find(r=>!r.completed_at)||null;
  return {sessions:rows,completed,current,plan:Array.isArray(plan)?plan:[],
    completedCount:completed.length,
    weekCount:completed.filter(r=>String(r.workout_date||"")>=weekBeginning).length,
    totalVolume:completed.reduce((n,r)=>n+workoutVolume(r),0),
    lastCompleted:completed[0]||null,
  };
}
export async function loadGymRecords(client,uid,{limit=100}={}){
  const user= requireUser(uid);
  const max=Math.min(250,Math.max(1,Math.trunc(limit)||100));
  const [a,b]=await Promise.all([
    client.from("gym_sessions").select("id,user_id,workout_date,day,title,started_at,completed_at,duration_minutes,cardio_minutes,body_weight,notes,exercises")
      .eq("user_id",user).order("workout_date",{ascending:false}).limit(max),
    client.from("gym_plans").select("user_id,plan,updated_at")
      .eq("user_id",user).maybeSingle()
  ]);
  const rows=checkResult(a)||[];
  const p=checkResult(b);
  return summariseGymRecords(rows,p?.plan||null);
}
