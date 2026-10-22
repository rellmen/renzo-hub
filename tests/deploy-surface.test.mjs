// Comprueba qué llegaría a Vercel según .vercelignore: solo la app, nunca docs, SQL, scripts, tests ni secretos.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const ignoreConfig = readFileSync(new URL("../.vercelignore", import.meta.url), "utf8");
// React needs its source files during the Vercel build; they are NOT public URL files.
// The classic static-site contract below remains unchanged outside isolated React QA.
const reactBuildMode = ignoreConfig.includes("Isolated Nocturne QA branch ONLY");
const patterns = ignoreConfig.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));

const toRegex = glob => new RegExp("^" + glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*") + "$");
export function ignored(file) {
  const base = file.split("/").pop();
  return patterns.some(p => {
    if (p.endsWith("/")) return file.startsWith(p) || file.includes("/" + p);
    if (p.includes("*")) return toRegex(p).test(p.includes("/") ? file : base);
    return file === p || base === p;
  });
}

const files = execSync("git ls-files", { encoding: "utf8" }).split("\n").filter(Boolean);
const deployed = files.filter(f => !ignored(f));

test("no se publica documentación, SQL, scripts, tests ni configuración interna", () => {
  const leaks = deployed.filter(f => {
    // These paths and secrets may never be present in either deployment's inputs.
    if (/^(docs|supabase|scripts|integrations|os-core|tests|tools|\.github)\//.test(f) ||
        /(^|\/)\.env(\.|$)|\.(pem|key|p12|sql|sh)$/.test(f)) return true;
    // Build inputs for apps/rise-react are compiled into the TanStack/Nitro output.
    // Their presence in the Git checkout does not mean Vercel serves /src/*.ts.
    if (reactBuildMode && (f.startsWith("apps/rise-react/") || /^package(-lock)?\.json$/.test(f))) return false;
    return /\.(md|sql|sh|mjs|ts)$/.test(f) ||
      /^(package(-lock)?\.json|tsconfig\.json|\.gitignore|\.vercelignore)$/.test(f);
  });
  assert.deepEqual(leaks, []);
});

test("la app sí se publica", () => {
  for (const f of ["index.html", "app.js", "world.js", "phase1.js", "profile.js", "sw.js", "release.json", "vercel.json",
                   "manifest.webmanifest", "api/jarvis.js", "api/supabase-config.js", "api/deployment-info.js"])
    assert.ok(deployed.includes(f), `${f} debería publicarse`);
});

test("lo publicado no contiene claves secretas", () => {
  const secret = /(sb_secret_[A-Za-z0-9_-]{10,}|eyJhbGciOi[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}|service_role["']?\s*[:=]\s*["'][^"']{20,})/;
  const hits = deployed.filter(f => /\.(js|mjs|ts|tsx|html|json|webmanifest)$/.test(f))
    .filter(f => secret.test(readFileSync(new URL("../" + f, import.meta.url), "utf8")));
  assert.deepEqual(hits, []);
});
