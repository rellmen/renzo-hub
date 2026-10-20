// Gym · visuales del diseño de Lovable (19 oct 2026), hechos por Claude con permiso de Renzo.
// Funciones puras que devuelven HTML: hoja "Más", gráfica de fuerza, semanas y récords.
// Solo pintan datos reales que ya calcula gym.js; si no hay datos, lo dicen.

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const kg = n => Number(n).toLocaleString("es-ES", { maximumFractionDigits: 1 });
const shortDate = d => new Date(`${d}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
const svgIcon = d => `<svg viewBox="0 0 24 24" aria-hidden="true" class="gym-ic">${d}</svg>`;

export const MORE_SECTIONS = [
  ["ranks", "Rangos", "Nivel, XP y progresión RISE", '<path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>'],
  ["trends", "Fuerza", "Tendencias y evolución de cargas", '<path d="M3 17l6-6 4 3 8-9M16 5h5v5"/>'],
  ["photos", "Fotos de progreso", "Antes y después con la misma luz", '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>'],
  ["goals", "Objetivos", "Prioridad, sesiones y meta de peso", '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'],
  ["measurements", "Medidas", "Peso y cintura medidos", '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/>'],
  ["history", "Historial", "Sesiones y registros recientes", '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>'],
  ["muscles", "Volumen por músculo", "Series por grupo y semana", '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9M13 17V5M8 17v-3"/>'],
  ["recovery", "Recuperación", "Energía, fatiga y descanso", '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>'],
  ["sides", "Lados", "Izquierda frente a derecha", '<path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"/>'],
  ["calendar", "Turnos", "Entrenos según tu horario", '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'],
  ["coach", "Coach", "Revisión con tus datos", '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'],
];
export const MORE_IDS = MORE_SECTIONS.map(s => s[0]);

export function moreButtonHtml(view) {
  const current = MORE_SECTIONS.find(s => s[0] === view);
  return `<button type="button" class="switch gym-more ${current ? "selected" : ""}" data-more-open aria-haspopup="dialog" ${current ? 'aria-current="page"' : ""}>${current ? esc(current[1]) : "Más"} <span aria-hidden="true">▾</span></button>`;
}

export function moreSheetHtml(view) {
  return `<div class="gym-sheet-scrim" data-more-close></div><div class="gym-sheet" role="dialog" aria-modal="true" aria-labelledby="gymMoreTitle"><div class="gym-sheet-grip" aria-hidden="true"></div><div class="gym-sheet-head"><h2 id="gymMoreTitle">Más de Gym</h2><button type="button" class="secondary" data-more-close aria-label="Cerrar">✕</button></div><nav class="gym-more-list">${MORE_SECTIONS.map(([id, title, detail, d]) => `<button type="button" data-more-go="${id}" ${view === id ? 'aria-current="page"' : ""}>${svgIcon(d)}<span><b>${esc(title)}</b><span class="small">${esc(detail)}</span></span><span aria-hidden="true">›</span></button>`).join("")}</nav></div>`;
}

// Línea de 1RM estimado: rejilla, escala de valores reales y último punto destacado.
export function strengthChartSvg(points) {
  const pts = (points || []).filter(p => Number.isFinite(p?.estimated1RM) && p.estimated1RM > 0 && p.date);
  if (pts.length < 2) return `<p class="small gym-empty">${pts.length ? `Una sesión registrada: ${kg(pts[0].estimated1RM)} kg estimados. Con la siguiente verás la línea.` : "Completa una sesión con este ejercicio para ver tu fuerza."}</p>`;
  const vals = pts.map(p => p.estimated1RM), lo = Math.floor(Math.min(...vals) * 0.97), hi = Math.ceil(Math.max(...vals) * 1.03), span = hi - lo || 1;
  const W = 320, H = 150, L = 34, R = 12, T = 14, B = 26;
  const x = i => L + i / (pts.length - 1) * (W - L - R), y = v => T + (1 - (v - lo) / span) * (H - T - B);
  const ticks = [lo, Math.round((lo + hi) / 2), hi];
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.estimated1RM).toFixed(1)}`).join(" ");
  const area = `${line} L${x(pts.length - 1).toFixed(1)},${H - B} L${L},${H - B} Z`;
  const last = pts.at(-1), lx = x(pts.length - 1), ly = y(last.estimated1RM);
  return `<svg class="gym-line" viewBox="0 0 ${W} ${H}" role="img" aria-label="Fuerza estimada: de ${kg(pts[0].estimated1RM)} a ${kg(last.estimated1RM)} kg en ${pts.length} sesiones">
${ticks.map(t => `<line x1="${L}" x2="${W - R}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}" class="gym-line-grid"/><text x="${L - 6}" y="${(y(t) + 4).toFixed(1)}" text-anchor="end" class="gym-line-tick">${t}</text>`).join("")}
<path d="${area}" class="gym-line-area"/><path d="${line}" class="gym-line-path"/>
${pts.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.estimated1RM).toFixed(1)}" r="${i === pts.length - 1 ? 5 : 2.5}" class="${i === pts.length - 1 ? "gym-line-last" : "gym-line-dot"}"/>`).join("")}
<text x="${L}" y="${H - 6}" class="gym-line-tick">${esc(shortDate(pts[0].date))}</text><text x="${W - R}" y="${H - 6}" text-anchor="end" class="gym-line-tick">${esc(shortDate(last.date))}</text>
</svg><p class="gym-line-now"><b>${kg(last.estimated1RM)} kg</b> <span class="small">último 1RM estimado · ${esc(shortDate(last.date))}</span></p>`;
}

// Semanas: lunes de las últimas `count` semanas (incluye las vacías) con sesiones y volumen reales.
export function weekBuckets(weeks, today, count = 8) {
  const t = new Date(`${today}T12:00:00`); t.setDate(t.getDate() - ((t.getDay() + 6) % 7));
  const keyOf = d => [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
  const byKey = new Map();
  for (const w of weeks || []) {
    const d = new Date(`${String(w.week).slice(0, 10)}T12:00:00`); d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const k = keyOf(d), prev = byKey.get(k) || { sessions: 0, volume: 0 };
    byKey.set(k, { sessions: prev.sessions + (w.sessions || 0), volume: prev.volume + (w.volume_kg || 0) });
  }
  const out = [];
  for (let i = count - 1; i >= 0; i--) { const d = new Date(t); d.setDate(t.getDate() - i * 7); const k = keyOf(d), v = byKey.get(k) || { sessions: 0, volume: 0 }; out.push({ week: k, ...v }); }
  return out;
}

export function weeklyBarsHtml(buckets, perWeek) {
  if (!buckets.some(b => b.sessions)) return `<div class="card gym-weeks"><p class="small gym-empty">Aún no hay sesiones completadas en las últimas ${buckets.length} semanas.</p></div>`;
  const maxS = Math.max(perWeek || 0, ...buckets.map(b => b.sessions), 1), maxV = Math.max(...buckets.map(b => b.volume), 1);
  const thisWeek = buckets.at(-1);
  const bars = (key, max, fmt) => `<div class="gym-bars" role="img" aria-label="${key === "sessions" ? "Sesiones" : "Volumen"} por semana, últimas ${buckets.length}">${buckets.map((b, i) => `<div class="gym-bar-col ${i === buckets.length - 1 ? "now" : ""}"><span class="gym-bar-val">${b[key] ? fmt(b[key]) : ""}</span><div class="gym-bar"><i style="height:${Math.round(b[key] / max * 100)}%"></i></div><span class="gym-bar-lab">${esc(shortDate(b.week))}</span></div>`).join("")}</div>`;
  return `<div class="card gym-weeks"><div class="gym-weeks-head"><div><span class="small">Esta semana</span><b>${thisWeek.sessions}${perWeek ? `/${perWeek}` : ""} <span class="small">sesiones</span></b></div><div><span class="small">Volumen</span><b>${Math.round(thisWeek.volume).toLocaleString("es-ES")} <span class="small">kg</span></b></div></div>
<h4>Sesiones por semana</h4>${bars("sessions", maxS, v => v)}
<h4>Volumen por semana</h4>${bars("volume", maxV, v => v >= 1000 ? `${(v / 1000).toLocaleString("es-ES", { maximumFractionDigits: 1 })}k` : Math.round(v))}</div>`;
}

export function recordsHtml(best) {
  const list = Object.entries(best || {}).filter(([, v]) => Number.isFinite(v) && v > 0).sort((a, b) => b[1] - a[1]);
  if (!list.length) return `<p class="small gym-empty">Tus mejores marcas aparecerán al completar sesiones.</p>`;
  return `<div class="gym-records">${list.map(([n, v]) => `<div class="gym-record"><span class="small">${esc(n)}</span><b>${kg(v)} <span class="small">kg</span></b><span class="small">1RM estimado</span></div>`).join("")}</div><p class="small">Compara solo en la misma máquina y técnica.</p>`;
}
