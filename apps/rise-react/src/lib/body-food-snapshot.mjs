// React Nocturne Body/Food: read-only snapshot using the exact legacy data model.
// Real data is scoped to a logged-in Supabase user and existing RLS policies.
import {summarizeBody,localDay} from "./legacy-body-food/overview.js";
import {progressAgainst} from "./legacy-body-food/today.js";

function owner(user){if(!user?.id||typeof user.id!=="string")throw Error("Inicia sesión.");return user.id;}
function good(reply,label){if(!reply||reply.error)throw Error(reply?.error?.message||"No se pudo recuperar "+label);return reply.data;}
function daysAgo(day,n){
  const d=new Date(day+"T12:00:00");d.setDate(d.getDate()-n);return localDay(d);
}
export async function loadBodyFoodSnapshot(client,user,{at=new Date()}={}){
  const uid=owner(user),today=localDay(at),since=daysAgo(today,120);
  const [w,g,f,s,settings]=await Promise.all([
    client.from("hub_records").select("payload,occurred_at")
      .eq("owner_id",uid).eq("record_type","body_weight")
      .gte("occurred_at",since+"T00:00:00.000Z").order("occurred_at",{ascending:true}).limit(400),
    client.from("gym_sessions").select("workout_date,title,completed_at")
      .eq("user_id",uid).not("completed_at","is",null)
      .gte("workout_date",daysAgo(today,14)).order("workout_date",{ascending:false}).limit(30),
    client.from("hub_records").select("id,payload,occurred_at")
      .eq("owner_id",uid).eq("record_type","food_log")
      .gte("occurred_at",today+"T00:00:00.000Z").limit(100),
    client.from("skin_routine_logs").select("session,completed_steps")
      .eq("user_id",uid).eq("routine_date",today),
    client.from("user_settings").select("settings")
      .eq("user_id",uid).maybeSingle()
  ]);
  const weights=good(w,"pesos")||[],sessions=good(g,"entrenamientos")||[],
    food=good(f,"comidas")||[],skin=good(s,"rutinas")||[];
  const cfg=good(settings,"perfil corporal")?.settings||{};
  const goals=user.user_metadata?.gym_goals||null;
  // The legacy summarizer interprets Number(null) as 0. Exclude incomplete
  // weight entries so a missing measurement never appears as "0 kg".
  const validWeights=weights.filter(r=>{
    const v=r?.payload?.value;
    return v!==null&&v!==undefined&&v!==""&&Number.isFinite(Number(v))&&Number(v)>0;
  });
  const body=summarizeBody({weights:validWeights,sessions,food,skin,goals,today});
  const meals=food.filter(r=>r?.payload?.date===today).map(r=>({
    id:String(r.id||""),title:String(r.payload?.meal||r.payload?.name||r.payload?.description||"Comida registrada"),
    kcal:r.payload?.kcal!=null&&r.payload.kcal!==""&&Number.isFinite(Number(r.payload.kcal))?Number(r.payload.kcal):null,
    protein:r.payload?.protein!=null&&r.payload.protein!==""&&Number.isFinite(Number(r.payload.protein))?Number(r.payload.protein):null
  }));
  const profile=cfg.bodyProfile&&typeof cfg.bodyProfile==="object"?cfg.bodyProfile:{};
  return {
    today,body,meals,profile,
    nutrition:body.food||{meals:0,kcal:0,protein:0},
    kcalProgress:progressAgainst(body.food?.kcal||0,profile.kcalMin,profile.kcalMax),
    proteinProgress:progressAgainst(body.food?.protein||0,profile.proteinMin,profile.proteinMax)
  };
}
