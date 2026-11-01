// Rise · Roadmap maestro 2026–2032 (v1.0, 24-10-2026) convertido en tareas y subtareas.
// Estructura: Etapas (2026–2032) → Fases PAU (6) → Semanas (24) → Tareas (sesiones) → Subtareas (pasos)
// + Hitos con fecha límite (ASML, 90 días, universidad, portfolio), también con subtareas.
// Los avances son registros privados (hub_records · domain=work · record_type=career_path_tick).
// No acredita XP ni da por hechos resultados: solo lo que marcas tú o lo que Academia ya registró.
export const PATH_VERSION="2026-10-24";
export const START_DAY="2026-10-26";
export const LAST_WEEK=23;
export const DIRECTION=Object.freeze(["DHL/ASML (operaciones)","Logistics Data Analyst","Data Engineer","AI Systems Engineer","Nodalys (SaaS B2B)"]);

// Ruta decidida por Renzo el 01-11-2026 (opción 2): prueba +25 común de Cataluña (Generalitat, presencial),
// opción E Ingeniería y Arquitectura con Matemáticas + Economía de la Empresa, y Llengua catalana en la
// fase general. La prueba en español de la UOC no admite Economía en Ingeniería (solo Física, Matemáticas,
// Química). Física queda como complementaria. La semana 1 (26 oct–1 nov) conserva el plan anterior.
export const EXAM_ROUTE=Object.freeze({id:"cat-pau25-2027",label:"PAU +25 de Cataluña (presencial)",decidedOn:"2026-11-01",
 source:"https://universitats.gencat.cat/ca/proves-majors/25-anys/"});
export const SPECIFIC_SUBJECTS=Object.freeze(["Matemáticas","Economía de la Empresa"]);
export const GENERAL_SUBJECTS=Object.freeze(["Comentario de texto","Lengua catalana","Lengua castellana","Inglés"]);
/** Primera semana (índice) con el plan de la opción 2. */
export const ROUTE_SWITCH_WEEK=1;

const RULE_ERRORS="Anotar errores: concepto, cálculo, lectura o tiempo";
const STEPS=Object.freeze({
 math:[{id:"leccion",label:"Lección de Matemáticas en Academia",auto:"matematicas"},{id:"practica",label:"Ejercicios sin mirar la solución"},{id:"errores",label:RULE_ERRORS}],
 physics:[{id:"leccion",label:"Lección de Física en Academia",auto:"fisica"},{id:"practica",label:"Problemas con unidades y dibujo"},{id:"errores",label:RULE_ERRORS}],
 economy:[{id:"leccion",label:"Lección de Economía en Academia",auto:"economia"},{id:"practica",label:"Ejercicios con cifras, sin mirar la solución"},{id:"errores",label:RULE_ERRORS}],
 catalan:[{id:"estudiar",label:"Estudiar el tema de catalán"},{id:"practica",label:"Ejercicios o texto corregido"},{id:"errores",label:"Anotar errores de catalán"}],
 spanish:[{id:"leccion",label:"Lección de Castellano en Academia",auto:"castellano"},{id:"practica",label:"Ejercicios corregidos"},{id:"errores",label:"Anotar errores de lengua"}],
 comment:[{id:"leer",label:"Leer el texto y marcar tema y tesis"},{id:"redactar",label:"Redactar el comentario"},{id:"corregir",label:"Corregir con la rúbrica"}],
 english:[{id:"vocab",label:"Vocabulario y gramática"},{id:"practica",label:"Reading o writing"},{id:"corregir",label:"Autocorregir y anotar fallos"}],
 review:[{id:"test",label:"Mini test de 30 min"},{id:"nota",label:"Anotar nota, tiempo y aciertos"},{id:"errores",label:"Elegir 3 errores prioritarios"}],
 boss:[{id:"presentado",label:"Me he presentado al examen"},{id:"sensaciones",label:"Anotar sensaciones y dudas al salir"}],
});

