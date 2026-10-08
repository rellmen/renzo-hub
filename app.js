import {mountGym} from "./gym.js";
import {mountNews} from "./news.js";
import {mountWorld} from "./world.js";
import {mountJarvis} from "./jarvis-ui.js";
import {mountWorldExtensions} from "./world-extensions.js";
import {mountProfile} from "./profile.js";
import {mountPhase1} from "./phase1.js";

function showStartupError(error){
  const message=error instanceof Error?error.message:String(error||"");
  document.getElementById("authScreen")?.classList.add("hidden");
  document.getElementById("appShell")?.classList.add("hidden");
  document.getElementById("bottomNav")?.classList.add("hidden");
  document.getElementById("bootErrorMessage").textContent=/fetch|network|failed to/i.test(message)?"No se pudo conectar con el servicio de acceso. Comprueba la conexión y pulsa Reintentar.":`No se pudo preparar el acceso: ${message||"error inesperado"}. Pulsa Reintentar.`;
  document.getElementById("bootError").classList.remove("hidden");
  const badge=document.getElementById("environmentBadge");badge.dataset.env="unknown";badge.textContent="ENTORNO SIN VERIFICAR";
}

async function startRenzoHub(){
try{
// Dynamic loading keeps a CDN failure visible and recoverable instead of leaving a blank page.
const importSupabase=()=>Promise.race([import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/+esm"),new Promise((_,reject)=>setTimeout(()=>reject(new Error("El servicio de acceso tardó demasiado en responder.")),12000))]);
const {createClient}=await importSupabase();
const fetchWithTimeout=(url,options={},timeoutMs=10000)=>{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);return fetch(url,{...options,signal:controller.signal}).finally(()=>clearTimeout(timer));};
const configResponse=await fetchWithTimeout("/api/supabase-config",{cache:"no-store"},10000);
if(!configResponse.ok)throw new Error(configResponse.status===503?"La configuración de acceso de este entorno no está lista.":"El servicio de acceso no respondió correctamente.");
const supabaseConfig=await configResponse.json();
if(!supabaseConfig.supabaseUrl||!supabaseConfig.publishableKey)throw new Error("La configuración de acceso de este entorno está incompleta.");
const supabase=createClient(supabaseConfig.supabaseUrl,supabaseConfig.publishableKey);
fetchWithTimeout("/api/deployment-info",{cache:"no-store"},5000).then(r=>r.ok?r.json():Promise.reject()).then(info=>{
 const badge=document.getElementById("environmentBadge");
 const env=info.environment==="production"?"production":info.environment==="preview"?"preview":"unknown";
 badge.dataset.env=env;badge.textContent=env==="production"?"PRODUCCIÓN · PÚBLICA":env==="preview"?"PREVIEW · ENTORNO DE PRUEBAS":"ENTORNO SIN VERIFICAR";
}).catch(()=>{const badge=document.getElementById("environmentBadge");badge.dataset.env="unknown";badge.textContent="ENTORNO SIN VERIFICAR";});
const news=mountNews(document.getElementById("news"),supabase,()=>user);
const gym=mountGym(document.getElementById("gym"),supabase,()=>user);
const world=mountWorld({home:document.getElementById("worldHome"),body:document.getElementById("worldBody"),work:document.getElementById("worldWork"),money:document.getElementById("worldMoney"),system:document.getElementById("worldSystem"),study:document.getElementById("worldStudy"),car:document.getElementById("worldCar")},()=>user,supabase);

const PRODUCTS=[["Arencia Fresh Green Rice Mochi Cleanser", "Limpiador principal", "Diario", "assets/skin_6.jpeg"], ["CeraVe Foaming Cleanser", "Limpiador alternativo", "Si notas más grasa", "assets/skin_7.jpeg"], ["Eucerin DermoPure Clinical Correcting Cleanser 2%", "Limpiador exfoliante", "1 vez/semana", "assets/skin_8.jpeg"], ["COSRX Advanced Snail 96 Mucin Power Essence", "Hidratación", "Mañana y noche", "assets/skin_1.jpeg"], ["SKIN1004 Madagascar Centella Ampoule", "Calmante", "Según rutina", "assets/skin_1.jpeg"], ["Paula’s Choice Skin Perfecting 2% BHA Liquid", "Puntos negros", "2 noches/semana", "assets/skin_2.jpeg"], ["Dr. Althea Vitamin C Boosting Serum", "Luminosidad", "3–4 mañanas/semana", "assets/skin_2.jpeg"], ["Anua Niacinamide 10% + TXA 4%", "Manchas y tono", "2 noches/semana", "assets/skin_2.jpeg"], ["ILLIYOON Ceramide Ato Concentrate Cream", "Barrera", "Principalmente noche", "assets/skin_3.jpeg"], ["AXIS-Y Dark Spot Correcting Glow Serum", "Antimanchas alternativo", "Alternativa al Anua", "assets/skin_3.jpeg"], ["Heliocare 360 Pigment Solution Fluid SPF50+", "Protector solar", "Cada mañana", "assets/skin_4.jpeg"], ["Avène Sunsimed Pigment", "Protector solar alternativo", "Alternativa al Heliocare", "assets/skin_4.jpeg"], ["NUXE Zinc Power", "Imperfecciones", "Opcional", "assets/skin_3.jpeg"]];
const AM=[["Limpiar","Arencia Fresh Green Rice Mochi Cleanser · o CeraVe si notas más grasa"],["Calmar","SKIN1004 Madagascar Centella Ampoule"],["Cuidar el tono y las manchas","Dr. Althea Vitamin C Boosting Serum · solo si lo toleras"],["Hidratar","COSRX Advanced Snail 96"],["Barrera","ILLIYOON Ceramide Cream · si lo necesitas"],["Proteger y prevenir nuevas manchas","Heliocare 360 Pigment Solution SPF50+ · o Avène Sunsimed Pigment"]];

const PM={
0:[["Limpiar","Arencia"],["Calmar","SKIN1004 Centella"],["Hidratar","COSRX Snail 96"],["Sellar","ILLIYOON"]],
1:[["Limpiar","Arencia"],["Reducir puntos negros","Paula’s Choice 2% BHA · omitir si hay irritación"],["Hidratar","COSRX Snail 96"],["Sellar","ILLIYOON"]],
2:[["Limpiar","Arencia o CeraVe"],["Calmar","SKIN1004 Centella"],["Tratar manchas","Anua Niacinamide 10% + TXA 4% · o AXIS-Y como alternativa; solo uno y si lo toleras"],["Hidratar","COSRX Snail 96"],["Sellar","ILLIYOON"]],
3:[["Limpiar exfoliando","Eucerin DermoPure 2% · opcional, según etiqueta; usa Arencia si hay sensibilidad"],["Calmar","SKIN1004 Centella"],["Hidratar","COSRX Snail 96"],["Sellar","ILLIYOON"]],
4:[["Limpiar","Arencia"],["Reducir puntos negros","Paula’s Choice 2% BHA · omitir si hay irritación"],["Hidratar","COSRX Snail 96"],["Sellar","ILLIYOON"]],
5:[["Limpiar","Arencia o CeraVe"],["Calmar","SKIN1004 Centella"],["Tratar manchas","Anua Niacinamide 10% + TXA 4% · o AXIS-Y como alternativa; solo uno y si lo toleras"],["Hidratar","COSRX Snail 96"],["Sellar","ILLIYOON"]],
6:[["Limpiar","Arencia"],["Calmar","SKIN1004 Centella"],["Hidratar","COSRX Snail 96"],["Sellar","ILLIYOON"]]
};

const DAYS=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
let now=new Date();
const localDate=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
let dateKey=localDate(now);
let mode=now.getHours()>=18?"pm":"am";
let user=null;
mountJarvis(supabase,()=>user);
mountWorldExtensions(supabase,()=>user);
const profile=mountProfile(supabase,()=>user);
const phase1=mountPhase1(supabase,()=>user);
let cloudState={am:[],pm:[]};
let noteTimer=null;
let selectedDay=null;
let gentle=false;
let weekRows=[];
let loadSequence=0;

const $=id=>document.getElementById(id);
function readJSON(key,fallback={}){try{const value=localStorage.getItem(key);return value?JSON.parse(value):fallback;}catch{return fallback;}}
function writeJSON(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Storage may be disabled; the live session can still work. */}}

function showAuth(message="",kind=""){
  $("bootError").classList.add("hidden");
  $("authScreen").classList.remove("hidden");
  $("appShell").classList.add("hidden");
  $("bottomNav").classList.add("hidden");
  $("authMessage").textContent=message;
  $("authMessage").className="authmsg "+kind;
}
function showApp(){
  $("authScreen").classList.add("hidden");
  $("appShell").classList.remove("hidden");
  $("bottomNav").classList.remove("hidden");
  $("userEmail").textContent=user?.email||"";
  const saved=readJSON(`renzo-nav:${user?.id}`,null);
  if(saved&&["home","body","work","money","system","study","car","gym","food","skin","news","settings"].includes(saved.section))go(saved.section,true);
}
function setSync(text,kind="ok"){
  const el=$("syncState");
  el.querySelector("span:last-child").textContent=text;
  const dot=el.querySelector(".dot");
  dot.className="dot"+(kind==="busy"?" busy":kind==="err"?" err":"");
}
const MICROAPP_IDS=new Set(["gym","food","skin","car","news","settings"]);
function go(id,restore=false){
  if(id==="news")news.load();
  if(["home","body","work","money","system","study","car"].includes(id))world.render(id);
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  $(id).classList.add("active");
  document.body.classList.toggle("microapp-open",MICROAPP_IDS.has(id));
  document.body.dataset.activeSection=id;
  document.querySelectorAll(".nav button").forEach(b=>b.classList.toggle("active",b.dataset.open===id));
  const saved=readJSON(`renzo-nav:${user?.id}`,{});
  const scrollY=restore?Number(saved.scrollY)||0:0;
  writeJSON(`renzo-nav:${user?.id}`,{section:id,scrollY});
  requestAnimationFrame(()=>window.scrollTo(0,scrollY));
}
document.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.open)));
let navSaveTimer;
window.addEventListener("scroll",()=>{if(!user)return;clearTimeout(navSaveTimer);navSaveTimer=setTimeout(()=>{const saved=readJSON(`renzo-nav:${user.id}`,{});writeJSON(`renzo-nav:${user.id}`,{...saved,scrollY:window.scrollY});},180);},{passive:true});

