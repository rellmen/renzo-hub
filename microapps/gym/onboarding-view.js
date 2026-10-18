// Tarjeta "Crear rutina con 3 preguntas" en Rutinas. Genera una propuesta, la enseña y,
// solo si Renzo pulsa "Cargar en el editor", la deja como borrador; se guarda con "Guardar rutina".
import {buildOnboardingPlan,ONBOARDING_LABELS} from './onboarding.js';

const opt=(map,selected)=>Object.entries(map).map(([v,l])=>`<option value="${v}" ${v===selected?'selected':''}>${l}</option>`).join('');

export function onboardingCardHtml(){
 return `<details class="card gym-onboard" data-onboard><summary><b>Crear rutina con 3 preguntas</b><span class="small"> · propuesta revisable, no borra tu plan</span></summary>
 <form class="gym-onboard-form" data-onboard-form>
  <label>¿Cuántos días entrenas a la semana?<select name="days">${[2,3,4,5].map(n=>`<option value="${n}" ${n===4?'selected':''}>${n} días</option>`).join('')}</select></label>
  <label>¿Qué equipamiento tienes?<select name="equipment">${opt(ONBOARDING_LABELS.equipment,'gym')}</select></label>
  <label>¿Cuál es tu objetivo principal?<select name="goal">${opt(ONBOARDING_LABELS.goal,'hypertrophy')}</select></label>
  <button type="submit" class="secondary">Ver propuesta</button>
 </form><div data-onboard-preview></div></details>`;
}

export function previewHtml(plan,esc){
 return `<div class="gym-onboard-preview">${plan.map((d,i)=>`<div class="gym-onboard-day"><b>Día ${i+1} · ${esc(d[0])}</b><span class="small">Cardio ${esc(d[1])} min</span><ul>${d[2].map(e=>`<li>${esc(e[0])} <span class="small">${e[1]}×${e[2]}–${e[3]}${e[5]?' · compuesto':''}</span></li>`).join('')}</ul></div>`).join('')}</div>
 <p class="small">Al cargarla sustituye el borrador del editor. Tu rutina guardada y tu historial no cambian hasta que pulses <b>Guardar rutina</b>.</p>
 <button type="button" class="primary" data-onboard-use>Cargar en el editor</button>`;
}

export function bindOnboarding(content,{esc,onUse,status}){
 const form=content.querySelector('[data-onboard-form]');
 if(!form)return;
 let proposal=null;
 form.onsubmit=e=>{
  e.preventDefault();
  const f=new FormData(form);
  try{
   proposal=buildOnboardingPlan({days:Number(f.get('days')),equipment:f.get('equipment'),goal:f.get('goal')});
   const box=content.querySelector('[data-onboard-preview]');
   box.innerHTML=previewHtml(proposal,esc);
   box.querySelector('[data-onboard-use]').onclick=()=>onUse(structuredClone(proposal));
  }catch(err){status?.(err.message);}
 };
}
