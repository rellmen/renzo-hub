// E2E con sesión (SOLO staging): login, navegación por microapps, perfil corporal, Portfolio y
// sincronización con un registro de Jarvis (source "jarvis" en payload). Requiere un usuario de pruebas
// de staging confirmado. Las credenciales se leen del entorno y nunca se guardan en el repo:
//   set -a; . ~/Projects/RENZO-HUB/local-config/e2e-staging.env; set +a
//   BASE_URL=http://localhost:4173 node tests/e2e/authenticated.mjs
import { chromium } from "playwright";
import assert from "node:assert/strict";

const { BASE_URL = "http://localhost:4173", E2E_EMAIL, E2E_PASSWORD, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env;
if (!E2E_EMAIL || !E2E_PASSWORD || !SUPABASE_URL) { console.error("Faltan E2E_EMAIL/E2E_PASSWORD/SUPABASE_URL"); process.exit(2); }
if (!/zpueziugbezqxompwsol/.test(SUPABASE_URL)) { console.error("Este test solo puede ejecutarse contra Supabase staging."); process.exit(2); }

const results = [];
const check = async (name, fn) => { try { await fn(); results.push(["ok", name]); } catch (e) { results.push(["FAIL", name, e.message.split("\n")[0]]); } };
const rest = async (path, token, init = {}) => {
  const r = await fetch(`${SUPABASE_URL}${path}`, { ...init, headers: { apikey: SUPABASE_PUBLISHABLE_KEY, authorization: `Bearer ${token}`, "content-type": "application/json", ...(init.headers || {}) } });
  const text = await r.text(); return { status: r.status, body: text ? JSON.parse(text) : null };
};

// 1) Sesión por API para preparar datos de prueba con los permisos normales del usuario (RLS).
const tok = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { method: "POST",
  headers: { apikey: SUPABASE_PUBLISHABLE_KEY, "content-type": "application/json" }, body: JSON.stringify({ email: E2E_EMAIL, password: E2E_PASSWORD }) }).then(r => r.json());
if (!tok.access_token) { console.error("Login API falló:", tok.error_code || tok.msg || tok.error_description); process.exit(1); }
const uid = tok.user.id, run = Date.now().toString(36);

// Simula lo que deja /api/jarvis: fila renzo_inbox con payload.source "jarvis" (antes rompía la sync).
const jarvisId = crypto.randomUUID();
await check("preparación: registro de Jarvis en AI Inbox (staging)", async () => {
  const r = await rest("/rest/v1/hub_records", tok.access_token, { method: "POST", headers: { prefer: "return=minimal" }, body: JSON.stringify({
    id: jarvisId, owner_id: uid, domain: "money", record_type: "renzo_inbox", title: `E2E nómina ${run}`, status: "needs_review",
    occurred_at: new Date().toISOString(), source: "automation", requires_review: true, confidence: 1,
    payload: { id: jarvisId, title: `E2E nómina ${run}`, category: "payslip", status: "needs_review", source: "jarvis", requiresReview: true, extracted: { net: 1, gross: 1, period: "E2E" } } }) });
  assert.equal(r.status, 201, JSON.stringify(r.body));
});

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", e => errors.push(String(e)));
page.on("console", m => { if (m.type() === "error" && !/favicon/.test(m.text())) errors.push(m.text()); });
// Deployments protegidos de Vercel: si VERCEL_PROTECTION_BYPASS está definido (nunca en el repo),
// la primera visita fija la cookie de bypass y el resto de peticiones van sin cabeceras extra.
const bypass = async (page, base) => { const s = process.env.VERCEL_PROTECTION_BYPASS; if (s) await page.goto(`${base}/?x-vercel-protection-bypass=${encodeURIComponent(s)}&x-vercel-set-bypass-cookie=true`); };
await bypass(page, BASE_URL);
await page.goto(BASE_URL + "/", { waitUntil: "networkidle" });

await check("login en la UI", async () => {
  await page.fill("#email", E2E_EMAIL); await page.fill("#password", E2E_PASSWORD);
  await page.click("#loginForm button[type=submit]");
  await page.waitForSelector("#appShell:not(.hidden)", { timeout: 15000 });
});

await check("sincronización world con registro de Jarvis presente (B-02)", async () => {
  await page.locator('[data-open="system"]:visible').first().click();
  await page.waitForFunction(() => /Sincronizado con Supabase|Sincronizado salvo/.test(document.getElementById("worldSyncStatus")?.textContent || ""), null, { timeout: 15000 });
  const status = await page.textContent("#worldSyncStatus");
  assert.match(status, /^Sincronizado con Supabase$/, status);
});

for (const section of ["home", "body", "study", "work", "money", "system", "food", "skin", "gym", "news", "settings", "car"]) {
  await check(`navegación: ${section}`, async () => {
    await page.evaluate(s => document.querySelector(`[data-open="${s}"]`)?.click(), section);
    await page.waitForSelector(`#${section}.page.active`, { timeout: 5000 });
  });
}