function current(){
 const steps=mode==="am"?AM:PM[now.getDay()];
 if(!gentle)return steps;
 return steps.map(([title,product])=>{
  if(title==="Reducir puntos negros"||title==="Tratar manchas"||title==="Cuidar el tono y las manchas")return ["Pausar este activo","Rutina suave: omite este producto hoy"];
  if(title==="Limpiar exfoliando")return ["Limpiar suavemente","Arencia o CeraVe · sin limpiador exfoliante"];
  return [title,product];
 });
}
function renderWeek(){
 const rows=[];
 for(let i=6;i>=0;i--){
  const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-i);const key=localDate(d);
  const logs=weekRows.filter(r=>r.routine_date===key);
  const status=session=>{
   const log=logs.find(r=>r.session===session);const count=(log?.completed_steps||[]).filter(v=>Number.isInteger(v)&&v>=0&&v<(session==="am"?AM.length:PM[d.getDay()].length)).length;
   return count===0?"sin registro":count===(session==="am"?AM.length:PM[d.getDay()].length)?"completa":count+" pasos";
  };
  rows.push(new Intl.DateTimeFormat("es",{weekday:"short",day:"numeric"}).format(d)+" · AM: "+status("am")+" · PM: "+status("pm"));
 }
 $("weekProgress").textContent="";rows.forEach(text=>{const line=document.createElement("div");line.textContent=text;$("weekProgress").appendChild(line);});
 const today=localDate(new Date());const todayLogs=weekRows.filter(r=>r.routine_date===today);const total=AM.length+PM[new Date().getDay()].length;
 $("skinPct").textContent=Math.round(todayLogs.reduce((n,r)=>n+(r.completed_steps||[]).length,0)/total*100)+"%";
}

