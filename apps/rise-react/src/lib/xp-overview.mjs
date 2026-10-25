// Read-only, owner-scoped XP registry. Never award XP from a UI render.
// Keep the classic Rise level equation and rank names (phase1.js / xp-store.js).
const RANKS=[[30,"S"],[20,"A"],[15,"B"],[10,"C"],[5,"D"],[1,"E"]];
export function verifiedLevelFor(points){
 const xp=Number(points);
 if(!Number.isFinite(xp))throw Error("El XP debe ser un número finito.");
 const level=Math.floor(Math.sqrt(Math.max(0,xp)/50))+1;
 const base=50*(level-1)**2,next=50*level*level;
 return {level,next,toNext:Math.max(0,next-xp),
  rank:(RANKS.find(([minimum])=>level>=minimum)||RANKS.at(-1))[1],
  percent:Math.max(0,Math.min(100,Math.round((xp-base)/(next-base)*100)))};
}

export function summarizeVerifiedXP(rows=[]){
 const sources=new Set();const events=[];let points=0,duplicates=0;
 for(const r of rows){
  if(r.record_type!=="xp_event")continue;
  const p=r.payload||{},source=String(p.sourceId||r.id||"");
  if(!source||sources.has(source)){duplicates++;continue;}
  sources.add(source);
  const value=Number(p.points);
  if(!Number.isFinite(value)){continue;}
  events.push({id:r.id,sourceId:source,date:String(p.date||r.occurred_at||""),kind:String(p.kind||"Acción registrada"),points:value});
  points+=value;
 }
 events.sort((a,b)=>b.date.localeCompare(a.date));
 return {events,points,duplicates,sourceCount:sources.size,progress:verifiedLevelFor(points)};
}
export async function loadVerifiedXP(client,uid){
 if(!client||!uid)throw Error("Inicia sesión para acceder a Quest.");
 const {data,error}=await client.from("hub_records")
  .select("id,owner_id,record_type,occurred_at,payload").eq("owner_id",uid)
  .eq("record_type","xp_event").order("occurred_at",{ascending:false}).limit(2000);
 if(error)throw Error("No se pudo consultar la experiencia verificada.");
 return summarizeVerifiedXP(data||[]);
}
