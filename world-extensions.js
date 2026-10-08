const esc = value => String(value ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dateKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
const euros = amount => new Intl.NumberFormat("nl-NL", { style:"currency", currency:"EUR" }).format(Number(amount)||0);

export function mountWorldExtensions(supabase, getUser) {
  const work = document.getElementById("worldWork");
  const money = document.getElementById("worldMoney");
  if (!work || !money) return;
  let portfolioLoading=false,moneyLoading=false;

  async function addPortfolio() {
    const user = getUser();
    if (!user || portfolioLoading || !work.children.length || work.querySelector("[data-portfolio-extension]")) return;
    portfolioLoading=true;
    const { data:rows, error } = await supabase.from("hub_records")
      .select("id,payload,occurred_at").eq("owner_id",user.id).eq("record_type","renzo_portfolio")
      .order("occurred_at",{ascending:false}).limit(100);
    portfolioLoading=false;
    if (getUser()?.id !== user.id || !work.children.length || work.querySelector("[data-portfolio-extension]")) return;
    const items = rows || [];
    const section = document.createElement("section");
    section.className = "world-extension";
    section.dataset.portfolioExtension = "true";
    section.innerHTML = `<div class="section"><h3>Portfolio · casos y entregables</h3><span class="small">${items.length} guardados</span></div><form class="card worldform" data-portfolio-form><label>Nombre del caso<input name="title" required maxlength="160"></label><label>Área<select name="area"><option>Logistics & Data</option><option>AI & Automation</option><option>Personal Systems</option><option>Case Study</option></select></label><label>Proyecto, carrera o skill relacionada<input name="related" maxlength="160"></label><label>Tecnologías y skills<input name="skills" maxlength="240"></label><label>Qué construiste y resultado<textarea name="summary" rows="3" maxlength="1200"></textarea></label><label>Enlace HTTPS opcional<input name="url" type="url" maxlength="500"></label><button class="secondary">Guardar caso en Portfolio privado</button><p class="small" role="status"></p></form>${items.map(row=>{const item=row.payload||{};const url=/^https:\/\//i.test(item.url||"")?`<p><a class="small" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">Abrir entregable</a></p>`:"";return `<div class="worlditem"><div class="row"><b>${esc(item.title)}</b><span class="worldbadge">${esc(item.area||"Portfolio")}</span></div>${item.related?`<small>Relacionado con ${esc(item.related)}</small>`:""}${item.skills?`<p class="small">Skills: ${esc(item.skills)}</p>`:""}${item.summary?`<p class="small">${esc(item.summary)}</p>`:""}${url}<small>${esc((item.date||row.occurred_at||"").slice(0,10))} · privado</small></div>`;}).join("")||`<div class="worldhint">Añade resultados reales cuando quieras; el Hub no inventa métricas.</div>`}${error?`<p class="small">Portfolio no pudo sincronizarse: ${esc(error.message)}</p>`:""}`;
    work.appendChild(section);
    section.querySelector("form").onsubmit = async event => {
      event.preventDefault();
      const form = event.currentTarget, button = form.querySelector("button"), status = form.querySelector('[role="status"]');
      const values = Object.fromEntries(new FormData(form));
      const url = values.url.trim();
      if (url && !/^https:\/\//i.test(url)) { status.textContent = "Usa un enlace HTTPS o deja el campo vacío."; return; }
      button.disabled = true;
      const id = crypto.randomUUID(), date = dateKey(new Date());
      const item = { id, title:values.title.trim(), area:values.area, related:values.related.trim(), skills:values.skills.trim(), summary:values.summary.trim(), url, date, source:"manual" };
      const rowsToSave = [
        { id, owner_id:user.id, domain:"work", record_type:"renzo_portfolio", title:item.title, status:"active", occurred_at:`${date}T12:00:00.000Z`, payload:item, source:"manual", requires_review:false },
        { id:crypto.randomUUID(), owner_id:user.id, domain:"system", record_type:"renzo_event", title:item.title, status:"active", occurred_at:`${date}T12:00:00.000Z`, payload:{id:crypto.randomUUID(),kind:"output",title:item.title,date,source:"portfolio"}, source:"manual", requires_review:false }
      ];
      const {error:saveError}=await supabase.from("hub_records").upsert(rowsToSave,{onConflict:"id"});
      if(saveError){status.textContent="No se pudo guardar. Revisa la conexión de Supabase.";button.disabled=false;return;}
      section.remove();
      addPortfolio();
    };
  }

  async function addMoneySummary() {
    const user = getUser();
    if (!user || moneyLoading || !money.children.length || money.querySelector("[data-money-extension]")) return;
    moneyLoading=true;
    const {data:rows,error}=await supabase.from("hub_records").select("payload,occurred_at")
      .eq("owner_id",user.id).eq("record_type","renzo_money").order("occurred_at",{ascending:false}).limit(1000);
    moneyLoading=false;
    if(getUser()?.id!==user.id||!money.children.length||money.querySelector("[data-money-extension]"))return;
    const records=(rows||[]).map(row=>row.payload||{}),today=new Date(),todayKey=dateKey(today),month=todayKey.slice(0,7),year=todayKey.slice(0,4);
    const weekStart=new Date(today);weekStart.setDate(weekStart.getDate()-((weekStart.getDay()-3+7)%7));const weekKey=dateKey(weekStart);
    const totals=items=>items.reduce((out,item)=>{const value=Number(item.amount??item.net)||0;if(["income","payslip"].includes(item.kind))out.income+=value;if(item.kind==="expense")out.expense+=value;return out;},{income:0,expense:0});
    const monthly=totals(records.filter(x=>(x.date||"").startsWith(month))),weekly=totals(records.filter(x=>x.date>=weekKey&&x.date<=todayKey)),annual=totals(records.filter(x=>(x.date||"").startsWith(year)));
    const activeMonths=new Set(records.filter(x=>(x.date||"").startsWith(year)&&["income","payslip"].includes(x.kind)).map(x=>x.date.slice(0,7)));
    const estimate=activeMonths.size>=3?euros(annual.income/activeMonths.size*12):"INSUFFICIENT DATA";
    const section=document.createElement("section");section.className="world-extension";section.dataset.moneyExtension="true";
    section.innerHTML=`<div class="section"><h3>Weekly · Monthly · Annual</h3><span class="small">Movimientos guardados · ${records.length}</span></div><div class="reportgrid"><div class="card"><b>${euros(weekly.income-weekly.expense)}</b><span class="small">Neto semanal · desde miércoles ${weekKey}</span></div><div class="card"><b>${euros(monthly.income-monthly.expense)}</b><span class="small">Neto mensual · ${month}</span></div><div class="card"><b>${euros(annual.income-annual.expense)}</b><span class="small">Neto acumulado · ${year}</span></div></div><div class="worldhint">Estimación anual simple de ingresos: ${estimate}${activeMonths.size>=3?` · media de ${activeMonths.size} meses observados × 12; no es garantía`:" · requiere al menos 3 meses con ingresos guardados"}. Sin datos completados por estimación.</div>${error?`<p class="small">Money no pudo sincronizarse: ${esc(error.message)}</p>`:""}`;
    money.appendChild(section);
  }

  const workObserver=new MutationObserver(()=>{void addPortfolio();});
  const moneyObserver=new MutationObserver(()=>{void addMoneySummary();});
  workObserver.observe(work,{childList:true});
  moneyObserver.observe(money,{childList:true});
  void addPortfolio();
  void addMoneySummary();
  return ()=>{workObserver.disconnect();moneyObserver.disconnect();};
}
