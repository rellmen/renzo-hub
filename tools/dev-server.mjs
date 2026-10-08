// Servidor local para pruebas: sirve los archivos estáticos, aplica las cabeceras de vercel.json
// y simula /api/supabase-config y /api/deployment-info. No contiene secretos: lee
// SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY (clave pública) del entorno. Uso:
//   SUPABASE_URL=... SUPABASE_PUBLISHABLE_KEY=... node tools/dev-server.mjs [puerto]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const port = Number(process.argv[2] || 4173);
const vercel = JSON.parse(await readFile(join(root, "vercel.json"), "utf8"));
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json",
  ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png", ".jpeg": "image/jpeg", ".css": "text/css" };
const blocked = [/\.md$/i, /^\/(supabase|scripts|integrations|tests|tools|docs|os-core)\//, /^\/\.(env|git|vercel)/, /^\/package/];

function applyHeaders(res, path) {
  for (const rule of vercel.headers || []) {
    const re = new RegExp("^" + rule.source.replace("(.*)", ".*") + "$");
    if (re.test(path)) for (const h of rule.headers) res.setHeader(h.key, h.value);
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  let path = decodeURIComponent(url.pathname);
  applyHeaders(res, path);
  if (path === "/api/supabase-config") {
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ supabaseUrl: process.env.SUPABASE_URL, publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY }));
  }
  if (path === "/api/deployment-info") {
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ environment: "preview", project: "local-dev", branch: "local" }));
  }
  if (path.startsWith("/api/")) { res.statusCode = 404; return res.end("{}"); }
  if (blocked.some(re => re.test(path))) { res.statusCode = 404; return res.end("Not found"); }
  if (path === "/") path = "/index.html";
  const file = normalize(join(root, path));
  if (!file.startsWith(root)) { res.statusCode = 403; return res.end(); }
  try {
    if (!(await stat(file)).isFile()) throw new Error();
    res.setHeader("Content-Type", types[extname(file)] || "application/octet-stream");
    res.end(await readFile(file));
  } catch { res.statusCode = 404; res.end("Not found"); }
}).listen(port, () => console.log(`Renzo HUB dev: http://localhost:${port}`));
