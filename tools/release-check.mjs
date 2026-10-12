#!/usr/bin/env node
// RISE HUB · comprobaciones fijas de release (las que Renzo pedía a mano en cada PR).
//
//   ./scripts/renzo-hub preflight [nº PR]          antes de fusionar
//   ./scripts/renzo-hub verify <staging|prod> [versión] [--smoke]   después de fusionar
//
// Solo lee: no fusiona, no despliega, no toca Supabase. Necesita `gh` con sesión para preflight.
// Staging está protegido por Vercel: define VERCEL_PROTECTION_BYPASS en tu shell (nunca en el repo)
// para poder verificarlo. Sale con código 1 si alguna comprobación FALLA.
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname;
const REPO = "rellmen/renzo-hub";
const release = JSON.parse(readFileSync(new URL("../release.json", import.meta.url), "utf8"));

const results = [];
const ok = (msg) => results.push(["OK", msg]);
const warn = (msg) => results.push(["AVISO", msg]);
const fail = (msg) => results.push(["FALLA", msg]);
const info = (msg) => results.push(["INFO", msg]);

function report(title) {
  console.log(`\n${title}`);
  for (const [level, msg] of results) console.log(`  ${level.padEnd(6)} ${msg}`);
  const fails = results.filter(([l]) => l === "FALLA").length;
  const warns = results.filter(([l]) => l === "AVISO").length;
  console.log(`\nResultado: ${fails ? `${fails} FALLA` : "sin fallos"}${warns ? `, ${warns} aviso(s)` : ""}`);
  process.exit(fails ? 1 : 0);
}

const gh = (path) => JSON.parse(execFileSync("gh", ["api", path], { encoding: "utf8", maxBuffer: 64 << 20 }));
const ghAll = (path) => JSON.parse(execFileSync("gh", ["api", "--paginate", "--slurp", path], { encoding: "utf8", maxBuffer: 64 << 20 })).flat();

// Archivos de la app: si cambian, tiene que cambiar release.json y la caché de sw.js.
const isAppFile = (f) => !/^(docs|supabase|scripts|integrations|os-core|tests|tools|\.github)\//.test(f)
  && !/\.md$/.test(f) && !/^(package(-lock)?\.json|\.vercelignore|\.gitignore)$/.test(f);
