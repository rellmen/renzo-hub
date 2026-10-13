// Registro central de RISE HUB (antes Renzo Hub): cada área y cada microapp se declara aquí UNA vez.
// app.js genera a partir de este archivo: rutas, pantallas completas, secciones guardadas,
// pestañas de cada área, enlaces directos (?app=<id>) y el ciclo de vida (open/close/load/reset).
// tests/registry.test.mjs comprueba que cada módulo existe, exporta su función de montaje
// y está en la caché sin conexión de sw.js. Guía: docs/MICROAPPS.md.
//
// Contrato de una microapp con módulo propio:
//   export function mountX(root, db, getUser, go) -> { load?, open?(param), close?, reset? }
//   root: su <section>; db: cliente Supabase; getUser(): usuario actual; go(id): navegar.
//
// Campos:
//   id          minúsculas, único; también es el id de la <section> y el valor de ?app=
//   name        nombre visible
//   area        área a la que pertenece (clave de AREAS); marca su botón del menú
//   module      ruta del módulo ES (sin él, la app aún vive en index.html/app.js: "legacy")
//   mount       nombre de la función exportada por el módulo
//   css         hoja de estilos propia (opcional)
//   fullscreen  true = oculta el menú inferior mientras está abierta
//   tab         texto de la pestaña dentro de su área (opcional)
//   loadOnSignIn true = llama a load() al iniciar sesión (datos para resúmenes de Home)
//   deepLink    nombre del parámetro que se pasa a open() en ?app=<id>&<param>=valor
//   home        texto de su tarjeta en Home (Áreas); icon = carácter de la tarjeta; cover = portada opcional (/assets/…)

export const AREAS = Object.freeze({
  home:   { name: "Home" },
  body:   { name: "Body" },
  study:  { name: "Study" },
  work:   { name: "Work" },
  money:  { name: "My Finance", tab: "Resumen" },
  system: { name: "System" },
  car:    { name: "Car", fullscreen: true }
});

export const MICROAPPS = Object.freeze([
  { id: "payroll", name: "Nóminas", area: "money", module: "/payroll.js", mount: "mountPayroll", css: "/payroll.css", tab: "Nóminas", deepLink: "payslip" },
  { id: "gym", name: "Gym", area: "body", module: "/gym.js", mount: "mountGym", fullscreen: true, loadOnSignIn: true },
  { id: "news", name: "News", area: "system", module: "/news.js", mount: "mountNews", fullscreen: true },
  { id: "skin", name: "Skin", area: "body", module: "/microapps/skin/skin.js", mount: "mountSkin", fullscreen: true, loadOnSignIn: true },
  { id: "food", name: "Food", area: "body", fullscreen: true },
  { id: "settings", name: "Cuenta y sincronización", area: "system", fullscreen: true },
  { id: "command-center", name: "Command Center", area: "home", module: "/microapps/command-center/command-center.js", mount: "mountCommandCenter", css: "/microapps/command-center/command-center.css", fullscreen: true, icon: "◈", home: "Actividad, servicios y agentes en un solo lugar. Solo lectura." },
  { id: "notes", name: "Notas", area: "home", module: "/microapps/notes/notes.js", mount: "mountNotes", icon: "✎", cover: "/assets/rise/area-productivity-v1.webp", home: "Apuntes rápidos, guardados en privado." },
  { id: "gastos", name: "Gastos", area: "money", module: "/microapps/gastos/gastos.js", mount: "mountGastos", css: "/microapps/gastos/gastos.css", tab: "Gastos" }
].map(Object.freeze));

export const SECTION_IDS = Object.freeze([...Object.keys(AREAS), ...MICROAPPS.map(m => m.id)]);

export const findMicroapp = id => MICROAPPS.find(m => m.id === id) || null;
export const navAreaOf = id => AREAS[id] ? id : findMicroapp(id)?.area || null;
export const isFullscreen = id => Boolean(AREAS[id]?.fullscreen || findMicroapp(id)?.fullscreen);

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Tarjetas de Home para las microapps con `home`.
export function homeTilesHTML() {
  // Misma tarjeta que las Áreas de Home: con portada (cover = ruta de imagen propia en /assets) o con el icono.
  return MICROAPPS.filter(m => m.home).map(m => `<button class="app rise-area${m.cover ? "" : " rise-area--plain"}" data-open="${esc(m.id)}">${m.cover
    ? `<img class="rise-area-cover" src="${esc(m.cover)}" width="640" height="427" alt="" loading="lazy" decoding="async">`
    : `<span class="app-icon app-icon--work" aria-hidden="true">${esc(m.icon || m.name[0])}</span>`}<span class="rise-area-go" aria-hidden="true">↗</span><span class="rise-area-copy"><b>${esc(m.name)}</b><span>${esc(m.home)}</span></span></button>`).join("");
}

// Pestañas de un área: la propia área (si define `tab`) y sus microapps con `tab`.
// Devuelve "" si el área tiene menos de dos pestañas.
export function areaTabsHTML(area, activeId) {
  const items = [];
  if (AREAS[area]?.tab) items.push({ id: area, label: AREAS[area].tab });
  for (const m of MICROAPPS) if (m.area === area && m.tab) items.push({ id: m.id, label: m.tab });
  if (items.length < 2) return "";
  const buttons = items.map(i => i.id === activeId
    ? `<button type="button" aria-current="page">${esc(i.label)}</button>`
    : `<button type="button" data-open="${esc(i.id)}">${esc(i.label)}</button>`).join("");
  return `<nav class="fin-tabs" aria-label="Apartados de ${esc(AREAS[area].name)}">${buttons}</nav>`;
}
