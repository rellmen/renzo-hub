import {installErrorLog} from "./microapps/errors.js";
import {AREAS,MICROAPPS,SECTION_IDS,findMicroapp,navAreaOf,isFullscreen,areaTabsHTML,homeTilesHTML} from "./microapps/registry.js";
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
let releasePromise=null;
const currentRelease=()=>releasePromise||(releasePromise=fetch("/release.json",{cache:"no-store"}).then(r=>r.json()).then(j=>j.release||"?").catch(()=>"?"));
// Registro de errores de la app (microapps/errors.js): se guardan en la fila del usuario y se ven en System.
const errorLog=installErrorLog(supabase,()=>user,{release:currentRelease});
fetchWithTimeout("/api/deployment-info",{cache:"no-store"},5000).then(r=>r.ok?r.json():Promise.reject()).then(info=>{
 const badge=document.getElementById("environmentBadge");
 const env=info.environment==="production"?"production":info.environment==="preview"?"preview":"unknown";
 badge.dataset.env=env;badge.textContent=env==="production"?"PRODUCCIÓN · PÚBLICA":env==="preview"?"PREVIEW · ENTORNO DE PRUEBAS":"ENTORNO SIN VERIFICAR";
}).catch(()=>{const badge=document.getElementById("environmentBadge");badge.dataset.env="unknown";badge.textContent="ENTORNO SIN VERIFICAR";});
const world=mountWorld({home:document.getElementById("worldHome"),body:document.getElementById("worldBody"),work:document.getElementById("worldWork"),money:document.getElementById("worldMoney"),system:document.getElementById("worldSystem"),study:document.getElementById("worldStudy"),car:document.getElementById("worldCar")},()=>user,supabase);

let user=null;
// Microapps del registro (microapps/registry.js): se crean su sección y su CSS si faltan, se importan en
// paralelo y se montan con el contrato mount(root, db, getUser, go). Si una falla, el resto sigue funcionando.
const apps={};
const pageHost=document.getElementById("home").parentElement;
const moduleApps=MICROAPPS.filter(m=>m.module);
const mounted=await Promise.allSettled(moduleApps.map(async m=>{
  let root=document.getElementById(m.id);
  if(!root){root=document.createElement("section");root.id=m.id;root.className="page";pageHost.insertBefore(root,document.getElementById("system"));}
  if(m.css&&!document.querySelector(`link[rel="stylesheet"][href="${m.css}"]`)){const link=document.createElement("link");link.rel="stylesheet";link.href=m.css;document.head.append(link);}
  const mod=await import(m.module);
  if(typeof mod[m.mount]!=="function")throw new Error(`${m.module} no exporta ${m.mount}`);
  apps[m.id]=mod[m.mount](root,supabase,()=>user,go)||{};
}));
mounted.forEach((result,i)=>{
  if(result.status==="fulfilled")return;
  const m=moduleApps[i];console.error(`No se pudo cargar la microapp ${m.id}`,result.reason);errorLog.report(result.reason,{kind:"microapp",source:m.module});
  const root=document.getElementById(m.id);
  if(root)root.innerHTML=`<button class="microapp-back" data-open="${m.area}">← ${AREAS[m.area].name}</button><p class="small">No se pudo cargar ${m.name}. Recarga la página.</p>`;
});
const eachApp=fn=>Object.values(apps).forEach(api=>{try{fn(api);}catch(error){console.error(error);}});
const signInLoads=()=>MICROAPPS.filter(m=>m.loadOnSignIn&&apps[m.id]?.load).map(m=>apps[m.id].load());
document.querySelectorAll("[data-area-tabs]").forEach(node=>{node.outerHTML=areaTabsHTML(node.dataset.areaTabs,node.dataset.areaTabs);});
{const tiles=homeTilesHTML(),box=document.querySelector("[data-microapp-tiles=home]");if(box&&tiles){box.querySelector("[data-tiles]").innerHTML=tiles;box.hidden=false;}}

// Enlace directo genérico: ?app=<id>&<deepLink>=<valor>
const linkQuery=new URLSearchParams(location.search);
const linkApp=findMicroapp(linkQuery.get("app"));
let deepLink=linkApp?{id:linkApp.id,param:linkApp.deepLink?linkQuery.get(linkApp.deepLink):null}:null;
if(deepLink){const clean=new URL(location.href);clean.searchParams.delete("app");if(linkApp.deepLink)clean.searchParams.delete(linkApp.deepLink);history.replaceState(null,"",clean);}

