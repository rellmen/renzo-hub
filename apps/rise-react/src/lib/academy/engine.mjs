// Rise Academia +25 · lógica pura (sin red): plan del día, dominio por habilidad, repasos y simulacros.
// Nunca inventa progreso: todo se deriva de filas reales devueltas por Supabase.

export const BANDS=[{min:80,id:"dominio",label:"Dominio provisional"},{min:60,id:"practica",label:"Más práctica"},{min:0,id:"rescate",label:"Rescate de prerrequisitos"}];
export const REVIEW_DAYS=[1,3,7,14,30,60];
export const SESSION_OPTIONS=[15,25,45,60];
const DAY=86400000;

export function bandFor(pct){
  if(typeof pct!=="number"||!Number.isFinite(pct))return null;
  return BANDS.find(b=>pct>=b.min)||BANDS[BANDS.length-1];
}

/** Días naturales que faltan (en la zona horaria del dispositivo) hasta una fecha YYYY-MM-DD. */
export function daysUntil(isoDate,now=new Date()){
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoDate||""));
  if(!m)return null;
  const target=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  return Math.round((target.getTime()-today.getTime())/DAY);
}

export function flattenLessons(catalog){
  const out=[];
  for(const c of catalog?.courses||[])for(const m of c.modules||[])for(const l of m.lessons||[])
    out.push({...l,course:c.slug,course_title:c.title,module:m.id,module_title:m.title,role:c.role});
  return out;
}

export function progressMap(rows){
  const map=new Map();
  for(const r of rows||[])if(r&&typeof r.lesson_id==="string")map.set(r.lesson_id,r);
  return map;
}

/** Una lección está disponible si existe contenido y (en modo normal) ya está publicada; en modo revisión, también borradores. */
export function lessonVisible(lesson,{showDrafts=false}={}){
  if(!lesson?.has_content)return false;
  if(lesson.status==="published")return true;
  return !!showDrafts;
}

export function prerequisitesMet(lesson,progress){
  return (lesson.prerequisites||[]).every(id=>{const p=progress.get(id);return p&&(p.status==="completed"||p.status==="mastered");});
}

/** Siguiente lección por curso: la primera no completada, visible, en orden de catálogo. Indica si le faltan prerrequisitos. */
export function nextLessonFor(catalog,courseSlug,progress,opts={}){
  const lessons=flattenLessons(catalog).filter(l=>l.course===courseSlug);
  for(const l of lessons){
    const p=progress.get(l.id);
    if(p&&(p.status==="completed"||p.status==="mastered"))continue;
    if(!lessonVisible(l,opts))continue;
    return {lesson:l,inProgress:!!p,missingPrereqs:(l.prerequisites||[]).filter(id=>{const q=progress.get(id);return !(q&&(q.status==="completed"||q.status==="mastered"));})};
  }
  return null;
}

export function dueReviews(reviews,now=new Date()){
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
  return (reviews||[]).filter(r=>{
    const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(r?.due_on||""));
    return m&&new Date(Number(m[1]),Number(m[2])-1,Number(m[3])).getTime()<=today;
  }).sort((a,b)=>String(a.due_on).localeCompare(String(b.due_on)));
}

/** Reparto semanal de referencia del PLAN_24_SEMANAS (10 h): matemáticas 4, específica 2, castellano 1,5, comentario 1, inglés 1, repaso 0,5. */
export const WEEKLY_SPLIT={matematicas:0.40,especifica:0.20,castellano:0.15,comentario:0.10,ingles:0.10,repaso:0.05};
export function weeklyPlan(weeklyMinutes,elective="fisica"){
  const total=Math.max(30,Math.min(4000,Math.round(Number(weeklyMinutes)||600)));
  const rows=[["matematicas","Matemáticas",WEEKLY_SPLIT.matematicas],[elective,elective==="fisica"?"Física":"Economía de la Empresa",WEEKLY_SPLIT.especifica],
    ["castellano","Lengua castellana",WEEKLY_SPLIT.castellano],["comentario","Comentario de texto",WEEKLY_SPLIT.comentario],
    ["ingles","Inglés",WEEKLY_SPLIT.ingles],["repaso","Repaso espaciado",WEEKLY_SPLIT.repaso]];
  return rows.map(([id,label,share])=>({id,label,minutes:Math.round(total*share/5)*5}));
}

/** Prioridad explicable: peso de examen × ganancia esperada × impacto de prerrequisito × urgencia (PRD §4). */
export function priorityScore({examWeight=1,mastery=null,unlocks=0,dueOverdueDays=0}={}){
  const gain=mastery===null?1:Math.max(0.1,1-mastery/100);
  const impact=1+Math.min(unlocks,5)*0.1;
  const urgency=1+Math.min(Math.max(dueOverdueDays,0),14)/14;
  return Math.round(examWeight*gain*impact*urgency*1000)/1000;
}

