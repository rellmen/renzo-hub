// Pure helpers for read-only status questions. Never send this context to OpenRouter.
const norm=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
export function isDevelopmentQuestion(question){
 const s=norm(question);
 return /(github|vercel|repositori|pull.request|\bprs?\b|\bcommit|despliegue|deploy|staging|production|produccion|codigo|codebase|version del hub|version de rise|fase del proyecto|fase de desarrollo|fase de rise|fase del hub|avance de rise|avance del hub|estado de desarrollo|que queda por (acabar|terminar)|que falta por (acabar|terminar)|que le falta a rise)/.test(s);
}
const line=(title,list,formatter)=>{
 if(!Array.isArray(list))return title+": no disponible.";
 if(list.length===0)return title+": ninguno en la muestra consultada.";
 return title+":\n"+list.slice(0,6).map((item,i)=>`  ${i+1}. ${formatter(item)}`).join("\n");
};
export function formatDevelopmentSources(value){
 const g=value?.github||{},v=value?.vercel||{};
 const available=g.available||{};
 const sha=String(v.deploymentCommit||"").slice(0,10)||"no identificado";
 const info=[
  "Estado técnico de RISE HUB (fuentes verificadas, solo lectura):",
  `• Despliegue que responde: ${v.project||"sin identificar"} · ${v.environment||"desconocido"} · rama ${v.deploymentBranch||"sin datos"} · commit ${sha}.`,
  `• Repositorio GitHub: ${g.repository||"no identificado"} · seguimiento de la rama staging.`,
  line("Commits recientes de staging",available.commits?g.commits:null,r=>`${String(r.sha||"").slice(0,7)} — ${r.title||"sin mensaje"}`),
  line("Pull Requests abiertas",available.pullRequests?g.pullRequests:null,r=>`#${r.number} ${r.title} → ${r.base||"?"}`),
  line("Issues abiertas",available.issues?g.issues:null,r=>`#${r.number} ${r.title}`),
  "",
  "Límite: las PRs e issues no son una lista completa de trabajos pendientes. No puedo calcular una fase o un porcentaje de finalización fiables únicamente con esos datos. Todavía no tengo conexión de ejecución o estado en vivo de Claude y Hermes.",
  "No he modificado ningún proyecto, tarea ni despliegue."
 ];
 return info.join("\n");
}
