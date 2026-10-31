// Smoke de navegador para Rise Nocturne (la app que sirve renzo-hub.vercel.app desde el 24-10-2026).
// Sustituye a tests/e2e/smoke.mjs (Classic, congelado) en `./scripts/renzo-hub verify ... --smoke`.
// Sin cuentas ni datos privados: solo comprueba lo que ve alguien sin sesión.
// Uso: BASE_URL=https://renzo-hub.vercel.app node tests/e2e/nocturne-smoke.mjs
import { createRequire } from "node:module";
import { resolve } from "node:path";
import assert from "node:assert/strict";
const require = createRequire(process.env.PLAYWRIGHT_ROOT ? resolve(process.env.PLAYWRIGHT_ROOT, "package.json") : import.meta.url);
const { chromium, devices } = require("playwright");

const base = (process.env.BASE_URL || "https://renzo-hub.vercel.app").replace(/\/$/, "");
const expectedEnv = process.env.EXPECT_ENV || (new URL(base).hostname === "renzo-hub.vercel.app" ? "production" : "preview");
const secret = process.env.VERCEL_PROTECTION_BYPASS;
const extra = secret ? { "x-vercel-protection-bypass": secret, "x-vercel-set-bypass-cookie": "true" } : {};
const ROUTES = ["/", "/ajustes", "/aprender", "/gym", "/dinero", "/gastos", "/piel", "/proyectos", "/notas", "/body", "/food",
  "/ares", "/nominas", "/turnos", "/apps", "/quest", "/news", "/agentes"];
const INTERNAL = ["/AGENTS.md", "/CLAUDE.md", "/RENZO-HUB-CURRENT.md", "/package.json", "/.env", "/scripts/renzo-hub",
  "/server/ares-ai.mjs", "/supabase/migrations/", "/vercel.json"];
// Directivas que no deben faltar nunca en la CSP de producción.
const CSP_REQUIRED = ["default-src 'self'", "frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'"];

const results = [];
const check = async (name, fn) => { try { await fn(); results.push(["ok", name]); } catch (e) { results.push(["FAIL", name, e.message.split("\n")[0]]); } };
const browser = await chromium.launch();

for (const [label, opts] of [["móvil", { ...devices["iPhone 13"], defaultBrowserType: undefined }], ["escritorio", { viewport: { width: 1440, height: 900 } }]]) {
  const ctx = await browser.newContext({ ...opts, extraHTTPHeaders: extra });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
  await page.addInitScript(() => document.addEventListener("securitypolicyviolation", (e) => console.error(`CSP: ${e.violatedDirective} ${e.blockedURI}`)));
  const resp = await page.goto(base + "/", { waitUntil: "networkidle", timeout: 45000 });

  await check(`[${label}] cabeceras de seguridad (CSP, nosniff, DENY, HSTS)`, async () => {
    const h = resp.headers();
    const csp = h["content-security-policy"] || "";
    for (const d of CSP_REQUIRED) assert.ok(csp.includes(d), `CSP sin ${d}`);
    assert.equal(h["x-content-type-options"], "nosniff");
    assert.equal(h["x-frame-options"], "DENY");
    if (base.startsWith("https://")) assert.ok(h["strict-transport-security"], "sin HSTS");
  });
  await check(`[${label}] pantalla de acceso de Nocturne`, async () => {
    await page.getByRole("heading", { name: "Tu espacio privado." }).waitFor({ timeout: 20000 });
    assert.ok(await page.getByLabel("Correo electrónico").isVisible(), "sin campo de correo");
    assert.ok(await page.getByLabel("Contraseña").isVisible(), "sin campo de contraseña");
  });
  await check(`[${label}] sin registro público`, async () => {
    assert.equal(await page.getByRole("button", { name: /crear cuenta|registr/i }).count(), 0);
  });
  await check(`[${label}] sin scroll horizontal`, async () => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 1, `desborde ${overflow}px`);
  });
  await check(`[${label}] ${ROUTES.length} rutas privadas protegidas por el login`, async () => {
    for (const p of ROUTES) {
      const r = await page.goto(base + p, { waitUntil: "domcontentloaded", timeout: 30000 });
      assert.equal(r.status(), 200, `${p}: HTTP ${r.status()}`);
      await page.getByRole("heading", { name: "Tu espacio privado." }).waitFor({ timeout: 20000 }).catch(() => { throw new Error(`${p}: no pide sesión`); });
    }
  });
  await check(`[${label}] sin errores de consola ni violaciones CSP`, async () => assert.deepEqual(errors, []));
  await page.screenshot({ path: `/tmp/rise-nocturne-smoke-${label === "móvil" ? "mobile" : "desktop"}.png` });
  await ctx.close();
}

const ctx = await browser.newContext({ extraHTTPHeaders: extra });
await check(`entorno ${expectedEnv} en /api/deployment-info`, async () => {
  const r = await ctx.request.get(base + "/api/deployment-info");
  assert.equal(r.status(), 200);
  assert.equal((await r.json()).environment, expectedEnv);
});
await check("release.json y PWA (manifest, iconos, service worker)", async () => {
  const rel = await (await ctx.request.get(base + "/release.json")).json();
  assert.match(rel.release, /^\d+\.\d+\.\d+$/);
  const m = await ctx.request.get(base + "/manifest.webmanifest");
  assert.equal(m.status(), 200);
  assert.equal((await m.json()).display, "standalone");
  for (const f of ["/icon-192.png", "/icon-512.png", "/apple-touch-icon.png", "/sw.js"]) assert.equal((await ctx.request.get(base + f)).status(), 200, f);
});
await check(`${INTERNAL.length} archivos internos no publicados`, async () => {
  const leaks = [];
  for (const p of INTERNAL) {
    const r = await ctx.request.get(base + p, { maxRedirects: 0 });
    // El SSR responde HTML (login) en rutas desconocidas: solo es fuga si devuelve el archivo en sí.
    if (r.status() === 200 && !/text\/html/.test(r.headers()["content-type"] || "")) leaks.push(p);
  }
  assert.deepEqual(leaks, []);
});
await browser.close();

for (const r of results) console.log(r.join(" · "));
const failed = results.filter((r) => r[0] === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} comprobaciones OK`);
process.exit(failed ? 1 : 0);