/** Plan del día: repasos vencidos primero; después la siguiente lección de cada materia, ordenada por prioridad. Nunca oculta una materia obligatoria. */
export function todayPlan(catalog,{progressRows=[],reviews=[],attempts=[],prefs=null,now=new Date()}={}){
  const progress=progressMap(progressRows);
  const showDrafts=prefs?.show_drafts!==false;
  const elective=prefs?.elective==="economia"?"economia":"fisica";
  const courses=["matematicas",elective,"castellano","comentario","ingles"];
  const weights={matematicas:1.2,[elective]:1.0,castellano:1.0,comentario:1.0,ingles:1.0};
  const skills=skillMastery(attempts);
  const due=dueReviews(reviews,now).map(r=>({type:"review",lesson_id:r.lesson_id,due_on:r.due_on,step:r.step}));
  const next=[];const blocked=[];
  for(const c of courses){
    const n=nextLessonFor(catalog,c,progress,{showDrafts});
    if(!n){blocked.push({course:c,reason:"Sin lecciones disponibles: el contenido de esta materia aún no está redactado o publicado."});continue;}
    const lessonSkills=(n.lesson.skill_ids||[]).map(s=>skills.get(s)?.pct).filter(v=>typeof v==="number");
    const mastery=lessonSkills.length?lessonSkills.reduce((a,b)=>a+b,0)/lessonSkills.length:null;
    next.push({type:"lesson",course:c,lesson:n.lesson,inProgress:n.inProgress,missingPrereqs:n.missingPrereqs,
      priority:priorityScore({examWeight:weights[c]||1,mastery,unlocks:0})});
  }
  next.sort((a,b)=>b.priority-a.priority);
  return {due,next,blocked};
}

/** Dominio por habilidad: % de aciertos en los últimos 10 intentos de cada habilidad (excluye "no sé" del numerador, cuenta como fallo). */
export function skillMastery(attempts,{window=10}={}){
  const by=new Map();
  const sorted=[...(attempts||[])].sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
  for(const a of sorted)for(const s of a.skill_ids||[]){
    const e=by.get(s)||{skill:s,course:a.course,n:0,correct:0,last:a.created_at};
    if(e.n>=window)continue;
    e.n++;if(a.is_correct)e.correct++;by.set(s,e);
  }
  for(const e of by.values()){e.pct=Math.round(e.correct/e.n*100);e.band=bandFor(e.pct)?.id;}
  return by;
}

export function courseProgress(catalog,progressRows){
  const progress=progressMap(progressRows);
  return (catalog?.courses||[]).map(c=>{
    const lessons=c.modules.flatMap(m=>m.lessons);
    const done=lessons.filter(l=>{const p=progress.get(l.id);return p&&(p.status==="completed"||p.status==="mastered");}).length;
    const mastered=lessons.filter(l=>progress.get(l.id)?.status==="mastered").length;
    return {slug:c.slug,title:c.title,role:c.role,total:lessons.length,withContent:lessons.filter(l=>l.has_content).length,
      atStandard:lessons.filter(l=>l.meets_standard).length,done,mastered,pct:lessons.length?Math.round(done/lessons.length*100):0};
  });
}

/** Puntuación máxima de un perfil de simulacro según las secciones elegibles. */
export function profileMax(profile){
  let t=0;
  for(const s of profile?.sections||[]){
    if(typeof s.choose==="number"&&typeof s.points_each==="number")t+=s.choose*s.points_each;
    else if(typeof s.count==="number"&&typeof s.points_each==="number")t+=s.count*s.points_each;
    else if(typeof s.points==="number")t+=s.points;
  }
  return Math.round(t*100)/100;
}

/** Plantilla de casillas de autocorrección para un perfil: una por ítem elegido, con su máximo. */
export function profileSlots(profile){
  const slots=[];
  (profile?.sections||[]).forEach((s,i)=>{
    if(typeof s.choose==="number"&&typeof s.points_each==="number")for(let k=0;k<s.choose;k++)slots.push({id:`s${i}-${k}`,label:`${cap(s.label)} ${k+1} de ${s.choose} elegidas`,max:s.points_each});
    else if(typeof s.count==="number"&&typeof s.points_each==="number")for(let k=0;k<s.count;k++)slots.push({id:`s${i}-${k}`,label:`${cap(s.label)} ${k+1}`,max:s.points_each});
    else if(typeof s.points==="number")slots.push({id:`s${i}`,label:cap(s.label),max:s.points});
  });
  return slots;
}
const cap=s=>String(s||"").charAt(0).toUpperCase()+String(s||"").slice(1);

/** Suma acotada de puntuaciones de autocorrección; menos penalizaciones declaradas. Devuelve null si hay valores fuera de rango. */
export function scoreExam(profile,scores,penalty=0){
  const slots=profileSlots(profile);let total=0;
  for(const s of slots){
    const v=scores?.[s.id];
    if(v===undefined||v===null||v==="")continue;
    const n=Number(String(v).replace(",","."));
    if(!Number.isFinite(n)||n<0||n>s.max)return null;
    total+=n;
  }
  const p=Number(penalty)||0;
  if(p<0)return null;
  return Math.max(0,Math.round((total-p)*100)/100);
}

export function wordCount(text){
  return String(text||"").trim().split(/\s+/).filter(w=>/[\p{L}\p{N}]/u.test(w)).length;
}

export function newId(){
  if(typeof crypto!=="undefined"&&typeof crypto.randomUUID==="function")return crypto.randomUUID();
  // Fallback RFC4122 v4 (entornos sin randomUUID).
  const b=new Uint8Array(16);(globalThis.crypto||{getRandomValues:a=>{for(let i=0;i<a.length;i++)a[i]=Math.floor(Math.random()*256);return a;}}).getRandomValues(b);
  b[6]=(b[6]&0x0f)|0x40;b[8]=(b[8]&0x3f)|0x80;
  const h=[...b].map(x=>x.toString(16).padStart(2,"0")).join("");
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}

/** Entorno: Academia activa en staging/local; en producción solo con VITE_ENABLE_ACADEMY=true y backend instalado. */
export function academyEnvironmentAllowed({hostEnvironment=null,releaseTarget="",flag=false}={}){
  const target=releaseTarget==="preview"?"staging":releaseTarget||hostEnvironment;
  if(target==="production")return flag===true;
  return true;
}