export const BOSSES=Object.freeze([
 {id:"boss-general-2027",kind:"exam",day:"2027-04-10",weekday:5,subject:"Fase general PAU +25",source:"boss",minutes:0,title:"Examen de la fase general",detail:"Comentario de texto, Catalán, Castellano e Inglés, presencial en Cataluña. Marcar solo después de presentarte.",chapter:5,week:23,steps:STEPS.boss},
 {id:"boss-specific-2027",kind:"exam",day:"2027-04-17",weekday:5,subject:"Fase específica PAU +25",source:"boss",minutes:0,title:"Examen de Matemáticas y Economía de la Empresa",detail:"Registra tus resultados cuando sean oficiales, sin dar por hecho el aprobado.",chapter:5,week:23,steps:STEPS.boss}
]);
export const CHAPTERS=Object.freeze([
 {name:"Diagnóstico",subtitle:"26 oct – 22 nov 2026",detail:"Diagnóstico en las 6 materias, aritmética y álgebra desde cero, empresa y porcentajes, ortografía catalana, comprensión."},
 {name:"Fundamentos",subtitle:"23 nov – 20 dic 2026",detail:"Funciones, ecuaciones, porcentajes; balance, PyG y análisis financiero; pronombres y verbos en catalán."},
 {name:"Consolidar",subtitle:"21 dic – 17 ene 2027",detail:"Problemas, financiación e inversiones (VAN, TIR), 1 texto por semana."},
 {name:"Temario completo",subtitle:"18 ene – 14 feb 2027",detail:"Completar temarios y ejercicios tipo examen; corregir errores."},
 {name:"Simulacros",subtitle:"15 feb – 14 mar 2027",detail:"Simulacros semanales y gestión del tiempo."},
 {name:"Rendimiento",subtitle:"15 mar – 17 abr 2027",detail:"2 simulacros por semana. General el 10/04, repaso 12–16/04, específica el 17/04."}
]);
export const FUTURE_STAGES=Object.freeze([
 {year:"2026–27",name:"Base analítica + PAU +25",detail:"Excel avanzado, SQL (JOIN, CTE, ventanas), Power BI, Python/pandas.",deliverable:"SQL reproducible + modelo de datos + dashboard de inventario."},
 {year:"2027",name:"Portfolio logístico",detail:"Inventory Control Tower (mar–jun) y Exception Detector (jul–oct). Universidad según resultado de abril.",deliverable:"Repositorio GitHub, README en inglés, demo y 3 conclusiones por proyecto."},
 {year:"2028",name:"Logistics Data Analyst",detail:"KPI, estadística, forecasting sencillo, calidad de datos, análisis de causas, automatización de informes.",deliverable:"Entrar en un rol de datos logísticos."},
 {year:"2029",name:"Data Engineering",detail:"Python modular, PostgreSQL, ETL/ELT, Git, APIs, tests, cloud.",deliverable:"Pipeline versionado, monitorizado y probado."},
 {year:"2030",name:"IA aplicada",detail:"ML, embeddings, RAG, APIs, seguridad, evaluación, agentes con límites y aprobación humana.",deliverable:"Asistente trazable, seguro y evaluado."},
 {year:"2031–32",name:"Nodalys",detail:"Multi-tenant, billing, métricas, observabilidad, privacidad, ventas B2B.",deliverable:"Uso real y retención validados; primer cliente de pago (objetivo 2029)."}
]);

