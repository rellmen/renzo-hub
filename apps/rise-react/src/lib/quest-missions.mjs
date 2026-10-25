// Rise Nocturne · Daily Quests derivadas de actividad REAL (port de world.js dailyQuests, Classic).
// Solo lectura: una misión está cumplida si existe un registro de esa cuenta en esa fecha.
// No otorga XP ni crea eventos: Classic decía que suman XP, pero acreditarlo exige un evento
// idempotente propio; hasta entonces se muestra el cumplimiento sin recompensa ficticia.
export const QUESTS=Object.freeze([
 {id:"body",title:"Registra un check-in Body",route:"/body",test:(e)=>e.kind==="body"},
 {id:"dutch",title:"Aplica o repasa neerlandés",route:"/aprender",test:(e)=>e.kind==="learning"&&["Application","Review"].includes(e.stage)},
 {id:"output",title:"Cierra un entregable",route:"/proyectos",test:(e)=>["output","project_done"].includes(e.kind)},
 {id:"money",title:"Revisa un movimiento Money",route:"/gastos",money:true}
]);
const ISO=/^\d{4}-\d{2}-\d{2}$/;
export function localDay(d=new Date()){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
export function shiftDay(day,delta){const d=new Date(day+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+delta);return d.toISOString().slice(0,10);}
export function questsForDay(day,events=[],money=[]){
 const e=events.map(r=>r.payload||{}).filter(p=>p.date===day);
 const reviewed=money.some(r=>r.payload?.date===day&&r.payload?.reviewed===true);
 const items=QUESTS.map(q=>({id:q.id,title:q.title,route:q.route,done:q.money?reviewed:e.some(q.test)}));
 return {day,items,done:items.filter(x=>x.done).length,total:items.length};
}
export function summarizeQuests(today,events,money,days=7){
 if(!ISO.test(today))throw Error("Fecha inválida.");
 const week=Array.from({length:days},(_,i)=>questsForDay(shiftDay(today,i-(days-1)),events,money));
 let streak=0;for(let i=week.length-1;i>=0;i--){if(week[i].done===week[i].total)streak++;else if(i!==week.length-1)break;else continue;}
 return {today:week[week.length-1],week,streak};
}
async function since(client,uid,type,from){
 const rows=[];
 for(let start=0;start<5000;start+=1000){
  const {data,error}=await client.from("hub_records").select("id,owner_id,record_type,payload")
   .eq("owner_id",uid).eq("record_type",type).gte("payload->>date",from).order("id").range(start,start+999);
  if(error||!Array.isArray(data))throw Error("No se pudo consultar la actividad de Quest.");
  if(data.some(r=>r.owner_id!==uid))throw Error("Respuesta de otra cuenta rechazada.");
  rows.push(...data);if(data.length<1000)return rows;
 }
 return rows;
}
export async function loadDailyQuests(client,uid,today=localDay()){
 if(!client||!uid)throw Error("Inicia sesión para acceder a Quest.");
 const from=shiftDay(today,-6);
 const [events,money]=await Promise.all([since(client,uid,"renzo_event",from),since(client,uid,"renzo_money",from)]);
 return summarizeQuests(today,events,money);
}
