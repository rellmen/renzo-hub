// Piezas de interfaz compartidas por las microapps. Los estilos .mx-* y .fin-tabs están en index.html,
// así cada microapp nueva se ve como el resto sin escribir CSS.
import { AREAS, findMicroapp, areaTabsHTML } from "./registry.js";

export const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const euro = value => value == null || value === "" || Number.isNaN(Number(value)) ? "Sin datos" : new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(Number(value));
export const shortDate = iso => iso ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso)) : "Sin fecha";
export const localDay = (d = new Date()) => [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");

// Cabecera estándar: volver al área, antetítulo, título y pestañas del área.
export function headerHTML(appId, { eyebrow = "", actions = "" } = {}) {
  const m = findMicroapp(appId);
  if (!m) throw new Error(`Microapp no registrada: ${appId}`);
  const area = AREAS[m.area];
  return `<button class="microapp-back" data-open="${esc(m.area)}">← ${esc(area.name)}</button>`
    + `<div class="top"><div><div class="ey">${esc(eyebrow || area.name)}</div><h1>${esc(m.name)}</h1></div>${actions}</div>`
    + areaTabsHTML(m.area, m.id);
}

// Estado vacío honesto: nunca inventa datos.
export const emptyHTML = (text = "Sin datos todavía.") => `<p class="mx-empty">${esc(text)}</p>`;
export const noticeHTML = (text, kind = "info") => text ? `<p class="mx-notice mx-notice--${kind === "error" ? "error" : "info"}" role="status">${esc(text)}</p>` : "";