// Hitos con fecha límite. Se pueden marcar en cualquier momento (son plazos, no sesiones).
export const MILESTONES=Object.freeze([
 {id:"h-tablero",group:"Próximos 90 días",due:"2026-11-24",title:"Tablero de estudio y registro de errores",detail:"Días 1–30.",steps:[{id:"tablero",label:"Usar este roadmap como tablero"},{id:"registro",label:"Crear el registro de errores (concepto, cálculo, lectura, tiempo)"}]},
 {id:"h-examenes",group:"Próximos 90 días",due:"2026-11-24",title:"Recopilar exámenes oficiales",detail:"2024 y 2025 con corrección; los de 2026 no se abren hasta el simulacro final.",steps:[{id:"mat",label:"Matemáticas"},{id:"eco",label:"Economía de la Empresa"},{id:"cat",label:"Llengua catalana"},{id:"gen",label:"Comentario, Castellano e Inglés"}]},
 {id:"h-sql10",group:"Próximos 90 días",due:"2026-12-24",title:"10 consultas SQL con datos ficticios",detail:"Hasta 2 h por semana solo si queda energía tras la PAU.",steps:[{id:"q1",label:"Consultas 1–3: SELECT, WHERE, GROUP BY"},{id:"q2",label:"Consultas 4–7: JOIN"},{id:"q3",label:"Consultas 8–10: CTE y ventanas"}]},
 {id:"h-asml",group:"Trabajo",due:"2026-12-31",title:"Confirmación escrita del scope ASML",detail:"No dar por garantizados salario ni contratación.",steps:[{id:"pedir",label:"Pedir la confirmación por escrito"},{id:"datos",label:"Contrato, salario, funciones, horario y fecha"},{id:"guardar",label:"Guardar la respuesta"}]},
 {id:"h-dia90",group:"Próximos 90 días",due:"2027-01-22",title:"Revisión del día 90",detail:"KPI: ≥80 % de sesiones, ≥2 simulacros, resultado ASML documentado, SQL demostrado.",steps:[{id:"simulacros",label:"Primer simulacro de cada fase"},{id:"debilidades",label:"Identificar 3 debilidades"},{id:"laboral",label:"Decidir estrategia laboral según ASML"},{id:"medir",label:"Medir avance frente al KPI"}]},
 {id:"h-busqueda",group:"Trabajo",due:"2027-01-31",title:"Plan B laboral si ASML no confirma",detail:"Buscar sin renunciar: Inventory Analyst, Logistics Reporting, Stock/Master Data, Junior Logistics Data Analyst. No dejar ingresos sin contrato y colchón.",steps:[{id:"cv",label:"CV con Excel, SQL, Power BI y SAP"},{id:"lista",label:"Lista de 10 ofertas objetivo"},{id:"aplicar",label:"Primeras candidaturas"}]},
 {id:"h-viaje",group:"Universidad",due:"2027-01-31",title:"Reservar el viaje a Cataluña para los exámenes",detail:"La prueba es presencial: sábados 10 y 17 de abril de 2027. Decidir dos viajes o una semana allí; la sede exacta sale en el resguardo de matrícula.",steps:[{id:"plan",label:"Elegir dos viajes o una estancia"},{id:"vacaciones",label:"Pedir los días libres en el trabajo"},{id:"reservar",label:"Reservar transporte y alojamiento"}]},
 {id:"h-inscripcion",group:"Universidad",due:"2027-02-15",title:"Matrícula PAU +25 en el Portal d'Accés",detail:"Plazo en febrero (en 2026 fue del 19 al 26). Confirmar fechas 2027 antes de actuar; tasas 2026: 41,30 € + 68,70 €.",steps:[{id:"convocatoria",label:"Leer la convocatoria 2027"},{id:"materias",label:"Opción E: Matemáticas + Economía de la Empresa; inglés como lengua extranjera"},{id:"inscribir",label:"Matricularme, pagar y guardar el resguardo con la sede"}]},
 {id:"h-ict",group:"Portfolio",due:"2027-06-30",title:"Inventory Control Tower",detail:"SQL + Power BI: exactitud, stock negativo, antigüedad, discrepancias, rotación. Solo datos ficticios.",steps:[{id:"sql",label:"Consultas SQL verificables"},{id:"dashboard",label:"Dashboard Power BI"},{id:"readme",label:"README en inglés con 3 conclusiones"},{id:"publicar",label:"Publicar en GitHub con capturas"}]},
 {id:"h-matricula",group:"Universidad",due:"2027-10-15",title:"Matrícula universitaria",detail:"Si apruebas: UOC Ingeniería Informática (1–2 asignaturas al empezar). Si no: Open University R88. Reconfirmar condiciones antes de pagar.",steps:[{id:"resultado",label:"Resultado oficial de la PAU"},{id:"programa",label:"Confirmar programa y tasas"},{id:"matricula",label:"Matricularme"}]},
 {id:"h-detector",group:"Portfolio",due:"2027-10-31",title:"Exception Detector",detail:"Python + PostgreSQL + CSV/ETL: ubicaciones anómalas, duplicados, movimientos incoherentes.",steps:[{id:"etl",label:"ETL de CSV a PostgreSQL"},{id:"reglas",label:"Reglas de detección con tests"},{id:"alertas",label:"Registro de errores y alertas"},{id:"readme",label:"README en inglés y demo"}]},
 {id:"h-nodalys10",group:"Nodalys",due:"2027-12-31",title:"10 entrevistas a responsables logísticos",detail:"Encontrar 1 problema repetido y cuantificable. Sin mezclar datos con Rise.",steps:[{id:"lista",label:"Lista de contactos"},{id:"entrevistas",label:"10 entrevistas hechas"},{id:"problema",label:"1 problema cuantificado"}]},
]);

