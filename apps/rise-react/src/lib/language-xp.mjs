// Owner-scoped display of SelfLearn XP; deliberately NOT added to global Quest XP.
export function summarizeLanguageXP(rows=[]){
 const keys=new Set();let points=0,duplicates=0;
 const events=[];
 for(const r of rows){
  if(r.record_type!=="renzo_event")continue;
  const p=r.payload||{};
  if(p.kind!=="learning"||!["nl","en"].includes(p.course)||!p.courseLessonId)continue;
  const key=p.course+"|"+p.courseLessonId;
  if(keys.has(key)){duplicates++;continue;}
  const xp=Number(p.xp);
  if(!Number.isFinite(xp)||xp<0||xp>50000)continue;
  keys.add(key);points+=xp;
  events.push({id:r.id,course:p.course,lesson:String(p.courseLessonId),date:String(p.date||r.occurred_at||""),xp});
 }
 events.sort((a,b)=>b.date.localeCompare(a.date));
 return {points,events,duplicates,lessonCount:events.length};
}
export async function loadLanguageXP(client,uid){
 if(!client?.from||!uid)throw Error("Sesión requerida.");
 const rows=[];
 for(let offset=0;offset<5000;offset+=400){
  const {data,error}=await client.from("hub_records").select("id,owner_id,record_type,occurred_at,payload")
   .eq("owner_id",uid).eq("record_type","renzo_event").order("occurred_at",{ascending:false})
   .range(offset,offset+399);
  if(error)throw Error("No se pudieron cargar los eventos de idiomas.");
  rows.push(...(data||[]));
  if((data||[]).length<400)return summarizeLanguageXP(rows);
 }
 throw Error("Historial de idiomas demasiado grande; no se mostrará un total incompleto.");
}
