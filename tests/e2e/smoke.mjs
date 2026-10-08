// Smoke test de navegador (Playwright): arranque con CSP, pantalla de acceso, sin registro público,
// sin errores de consola/CSP y diseño móvil sin scroll horizontal.
// Uso: BASE_URL=http://localhost:4173 node tests/e2e/smoke.mjs
import { chromium } from "playwright";
import assert from "node:assert/strict";

const base = process.env.BASE_URL || "http://localhost:4173";
const browser = await chromium.launch();
const results = [];
const check = async (name, fn) => { try { await fn(); results.push(["ok", name]); } catch (e) { results.push(["FAIL", name, e.message]); } };

for (const vp of [{ name: "móvil", width: 390, height: 844 }, { name: "escritorio", width: 1366, height: 900 }]) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  const errors = [];
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", e => errors.push(String(e)));
  await page.addInitScript(() => document.addEventListener("securitypolicyviolation", e => console.error(`CSP: ${e.violatedDirective} ${e.blockedURI}`)));
  const resp = await page.goto(base + "/", { waitUntil: "networkidle" });
  await check(`[${vp.name}] cabeceras de seguridad`, async () => {
    const h = resp.headers();
    assert.ok(h["content-security-policy"]?.includes("script-src 'self'"));
    assert.equal(h["x-content-type-options"], "nosniff");
  });
  await check(`[${vp.name}] arranca y muestra pantalla de acceso`, async () => {
    await page.waitForSelector("#authScreen:not(.hidden)", { timeout: 15000 });
    assert.equal(await page.isVisible("#bootError:not(.hidden)"), false, "no hay error de arranque");
  });
  await check(`[${vp.name}] sin botón de registro público`, async () => {
    assert.equal(await page.locator("#signupBtn").count(), 0);
  });
  await check(`[${vp.name}] indicador de entorno verificado`, async () => {
    await page.waitForFunction(() => document.getElementById("environmentBadge")?.dataset.env === "preview", null, { timeout: 8000 });
  });
  await check(`[${vp.name}] sin errores de consola ni violaciones CSP`, async () => {
    assert.deepEqual(errors, []);
  });
  await check(`[${vp.name}] sin scroll horizontal`, async () => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 1, `desborde ${overflow}px`);
  });
  await check(`[${vp.name}] HTML público sin datos corporales`, async () => {
    const html = await page.content();
    for (const s of ["84 kg", "1,70 m", "2.100–2.200"]) assert.ok(!html.includes(s), s);
  });
  await page.screenshot({ path: `/tmp/renzo-hub-smoke-${vp.width}.png`, fullPage: false });
  await page.close();
}
await check("documentos internos no publicados", async () => {
  const page = await browser.newPage();
  for (const p of ["/AGENTS.md", "/supabase/migrations/20261006234511_baseline_renzo_hub_staging.sql", "/scripts/renzo-hub"]) {
    const r = await page.goto(base + p); assert.equal(r.status(), 404, p);
  }
  await page.close();
});
await browser.close();
for (const r of results) console.log(r.join(" · "));
const failed = results.filter(r => r[0] === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} comprobaciones OK`);
process.exit(failed ? 1 : 0);