const MATH=["Operaciones con enteros y orden","Fracciones, decimales y porcentajes","Ecuaciones lineales","Problemas con porcentajes","Ecuaciones y sistemas 2×2","Funciones: dominio y recorrido","Funciones lineales y cuadráticas","Proporcionalidad y problemas","Problemas de funciones","Álgebra combinada","Interpretación de gráficos","Problemas mixtos con tiempo","Ejercicios oficiales: ecuaciones","Ejercicios oficiales: funciones","Problemas de examen con explicación","Examen por temas débiles","Simulacro de fase específica","Derivadas e integrales de examen","Simulacro alterno cronometrado","Simulacro alterno cronometrado","Dos simulacros: foco matemáticas","Ejercicios incorrectos","Dos simulacros con rúbrica","Repaso ligero"];
const PHYSICS=["F00 Unidades y notación científica","F01 Magnitudes y vectores","F01 Componentes de vectores","F02 Cinemática: MRU y MRUA","F02 Caída libre y gráficas","F02 Movimiento en el plano","F03 Leyes de Newton","F03 Rozamiento y planos inclinados","F03 Problemas de dinámica","F04 Trabajo y energía","F04 Momento lineal y choques","F05 Gravitación","F06 Ondas","F07 Electrostática","F08 Corriente y circuitos","F09 Magnetismo e inducción","Física: examen 2024 por temas","Física: examen 2025 cronometrado","Corrección y hoja de fallos de física","Física bajo tiempo","Dos simulacros: foco física","Ejercicios incorrectos de física","Prioridad: 3 fallos de física","Repaso de fórmulas de física"];
const SPANISH=["Ortografía y acentuación","Categorías gramaticales","Sujeto y predicado","Concordancia","Clases de oraciones","Complementos verbales","Ortografía aplicada","Análisis sintáctico básico","Sintaxis: oración simple","Subordinación básica","Puntuación","Análisis lingüístico","Gramática de examen","Ortografía de examen","Sintaxis de examen","Prueba de lengua","Corrección de castellano","Revisión de errores","Lengua y ortografía","Prueba de castellano","Ortografía y sintaxis","Ejercicios incorrectos","Prioridad: 3 fallos","Últimos errores"];
const COMMENT=["Identificar tema y tesis","Identificar argumentos","Estructura del texto","Primer comentario corregido","Tema, tesis y síntesis","Argumentos y contraargumentos","Coherencia y cohesión","Comentario cronometrado","Análisis de tesis","Argumentación","Comentario semanal","Comentario con rúbrica","Tesis y estructura","Comentario corregido","Comparar dos tesis","Comentario cronometrado","Comentario con rúbrica","Comentario con tiempo","Tesis sin ayuda","Comentario semanal","Comentario bajo tiempo","Argumentación","Estructura final","Síntesis y tesis"];
const ENGLISH=["Reading: idea general","Presente y pasado","Vocabulario de trabajo","Writing breve","Reading y conectores","Tiempos verbales","Vocabulario técnico","Writing con corrección","Comprensión de textos","Uso correcto de tiempos","Transformación de frases","Simulacro corto de inglés","Reading cronometrado","Writing estructurado","Errores frecuentes de inglés","Prueba de inglés","Reading + writing","Gramática aplicada","Comprensión de examen","Writing de examen","Reading de examen","Correcciones de inglés","Writing final","Repaso y examen general"];
// Economía: sigue las lecciones B00–B09 de Academia; semanas finales, exámenes tipo y simulacros.
const ECONOMY=["—","B00 Porcentajes y regla de tres","B01 La empresa y formas jurídicas","B01 Grupos de interés y objetivos","B02 Patrimonio y balance",
 "B02 Cuenta de pérdidas y ganancias","B02 Balance y PyG: ejercicios","B03 Fondo de maniobra y periodo de maduración","B03 Ratios y rentabilidades",
 "B03 Análisis completo de estados","B04 Recursos propios y ajenos","B04 Leasing, factoring, renting y amortizaciones","B05 Flujos de caja y payback",
 "B05 VAN y TIR","B06 DAFO, cadena de valor y ventaja competitiva","B06 Localización, dimensión y crecimiento","B07 Estudio de mercado y marketing mix",
 "B07 Punto muerto y viabilidad","B08 Examen tipo: elegir 4 de 5","Simulacro de Economía cronometrado","Repaso de errores: análisis financiero",
 "Simulacro de Economía cronometrado","Repaso de errores: inversiones y punto muerto","Simulacro final de Economía"];