async function loadCloudState(){
  if(!user)return;
  const seq=++loadSequence;
  now=selectedDay?new Date(selectedDay+"T12:00:00"):new Date();
  dateKey=localDate(now);
  const requestedDate=dateKey,requestedUser=user.id;
  setSync("Cargando…","busy");
  const {data,error}=await supabase.from("skin_routine_logs")
    .select("session,completed_steps")
    .eq("routine_date",dateKey)
    .eq("user_id",user.id);
  if(seq!==loadSequence||user?.id!==requestedUser)return;
  if(error){console.error(error);setSync("Error al cargar","err");return;}
  cloudState={am:[],pm:[]};
  for(const row of data||[]) cloudState[row.session]=Array.isArray(row.completed_steps)?row.completed_steps:[];

  const {data:noteData,error:noteError}=await supabase.from("skin_notes")
    .select("note")
    .eq("note_date",dateKey)
    .eq("user_id",user.id)
    .maybeSingle();
  if(seq!==loadSequence||user?.id!==requestedUser)return;
  if(!noteError) $("note").value=noteData?.note||"";

  if(!selectedDay)await migrateLocalIfNeeded();
  const since=new Date();since.setDate(since.getDate()-6);
  const {data:week,error:weekError}=await supabase.from("skin_routine_logs").select("routine_date,session,completed_steps").eq("user_id",requestedUser).gte("routine_date",localDate(since)).lte("routine_date",localDate(new Date()));
  if(seq!==loadSequence||user?.id!==requestedUser)return;
  if(!weekError){weekRows=week||[];renderWeek();}else{$("weekProgress").textContent="No se pudo cargar el progreso semanal.";}
  render();
  homeStats();
  setSync("Sincronizado","ok");
}

