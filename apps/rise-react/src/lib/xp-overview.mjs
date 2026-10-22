// Read-only, owner-scoped XP registry. Never award XP from a UI render.
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
 return {events,points,duplicates,sourceCount:sources.size};
}
export async function loadVerifiedXP(client,uid){
 if(!client||!uid)throw Error("Inicia sesión para acceder a Quest.");
 const {data,error}=await client.from("hub_records")
  .select("id,owner_id,record_type,occurred_at,payload").eq("owner_id",uid)
  .eq("record_type","xp_event").order("occurred_at",{ascending:false}).limit(2000);
 if(error)throw Error("No se pudo consultar la experiencia verificada.");
 return summarizeVerifiedXP(data||[]);
}