// Catalán: bloques habituales de la prueba de lengua (sin lecciones en Academia todavía).
const CATALAN=["—","Diagnòstic: comprensió lectora","Ortografia: accentuació i dièresi","Ortografia: s/ss/c/ç/z","Ortografia: b/v, g/j, h",
 "Morfologia: articles, contraccions i apòstrof","Pronoms febles (I)","Pronoms febles (II)","Morfologia verbal: present i passat",
 "Morfologia verbal: subjuntiu i imperatiu","Sintaxi: concordança i preposicions","Lèxic: barbarismes i castellanismes","Comprensió lectora: idea principal",
 "Expressió escrita: text breu","Pronoms febles (repàs)","Connectors i cohesió","Expressió escrita amb correcció","Comprensió i vocabulari",
 "Model d'examen 2024","Model d'examen 2025","Repàs d'errors d'ortografia","Model d'examen cronometrat","Repàs de pronoms i verbs","Simulacre final de català"];
const TOPICS=Object.freeze({math:MATH,physics:PHYSICS,economy:ECONOMY,catalan:CATALAN,spanish:SPANISH,comment:COMMENT,english:ENGLISH});

// Semana tipo de la ruta anterior (12 h + 30 min), solo para la semana 1: lunes=0 … domingo=6. Viernes libre.
const PATTERN_V1=Object.freeze([
 {day:0,key:"math_a",subject:"Matemáticas",minutes:90,source:"math",action:"Estudiar y resolver ejercicios"},
 {day:1,key:"physics_a",subject:"Física",minutes:90,source:"physics",action:"Estudiar y resolver problemas"},
 {day:2,key:"math_b",subject:"Matemáticas",minutes:90,source:"math",action:"Practicar sin mirar soluciones"},
 {day:3,key:"spanish_a",subject:"Castellano",minutes:90,source:"spanish",action:"Estudiar y corregir ejercicios"},
 {day:5,key:"physics_b",subject:"Física",minutes:90,source:"physics",action:"Practicar problemas tipo examen"},
 {day:5,key:"commentary",subject:"Comentario de texto",minutes:90,source:"comment",action:"Redactar y corregir un comentario"},
 {day:5,key:"english_a",subject:"Inglés",minutes:30,source:"english",action:"Repasar vocabulario y gramática"},
 {day:6,key:"math_c",subject:"Matemáticas",minutes:60,source:"math",action:"Resolver problemas y explicar errores"},
 {day:6,key:"spanish_b",subject:"Castellano",minutes:30,source:"spanish",action:"Repasar errores de lengua"},
 {day:6,key:"english_b",subject:"Inglés",minutes:60,source:"english",action:"Leer, escribir y autocorregir"},
 {day:6,key:"review",subject:"Revisión semanal",minutes:30,source:"review",action:"Mini test y registro de errores"}
]);
// Semana tipo de la opción 2 (13 h): pesos por nota. Las específicas valen la mitad de la nota final
// (Matemáticas 3 h 30, Economía 3 h); cada examen de la general vale 1/8 (1 h 30 cada uno). Viernes libre.
const PATTERN_V2=Object.freeze([
 {day:0,key:"math_a",subject:"Matemáticas",minutes:90,source:"math",action:"Estudiar y resolver ejercicios"},
 {day:1,key:"economy_a",subject:"Economía de la Empresa",minutes:90,source:"economy",action:"Estudiar y resolver ejercicios"},
 {day:2,key:"math_b",subject:"Matemáticas",minutes:60,source:"math",action:"Practicar sin mirar soluciones"},
 {day:2,key:"catalan_a",subject:"Lengua catalana",minutes:30,source:"catalan",action:"Estudiar el tema y hacer ejercicios"},
 {day:3,key:"spanish_a",subject:"Castellano",minutes:60,source:"spanish",action:"Estudiar y corregir ejercicios"},
 {day:3,key:"catalan_b",subject:"Lengua catalana",minutes:30,source:"catalan",action:"Practicar y corregir"},
 {day:5,key:"economy_b",subject:"Economía de la Empresa",minutes:90,source:"economy",action:"Ejercicios tipo examen"},
 {day:5,key:"commentary",subject:"Comentario de texto",minutes:90,source:"comment",action:"Redactar y corregir un comentario"},
 {day:5,key:"english_a",subject:"Inglés",minutes:30,source:"english",action:"Repasar vocabulario y gramática"},
 {day:6,key:"math_c",subject:"Matemáticas",minutes:60,source:"math",action:"Resolver problemas y explicar errores"},
 {day:6,key:"spanish_b",subject:"Castellano",minutes:30,source:"spanish",action:"Repasar errores de lengua"},
 {day:6,key:"catalan_c",subject:"Lengua catalana",minutes:30,source:"catalan",action:"Repasar errores de catalán"},
 {day:6,key:"english_b",subject:"Inglés",minutes:60,source:"english",action:"Leer, escribir y autocorregir"},
 {day:6,key:"review",subject:"Revisión semanal",minutes:30,source:"review",action:"Mini test y registro de errores"}
]);
export const patternForWeek=(week)=>week<ROUTE_SWITCH_WEEK?PATTERN_V1:PATTERN_V2;