async function migrateLocalIfNeeded(){
  const old=localStorage.getItem("hub-"+dateKey);
  if(old && cloudState.am.length===0 && cloudState.pm.length===0){
    try{
      const parsed=JSON.parse(old);
      for(const s of ["am","pm"]){
        if(Array.isArray(parsed[s]) && parsed[s].length){
          await saveSession(s,parsed[s],false);
          cloudState[s]=parsed[s];
        }
      }
    }catch{}
  }
  const oldNote=localStorage.getItem("hub-note-"+dateKey);
  if(oldNote && !$("note").value){
    $("note").value=oldNote;
    await saveNote(oldNote,false);
  }
}

async function saveSession(session,stepsArray,updateUI=true){
  if(!user||selectedDay)return false;
  if(updateUI)setSync("Guardando…","busy");
  const {error}=await supabase.from("skin_routine_logs").upsert({
    user_id:user.id,
    routine_date:dateKey,
    session,
    completed_steps:stepsArray
  },{onConflict:"user_id,routine_date,session"});
  if(error){console.error(error);setSync("No se pudo guardar","err");return false;}
  cloudState[session]=stepsArray;
  weekRows=weekRows.filter(r=>!(r.routine_date===dateKey&&r.session===session));weekRows.push({routine_date:dateKey,session,completed_steps:stepsArray});renderWeek();
  if(updateUI)setSync("Sincronizado","ok");
  return true;
}
async function saveNote(value,updateUI=true){
  if(!user||selectedDay)return;
  if(updateUI)$("noteState").textContent="Guardando…";
  const {error}=await supabase.from("skin_notes").upsert({
    user_id:user.id,
    note_date:dateKey,
    note:value
  },{onConflict:"user_id,note_date"});
  $("noteState").textContent=error?"No se pudo guardar":"Guardado";
  if(error)console.error(error);
}

