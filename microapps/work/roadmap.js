// RISE HUB 4.0 · source-of-truth roadmap. Only deployed and verified gates may be closed.
// No user-level data or estimated completion percentage is inferred.
export const RISE4_PHASES = Object.freeze([
 {id:0,title:'Plan maestro y criterios de cierre',hours:[6,10],status:'closed',scope:'Inventario, arquitectura, tablero y reglas de calidad.',deliverable:'Roadmap accesible en Work y especificación versionada.'},
 {id:1,title:'Payroll · Shift Tracker',hours:[35,55],status:'active',scope:'Agencias, turnos, descansos no pagados, franjas y porcentajes contractuales, previsión y contraste con nómina.',deliverable:'Turnos verificados frente a un mes de nóminas.'},
 {id:2,title:'My Finance conectado',hours:[30,55],status:'queued',scope:'Ingreso confirmado, presupuestos, ahorros, patrimonio y objetivos.',deliverable:'Dashboard privado sin ingresos duplicados.'},
 {id:3,title:'SelfLearn Academy',hours:[70,120],status:'queued',scope:'Gramática, escucha, conversación, práctica escrita, refuerzo adaptativo y preparación NT2.',deliverable:'Ejercicios por destreza y rúbricas, no certificados ficticios.'},
 {id:4,title:'Gym · progresión',hours:[35,55],status:'queued',scope:'Rutinas, cargas, récords, recuperación y seguimiento de métricas.',deliverable:'Entrenamientos reales y progresión verificable.'},
 {id:5,title:'Food · planificación',hours:[30,50],status:'queued',scope:'Menús, macros, lista de compra, presupuesto y horarios.',deliverable:'Plan semanal reproducible con cantidades.'},
 {id:6,title:'Skincare · seguimiento',hours:[16,26],status:'queued',scope:'Productos, frecuencia, fotos comparables, registro de irritación y reposición.',deliverable:'Calendario personal con avisos de uso y precauciones.'},
 {id:7,title:'Career · Logistics Data Analyst',hours:[45,70],status:'queued',scope:'SQL, Python, Power BI y laboratorios con datos logísticos ficticios.',deliverable:'Portafolio de ejercicios y entregables evaluables.'},
 {id:8,title:'Work · gestión avanzada',hours:[30,45],status:'queued',scope:'Kanban, proyectos, sprints, entregables, bloqueos e Idea Vault.',deliverable:'Proyectos con resultados demostrables.'},
 {id:9,title:'Ares Intelligence',hours:[60,100],status:'queued',scope:'Conectar métricas privadas, detectar tendencias e informar semanalmente con evidencia.',deliverable:'Recomendaciones trazables y ejecución solo con permisos.'},
 {id:10,title:'RISE RPG · progresión global',hours:[25,40],status:'queued',scope:'Misiones, niveles por habilidad, XP y coherencia entre microapps.',deliverable:'Logros basados en acciones verificadas, sin recompensas inventadas.'}
].map(x=>Object.freeze(x)));

export const RISE4_GATES = Object.freeze([
 'Requisitos y casos límite escritos antes de desarrollar.',
 'Pruebas unitarias y funcionales completas, incluidos errores y ausencia de datos.',
 'Flujo autenticado verificado con Supabase Staging; RLS y permisos revisados.',
 'Revisión móvil y escritorio, accesibilidad, seguridad y ausencia de regresiones.',
 'Revisión y CI de GitHub correctos, despliegue READY y versión pública comprobada.',
 'Documentación, evidencia del release y plan de reversión; sin incidentes abiertos de gravedad alta.'
]);
export function roadmapStats(phases=RISE4_PHASES){
 const items=[...phases],ordered=items.every((p,i)=>p.id===i);
 if(!ordered)throw Error('Las fases deben estar ordenadas por id.');
 const active=items.filter(p=>['active','validation'].includes(p.status));
 if(active.length>1)throw Error('Solo puede existir una fase activa o en validación.');
 if(items.some((p,i)=>p.status==='closed'&&items.slice(0,i).some(x=>x.status!=='closed')))throw Error('No se pueden cerrar fases fuera de orden.');
 return {total:items.length,closed:items.filter(p=>p.status==='closed').length,active:active[0]||null,hours:[items.reduce((s,p)=>s+p.hours[0],0),items.reduce((s,p)=>s+p.hours[1],0)]};
}
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label={queued:'Pendiente',active:'En desarrollo',validation:'En validación',closed:'Cerrada'};
export function riseRoadmapHTML(phases=RISE4_PHASES){
 const stats=roadmapStats(phases);
 return `<section class="rise-roadmap" aria-label="RISE HUB 4.0 · avance por fases"><div class="rise-roadmap-heading"><div><div class="ey">PROYECTO PRINCIPAL · PLAN 2026</div><h2>RISE HUB 4.0</h2><p>Una fase a la vez · sin saltarse las pruebas ni desplegar funciones incompletas.</p></div><strong>${stats.closed}/${stats.total}<small> fases cerradas</small></strong></div>
 <p class="rise-roadmap-current">${stats.active?`Fase actual: <b>${stats.active.id} · ${escape(stats.active.title)}</b> · ${escape(label[stats.active.status])}`:'No hay fase en ejecución.'}</p><p class="small">Estimación total: ${stats.hours[0]}–${stats.hours[1]} horas de desarrollo y validación. No representa un compromiso de trabajo en segundo plano.</p>
 <details><summary>Ver las 11 fases y sus entregables</summary><ol start="0">${phases.map(p=>`<li><strong>${escape(p.title)}</strong><span>${p.hours[0]}–${p.hours[1]} h · ${escape(label[p.status])}</span><p>${escape(p.scope)}</p><small>Entregable: ${escape(p.deliverable)}</small></li>`).join('')}</ol></details><details><summary>¿Cuándo se considera una fase cerrada?</summary><ol>${RISE4_GATES.map(x=>`<li>${escape(x)}</li>`).join('')}</ol></details>
 </section>`;
}