export function dayOffset(day,n){if(!/^\d{4}-\d{2}-\d{2}$/.test(day))throw Error("Fecha inválida");const d=new Date(day+"T12:00:00Z");if(Number.isNaN(d.getTime()))throw Error("Fecha inválida");d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export function localDate(d=new Date()){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
export function weekForDate(day){const t=Date.parse(day+"T12:00:00Z");if(!Number.isFinite(t))return 0;return Math.max(0,Math.min(LAST_WEEK,Math.floor((t-Date.parse(START_DAY+"T12:00:00Z"))/604800000)));}
export function weekStart(week){if(!Number.isInteger(week)||week<0||week>LAST_WEEK)throw Error("Semana inválida");return dayOffset(START_DAY,week*7);}
export function tasksForWeek(week){
 const start=weekStart(week),chapter=Math.floor(week/4);
 return patternForWeek(week).map(p=>({id:"w"+String(week+1).padStart(2,"0")+"-"+p.key,kind:"session",day:dayOffset(start,p.day),weekday:p.day,subject:p.subject,source:p.source,minutes:p.minutes,
  title:p.action,detail:p.source==="review"?"Nota, tiempo, aciertos y tres errores prioritarios":TOPICS[p.source][week],chapter,week,steps:STEPS[p.source]}));
}
let ALL=null;
export function allTasks(){return ALL||(ALL=[...Array.from({length:24},(_,w)=>tasksForWeek(w)).flat(),...BOSSES]);}
export function findItem(id){return allTasks().find(t=>t.id===id)||MILESTONES.find(m=>m.id===id)||null;}
export function tasksForDay(day){return allTasks().filter(t=>t.day===day);}

/** Pasos que Academia ya registró: una lección de esa materia completada ese mismo día. */
export function autoSteps(item,academyProgress){
 const out=new Set();
 if(!Array.isArray(academyProgress)||!item?.steps)return out;
 for(const s of item.steps){
  if(!s.auto)continue;
  const hit=academyProgress.some(p=>(p.status==="completed"||p.status==="mastered")&&p.completed_at&&String(p.lesson_id||"").startsWith(s.auto+"-")
   &&localDate(new Date(p.completed_at))===item.day);
  if(hit)out.add(s.id);
 }
 return out;
}
/** Estado de un elemento: pasos hechos (guardados + automáticos) y si está completo. */
export function itemState(item,row,auto=new Set()){
 const saved=new Set(Array.isArray(row?.payload?.steps)?row.payload.steps:[]);
 const steps=(item.steps||[]).map(s=>({...s,done:saved.has(s.id)||auto.has(s.id),isAuto:auto.has(s.id)}));
 const doneSteps=steps.filter(s=>s.done).length;
 const done=row?.status==="completed"||(steps.length>0&&doneSteps===steps.length);
 return {steps,doneSteps,totalSteps:steps.length,done,pct:steps.length?Math.round(doneSteps*100/steps.length):(done?100:0)};
}
export function rowsByTask(rows=[]){const m=new Map();for(const r of rows)if(typeof r?.payload?.taskId==="string")m.set(r.payload.taskId,r);return m;}

export function pathMetrics(rows=[],{today=localDate(),academyProgress=null}={}){
 const by=rowsByTask(rows);
 const full=allTasks();
 const isDone=t=>itemState(t,by.get(t.id),autoSteps(t,academyProgress)).done;
 const doneIds=new Set(full.filter(isDone).map(t=>t.id));
 const weeks=Array.from({length:24},(_,w)=>tasksForWeek(w).every(t=>doneIds.has(t.id))).filter(Boolean).length;
 const due=full.filter(t=>t.kind==="session"&&t.day<=today);
 const dueDone=due.filter(t=>doneIds.has(t.id)).length;
 const chapters=CHAPTERS.map((_,c)=>{const items=full.filter(t=>t.kind==="session"&&t.chapter===c);const d=items.filter(t=>doneIds.has(t.id)).length;return {done:d,total:items.length,pct:Math.round(d*100/items.length)};});
 const milestonesDone=MILESTONES.filter(m=>itemState(m,by.get(m.id)).done).length;
 return {done:doneIds.size,total:full.length,percent:Math.round(doneIds.size*100/full.length),completeWeeks:weeks,
  due:due.length,dueDone,sessionRate:due.length?Math.round(dueDone*100/due.length):null,chapters,milestonesDone,milestonesTotal:MILESTONES.length};
}

/** Lo que Inicio necesita: tareas de hoy, atrasadas de esta semana, próximo día con tareas y próximo hito. */
export function todayView(rows=[],{today=localDate(),academyProgress=null}={}){
 const by=rowsByTask(rows);
 const state=t=>({...t,...itemState(t,by.get(t.id),autoSteps(t,academyProgress))});
 const week=weekForDate(today);
 const todayItems=tasksForDay(today).map(state);
 const weekItems=today<START_DAY?[]:tasksForWeek(week).map(state);
 const overdue=weekItems.filter(t=>t.day<today&&!t.done);
 const upcoming=allTasks().filter(t=>t.day>today).sort((a,b)=>a.day.localeCompare(b.day));
 const nextDay=todayItems.length?null:upcoming[0]?.day||null;
 const nextItems=nextDay?upcoming.filter(t=>t.day===nextDay).map(state):[];
 const openMilestones=MILESTONES.map(m=>({...m,...itemState(m,by.get(m.id))})).filter(m=>!m.done).sort((a,b)=>a.due.localeCompare(b.due));
 const chapter=today<START_DAY?0:Math.floor(week/4);
 return {today,week,chapter,beforeStart:today<START_DAY,afterExams:today>"2027-04-17",todayItems,overdue,nextDay,nextItems,
  weekDone:weekItems.filter(t=>t.done).length,weekTotal:weekItems.length,nextMilestone:openMilestones[0]||null,openMilestones};
}

/** Franja de estudio según el turno (roadmap §8). */
export function studyWindow(shift,day){
 const wd=new Date(day+"T12:00:00Z").getUTCDay();const weekend=wd===0||wd===6;
 if(weekend)return {label:"Fin de semana",deep:"2 h repartidas en el día",review:null};
 if(shift==="Morning Shift")return {label:"Semana de mañana",deep:"16:30–18:00",review:"19:00–19:30"};
 if(shift==="Evening Shift")return {label:"Semana de tarde",deep:"09:00–10:30",review:"11:00–11:30"};
 if(shift==="Vacation")return {label:"Día libre",deep:"Bloque largo a tu ritmo",review:null};
 return {label:"Sin turno registrado",deep:null,review:null};
}

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function owner(uid){if(!UUID.test(uid||""))throw Error("Inicia sesión para guardar tu progreso.");return uid;}
async function stableTaskId(uid,taskId){
 const bytes=new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256",new TextEncoder().encode("rise-career-v1:"+uid+":"+taskId)));
 const id=bytes.slice(0,16);id[6]=(id[6]&15)|80;id[8]=(id[8]&63)|128;
 const hex=[...id].map(b=>b.toString(16).padStart(2,"0")).join("");
 return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join("-");
}
const COLS="id,owner_id,record_type,domain,status,payload,updated_at";
export async function loadPathProgress(client,uid){
 const id=owner(uid),rows=[];
 for(let start=0;start<1200;start+=400){
  const {data,error}=await client.from("hub_records").select(COLS)
   .eq("owner_id",id).eq("domain","work").eq("record_type","career_path_tick").order("id").range(start,start+399);
  if(error||!Array.isArray(data))throw Error("No se pudo recuperar el progreso del roadmap.");
  if(data.some(r=>r.owner_id!==id))throw Error("Respuesta de otra cuenta rechazada.");
  rows.push(...data);if(data.length<400)return rows;
 }
 throw Error("El historial supera el límite esperado. No se mostrarán datos parciales.");
}

/**
 * Guarda los pasos marcados de una tarea o hito. `steps` = ids de pasos MANUALES marcados.
 * El estado pasa a completed cuando todos los pasos (manuales + automáticos de Academia) están hechos.
 */
export async function saveItemSteps(client,uid,item,steps,oldRow,{auto=new Set()}={}){
 const id=owner(uid),valid=findItem(item?.id);
 if(!valid)throw Error("La tarea no pertenece al roadmap.");
 if(valid.day&&valid.day>localDate())throw Error("Todavía no ha llegado la fecha de esta tarea.");
 const allowed=new Set((valid.steps||[]).map(s=>s.id));
 const clean=[...new Set((steps||[]).filter(s=>allowed.has(s)))].sort();
 const complete=(valid.steps||[]).every(s=>clean.includes(s.id)||auto.has(s.id));
 const payload={taskId:valid.id,kind:valid.kind||"milestone",plannedDay:valid.day||valid.due,minutes:valid.minutes||0,roadmapVersion:PATH_VERSION,
  steps:clean,confirmedAt:complete?new Date().toISOString():null};
 if(oldRow){
  if(oldRow.owner_id!==id||!oldRow.updated_at)throw Error("Actualiza el progreso antes de editar.");
  const {data,error}=await client.from("hub_records").update({status:complete?"completed":"open",payload:{...oldRow.payload,...payload}})
   .eq("id",oldRow.id).eq("owner_id",id).eq("domain","work").eq("record_type","career_path_tick")
   .eq("updated_at",oldRow.updated_at).select(COLS).maybeSingle();
  if(error)throw Error("No se pudo guardar la tarea.");
  if(!data)throw Error("La tarea cambió en otra sesión. Actualiza y vuelve a intentarlo.");
  return data;
 }
 if(!clean.length&&!complete)return null;
 const rowId=await stableTaskId(id,valid.id);
 const {data,error}=await client.from("hub_records").insert({id:rowId,owner_id:id,domain:"work",record_type:"career_path_tick",
  title:(valid.subject?valid.subject+" · ":"")+valid.title,status:complete?"completed":"open",source:"manual",occurred_at:new Date().toISOString(),payload})
  .select(COLS).single();
 if(error||!data)throw Error(error?.code==="23505"?"Esta tarea ya se guardó en otra sesión. Actualiza.":"No se pudo guardar la tarea. Inténtalo de nuevo.");
 return data;
}
/** Compatibilidad: marcar/desmarcar la tarea entera = todos sus pasos manuales. */
export function setPathTask(client,uid,task,done,oldRow,opts){
 const valid=findItem(task?.id);
 if(!valid||(task.day&&valid.day!==task.day))return Promise.reject(Error("La tarea no pertenece al roadmap."));
 return saveItemSteps(client,uid,valid,done?(valid.steps||[]).map(s=>s.id):[],oldRow,opts);
}
