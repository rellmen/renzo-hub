// Career / DataLab · Roadmap del 24-10-2026, no altera Quest ni SelfLearn.
// Los avances son solo registros privados del usuario; no se acredita XP global.
export const PATH_VERSION="2026-10-24";
export const START_DAY="2026-10-26";
export const LAST_WEEK=23;
export const CHAPTERS=Object.freeze([
 {name:"Diagnóstico",subtitle:"26 oct – 22 nov 2026",detail:"Nivel de partida, álgebra, conceptos de empresa y comprensión.",color:"var(--learn)"},
 {name:"Fundamentos",subtitle:"23 nov – 20 dic 2026",detail:"Funciones, ecuaciones, porcentajes, costes y organización.",color:"var(--gold)"},
 {name:"Consolidar",subtitle:"21 dic – 17 ene 2027",detail:"Problemas, balances, rentabilidad y comentario semanal.",color:"var(--projects)"},
 {name:"Temario completo",subtitle:"18 ene – 14 feb 2027",detail:"Prácticas por tema y corrección de errores.",color:"var(--learn)"},
 {name:"Simulacros",subtitle:"15 feb – 14 mar 2027",detail:"Un simulacro por semana y análisis de resultados.",color:"var(--gold)"},
 {name:"Rendimiento",subtitle:"15 mar – 11 abr 2027",detail:"Dos simulacros semanales y repaso dirigido. Exámenes el 10 y 17 de abril.",color:"var(--projects)"}
]);
export const FUTURE_STAGES=Object.freeze([
 {year:"2026–27",name:"Acceso +25 / base SQL",detail:"UOC opción Ingeniería y Arquitectura, 10 y 17 abril de 2027. SQL, Excel, Power BI y Python."},
 {year:"2027",name:"Portfolio logístico",detail:"Inventory Control Tower (mar–jun); Exception Detector (jul–oct). Vía universitaria tras el resultado de abril."},
 {year:"2028",name:"Logistics Data Analyst",detail:"KPIs, SQL avanzado, forecasting, estadística y automatización. Buscar transición a un puesto de datos."},
 {year:"2029",name:"Data Engineering",detail:"Python, PostgreSQL, ETL/ELT, Git, APIs, pruebas y cloud; pipeline verificable."},
 {year:"2030",name:"AI Systems",detail:"ML aplicado, RAG, evaluación, permisos y aprobación humana antes de cambios."},
 {year:"2031–32",name:"Nodalys",detail:"Inventory Exception Assistant: validar un problema pagable, piloto y primeros clientes sin mezclar datos de RISE HUB."}
]);
const TOPICS=Object.freeze([
 ["Operaciones con enteros y orden","Tipos de empresa y recursos","Ortografía y acentuación","Identificar tema y tesis","Reading: idea general"],
 ["Fracciones, decimales y porcentajes","Costes fijos y variables","Categorías gramaticales","Identificar argumentos","Presente y pasado"],
 ["Ecuaciones lineales","Ingresos, costes y beneficio","Sujeto y predicado","Estructura del texto","Vocabulario de trabajo"],
 ["Problemas con porcentajes","Diagnóstico de balances sencillos","Concordancia","Primer comentario corregido","Writing breve"],
 ["Ecuaciones y sistemas 2×2","Organización empresarial","Clases de oraciones","Tema, tesis y síntesis","Reading y conectores"],
 ["Funciones: dominio y recorrido","Activo, pasivo y patrimonio","Complementos verbales","Argumentos y contraargumentos","Tiempos verbales"],
 ["Funciones lineales y cuadráticas","Balance de situación","Ortografía aplicada","Coherencia y cohesión","Vocabulario técnico"],
 ["Proporcionalidad y problemas","Ratios empresariales","Análisis sintáctico básico","Comentario cronometrado","Writing con corrección"],
 ["Problemas de funciones","Rentabilidad económica","Sintaxis: oración simple","Análisis de tesis","Comprensión de textos"],
 ["Álgebra combinada","Rentabilidad financiera","Subordinación básica","Argumentación","Uso correcto de tiempos"],
 ["Interpretación de gráficos","Punto de equilibrio","Puntuación","Comentario semanal","Transformación de frases"],
 ["Problemas mixtos con tiempo","Costes y financiación","Análisis lingüístico","Comentario con rúbrica","Simulacro corto de inglés"],
 ["Ejercicios oficiales: ecuaciones","Supuestos de balances","Gramática de examen","Tesis y estructura","Reading cronometrado"],
 ["Ejercicios oficiales: funciones","Supuestos de financiación","Ortografía de examen","Comentario corregido","Writing estructurado"],
 ["Problemas de examen con explicación","Ratios y decisiones empresariales","Sintaxis de examen","Comparar dos tesis","Errores frecuentes de inglés"],
 ["Examen por temas débiles","Economía por temas débiles","Prueba de lengua","Comentario cronometrado","Prueba de inglés"],
 ["Simulacro de fase específica","Corrección de economía","Corrección de castellano","Comentario con rúbrica","Reading + writing"],
 ["Simulacro de fase general","Balances y ratios bajo tiempo","Revisión de errores","Comentario con tiempo","Gramática aplicada"],
 ["Simulacro alterno cronometrado","Financiación y costes","Lengua y ortografía","Tesis sin ayuda","Comprensión de examen"],
 ["Simulacro alterno cronometrado","Corrección y hoja de fallos","Prueba de castellano","Comentario semanal","Writing de examen"],
 ["Dos simulacros: foco matemáticas","Ejercicios incorrectos","Ortografía y sintaxis","Comentario bajo tiempo","Reading de examen"],
 ["Dos simulacros: foco economía","Ratios y balances","Ejercicios incorrectos","Argumentación","Correcciones de inglés"],
 ["Dos simulacros con rúbrica","Prioridad 3 fallos","Prioridad 3 fallos","Estructura final","Writing final"],
 ["Repaso ligero y examen general","Repaso de fórmulas y balances","Últimos errores","Síntesis y tesis","Repaso y examen general"]
]);
const PATTERN=Object.freeze([
 {day:0,key:"math_a",subject:"Matemáticas",minutes:90,source:"math",action:"Estudiar y resolver ejercicios"},
 {day:1,key:"economy_a",subject:"Economía",minutes:90,source:"economy",action:"Estudiar y resolver un caso"},
 {day:2,key:"math_b",subject:"Matemáticas",minutes:90,source:"math",action:"Practicar sin mirar soluciones"},
 {day:3,key:"spanish_a",subject:"Castellano",minutes:90,source:"spanish",action:"Estudiar y corregir ejercicios"},
 {day:5,key:"economy_b",subject:"Economía",minutes:90,source:"economy",action:"Practicar con ejemplos"},
 {day:5,key:"commentary",subject:"Comentario de texto",minutes:90,source:"comment",action:"Redactar y corregir un comentario"},
 {day:5,key:"english_a",subject:"Inglés",minutes:30,source:"english",action:"Repasar vocabulario y gramática"},
 {day:6,key:"math_c",subject:"Matemáticas",minutes:60,source:"math",action:"Resolver problemas y explicar errores"},
 {day:6,key:"spanish_b",subject:"Castellano",minutes:30,source:"spanish",action:"Repasar errores de lengua"},
 {day:6,key:"english_b",subject:"Inglés",minutes:60,source:"english",action:"Leer, escribir y autocorregir"},
 {day:6,key:"review",subject:"Revisión semanal",minutes:30,source:"review",action:"Mini test y registro de errores"}
]);
const LABEL_KEYS=Object.freeze({math:0,economy:1,spanish:2,comment:3,english:4});
export function dayOffset(day,n){if(!/^\d{4}-\d{2}-\d{2}$/.test(day))throw Error("Fecha inválida");const d=new Date(day+"T12:00:00Z");if(Number.isNaN(d.getTime()))throw Error("Fecha inválida");d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export function localDate(d=new Date()){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
export function weekForDate(day){const t=Date.parse(day+"T12:00:00Z");if(!Number.isFinite(t))return 0;return Math.max(0,Math.min(LAST_WEEK,Math.floor((t-Date.parse(START_DAY+"T12:00:00Z"))/604800000)));}
export function weekStart(week){if(!Number.isInteger(week)||week<0||week>LAST_WEEK)throw Error("Semana inválida");return dayOffset(START_DAY,week*7);}
export function tasksForWeek(week){
 const start=weekStart(week),chapter=Math.floor(week/4),topics=TOPICS[week];
 return PATTERN.map(p=>{
  const topic=p.source==="review"?"Anotar nota, tiempo, aciertos y tres errores prioritarios":topics[LABEL_KEYS[p.source]];
  return {id:"w"+String(week+1).padStart(2,"0")+"-"+p.key,day:dayOffset(start,p.day),weekday:p.day,subject:p.subject,minutes:p.minutes,
   title:p.action,detail:topic,chapter,week};
 });
}
export function allTasks(){return Array.from({length:24},(_,w)=>tasksForWeek(w)).flat();}
export function pathMetrics(rows=[]){
 const completed=new Set(rows.filter(r=>r?.status==="completed"&&typeof r?.payload?.taskId==="string").map(r=>r.payload.taskId));
 const full=allTasks(),valid=full.filter(t=>completed.has(t.id));
 const weeks=Array.from({length:24},(_,w)=>{const items=tasksForWeek(w);return items.every(t=>completed.has(t.id));}).filter(Boolean).length;
 return {done:valid.length,total:full.length,percent:Math.round(valid.length*100/full.length),completeWeeks:weeks};
}
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function owner(uid){if(!UUID.test(uid||""))throw Error("Inicia sesión para guardar tu progreso.");return uid;}
async function stableTaskId(uid,taskId){
 const bytes=new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256",new TextEncoder().encode("rise-career-v1:"+uid+":"+taskId)));
 const id=bytes.slice(0,16);id[6]=(id[6]&15)|80;id[8]=(id[8]&63)|128;
 const hex=[...id].map(b=>b.toString(16).padStart(2,"0")).join("");
 return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join("-");
}
export async function loadPathProgress(client,uid){
 const id=owner(uid),rows=[];
 for(let start=0;start<1200;start+=400){
  const {data,error}=await client.from("hub_records").select("id,owner_id,record_type,domain,status,payload,updated_at")
   .eq("owner_id",id).eq("domain","work").eq("record_type","career_path_tick").order("id").range(start,start+399);
  if(error||!Array.isArray(data))throw Error("No se pudo recuperar el progreso de Career.");
  if(data.some(r=>r.owner_id!==id))throw Error("Respuesta de otra cuenta rechazada.");
  rows.push(...data);if(data.length<400)return rows;
 }
 throw Error("El historial supera el límite esperado. No se mostrarán datos parciales.");
}
export async function setPathTask(client,uid,task,done,oldRow){
 const id=owner(uid),valid=allTasks().find(t=>t.id===task?.id);
 if(!valid||valid.day!==task.day)throw Error("La tarea no pertenece al roadmap.");
 if(valid.day>localDate())throw Error("Todavía no ha llegado la fecha de esta misión.");
 if(oldRow){
  if(oldRow.owner_id!==id||!oldRow.updated_at)throw Error("Actualiza el progreso antes de editar.");
  if((oldRow.status==="completed")===done)return oldRow;
  const {data,error}=await client.from("hub_records").update({status:done?"completed":"open",
   payload:{...oldRow.payload,taskId:valid.id,plannedDay:valid.day,minutes:valid.minutes,roadmapVersion:PATH_VERSION,confirmedAt:done?new Date().toISOString():null}})
   .eq("id",oldRow.id).eq("owner_id",id).eq("domain","work").eq("record_type","career_path_tick")
   .eq("updated_at",oldRow.updated_at).select("id,owner_id,status,payload,updated_at").maybeSingle();
  if(error)throw Error("No se pudo guardar la misión.");
  if(!data)throw Error("La misión cambió en otra sesión. Actualiza y vuelve a intentarlo.");
  return data;
 }
 if(!done)return null;
 const rowId=await stableTaskId(id,valid.id);
 const {data,error}=await client.from("hub_records").insert({id:rowId,owner_id:id,domain:"work",record_type:"career_path_tick",title:valid.subject+" · "+valid.title,
  status:"completed",source:"manual",occurred_at:new Date().toISOString(),payload:{taskId:valid.id,plannedDay:valid.day,minutes:valid.minutes,
  roadmapVersion:PATH_VERSION,confirmedAt:new Date().toISOString()}}).select("id,owner_id,status,payload,updated_at").single();
 if(error||!data)throw Error(error?.code==="23505"?"Esta misión ya se guardó en otra sesión. Actualiza.":"No se pudo guardar la misión. Inténtalo de nuevo.");
 return data;
}
