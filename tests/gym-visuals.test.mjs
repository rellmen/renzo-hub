import test from "node:test";
import assert from "node:assert/strict";
import { moreButtonHtml, moreSheetHtml, MORE_IDS, strengthChartSvg, weekBuckets, weeklyBarsHtml, recordsHtml } from "../microapps/gym/visuals.js";

test("la hoja Más lista las 11 secciones y marca la actual", () => {
  assert.equal(MORE_IDS.length, 11);
  assert.ok(MORE_IDS.includes("ranks"));
  assert.ok(MORE_IDS.includes("trends"));
  const html = moreSheetHtml("recovery");
  for (const id of MORE_IDS) assert.match(html, new RegExp(`data-more-go="${id}"`));
  assert.match(html, /data-more-go="recovery" aria-current="page"/);
  assert.match(moreButtonHtml("photos"), /Fotos de progreso/);
  assert.match(moreButtonHtml("train"), />Más </);
});

test("la gráfica de fuerza no inventa: pide dos sesiones y destaca la última", () => {
  assert.match(strengthChartSvg([]), /Completa una sesión/);
  assert.match(strengthChartSvg([{ date: "2026-10-01", estimated1RM: 80 }]), /Una sesión registrada: 80 kg/);
  const svg = strengthChartSvg([{ date: "2026-10-01", estimated1RM: 80 }, { date: "2026-10-08", estimated1RM: 82.5 }, { date: "2026-10-15", estimated1RM: 85 }]);
  assert.equal((svg.match(/gym-line-last/g) || []).length, 1);
  assert.match(svg, /de 80 a 85 kg en 3 sesiones/);
  assert.match(svg, /<b>85 kg<\/b>/);
});

test("semanas: 8 lunes seguidos, incluidas las vacías, con sesiones y volumen reales", () => {
  const b = weekBuckets([{ week: "2026-10-12", sessions: 3, volume_kg: 12500 }, { week: "2026-09-28", sessions: 2, volume_kg: 8000 }], "2026-10-19", 8);
  assert.equal(b.length, 8);
  assert.equal(b.at(-1).week, "2026-10-19");
  assert.equal(b.at(-1).sessions, 0);
  assert.deepEqual(b.at(-2), { week: "2026-10-12", sessions: 3, volume: 12500 });
  assert.deepEqual(b.at(-4), { week: "2026-09-28", sessions: 2, volume: 8000 });
  assert.match(weeklyBarsHtml(b, 4), /0\/4 <span class="small">sesiones/);
  assert.match(weeklyBarsHtml(b, 4), /12,5k/);
  assert.match(weeklyBarsHtml(weekBuckets([], "2026-10-19"), 4), /Aún no hay sesiones/);
});

test("récords ordenados de mayor a menor y escapados", () => {
  const html = recordsHtml({ "Curl <b>": 30, "Press banca": 92.4 });
  assert.ok(html.indexOf("Press banca") < html.indexOf("Curl"));
  assert.doesNotMatch(html, /<b>"?\)/);
  assert.match(html, /Curl &lt;b&gt;/);
  assert.match(recordsHtml({}), /aparecerán al completar sesiones/);
});