mountJarvis(supabase,()=>user);
mountWorldExtensions(supabase,()=>user);
const profile=mountProfile(supabase,()=>user);
const phase1=mountPhase1(supabase,()=>user);

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
  if(deepLink){const link=deepLink;deepLink=null;go(link.id);if(link.param)apps[link.id]?.open?.(link.param);return;}
  const saved=readJSON(`renzo-nav:${user?.id}`,null);
  if(saved&&SECTION_IDS.includes(saved.section))go(saved.section,true);
}
function setSync(text,kind="ok"){
  const el=$("syncState");
  el.querySelector("span:last-child").textContent=text;
  const dot=el.querySelector(".dot");
  dot.className="dot"+(kind==="busy"?" busy":kind==="err"?" err":"");
}
function go(id,restore=false){
  if(!document.getElementById(id))id="home";
  for(const [appId,api] of Object.entries(apps)){try{if(appId===id)api.open?.();else api.close?.();}catch(error){console.error(error);}}
  if(AREAS[id])world.render(id);
  if(id==="system")errorLog.renderPanel($("appErrors"));
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  $(id).classList.add("active");
  document.body.classList.toggle("microapp-open",isFullscreen(id));
  document.body.dataset.activeSection=id;
  const navId=navAreaOf(id);
  document.querySelectorAll(".nav button").forEach(b=>b.classList.toggle("active",b.dataset.open===navId));
  const saved=readJSON(`renzo-nav:${user?.id}`,{});
  const scrollY=restore?Number(saved.scrollY)||0:0;
  writeJSON(`renzo-nav:${user?.id}`,{section:id,scrollY});
  requestAnimationFrame(()=>window.scrollTo(0,scrollY));
}
// Un solo listener para todo [data-open], también para el HTML que las microapps pintan después.
document.addEventListener("click",event=>{const b=event.target.closest("[data-open]");if(b&&SECTION_IDS.includes(b.dataset.open))go(b.dataset.open);});
let navSaveTimer;
window.addEventListener("scroll",()=>{if(!user)return;const uid=user.id;clearTimeout(navSaveTimer);navSaveTimer=setTimeout(()=>{if(user?.id!==uid)return;const saved=readJSON(`renzo-nav:${uid}`,{});writeJSON(`renzo-nav:${uid}`,{...saved,scrollY:window.scrollY});},180);},{passive:true});

$("loginForm").addEventListener("submit",async e=>{
  e.preventDefault();
  $("authMessage").textContent="Entrando…";
  $("authMessage").className="authmsg";
  try{const {error}=await supabase.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});if(error)throw error;}
  catch(error){$("authMessage").textContent=error?.message||"No se pudo iniciar sesión. Comprueba la conexión e inténtalo de nuevo.";$("authMessage").className="authmsg err";}
});
$("logoutBtn").addEventListener("click",async()=>{await supabase.auth.signOut();});

supabase.auth.onAuthStateChange((event,session)=>{
  if(user?.id!==session?.user?.id)eachApp(api=>api.reset?.());
  user=session?.user||null;
  if(user){showApp();errorLog.flush();setTimeout(()=>{Promise.allSettled([...signInLoads(),world.load(),profile.load(),phase1.load()]).then(results=>{if(results.some(result=>result.status==="rejected"))setSync("Conectado · algunos datos no se pudieron cargar","err");});},0);}
  else{eachApp(api=>api.reset?.());world.reset();profile.reset();phase1.reset();showAuth();}
});

let session=null;
try{const {data,error}=await supabase.auth.getSession();if(error)throw error;session=data?.session||null;}
catch(error){console.warn("Could not restore Renzo Hub session; keeping sign-in available",error);showAuth("No se pudo restaurar la sesión. Puedes volver a iniciar sesión.","err");}
user=session?.user||null;
if(user){showApp();const results=await Promise.allSettled([...signInLoads(),world.load(),profile.load(),phase1.load()]);if(results.some(result=>result.status==="rejected"))setSync("Conectado · algunos datos no se pudieron cargar","err");}else if(!document.getElementById("authMessage").textContent){showAuth();}

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
