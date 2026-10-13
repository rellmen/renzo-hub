// Ares AI — chat privado de RISE HUB.
export const ARES_QUERY_TYPES = ["renzo_project", "renzo_task", "renzo_inbox", "ares_decision", "ares_operation", "ares_agent_run", "renzo_event"];
export function aresNormalize(value){return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
const f=v=>aresNormalize(v), st=r=>String(r.payload?.status||r.status||"sin estado");
const openTask=r=>!["completed","done","cancelled","archived"].includes(f(st(r)));
const pendingInbox=r=>!["reviewed","archived","confirmed","rejected"].includes(f(st(r)));
const agentEvent=r=>r.record_type==="ares_agent_run"||(r.record_type==="renzo_event"&&(r.source==="automation"||["claude","hermes","jarvis","n8n"].includes(f(r.payload?.source))));
const summary=(title,rows)=>title+(rows.length?"\n"+rows.slice(0,8).map((r,i)=>`${i+1}. ${r.title||"Sin título"} — ${st(r)}`).join("\n")+(rows.length>8?`\n... y ${rows.length-8} más.`:""):"\nNo hay registros en los datos consultados.");
export function answerAres(q,records,previous=""){
  const rows=Array.isArray(records)?records:[],text=f(q),by=t=>rows.filter(r=>r.record_type===t),limited=rows.length>=500?" (muestra parcial de 500 registros recientes)":"";
  const projects=by("renzo_project").filter(r=>f(st(r))!=="completed"),tasks=by("renzo_task").filter(openTask);
  const review=by("renzo_inbox").filter(pendingInbox),operations=by("ares_operation").filter(r=>r.status==="pending_approval"),decisions=by("ares_decision").filter(r=>r.status==="pending");
  const events=rows.filter(agentEvent);
  let topic=/proyect|project|fase|avance/.test(text)?"projects":/tarea|por hacer|prioridad|bloqueo/.test(text)?"tasks":/aproba|aprob|decision|revision|inbox|bandeja|solicitud/.test(text)?"inbox":/claude|hermes|jarvis|agente|automatiz|n8n/.test(text)?"agents":/despliegue|staging|produccion|vercel|version/.test(text)?"deploy":/finanza|banco|nomina|gasto|cobrado|dinero/.test(text)?"finance":/^(y |cuales|dime mas|detalles)/.test(text)?previous:"overview";
  if(topic==="overview"&&projects.some(p=>String(p.title||"").length>3&&text.includes(f(p.title))))topic="projects";
  if(topic==="projects"){
    const project=projects.find(p=>(p.title||"").length>3&&text.includes(f(p.title)));
    if(project){const related=by("renzo_task").filter(t=>f(t.payload?.project)===f(project.title));return {topic,text:`Proyecto: ${project.title}. Estado: ${st(project)}. Entregable: ${project.payload?.output||"no indicado"}. Tareas vinculadas: ${related.filter(t=>!openTask(t)).length}/${related.length} completadas.${limited}`};}
    return {topic,text:summary(`Proyectos registrados activos o en backlog: ${projects.length}${limited}.`,projects)};
  }
  if(topic==="tasks")return {topic,text:summary(`Tareas abiertas registradas: ${tasks.length}${limited}.`,tasks)};
  if(topic==="inbox")return {topic,text:summary(`Revisiones pendientes: ${review.length+operations.length+decisions.length}${limited}. Aprobar no ejecuta agentes.`,[...operations,...decisions,...review]),actions:operations.slice(0,4).map(r=>({type:"review",id:r.id,label:"Revisar: "+String(r.title).slice(0,38)}))};
  if(topic==="agents")return {topic,text:summary(`Eventos de agentes almacenados: ${events.length}${limited}. No son indicadores de estado en tiempo real.`,events)};
  if(topic==="deploy")return {topic,text:"Puedo consultar el despliegue real del entorno actual. El resultado no certifica si un agente está funcionando.",actions:[{type:"deployment",label:"Consultar despliegue"}]};
  if(topic==="finance")return {topic,text:"Las consultas financieras detalladas aún no están integradas. Puedes consultar tus datos privados en My Finance; no inventaré importes.",actions:[{type:"navigate",id:"money",label:"Abrir My Finance"}]};
  return {topic:"overview",text:`Estado de RISE HUB según tus registros:\n• ${projects.length} proyectos activos.\n• ${tasks.length} tareas abiertas.\n• ${review.length+operations.length+decisions.length} revisiones pendientes.\n• ${events.length} eventos de agentes almacenados.${limited}\n\nPuedes preguntarme por un proyecto, tus tareas o tus aprobaciones. También preparar encargos para Claude, Hermes o Jarvis, sin ejecutarlos automáticamente.`};
}
const node=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=String(value);return n;};
export function mountAresAI({supabase,getUser,navigate}){
 const launch=node("button","ares-fab","✧  Ares AI");launch.type="button";launch.hidden=true;launch.setAttribute("aria-label","Hablar con Ares AI");
 const panel=node("section","ares-chat");panel.hidden=true;panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");panel.setAttribute("aria-label","Ares AI");
 panel.innerHTML='<header class="ares-chat-head"><div class="ares-avatar">✧</div><div><strong>Ares AI</strong><small>Tu asistente personal de RISE HUB</small></div><button type="button" class="ares-close" aria-label="Cerrar Ares AI">✕</button></header><div class="ares-chat-stream" role="log" aria-live="polite"></div><div class="ares-chat-suggestions"><button type="button" data-suggest="¿Cómo van mis proyectos?">Proyectos</button><button type="button" data-suggest="¿Qué tareas tengo pendientes?">Mis tareas</button><button type="button" data-suggest="¿Qué debo aprobar?">Aprobaciones</button><button type="button" data-suggest="¿Qué han hecho mis agentes?">Agentes</button></div><form class="ares-chat-form"><label class="ares-sr" for="aresQuestion">Escribe a Ares AI</label><textarea id="aresQuestion" maxlength="500" rows="1" placeholder="Pregunta lo que quieras de tu Hub…" aria-label="Tu mensaje"></textarea><button type="submit" aria-label="Enviar">↑</button></form><p class="ares-chat-foot">Respuestas basadas en tu Hub · Sin IA generativa externa</p>';
 document.body.append(launch,panel);
 const stream=panel.querySelector(".ares-chat-stream"),input=panel.querySelector("textarea"),form=panel.querySelector("form");
 let owner=null,topic="",generation=0,busy=false,isOpen=false,aiEnabled=false;
 const foot=panel.querySelector(".ares-chat-foot");
 function bubble(role,content,actions=[]){const item=node("article","ares-msg ares-msg-"+role),body=node("div","ares-msg-body",content);item.append(body);if(actions.length){const bar=node("div","ares-msg-actions");for(const act of actions){const btn=node("button","",act.label);btn.type="button";btn.addEventListener("click",()=>void doAction(act,btn));bar.append(btn);}item.append(bar);}stream.append(item);stream.scrollTop=stream.scrollHeight;return item;}
 function clear(){generation++;stream.replaceChildren();topic="";busy=false;input.value="";form.querySelector('[type="submit"]').disabled=false;}
 async function checkAI(){try{const res=await fetch("/api/ares-ai",{cache:"no-store",signal:AbortSignal.timeout(5000)});const data=res.ok?await res.json():{};aiEnabled=data.enabled===true;foot.textContent=aiEnabled?"OpenRouter/free activado · solo nombres y estados seleccionados de proyectos/tareas":"Consultas privadas sin IA externa · activa OpenRouter en Vercel Preview si lo autorizas";}catch{aiEnabled=false;foot.textContent="Consultas locales de tus registros";}}
 function setSession(){const id=getUser()?.id||null;if(id!==owner){owner=id;clear();}launch.hidden=!id;if(!id){panel.hidden=true;isOpen=false;document.body.classList.remove("ares-chat-open");}}
 function open(){setSession();if(!owner)return;void checkAI();panel.hidden=false;isOpen=true;document.body.classList.add("ares-chat-open");if(!stream.children.length)bubble("bot","Hola, soy Ares AI. Puedo consultar tus proyectos, tareas, revisiones y agentes a partir de los registros reales de RISE HUB. ¿Qué quieres saber?");input.focus();}
 function close(){panel.hidden=true;isOpen=false;document.body.classList.remove("ares-chat-open");launch.focus();}
 function reset(){owner=null;clear();panel.hidden=true;launch.hidden=true;isOpen=false;document.body.classList.remove("ares-chat-open");}
 async function records(){const id=owner;if(!id||id!==getUser()?.id)throw Error("Inicia sesión para preguntar.");const {data,error}=await supabase.from("hub_records").select("id,domain,record_type,title,status,occurred_at,payload,source,requires_review").eq("owner_id",id).in("record_type",ARES_QUERY_TYPES).order("occurred_at",{ascending:false}).limit(500);if(error)throw Error("La consulta privada ha fallado: "+error.message);if(id!==getUser()?.id)throw Error("La sesión ha cambiado.");return data||[];}
 const detectTask=question=>{const m=question.match(/^(?:pide|encarga|solicita|dile)\s+(?:a\s+)?(claude|hermes|jarvis)\s+(?:que\s+)?(.{4,})$/i);return m?{agent:m[1][0].toUpperCase()+m[1].slice(1).toLowerCase(),task:m[2].trim().slice(0,180)}:null;};
 async function send(value){const text=String(value||"").trim().slice(0,500);if(!text||busy||!owner)return;busy=true;const seq=++generation;input.value="";form.querySelector('[type="submit"]').disabled=true;bubble("user",text);const placeholder=bubble("bot","Consultando tus registros…");
  try{const rows=await records();if(seq!==generation||owner!==getUser()?.id)return;placeholder.remove();const task=detectTask(text);if(task){bubble("bot",`He preparado una solicitud para ${task.agent}: “${task.task}”. Debes confirmarla para guardarla en AI Inbox. No ejecutará ninguna tarea.`,[{type:"request",label:"Crear solicitud pendiente",...task}]);topic="agents";}else{
        let aiReply=null,aiSource="OpenRouter/free · modelo externo";
        if(aiEnabled){
          try{
            const session=await supabase.auth.getSession();
            if(session?.data?.session?.access_token){
              const res=await fetch("/api/ares-ai",{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+session.data.session.access_token},body:JSON.stringify({question:text}),signal:AbortSignal.timeout(28000)});
              const data=await res.json().catch(()=>({}));
              if(res.ok && typeof data.text==="string"){aiReply=data.text;aiSource=typeof data.source==="string"?data.source:aiSource;}
            }
          }catch{/* Fall back to direct read-only answers when the external model is unavailable. */}
        }
        if(seq!==generation||owner!==getUser()?.id)return;
        const answer=answerAres(text,rows,topic);topic=answer.topic;
        bubble("bot",aiReply?aiReply+"\n\nFuente: "+aiSource:answer.text,aiReply?[]:answer.actions||[]);
      }}
  catch(e){if(seq===generation){placeholder.remove();bubble("bot","No he podido responder con datos verificados: "+String(e.message||e));}}
  finally{if(seq===generation){busy=false;form.querySelector('[type="submit"]').disabled=false;input.focus();}}
 }
 async function doAction(action,button){if(!owner||owner!==getUser()?.id)return;button.disabled=true;
  try{
   if(action.type==="navigate"){close();navigate(action.id);return;}
   if(action.type==="deployment"){const res=await fetch("/api/deployment-info",{cache:"no-store",signal:AbortSignal.timeout(8000)});if(!res.ok)throw Error("No accesible");const x=await res.json();bubble("bot",`Entorno: ${x.environment||"desconocido"}. Proyecto: ${x.project||"sin datos"}. Rama: ${x.branch||"sin datos"}. Commit: ${String(x.commit||"no informado").slice(0,12)}. Este dato no certifica la salud de los agentes.`);return;}
   if(action.type==="request"){
    const now=new Date().toISOString();const data={owner_id:owner,domain:"system",record_type:"ares_operation",title:action.task,status:"pending_approval",requires_review:true,occurred_at:now,source:"manual",payload:{agent:action.agent,details:"Solicitud creada desde Ares AI",requestedAt:now,executionStatus:"not_connected",executed:false}};
    const {error}=await supabase.from("hub_records").insert(data);if(error)throw Error(error.message);
    bubble("bot",`Solicitud registrada para ${action.agent}. Está pendiente de aprobación y NO ejecutará nada hasta que lo autorices expresamente.`);return;
   }
   if(action.type==="review"){
    const rows=await records(),r=rows.find(v=>v.id===action.id&&v.record_type==="ares_operation"&&v.status==="pending_approval");if(!r){bubble("bot","Esa solicitud ya no está pendiente; vuelve a preguntar.");return;}
    bubble("bot",`Solicitud: ${r.title}. Agente: ${r.payload?.agent||"no indicado"}. ${r.payload?.details||""} Aprobar solo registra tu decisión; no ejecuta al agente.`,[{type:"decide",id:r.id,decision:"approved",label:"Aprobar solicitud"},{type:"decide",id:r.id,decision:"rejected",label:"Rechazar solicitud"}]);return;
   }
   if(action.type==="decide"){
    const approved=action.decision==="approved";if(!confirm(approved?"¿Registrar aprobación sin ejecutar la tarea?":"¿Rechazar la solicitud?")){button.disabled=false;return;}
    const rows=await records(),r=rows.find(v=>v.id===action.id&&v.record_type==="ares_operation"&&v.status==="pending_approval");if(!r)throw Error("Ya no está pendiente.");
    const {data,error}=await supabase.from("hub_records").update({status:action.decision,requires_review:false,payload:{...(r.payload||{}),decisionBy:"owner",reviewedAt:new Date().toISOString(),executionStatus:"not_connected",executed:false}}).eq("owner_id",owner).eq("id",r.id).eq("record_type","ares_operation").eq("status","pending_approval").select("id");if(error||!data?.length)throw Error(error?.message||"No se pudo verificar la actualización.");
    bubble("bot",approved?"Aprobación registrada. Ningún agente se ha ejecutado.":"Solicitud rechazada.");return;
   }
  }catch(e){bubble("bot","No he podido realizar la acción: "+String(e.message||e));button.disabled=false;}
 }
 launch.addEventListener("click",open);panel.querySelector(".ares-close").addEventListener("click",close);
 panel.querySelectorAll("[data-suggest]").forEach(b=>b.addEventListener("click",()=>void send(b.dataset.suggest)));
 form.addEventListener("submit",e=>{e.preventDefault();void send(input.value);});
 input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit();}});
 window.addEventListener("keydown",e=>{if(e.key==="Escape"&&isOpen)close();if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"&&owner){e.preventDefault();isOpen?close():open();}});
 return {open,close,reset,setSession,send};
}
