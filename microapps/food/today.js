// Food · "Hoy" y compra mensual (diseño del prototipo de Lovable, 19 oct 2026).
// Compara lo comido hoy (food_log) con los rangos de tu perfil corporal (Ajustes → Perfil corporal).
// Sin perfil, enseña lo comido sin objetivo: no inventa metas.

const num = v => { if (v === null || v === undefined || v === "") return null; const n = Number(v); return Number.isFinite(n) ? n : null; };
const es = n => Math.round(n).toLocaleString("es-ES");

// Rango objetivo → estado y porcentaje para la barra (100 % = máximo del rango).
export function progressAgainst(value, min, max) {
  const lo = num(min), hi = num(max) ?? lo;
  if (hi === null || hi <= 0) return { pct: null, state: "none", left: null, target: null };
  const low = lo ?? hi, pct = Math.min(100, Math.round(value / hi * 100));
  const state = value < low ? "under" : value <= hi ? "in" : "over";
  return { pct, state, left: Math.max(0, Math.round(low - value)), target: low === hi ? es(hi) : `${es(low)}–${es(hi)}`, minPct: Math.round(low / hi * 100) };
}

export function renderFoodToday({ kcal = 0, protein = 0, meals = 0 } = {}, profile = {}) {
  const k = progressAgainst(kcal, profile.kcalMin, profile.kcalMax), p = progressAgainst(protein, profile.proteinMin, profile.proteinMax);
  const meter = (label, value, unit, g) => {
    const head = `<div class="food-meter-head"><span>${label}</span><b>${es(value)}<span class="small">${unit}</span></b></div>`;
    if (g.pct === null) return `<div class="food-meter">${head}<p class="small">Sin objetivo. Añádelo en Ajustes → Perfil corporal.</p></div>`;
    const note = g.state === "under" ? `Faltan ${es(g.left)}${unit} para el mínimo` : g.state === "in" ? "Dentro del objetivo" : "Por encima del objetivo";
    return `<div class="food-meter food-${g.state}">${head}<div class="food-bar" role="progressbar" aria-label="${label} frente al objetivo ${g.target}${unit}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${g.pct}"><i style="width:${g.pct}%"></i><s style="left:${g.minPct}%"></s></div><p class="small">${note} · objetivo ${g.target}${unit}</p></div>`;
  };
  return `<section class="food-today" aria-labelledby="foodTodayTitle"><div class="food-today-head"><h2 id="foodTodayTitle">Hoy</h2><span class="small">${meals ? `${meals} ${meals === 1 ? "comida" : "comidas"}` : "Sin comidas aún"}</span></div>${meter("Kcal", kcal, " kcal", k)}${meter("Proteína", protein, " g", p)}</section>`;
}

const SHOP_KEY = month => `rise-food-shop-${month}`;
function readShop(month) { try { return JSON.parse(localStorage.getItem(SHOP_KEY(month)) || "[]"); } catch { return []; } }
function writeShop(month, list) { try { localStorage.setItem(SHOP_KEY(month), JSON.stringify(list)); } catch { /* sin almacenamiento: solo esta visita */ } }

// Casillas "comprado" en la lista mensual. Se guardan en este dispositivo y se reinician cada mes.
export function enhanceShopping(list, month = new Date().toISOString().slice(0, 7)) {
  if (!list || list.dataset.shopReady) return;
  list.dataset.shopReady = "1";
  const done = new Set(readShop(month));
  list.querySelectorAll(":scope > div").forEach((row, i) => {
    const name = row.querySelector("dt")?.textContent.trim() || `item-${i}`;
    const box = document.createElement("input");
    box.type = "checkbox"; box.className = "food-shop-check"; box.checked = done.has(name);
    box.setAttribute("aria-label", `Comprado: ${name}`);
    row.classList.toggle("food-bought", box.checked);
    box.onchange = () => { box.checked ? done.add(name) : done.delete(name); row.classList.toggle("food-bought", box.checked); writeShop(month, [...done]); };
    const hit = document.createElement("label"); hit.className = "food-shop-hit"; hit.append(box); // zona táctil de 44 px
    row.prepend(hit);
  });
}

export function mountFoodToday(root, db, getUser) {
  let profile = {}, last = { kcal: 0, protein: 0, meals: 0 }, owner = null;
  const draw = () => { if (root) root.innerHTML = getUser() ? renderFoodToday(last, profile) : ""; };
  document.addEventListener("rise:food-changed", e => { last = e.detail || last; draw(); });
  async function load() {
    const user = getUser(); if (!user) { profile = {}; draw(); return; }
    if (owner !== user.id) { owner = user.id; profile = {}; }
    const r = await db.from("user_settings").select("settings").eq("user_id", user.id).maybeSingle();
    if (getUser()?.id !== user.id) return;
    profile = r.error ? {} : (r.data?.settings?.bodyProfile || {});
    draw();
    enhanceShopping(document.querySelector("#food .food-list"));
  }
  return { load: () => load().catch(error => { console.error(error); draw(); }), reset() { profile = {}; owner = null; last = { kcal: 0, protein: 0, meals: 0 }; draw(); } };
}
