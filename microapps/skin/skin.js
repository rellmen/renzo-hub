import {readSkinInventory,updateSkinInventory} from './inventory.js';
// Microapp Skin (rutina de piel AM/PM, notas y progreso semanal). Extraída de app.js en 2.9.2 sin cambios
// visibles. Datos: tablas skin_routine_logs y skin_notes (RLS por user_id). El HTML sigue en index.html (#skin).
export function mountSkin(root, db, getUser) {
  const $ = id => root.querySelector("#" + id);
  // Algunos elementos antiguos ya no existen (p. ej. skinPct): escribir solo si están, para no romper la carga.
  const setText = (id, value) => { const el = $(id); if (el) el.textContent = value; };
  function setSync(text, kind = "ok") {
    const el = $("syncState"); if (!el) return;
    el.querySelector("span:last-child").textContent = text;
    const dot = el.querySelector(".dot");
    dot.className = "dot" + (kind === "busy" ? " busy" : kind === "err" ? " err" : "");
  }
  const PRODUCTS=[["Arencia Fresh Green Rice Mochi Cleanser", "Limpiador principal", "Diario", "assets/skin_6.jpeg"], ["CeraVe Foaming Cleanser", "Limpiador alternativo", "Si notas más grasa", "assets/skin_7.jpeg"], ["Eucerin DermoPure Clinical Correcting Cleanser 2%", "Limpiador exfoliante", "Pausar durante descamación; no combinar con otros exfoliantes", "assets/skin_8.jpeg"], ["COSRX Advanced Snail 96 Mucin Power Essence", "Hidratación", "Mañana y noche", "assets/skin_1.jpeg"], ["SKIN1004 Madagascar Centella Tone Brightening Capsule Ampoule", "Calmante y tono", "Opcional si la piel lo tolera", "assets/skin_1.jpeg"], ["Paula’s Choice Skin Perfecting 2% BHA Liquid", "Puntos negros", "Pausar durante descamación; no usar en noches de retinal", "assets/skin_2.jpeg"], ["Dr. Althea Vitamin C Boosting Serum", "Luminosidad", "Pausar hasta recuperar barrera; retomar solo si toleras", "assets/skin_2.jpeg"], ["Anua Niacinamide 10% + TXA 4%", "Manchas y tono", "Posponer hasta recuperación; no combinar activos al iniciar retinal", "assets/skin_2.jpeg"], ["ILLIYOON Ceramide Ato Concentrate Cream", "Barrera", "Principalmente noche", "assets/skin_3.jpeg"], ["AXIS-Y Dark Spot Correcting Glow Serum", "Antimanchas alternativo", "Alternativa al Anua", "assets/skin_3.jpeg"], ["Heliocare 360 Pigment Solution Fluid SPF50+", "Protector solar", "Cada mañana", "assets/skin_4.jpeg"], ["Avène Sunsimed Pigment", "Protector solar alternativo", "Alternativa al Heliocare", "assets/skin_4.jpeg"], ["celimax Retinal Shot Tightening Booster", "Retinoide nocturno", "Pausar con descamación; introducir gradualmente cuando la barrera se recupere", "assets/skin_3.jpeg"], ["NUXE Zinc Power", "Imperfecciones", "Pausar durante descamación", "assets/skin_3.jpeg"], ["Isntree Hyaluronic Acid Toner Plus", "Tónico hidratante", "Opcional: evita duplicar demasiadas capas hidratantes", "assets/skin_1.jpeg"], ["AXIS-Y Vegan Collagen Eye Serum", "Contorno de ojos", "Opcional; no necesario para manchas faciales", "assets/skin_3.jpeg"], ["Ondo Beauty 36.5 Dark Spot Treatment", "Tratamiento de manchas", "Reservar como alternativa, no combinar múltiples activos inicialmente", "assets/skin_2.jpeg"], ["Differin 0.1% (adapaleno)", "Retinoide alternativo", "No combinar con retinal Celimax; consultar indicación y tolerancia", "assets/skin_3.jpeg"], ["Aceite de ricino Deliplus", "Aceite", "Fuera de la rutina facial principal", "assets/skin_3.jpeg"]];
  // Barrier-first for reported dryness/flaking. Retinal may be resumed only when comfortable.
  const AM=[["Limpiar suavemente","Arencia Fresh Green Rice Mochi Cleanser · sin limpiadores exfoliantes"],
    ["Calmar (opcional)","SKIN1004 Centella Tone Brightening Capsule Ampoule"],
    ["Hidratar (opcional)","COSRX Snail 96 · si lo toleras"],
    ["Reforzar barrera","ILLIYOON Ceramide Ato Concentrate Cream"],
    ["Protección imprescindible","Heliocare 360 Pigment Solution SPF50+ · aplicar cantidad suficiente y reaplicar durante exposición"]];
  const BASE=[["Limpiar","Arencia Fresh Green Rice Mochi Cleanser"],
    ["Calmar e hidratar","SKIN1004 Centella o COSRX Snail 96 · elegir según tolerancia"],
    ["Reparar barrera","ILLIYOON Ceramide Ato Concentrate Cream"]];
  const PM={
    0:BASE,1:BASE,2:BASE,3:BASE,4:BASE,
    5:[BASE[0],["Retinal opcional (solo piel recuperada)","celimax Retinal Shot Tightening Booster · cantidad pequeña, sobre piel seca. Empezar una noche/semana; no usar con descamación o irritación. Evitar durante embarazo."],BASE[2]],
    6:BASE
  };
  const DAYS=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  let now=new Date();
  const localDate=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
  let dateKey=localDate(now);
  let mode=now.getHours()>=18?"pm":"am";
  let cloudState={am:[],pm:[]};
  let noteTimer=null;
  let selectedDay=null;
  let gentle=true;
  let weekRows=[];
  let loadSequence=0;
  function current(){
   const steps=mode==="am"?AM:PM[now.getDay()];
   if(!gentle)return steps;
   return steps.map(([title,product])=>{
    if(title==="Retinal opcional (solo piel recuperada)"||title==="Reducir puntos negros"||title==="Tratar manchas"||title==="Cuidar el tono y las manchas")return ["Pausar este activo","Rutina suave: omite este producto hoy"];
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
   setText("skinPct",Math.round(todayLogs.reduce((n,r)=>n+(r.completed_steps||[]).length,0)/total*100)+"%");
  }

  async function loadCloudState(){
    if(!getUser())return;
    const seq=++loadSequence;
    now=selectedDay?new Date(selectedDay+"T12:00:00"):new Date();
    dateKey=localDate(now);
    const requestedDate=dateKey,requestedUser=getUser().id;
    setSync("Cargando…","busy");
    const {data,error}=await db.from("skin_routine_logs")
      .select("session,completed_steps")
      .eq("routine_date",dateKey)
      .eq("user_id",getUser().id);
    if(seq!==loadSequence||getUser()?.id!==requestedUser)return;
    if(error){console.error(error);setSync("Error al cargar","err");return;}
    cloudState={am:[],pm:[]};
    for(const row of data||[]) cloudState[row.session]=Array.isArray(row.completed_steps)?row.completed_steps:[];

    const {data:noteData,error:noteError}=await db.from("skin_notes")
      .select("note")
      .eq("note_date",dateKey)
      .eq("user_id",getUser().id)
      .maybeSingle();
    if(seq!==loadSequence||getUser()?.id!==requestedUser)return;
    if(!noteError) $("note").value=noteData?.note||"";

    if(!selectedDay)await migrateLocalIfNeeded();
    const since=new Date();since.setDate(since.getDate()-6);
    const {data:week,error:weekError}=await db.from("skin_routine_logs").select("routine_date,session,completed_steps").eq("user_id",requestedUser).gte("routine_date",localDate(since)).lte("routine_date",localDate(new Date()));
    if(seq!==loadSequence||getUser()?.id!==requestedUser)return;
    if(!weekError){weekRows=week||[];renderWeek();}else{$("weekProgress").textContent="No se pudo cargar el progreso semanal.";}
    render();
    renderInventory();
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
    if(!getUser()||selectedDay)return false;
    if(updateUI)setSync("Guardando…","busy");
    const {error}=await db.from("skin_routine_logs").upsert({
      user_id:getUser().id,
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
    if(!getUser()||selectedDay)return;
    if(updateUI)$("noteState").textContent="Guardando…";
    const {error}=await db.from("skin_notes").upsert({
      user_id:getUser().id,
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
    const focus={0:"Barrera e hidratación",1:"Barrera e hidratación",2:"Barrera e hidratación",3:"Barrera e hidratación",4:"Barrera e hidratación",5:"Retinal solo si no hay irritación",6:"Barrera e hidratación"};
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
      const session=mode, previous=[...(cloudState[session]||[])];
      cloudState[session]=next;
      render();homeStats();
      if(!await saveSession(session,next,true)){
        cloudState[session]=previous;
        render();homeStats();
        setSync("No se pudo guardar; se restauró el registro anterior","err");
      }
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
   selectedDay=key===localDate(new Date())?null:key;gentle=true;await loadCloudState();
  }
  $("prevDay").addEventListener("click",()=>chooseDay(-1));
  $("nextDay").addEventListener("click",()=>chooseDay(1));
  $("todayBtn").addEventListener("click",async()=>{clearTimeout(noteTimer);if(!selectedDay&&$("noteState").textContent==="Pendiente…")await saveNote($("note").value);selectedDay=null;gentle=true;await loadCloudState();});
  $("gentleBtn").addEventListener("click",()=>{gentle=!gentle;render();});
  $("switchBtn").addEventListener("click",()=>{mode=mode==="am"?"pm":"am";render()});
  $("clearBtn").addEventListener("click",async()=>{
    const session=mode,previous=[...(cloudState[session]||[])];cloudState[session]=[];render();homeStats();
    if(!await saveSession(session,[],true)){cloudState[session]=previous;render();homeStats();setSync("No se pudo guardar; se restauró el registro anterior","err");}
  });
  $("completeBtn").addEventListener("click",async()=>{
    const session=mode,previous=[...(cloudState[session]||[])],next=current().map((_,i)=>i);cloudState[session]=next;render();homeStats();
    if(!await saveSession(session,next,true)){cloudState[session]=previous;render();homeStats();setSync("No se pudo guardar; se restauró el registro anterior","err");}
  });
  $("note").addEventListener("input",()=>{
    $("noteState").textContent="Pendiente…";
    clearTimeout(noteTimer);
    noteTimer=setTimeout(()=>saveNote($("note").value,true),600);
  });

  function renderInventory(){
    const user=getUser(),currentInventory=readSkinInventory(user?.id);
    const list=$("productList");list.replaceChildren();
    PRODUCTS.forEach((p,i)=>{
      const card=document.createElement("div");card.className="product";
      const img=document.createElement("img");img.src=p[3];img.alt="";card.append(img);
      const body=document.createElement("div"),name=document.createElement("b");name.textContent=p[0];body.append(name);
      for(const note of [p[1],p[2]]){const label=document.createElement("span");label.textContent=note;body.append(label);}
      const select=document.createElement("select");select.setAttribute("aria-label","Inventario: "+p[0]);select.disabled=!user;
      const options=[["unknown","Sin confirmar"],["available","Lo tengo"],["paused","En pausa"],["finished","Terminado / no disponible"]];
      for(const [value,text] of options){const o=document.createElement("option");o.value=value;o.textContent=text;select.append(o);}
      select.value=currentInventory["p"+i]||"unknown";
      select.addEventListener("change",()=>{try{updateSkinInventory(user.id,"p"+i,select.value);setSync("Inventario guardado en este dispositivo");}catch{setSync("No se pudo guardar inventario","err");}});
      body.append(select);card.append(body);list.append(card);
    });
  }
  renderInventory();

  function homeStats(){
    renderWeek();
  }

  window.addEventListener("focus", () => { if (getUser()) loadCloudState(); });
  return {
    load: loadCloudState,
    reset() { loadSequence++; selectedDay = null; weekRows = []; gentle = true; cloudState = { am: [], pm: [] }; clearTimeout(noteTimer); $("note").value = ""; }
  };
}
