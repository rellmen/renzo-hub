// Garantías del registro de microapps: si una app se declara mal o se olvida un paso, falla aquí y no en producción.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { AREAS, MICROAPPS, SECTION_IDS, navAreaOf, isFullscreen, areaTabsHTML } from "../microapps/registry.js";
import { ignored } from "./deploy-surface.test.mjs";

const read = f => readFileSync(new URL("../" + f, import.meta.url), "utf8");
const sw = read("sw.js");
const html = read("index.html");
const core = JSON.parse(sw.match(/const CORE=(\[[^\]]*\])/)[1].replace(/'/g, '"'));

test("ids únicos y válidos, sin chocar con las áreas", () => {
  assert.equal(new Set(SECTION_IDS).size, SECTION_IDS.length);
  for (const m of MICROAPPS) assert.match(m.id, /^[a-z][a-z0-9-]{1,30}$/, m.id);
});

test("cada microapp pertenece a un área existente y tiene nombre", () => {
  for (const m of MICROAPPS) {
    assert.ok(AREAS[m.area], `${m.id}: área ${m.area} no existe`);
    assert.ok(m.name, `${m.id}: falta name`);
  }
});

test("cada módulo existe, exporta su función de montaje, se publica y está en la caché sin conexión", async () => {
  for (const m of MICROAPPS.filter(m => m.module)) {
    const file = m.module.replace(/^\//, "");
    assert.ok(existsSync(new URL("../" + file, import.meta.url)), `${m.id}: no existe ${file}`);
    assert.ok(!ignored(file), `${m.id}: ${file} no se publicaría (.vercelignore)`);
    assert.ok(core.includes(m.module), `${m.id}: añade ${m.module} a CORE en sw.js`);
    assert.match(read(file), new RegExp(`export\\s+function\\s+${m.mount}\\s*\\(`), `${m.id}: ${file} debe exportar ${m.mount}`);
    if (m.css) {
      assert.ok(existsSync(new URL("../" + m.css.replace(/^\//, ""), import.meta.url)), `${m.id}: no existe ${m.css}`);
      assert.ok(core.includes(m.css), `${m.id}: añade ${m.css} a CORE en sw.js`);
    }
  }
  assert.ok(core.includes("/microapps/registry.js"), "el registro debe estar en CORE");
});

test("las apps sin módulo (legacy) tienen su sección en index.html", () => {
  for (const m of MICROAPPS.filter(m => !m.module)) assert.ok(html.includes(`id="${m.id}"`), `${m.id}: falta <section id="${m.id}">`);
  for (const a of Object.keys(AREAS)) assert.ok(html.includes(`id="${a}"`), `área ${a}: falta su sección`);
});

test("menú, pantalla completa y pestañas se derivan del registro", () => {
  assert.equal(navAreaOf("payroll"), "money");
  assert.equal(navAreaOf("money"), "money");
  assert.equal(navAreaOf("nada"), null);
  assert.equal(isFullscreen("gym"), true);
  assert.equal(isFullscreen("payroll"), false);
  const tabs = areaTabsHTML("money", "payroll");
  assert.match(tabs, /data-open="money">Resumen</);
  assert.match(tabs, /aria-current="page">Nóminas</);
  assert.equal(areaTabsHTML("home", "home"), "");
});

test("el registro está congelado (nadie lo cambia en tiempo de ejecución)", () => {
  assert.ok(Object.isFrozen(MICROAPPS) && MICROAPPS.every(Object.isFrozen) && Object.isFrozen(AREAS));
});

test("las tarjetas de Home salen del registro", async () => {
  const { homeTilesHTML } = await import("../microapps/registry.js");
  for (const m of MICROAPPS.filter(m => m.home)) assert.match(homeTilesHTML(), new RegExp(`data-open="${m.id}"`));
});

test("todos los módulos de microapps/ están en la caché sin conexión", async () => {
  const { readdirSync, statSync } = await import("node:fs");
  const dir = new URL("../microapps/", import.meta.url);
  const files = [];
  for (const f of readdirSync(dir)) {
    const st = statSync(new URL(f, dir));
    if (st.isDirectory()) for (const g of readdirSync(new URL(f + "/", dir))) { if (g.endsWith(".js")) files.push(`/microapps/${f}/${g}`); }
    else if (f.endsWith(".js")) files.push(`/microapps/${f}`);
  }
  for (const f of files) assert.ok(core.includes(f), `añade ${f} a CORE en sw.js`);
});
