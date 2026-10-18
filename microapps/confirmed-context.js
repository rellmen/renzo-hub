// Confirmed personal context stays in the authenticated browser. No external AI requests.
export const CONTEXT_SECTIONS=Object.freeze({profile:'Perfil',finance:'Finanzas',work:'Trabajo',learning:'Formación',gym:'Gym',skincare:'Skincare',projects:'Proyectos'});
const labels={user_confirmed:'Confirmado',historical:'Histórico · vigencia pendiente',photo_verified:'Identificado en foto · stock actual sin confirmar',needs_confirmation:'Pendiente de confirmar',verified_source:'Fuente verificada'};
export function confirmedFacts(records,section){
 const result=[];
 for(const r of records||[]){const p=r.payload;
  if(r.record_type!=='personal_fact'||p?.section!==section||p.confirmed!==true||!p.confirmedAt||!Array.isArray(p.facts))continue;
  for(const f of p.facts){
   if(!labels[f?.verification]||typeof f.label!=='string'||typeof f.value!=='string'||!f.asOf||!f.provenance)continue;
   result.push({label:f.label.slice(0,160),value:f.value.slice(0,650),detail:`${labels[f.verification]} · ${String(f.asOf).slice(0,80)} · ${String(f.provenance).slice(0,240)}`});
  }
 }
 return result;
}
export function personalTopic(q,previous=''){
 const s=String(q||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(/selflearn|formacion|estudi|aprend|power\s?bi|\bsql\b|neerland|holandes|ingles|idioma/.test(s))return 'learning';
 if(/skincare|skin routine|productos|rutina.*piel/.test(s))return 'skincare';
 if(/\bgym\b|gimnas|entren|peso|altura/.test(s))return 'gym';
 if(/finanza|alquiler|deuda|ingreso|banco|nomina|gasto|cobr[oa]|dinero|sueldo|salario/.test(s))return 'finance';
 if(/turno|empleo|empresa|cargo|trabajo|profesion/.test(s))return 'work';
 if(/perfil|residencia|nacimiento|nacionalidad|datos personales|sabes (?:de|sobre) mi|donde vivo/.test(s))return 'profile';
 if(/^(y |cuales|dime mas|detalles)/.test(s)&&CONTEXT_SECTIONS[previous])return previous;
 return null;
}
// Only these pre-reviewed generic summaries may use the existing external mode.
// Unknown questions and free-form personal follow-ups stay local by default.
export function isExternalSummaryQuestion(q){
 const s=String(q||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[¿?!.]/g,'').trim();
 return ['como van mis proyectos','que tareas tengo pendientes','que debo aprobar','que han hecho mis agentes'].includes(s);
}
export function contextAnswer(records,section){
 const rows=confirmedFacts(records,section);
 return rows.length?`${CONTEXT_SECTIONS[section]} · contexto privado guardado:\n`+(section==='finance'?'Estas referencias no certifican saldo, salario ni pagos actuales.\n':'')+rows.map(f=>`• ${f.label}: ${f.value}\n  ${f.detail}`).join('\n'):'No hay datos confirmados de '+CONTEXT_SECTIONS[section]+'.';
}
export function mountConfirmedContext({db,getUser,document:doc=globalThis.document}){
 let generation=0;const panels=[],observers=[];
 const reset=()=>{generation++;for(const o of observers)o.disconnect();observers.length=0;for(const p of panels)p.remove();panels.length=0;};
 async function load(){
  reset();const seq=generation,owner=getUser()?.id;if(!owner)return;
  const {data,error}=await db.from('hub_records').select('id,record_type,payload').eq('owner_id',owner).eq('record_type','personal_fact').order('occurred_at',{ascending:false}).limit(100);
  if(seq!==generation||owner!==getUser()?.id)return;
  if(error)throw Error('No se pudo leer el contexto confirmado: '+error.message);
  const targets={profile:'system',finance:'money',work:'work',learning:'study',gym:'gym',skincare:'skin',projects:'work'};
  for(const [section,id] of Object.entries(targets)){
   const root=doc.getElementById(id),facts=confirmedFacts(data,section);if(!root||!facts.length)continue;
   const panel=doc.createElement('details');panel.className='card';panel.dataset.confirmedContext=section;
   const title=doc.createElement('summary');title.textContent=CONTEXT_SECTIONS[section]+' · datos con fecha y procedencia';panel.append(title);
   for(const f of facts){const item=doc.createElement('p'),b=doc.createElement('b'),v=doc.createElement('span'),small=doc.createElement('small');b.textContent=f.label+': ';v.textContent=f.value;small.textContent=f.detail;small.className='small';item.append(b,v,doc.createElement('br'),small);panel.append(item);}
   root.append(panel);panels.push(panel);
   const observer=new MutationObserver(()=>{if(seq===generation&&owner===getUser()?.id&&!panel.isConnected)root.append(panel);});
   observer.observe(root,{childList:true});observers.push(observer);
  }
 }
 return {load,reset};
}
