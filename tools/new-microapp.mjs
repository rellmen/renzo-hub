#!/usr/bin/env node
// Crea una microapp nueva conectada a todo: módulo, registro, caché sin conexión.
// Uso: ./scripts/renzo-hub new-microapp <id> "<Nombre>" <area> [domain] [--tab]
//   id      minúsculas (ej. notes); también será la ruta ?app=<id>
//   area    home | body | study | work | money | system | car
//   domain  dominio de hub_records (por defecto según el área)
//   --tab   añade la app como pestaña dentro de su área
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { AREAS, SECTION_IDS } from "../microapps/registry.js";
import { RECORD_DOMAINS } from "../microapps/records.js";

const root = new URL("../", import.meta.url);
const args = process.argv.slice(2).filter(a => a !== "--tab");
const tab = process.argv.includes("--tab");
const [id, name, area, domainArg] = args;
const fail = msg => { console.error(`Error: ${msg}`); process.exit(1); };

const AREA_DOMAIN = { home: "personal", body: "body", study: "learning", work: "work", money: "money", system: "system", car: "money" };
if (!id || !name || !area) fail('uso: new-microapp <id> "<Nombre>" <area> [domain] [--tab]');
if (!/^[a-z][a-z0-9]{1,30}$/.test(id)) fail("el id debe ir en minúsculas, sin espacios ni guiones (ej. notes)");
if (SECTION_IDS.includes(id)) fail(`ya existe una sección o microapp "${id}"`);
if (!AREAS[area]) fail(`área desconocida "${area}". Opciones: ${Object.keys(AREAS).join(", ")}`);
const domain = domainArg || AREA_DOMAIN[area];
if (!RECORD_DOMAINS.includes(domain)) fail(`dominio "${domain}" no permitido. Opciones: ${RECORD_DOMAINS.join(", ")}`);

const mount = "mount" + id[0].toUpperCase() + id.slice(1);
const modulePath = `/microapps/${id}/${id}.js`;
const file = new URL(`microapps/${id}/${id}.js`, root);
if (existsSync(file)) fail(`ya existe ${modulePath}`);

// 1. Módulo desde la plantilla
const tpl = readFileSync(new URL("tools/microapp-template.js.tpl", root), "utf8");
mkdirSync(new URL(`microapps/${id}/`, root), { recursive: true });
writeFileSync(file, tpl.replaceAll("__ID__", id).replaceAll("__NAME__", name).replaceAll("__MOUNT__", mount)
  .replaceAll("__DOMAIN__", domain).replaceAll("__TYPE__", id.replace(/s$/, "")));

// 2. Entrada en el registro
const regUrl = new URL("microapps/registry.js", root);
const reg = readFileSync(regUrl, "utf8");
const end = "\n].map(Object.freeze));";
if (!reg.includes(end)) fail("no encuentro el final de MICROAPPS en microapps/registry.js");
const entry = `  { id: ${JSON.stringify(id)}, name: ${JSON.stringify(name)}, area: ${JSON.stringify(area)}, module: ${JSON.stringify(modulePath)}, mount: ${JSON.stringify(mount)}${tab ? `, tab: ${JSON.stringify(name)}` : ""}${area === "home" ? `, home: ${JSON.stringify(name + ": descripción corta.")}` : ""} }`;
writeFileSync(regUrl, reg.replace(end, `,\n${entry}${end}`));

// 3. Caché sin conexión
const swUrl = new URL("sw.js", root);
const sw = readFileSync(swUrl, "utf8");
writeFileSync(swUrl, sw.replace("const CORE=['/microapps/registry.js',", `const CORE=['/microapps/registry.js','${modulePath}',`));

console.log(`Microapp "${name}" creada:
  ${modulePath}  (datos: hub_records · ${domain} · ${id.replace(/s$/, "")})
  registro y sw.js actualizados

Siguientes pasos:
  1. Ajusta la interfaz en ${modulePath}
  2. npm test  (comprueba registro, caché y publicación)
  3. Sube release.json, cambia CACHE en sw.js y apunta el cambio en RENZO-HUB-CURRENT.md
  4. Rama feature/* -> PR a staging`);