function render(){
  const history=Boolean(selectedDay);
  $("note").readOnly=history;$("clearBtn").disabled=history;$("completeBtn").disabled=history;$("gentleBtn").disabled=history;
  $("nextDay").disabled=!history;$("historyLabel").textContent=history?"Historial · solo lectura":"Rutina de hoy";
  $("gentleBtn").textContent=gentle?"Rutina suave activada · volver al plan":"Activar rutina suave";
  $("gentleBtn").setAttribute("aria-pressed",String(gentle));$("gentleHint").classList.toggle("hidden",!gentle);

  $("skinDate").textContent=new Intl.DateTimeFormat("es",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(now);
  const focus={0:"Recuperación e hidratación",1:"Puntos negros",2:"Cuidado de las manchas",3:"Limpieza y cuidado de la barrera",4:"Puntos negros",5:"Cuidado de las manchas",6:"Recuperación e hidratación"};
  $("skinFocus").textContent=mode==="am"?"Hoy por la mañana: tono uniforme y protección solar":"Hoy por la noche: "+focus[now.getDay()];
  const arr=current(), done=new Set(cloudState[mode]||[]);
  $("pill").textContent=mode==="am"?"MAÑANA":"NOCHE";
  $("switchBtn").textContent=mode==="am"?"Cambiar a noche":"Cambiar a mañana";
  $("routineTitle").textContent=mode==="am"?"Rutina de "+DAYS[now.getDay()]+" por la mañana":"Rutina de "+DAYS[now.getDay()]+" por la noche";
  $("steps").innerHTML="";
  arr.forEach((x,i)=>{
    const ok=done.has(i),el=document.createElement("div");
    el.className="step"+(ok?" done":"");
    el.innerHTML='<button class="check '+(ok?'done':'')+'" data-i="'+i+'">'+(ok?'✓':'')+'</button><div class="txt"><div class="st">'+(i+1)+'. '+x[0]+'</div><div class="ss">'+x[1]+'</div></div>';
    $("steps").appendChild(el);
  });
  $("steps").querySelectorAll(".check").forEach(b=>b.addEventListener("click",async()=>{
    if(selectedDay)return;
    const i=Number(b.dataset.i);
    let next=[...(cloudState[mode]||[])];
    next=next.includes(i)?next.filter(v=>v!==i):next.concat(i);
    cloudState[mode]=next;
    render();homeStats();
    await saveSession(mode,next,true);
  }));
  $("steps").querySelectorAll(".check").forEach(b=>b.disabled=history);
  const pct=Math.round(done.size/arr.length*100);
  $("bar").style.width=pct+"%";
  $("prog").textContent=done.size+" de "+arr.length+" pasos · "+pct+"%";
}

async function chooseDay(offset){
 clearTimeout(noteTimer);
 if(!selectedDay&&$("noteState").textContent==="Pendiente…")await saveNote($("note").value);
 const d=new Date(now);d.setDate(d.getDate()+offset);const key=localDate(d);
 selectedDay=key===localDate(new Date())?null:key;gentle=false;await loadCloudState();
}
$("prevDay").addEventListener("click",()=>chooseDay(-1));
$("nextDay").addEventListener("click",()=>chooseDay(1));
$("todayBtn").addEventListener("click",async()=>{clearTimeout(noteTimer);if(!selectedDay&&$("noteState").textContent==="Pendiente…")await saveNote($("note").value);selectedDay=null;gentle=false;await loadCloudState();});
$("gentleBtn").addEventListener("click",()=>{gentle=!gentle;render();});
$("switchBtn").addEventListener("click",()=>{mode=mode==="am"?"pm":"am";render()});
$("clearBtn").addEventListener("click",async()=>{
  cloudState[mode]=[];render();homeStats();await saveSession(mode,[],true);
});
$("completeBtn").addEventListener("click",async()=>{
  const next=current().map((_,i)=>i);cloudState[mode]=next;render();homeStats();await saveSession(mode,next,true);
});
$("note").addEventListener("input",()=>{
  $("noteState").textContent="Pendiente…";
  clearTimeout(noteTimer);
  noteTimer=setTimeout(()=>saveNote($("note").value,true),600);
});

$("productList").innerHTML=PRODUCTS.map(p=>'<div class="product"><img src="'+p[3]+'" alt=""><div><b>'+p[0]+'</b><span>'+p[1]+'</span><span>'+p[2]+'</span></div></div>').join("");

function homeStats(){
  renderWeek();
  const h=now.getHours();
  $("greeting").textContent=h<12?"Buenos días.":h<19?"Buenas tardes.":"Buenas noches.";
  $("streak").textContent="—";
}

$("loginForm").addEventListener("submit",async e=>{
  e.preventDefault();
  $("authMessage").textContent="Entrando…";
  $("authMessage").className="authmsg";
  try{const {error}=await supabase.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});if(error)throw error;}
  catch(error){$("authMessage").textContent=error?.message||"No se pudo iniciar sesión. Comprueba la conexión e inténtalo de nuevo.";$("authMessage").className="authmsg err";}
});
$("logoutBtn").addEventListener("click",async()=>{await supabase.auth.signOut();});