const SECRET = /(sb_secret_[A-Za-z0-9_-]{10,}|eyJhbGciOi[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}|service_role["']?\s*[:=]\s*["'][^"']{20,}|ghp_[A-Za-z0-9]{30,}|sk-ant-[A-Za-z0-9_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/;

function preflight(arg) {
  let number = arg;
  if (!number) {
    const branch = execFileSync("git", ["-C", ROOT, "rev-parse", "--abbrev-ref", "HEAD"], { encoding: "utf8" }).trim();
    const found = gh(`repos/${REPO}/pulls?state=open&head=rellmen:${branch}`);
    if (!found.length) { fail(`no hay PR abierto para la rama ${branch}; indica el número: preflight <nº>`); return report("Preflight"); }
    number = String(found[0].number);
  }
  const pr = gh(`repos/${REPO}/pulls/${number}`);
  const title = `Preflight PR #${pr.number}: ${pr.title}\n  ${pr.html_url}`;

  // 1. Destino
  if (pr.base.ref === "staging") ok(`destino: ${pr.head.ref} → staging`);
  else if (pr.base.ref === "main" && pr.head.ref === "staging") warn("destino: staging → main (PRODUCCIÓN). Solo con OK explícito de Renzo");
  else fail(`destino inesperado: ${pr.head.ref} → ${pr.base.ref}`);

  // 2. Estado
  if (pr.state !== "open") fail(`el PR está ${pr.merged ? "ya fusionado" : pr.state}`);
  else if (pr.mergeable === false) fail(`no se puede fusionar (conflictos: ${pr.mergeable_state})`);
  else if (pr.mergeable === null) warn("GitHub aún calcula si se puede fusionar; repite en unos segundos");
  else ok(`fusionable (${pr.mergeable_state})`);

  // 3. CI en el último commit
  // El último intento de cada check (los reintentos aparecen repetidos).
  const all = gh(`repos/${REPO}/commits/${pr.head.sha}/check-runs?per_page=100`).check_runs;
  const runs = [...new Map(all.sort((a, b) => a.id - b.id).map((r) => [r.name, r])).values()];
  if (!runs.length) warn(`sin checks de CI en ${pr.head.sha.slice(0, 7)}`);
  for (const r of runs) {
    if (r.status !== "completed") warn(`CI ${r.name}: en curso`);
    else if (["success", "skipped", "neutral"].includes(r.conclusion)) ok(`CI ${r.name}: ${r.conclusion} (${pr.head.sha.slice(0, 7)})`);
    else fail(`CI ${r.name}: ${r.conclusion}`);
  }

  // 4. Versión y caché
  const files = ghAll(`repos/${REPO}/pulls/${number}/files?per_page=100`);
  const names = files.map((f) => f.filename);
  info(`${names.length} archivo(s) cambiados`);
  const appChanged = names.filter(isAppFile).filter((f) => !["release.json", "sw.js"].includes(f));
  if (appChanged.length) {
    names.includes("release.json") ? ok("release.json incrementado") : fail("cambia la app pero no release.json");
    const sw = files.find((f) => f.filename === "sw.js");
    sw && /^[-+]const CACHE=/m.test(sw.patch || "") ? ok("caché de sw.js renombrada") : fail("cambia la app pero no la caché de sw.js");
  } else info("no cambia la app publicada: no hace falta subir versión ni caché");
  names.includes("RENZO-HUB-CURRENT.md") ? ok("RENZO-HUB-CURRENT.md actualizado") : warn("RENZO-HUB-CURRENT.md sin cambios");

  // 5. Migraciones
  const migrations = names.filter((f) => /^supabase\/(migrations|pending)\/.+\.sql$/.test(f) && !f.endsWith(".rollback.sql"));
  if (!migrations.length) ok("sin migraciones");
  const rollbackExists = (prefix) => names.some((f) => f.endsWith(".rollback.sql") && f.split("/").pop().startsWith(prefix))
    || ["rollbacks", "pending"].some((d) => { try { return execFileSync("ls", [`${ROOT}supabase/${d}`], { encoding: "utf8" }).split("\n").some((f) => f.startsWith(prefix) && f.endsWith(".rollback.sql")); } catch { return false; } });
  for (const m of migrations) {
    const base = m.split("/").pop();
    rollbackExists(base.slice(0, 14))
      ? warn(`migración ${base}: con rollback. Aplicar primero en staging; producción solo con OK de Renzo`)
      : fail(`migración ${base}: falta su rollback en supabase/rollbacks/`);
  }

  // 6. Secretos en lo añadido
  const leaked = files.filter((f) => (f.patch || "").split("\n").some((l) => l.startsWith("+") && SECRET.test(l)));
  leaked.length ? fail(`posible clave en: ${leaked.map((f) => f.filename).join(", ")}`) : ok("sin claves ni tokens en las líneas añadidas");

  // 7. Superficie publicada
  const exposed = names.filter((f) => !isAppFile(f) && f !== "release.json").length;
  info(`${exposed} archivo(s) internos: .vercelignore los excluye (lo comprueba tests/deploy-surface.test.mjs)`);
  info("al fusionar: 'Create a merge commit' y NO borrar la rama staging");
  report(title);
}

const INTERNAL = ["/AGENTS.md", "/RENZO-HUB-CURRENT.md", "/JARVIS-CONNECTION.md", "/README.md", "/scripts/renzo-hub",
  "/package.json", "/docs/RELEASE-CHECKLIST.md", "/supabase/migrations/", "/tests/deploy-surface.test.mjs",
  "/tools/release-check.mjs", "/.env", "/.vercelignore"].concat(["/supabase/rollbacks/"]);

async function verify(target, expected, smoke) {
  const env = { staging: ["preview", release.preview], stg: ["preview", release.preview],
    prod: ["production", release.production], production: ["production", release.production] }[target];
  if (!env) { console.error("Uso: verify <staging|prod> [versión] [--smoke]"); process.exit(2); }
  const [wantEnv, base] = env;
  const version = expected || release.release;
  const secret = process.env.VERCEL_PROTECTION_BYPASS;
  const headers = { "cache-control": "no-cache", ...(secret ? { "x-vercel-protection-bypass": secret } : {}) };
  const get = (p) => fetch(base + p, { headers, redirect: "manual" });

  const rel = await get("/release.json").catch((e) => ({ error: e }));
  if (rel.error) fail(`${base} no responde (${rel.error.message})`);
  else if (rel.status === 401 || rel.status === 302 || rel.status === 307) {
    fail(`${base} pide login de Vercel: define VERCEL_PROTECTION_BYPASS en tu shell para verificarlo`);
    return report(`Verify ${target}`);
  } else {
    const live = await rel.json().catch(() => ({}));
    live.release === version ? ok(`release ${live.release}`) : fail(`release ${live.release ?? "?"}, se esperaba ${version}`);
  }
  const di = await get("/api/deployment-info").then((r) => r.json()).catch(() => ({}));
  di.environment === wantEnv ? ok(`entorno ${di.environment} (rama ${di.branch ?? "?"})`) : fail(`entorno ${di.environment ?? "?"}, se esperaba ${wantEnv}`);
  const leaks = [];
  for (const p of INTERNAL) {
    const r = await get(p).catch(() => null);
    if (r && r.status === 200 && !/text\/html/.test(r.headers.get("content-type") || "")) leaks.push(p);
  }
  leaks.length ? fail(`rutas internas expuestas: ${leaks.join(", ")}`) : ok(`${INTERNAL.length} rutas internas no expuestas`);
  const up = await get("/api/payroll-upload").catch(() => null);
  up ? info(`/api/payroll-upload responde ${up.status}`) : warn("/api/payroll-upload no responde");

  if (smoke) {
    const run = spawnSync("node", ["tests/e2e/smoke.mjs"], { cwd: ROOT, encoding: "utf8", env: { ...process.env, BASE_URL: base } });
    const last = (run.stdout || run.stderr || "").trim().split("\n").pop();
    run.status === 0 ? ok(`smoke: ${last}`) : fail(`smoke: ${last}`);
  } else info("smoke sin ejecutar (añade --smoke)");
  report(`Verify ${target} · ${base}`);
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === "preflight") preflight(rest[0]);
else if (cmd === "verify") verify(rest[0], rest.find((a) => /^\d+\.\d+\.\d+$/.test(a)), rest.includes("--smoke"));
else { console.error("Uso: release-check.mjs preflight [nº PR] | verify <staging|prod> [versión] [--smoke]"); process.exit(2); }
