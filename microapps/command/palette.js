// Búsqueda rápida (⌘K / Ctrl+K), inspirada en el rediseño editorial de Lovable.
// Solo navega: lista las áreas y microapps del registro y abre la elegida con el mismo [data-open] de toda la app.
import { AREAS, MICROAPPS } from "../registry.js";

const HINTS = {
  home: "Tu día", body: "Gym, comida y skincare", study: "Neerlandés A0–B2 y cursos", work: "Proyectos y tareas",
  money: "Resumen, nóminas y gastos", system: "Ajustes, hábitos y sincronización", car: "Gastos del coche",
  payroll: "Nóminas de SD Worx", gym: "Entrenamiento", news: "Resúmenes", skin: "Rutina AM/PM", food: "Plan diario y compra",
  settings: "Cuenta", "ares-center": "Tu asistente", notes: "Apuntes privados", gastos: "Movimientos del banco"
};
export const paletteItems = () => [
  ...Object.entries(AREAS).map(([id, a]) => ({ id, name: a.name, hint: HINTS[id] || "Área" })),
  ...MICROAPPS.map(m => ({ id: m.id, name: m.name, hint: HINTS[m.id] || (AREAS[m.area]?.name ?? "") }))
];
const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export const filterItems = (items, q) => { const t = norm(q).trim(); if (!t) return items; const byName = items.filter(i => norm(i.name).includes(t)); return [...byName, ...items.filter(i => !byName.includes(i) && norm(i.hint).includes(t))]; };

export function mountPalette() {
  if (typeof document === "undefined" || document.getElementById("risePalette")) return;
  const dlg = document.createElement("dialog");
  dlg.id = "risePalette"; dlg.className = "rise-palette"; dlg.setAttribute("aria-label", "Buscar en RISE HUB");
  dlg.innerHTML = `<form method="dialog" class="rise-palette-box"><div class="rise-palette-input"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" role="combobox" aria-expanded="true" aria-controls="risePaletteResults" aria-autocomplete="list" placeholder="Buscar un área o microapp…" aria-label="Buscar" autocomplete="off"><kbd>Esc</kbd></div><ul id="risePaletteResults" role="listbox" aria-label="Áreas y microapps"></ul></form>`;
  document.body.append(dlg);
  const input = dlg.querySelector("input"), list = dlg.querySelector("ul");
  let items = [], active = 0;
  const render = () => {
    items = filterItems(paletteItems(), input.value); active = Math.min(active, Math.max(0, items.length - 1));
    list.innerHTML = items.map((i, n) => `<li id="rise-option-${i.id}" role="option" aria-selected="${n === active}" data-id="${i.id}"><b>${i.name}</b><span>${i.hint}</span></li>`).join("") || `<li class="empty" role="status">Sin resultados</li>`;
    if (items[active]) {
      input.setAttribute("aria-activedescendant", `rise-option-${items[active].id}`);
      list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
    } else input.removeAttribute("aria-activedescendant");
  };
  const go = id => { dlg.close(); const b = document.createElement("button"); b.hidden = true; b.dataset.open = id; document.body.append(b); b.click(); b.remove(); };
  const open = () => { if (document.getElementById("bottomNav")?.classList.contains("hidden")) return; input.value = ""; active = 0; dlg.showModal(); render(); input.focus(); };
  input.addEventListener("input", () => { active = 0; render(); });
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); active = Math.max(0, Math.min(items.length - 1, active + 1)); render(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(0, active - 1); render(); }
    else if (e.key === "Enter") { e.preventDefault(); if (items[active]) go(items[active].id); }
  });
  list.addEventListener("click", e => { const li = e.target.closest("li[data-id]"); if (li) go(li.dataset.id); });
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  document.addEventListener("keydown", e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); e.stopPropagation(); dlg.open ? dlg.close() : open(); } });
  document.addEventListener("click", e => { if (e.target.closest("[data-rise-search]")) open(); });
}
mountPalette();
