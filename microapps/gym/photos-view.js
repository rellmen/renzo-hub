// Gym · Fotos de progreso: subir (privado), galería por pose y comparador antes/después con deslizador.
// Contrato con gym.js: render(container, {db, getUser, owner, status, esc}).
import {PHOTO_POSES,preparePhoto,uploadProgressPhoto,listProgressPhotos,signedProgressPhotoUrls,deleteProgressPhoto,daysBetween} from './progress-photos.js';

const today=()=>new Date().toLocaleDateString('sv-SE');
const fmt=d=>new Date(d+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'});
const span=days=>days<14?`${days} días`:days<=112?`${Math.round(days/7)} semanas`:`${Math.round(days/30.4)} meses`;

export async function render(container,{db,getUser,owner,status,esc}){
 const user=owner||getUser?.()?.id;
 let photos=[],urls={},pose='front',busy=false;

 const shell=()=>{
  container.innerHTML=`<div class="section"><h3>Fotos de progreso</h3></div>
  <div class="card gym-photos-add"><p class="small">Privadas: solo tú puedes verlas. Se guardan reducidas y sin datos de ubicación. Misma luz, distancia y pose cada 2–4 semanas para comparar bien.</p>
   <form data-photo-form class="gym-photo-form">
    <label>Foto<input type="file" name="file" accept="image/*" required></label>
    <label>Fecha<input type="date" name="date" value="${today()}" max="${today()}" required></label>
    <label>Pose<select name="pose">${Object.entries(PHOTO_POSES).map(([k,v])=>`<option value="${k}" ${k===pose?'selected':''}>${v}</option>`).join('')}</select></label>
    <button class="primary" type="submit">Subir foto</button>
   </form></div>
  <div class="gym-photo-poses" role="tablist">${Object.entries(PHOTO_POSES).map(([k,v])=>`<button type="button" class="switch ${k===pose?'selected':''}" data-pose="${k}" role="tab" aria-selected="${k===pose}">${v}</button>`).join('')}</div>
  <div data-photo-compare></div><div data-photo-grid class="gym-photo-grid"><p class="small">Cargando…</p></div>`;
  container.querySelector('[data-photo-form]').onsubmit=upload;
  container.querySelectorAll('[data-pose]').forEach(b=>b.onclick=()=>{pose=b.dataset.pose;container.querySelector('[name="pose"]').value=pose;container.querySelectorAll('[data-pose]').forEach(x=>{const on=x.dataset.pose===pose;x.classList.toggle('selected',on);x.setAttribute('aria-selected',on);});draw();});
 };

 const draw=()=>{
  const list=photos.filter(p=>p.pose===pose);
  const grid=container.querySelector('[data-photo-grid]'),cmp=container.querySelector('[data-photo-compare]');
  if(!list.length){cmp.innerHTML='';grid.innerHTML=`<p class="small">Aún no hay fotos de pose ${esc(PHOTO_POSES[pose].toLowerCase())}. Sube la primera para empezar tu comparativa.</p>`;return;}
  grid.innerHTML=list.map(p=>`<figure class="gym-photo"><img src="${esc(urls[p.path]||'')}" alt="Foto ${esc(PHOTO_POSES[p.pose])} del ${esc(fmt(p.date))}" decoding="async"><figcaption><span>${esc(fmt(p.date))}</span><button type="button" class="gym-photo-del" data-del="${esc(p.path)}" aria-label="Borrar foto del ${esc(fmt(p.date))}">Borrar</button></figcaption></figure>`).join('');
  grid.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>remove(b.dataset.del));
  if(list.length<2){cmp.innerHTML='<p class="small">Con dos fotos de la misma pose aparece el comparador antes/después.</p>';return;}
  const oldest=list[list.length-1],newest=list[0];
  const options=sel=>list.map(p=>`<option value="${esc(p.path)}" ${p.path===sel?'selected':''}>${esc(fmt(p.date))}</option>`).join('');
  cmp.innerHTML=`<div class="card gym-compare"><div class="gym-compare-pick"><label>Antes<select data-before>${options(oldest.path)}</select></label><label>Después<select data-after>${options(newest.path)}</select></label></div>
   <div class="gym-compare-stage" data-stage><img data-img-before alt="Antes"><img data-img-after alt="Después" class="gym-compare-after"><span class="gym-compare-tag gym-compare-tag-l">Antes</span><span class="gym-compare-tag gym-compare-tag-r">Después</span><div class="gym-compare-line" aria-hidden="true"></div></div>
   <input type="range" min="0" max="100" value="50" data-slider aria-label="Deslizar entre antes y después">
   <p class="small" data-compare-gap></p></div>`;
  const before=cmp.querySelector('[data-before]'),after=cmp.querySelector('[data-after]'),stage=cmp.querySelector('[data-stage]'),slider=cmp.querySelector('[data-slider]');
  const update=()=>{
   const a=list.find(p=>p.path===before.value),b=list.find(p=>p.path===after.value);
   cmp.querySelector('[data-img-before]').src=urls[a.path]||'';cmp.querySelector('[data-img-after]').src=urls[b.path]||'';
   const d=daysBetween(a.date,b.date);cmp.querySelector('[data-compare-gap]').textContent=a.path===b.path?'Elige dos fotos diferentes.':`${span(d)} de diferencia (${fmt(a.date)} → ${fmt(b.date)}).`;
  };
  const move=()=>stage.style.setProperty('--split',slider.value+'%');
  before.onchange=after.onchange=update;slider.oninput=move;update();move();
 };

 const refresh=async()=>{
  photos=await listProgressPhotos(db,user);
  urls=await signedProgressPhotoUrls(db,user,photos.map(p=>p.path));
  draw();
 };

 async function upload(e){
  e.preventDefault();if(busy)return;busy=true;
  const form=e.currentTarget,btn=form.querySelector('button[type="submit"]'),f=new FormData(form);
  btn.disabled=true;btn.textContent='Subiendo…';
  try{
   const file=await preparePhoto(f.get('file'));
   const date=String(f.get('date')||today());
   if(date>today())throw Error('La fecha no puede ser futura');
   pose=String(f.get('pose'));
   await uploadProgressPhoto(db,user,file,{date,pose});
   shell();await refresh();status?.('Foto guardada en tu espacio privado.');
  }catch(err){status?.('No se pudo subir la foto: '+(err?.message||err));}
  finally{busy=false;const b=container.querySelector('[data-photo-form] button[type="submit"]');if(b){b.disabled=false;b.textContent='Subir foto';}}
 }

 async function remove(path){
  if(busy||!window.confirm('¿Borrar esta foto? No se puede recuperar.'))return;
  busy=true;
  try{await deleteProgressPhoto(db,user,path);await refresh();status?.('Foto borrada.');}
  catch(err){status?.('No se pudo borrar: '+(err?.message||err));}
  finally{busy=false;}
 }

 shell();
 if(!user){container.querySelector('[data-photo-grid]').innerHTML='<p class="small">Inicia sesión para ver tus fotos.</p>';return;}
 try{await refresh();}
 catch(err){container.querySelector('[data-photo-grid]').innerHTML=`<p class="small">No se pudieron cargar las fotos: ${esc(err?.message||err)}. Pulsa Recargar para reintentar.</p>`;}
}