await check("perfil corporal: guardar y releer desde Supabase (user_settings)", async () => {
  await page.evaluate(() => document.querySelector('[data-open="settings"]')?.click());
  await page.fill('#bodyProfileForm [name=kcalMin]', "2000"); await page.fill('#bodyProfileForm [name=kcalMax]', "2200");
  await page.fill('#bodyProfileForm [name=startWeight]', "80"); await page.fill('#bodyProfileForm [name=phases]', "77, 75");
  await page.click("#bodyProfileForm button[type=submit]");
  await page.waitForFunction(() => document.getElementById("bodyProfileStatus")?.textContent === "Perfil guardado.", null, { timeout: 10000 });
  const r = await rest(`/rest/v1/user_settings?user_id=eq.${uid}&select=settings`, tok.access_token);
  assert.equal(r.body[0].settings.bodyProfile.kcalMin, 2000);
  await page.reload({ waitUntil: "networkidle" }); await page.waitForSelector("#appShell:not(.hidden)");
  await page.waitForFunction(() => document.getElementById("bpKcal")?.textContent.includes("2000") || document.getElementById("bpKcal")?.textContent.includes("2.000"), null, { timeout: 10000 });
});

await check("Portfolio: guardar caso (B-01) y comprobar en Supabase", async () => {
  await page.evaluate(() => document.querySelector('[data-open="work"]')?.click());
  const form = page.locator("[data-portfolio-form]");
  await form.waitFor({ timeout: 10000 });
  await form.locator("[name=title]").fill(`E2E caso ${run}`);
  await form.locator("button[type=submit], button:not([type])").first().click();
  await page.waitForTimeout(2500);
  const r = await rest(`/rest/v1/hub_records?owner_id=eq.${uid}&record_type=eq.renzo_portfolio&title=eq.${encodeURIComponent(`E2E caso ${run}`)}&select=id,source`, tok.access_token);
  assert.equal(r.body.length, 1, "portfolio guardado");
  assert.equal(r.body[0].source, "manual");
});

await page.evaluate(() => { window.__RH_CONFIRM__ = () => true; });

await check("Nutrición: registrar comida con kcal y proteína", async () => {
  await page.evaluate(() => document.querySelector('[data-open="food"]')?.click());
  const f = page.locator("[data-food-form]"); await f.waitFor({ timeout: 10000 });
  await f.locator("[name=description]").fill(`E2E avena ${run}`); await f.locator("[name=kcal]").fill("450"); await f.locator("[name=protein]").fill("30");
  await f.locator("button[type=submit]").click();
  await page.waitForFunction(r => document.getElementById("p1Food")?.textContent.includes(`E2E avena ${r}`), run, { timeout: 10000 });
  const r = await rest(`/rest/v1/hub_records?owner_id=eq.${uid}&record_type=eq.food_log&select=payload&order=created_at.desc&limit=1`, tok.access_token);
  assert.equal(r.body[0].payload.kcal, 450); assert.equal(r.body[0].payload.protein, 30);
});

await check("Peso: guardar dos días y ver evolución", async () => {
  await page.evaluate(() => document.querySelector('[data-open="body"]')?.click());
  for (const [date, value] of [["2026-10-01", "81.2"], [new Date().toISOString().slice(0, 10), "80.6"]]) {
    const f = page.locator("[data-weight-form]"); await f.waitFor({ timeout: 10000 });
    await f.locator("[name=value]").fill(value); await f.locator("[name=date]").fill(date); await f.locator("button[type=submit]").click();
    await page.waitForTimeout(1200);
  }
  await page.waitForSelector("#p1Weight svg", { timeout: 10000 });
});

await check("Hábitos: definir en Ajustes y marcar en Home", async () => {
  await page.evaluate(() => document.querySelector('[data-open="settings"]')?.click());
  const f = page.locator("[data-habits-form]"); await f.waitFor({ timeout: 10000 });
  await f.locator("[name=habits]").fill("Beber 2 L de agua\nLeer 10 minutos"); await f.locator("button[type=submit]").click();
  await page.waitForFunction(() => document.querySelector("[data-habits-form] [role=status]")?.textContent === "Hábitos guardados.", null, { timeout: 10000 });
  const s = await rest(`/rest/v1/user_settings?user_id=eq.${uid}&select=settings`, tok.access_token);
  assert.equal(s.body[0].settings.habits.length, 2);
  assert.equal(s.body[0].settings.bodyProfile?.kcalMin, 2000, "el perfil corporal no se pisó");
  await page.evaluate(() => document.querySelector('[data-open="home"]')?.click());
  const cb = page.locator('[data-habit="Beber 2 L de agua"]'); await cb.waitFor(); await cb.check();
  await page.waitForTimeout(1500);
  assert.equal(await page.locator('[data-habit="Beber 2 L de agua"]').isChecked(), true);
});

await check("Progreso y XP: datos reales y sin duplicados tras recargar", async () => {
  const count = async () => (await rest(`/rest/v1/hub_records?owner_id=eq.${uid}&record_type=eq.xp_event&select=id`, tok.access_token)).body.length;
  const before = await count(); assert.ok(before > 0, "hay eventos de XP");
  await page.reload({ waitUntil: "networkidle" }); await page.waitForSelector("#appShell:not(.hidden)"); await page.waitForTimeout(3000);
  assert.equal(await count(), before, "recargar no duplica XP");
  const txt = await page.textContent("#p1Home"); assert.match(txt, /Nivel \d+/); assert.match(txt, /Días con comidas registradas/);
});

await check("sin errores JS en la sesión", async () => assert.deepEqual(errors, []));
await page.screenshot({ path: "/tmp/renzo-hub-e2e-auth.png" });
await browser.close();

for (const r of results) console.log(r.join(" · "));
const failed = results.filter(r => r[0] === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} comprobaciones OK (usuario de pruebas ${uid.slice(0, 8)} · staging)`);
process.exit(failed ? 1 : 0);
