// Unauthenticated React Nocturne browser smoke. No staging user, token or private data.
import { chromium, webkit, devices } from 'playwright';
import assert from 'node:assert/strict';

const origin = process.env.REACT_QA_BASE_URL || 'http://127.0.0.1:4174';
const paths = ['/', '/ares', '/aprender', '/gym', '/dinero', '/piel', '/proyectos', '/notas', '/body', '/food', '/ajustes'];
for (const [name, engine, opts] of [
  ['Chromium desktop', chromium, { viewport: {width: 1440, height: 900} }],
  ['WebKit mobile emulation', webkit, {...devices['iPhone 13']}],
]) {
  const browser = await engine.launch();
  try {
    const context = await browser.newContext(opts);
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', e => pageErrors.push(e.message));
    for (const path of paths) {
      const res = await page.goto(new URL(path, origin).href, {waitUntil: 'domcontentloaded'});
      assert.equal(res?.status(), 200, `${name} ${path}: unexpected HTTP status`);
      await page.getByRole('heading', {name: 'Tu espacio privado.'}).waitFor({timeout: 20000});
      assert.ok(await page.getByLabel('Correo electrónico').isVisible(), 'Email form missing');
      assert.ok(await page.getByLabel('Contraseña').isVisible(), 'Password form missing');
    }
    const manifest = await context.request.get(new URL('/manifest.webmanifest', origin).href);
    assert.equal(manifest.status(), 200);
    const pwa = await manifest.json();
    assert.equal(pwa.display, 'standalone');
    assert.ok(pwa.icons.some(i => i.sizes === '192x192'));
    assert.ok(pwa.icons.some(i => i.sizes === '512x512'));
    for (const icon of ['/icon-192.png','/icon-512.png','/sw.js']) {
      const res=await context.request.get(new URL(icon,origin).href);
      assert.equal(res.status(), 200, `${icon} unavailable`);
    }
    assert.deepEqual(pageErrors, [], `${name} browser errors`);
    await context.close();
    console.log(`${name}: ${paths.length} private routes guarded, manifest and icons OK`);
  } finally {
    await browser.close();
  }
}
