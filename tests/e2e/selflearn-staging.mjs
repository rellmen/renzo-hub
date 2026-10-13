// E2E de preferencias SelfLearn contra una cuenta EXCLUSIVA de pruebas Supabase staging.
// Se restaura el estado previo; no se ejecuta en producción ni se guardan credenciales.
import { chromium } from "playwright";
import assert from "node:assert/strict";
const { BASE_URL = "http://localhost:4181", SUPABASE_URL, E2E_EMAIL, E2E_PASSWORD } = process.env;
if (!SUPABASE_URL?.includes("zpueziugbezqxompwsol") || !E2E_EMAIL || !E2E_PASSWORD) {
  throw new Error("Este test requiere usuario y proyecto Supabase de staging.");
}
const browser = await chromium.launch({ headless: true });
const current = async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.locator("#email").fill(E2E_EMAIL);
  await page.locator("#password").fill(E2E_PASSWORD);
  await page.locator("#loginForm button[type=submit]").click();
  await page.locator("#appShell:not(.hidden)").waitFor({ timeout: 15000 });
  await page.locator('[data-open="study"]:visible').first().click();
  await page.locator("#study .study-level").first().waitFor({ timeout: 15000 });
  await page.waitForFunction(() => document.querySelector('#worldSyncStatus')?.textContent === 'Sincronizado con Supabase', null, { timeout: 15000 });
  return page;
};
const snapshot = async page => page.locator('#study form[data-form="study-settings"]').evaluate(
  el => Object.fromEntries(new FormData(el))
);
const cloudSnapshot = async page => page.evaluate(async () => {
  const storageKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  const session = JSON.parse(localStorage.getItem(storageKey) || 'null');
  const config = await fetch('/api/supabase-config').then(r => r.json());
  const response = await fetch(`${config.supabaseUrl}/rest/v1/hub_user_state?select=state`, {
    headers: { apikey: config.publishableKey, authorization: `Bearer ${session.access_token}` }
  });
  const rows = await response.json();
  return { status: response.status, settings: rows[0]?.state?.learningSettings || null };
});
const setPreferences = async (page, values) => {
  const f = page.locator('#study form[data-form="study-settings"]');
  for (const [key, value] of Object.entries(values)) await f.locator(`[name="${key}"]`).selectOption(String(value));
  const [response] = await Promise.all([
    page.waitForResponse(r => r.url().includes('/rest/v1/hub_user_state') && r.request().method() === 'POST', { timeout: 15000 }),
    f.locator('button[type=submit]').click()
  ]);
  assert(response.ok(), `Error saving preferences: ${response.status()}`);
  await page.waitForFunction(
    () => document.querySelector("#worldSyncStatus")?.textContent === "Sincronizado con Supabase",
    null, { timeout: 15000 }
  );
};
let original = null;
try {
  const page = await current();
  original = await snapshot(page);
  assert.equal(await page.locator("#study .study-level").count(), 5);
  const chosen = {
    startingLevel: original.startingLevel === "A0" ? "A1" : "A0",
    sessionMinutes: original.sessionMinutes === "5" ? "10" : "5",
    focus: original.focus === "Logística" ? "Mixto" : "Logística"
  };
  await setPreferences(page, chosen);
  assert.deepEqual((await cloudSnapshot(page)).settings, { ...chosen });
  await page.close();
  const anotherBrowserSession = await current(); // Sin datos de localStorage de la sesión anterior.
  assert.deepEqual((await cloudSnapshot(anotherBrowserSession)).settings, { ...chosen });
  assert.deepEqual(await snapshot(anotherBrowserSession), chosen);
  console.log("PASS: preferencias guardadas y recuperadas desde Supabase staging en sesión nueva");
  await anotherBrowserSession.close();
} finally {
  if (original) {
    const restore = await current();
    await setPreferences(restore, original);
    await restore.close();
    const verify = await current();
    assert.deepEqual(await snapshot(verify), original);
    console.log("PASS: preferencias originales restablecidas en la cuenta de pruebas");
    await verify.close();
  }
  await browser.close();
}