supabase.auth.onAuthStateChange((event,session)=>{
  user=session?.user||null;
  if(user){showApp();setTimeout(()=>{Promise.allSettled([loadCloudState(),gym.load(),world.load(),profile.load(),phase1.load()]).then(results=>{if(results.some(result=>result.status==="rejected"))setSync("Conectado · algunos datos no se pudieron cargar","err");});},0);}
  else{gym.reset();world.reset();profile.reset();phase1.reset();loadSequence++;selectedDay=null;weekRows=[];gentle=false;cloudState={am:[],pm:[]};clearTimeout(noteTimer);$("note").value="";showAuth();}
});

let session=null;
try{const {data,error}=await supabase.auth.getSession();if(error)throw error;session=data?.session||null;}
catch(error){console.warn("Could not restore Renzo Hub session; keeping sign-in available",error);showAuth("No se pudo restaurar la sesión. Puedes volver a iniciar sesión.","err");}
user=session?.user||null;
if(user){showApp();const results=await Promise.allSettled([loadCloudState(),gym.load(),world.load(),profile.load(),phase1.load()]);if(results.some(result=>result.status==="rejected"))setSync("Conectado · algunos datos no se pudieron cargar","err");}else if(!document.getElementById("authMessage").textContent){showAuth();}

window.addEventListener("focus",()=>{if(user)loadCloudState();});
if("serviceWorker" in navigator){
 navigator.serviceWorker.register("/sw.js").then(reg=>{
   const showUpdate=()=>$("updateBanner").classList.remove("hidden");
   if(reg.waiting&&navigator.serviceWorker.controller)showUpdate();
   reg.addEventListener("updatefound",()=>{const worker=reg.installing;if(!worker)return;worker.addEventListener("statechange",()=>{if(worker.state==="installed"&&navigator.serviceWorker.controller)showUpdate();});});
   $("updateNow").onclick=()=>{if(reg.waiting)reg.waiting.postMessage({type:"SKIP_WAITING"});else location.reload();};
   navigator.serviceWorker.addEventListener("controllerchange",()=>location.reload());
   setInterval(()=>reg.update().catch(()=>{}),60*60*1000);
 }).catch(()=>{});
}
}catch(error){console.error("Renzo Hub startup failed",error);showStartupError(error);}
}
document.getElementById("bootRetry").addEventListener("click",()=>location.reload());
startRenzoHub();
