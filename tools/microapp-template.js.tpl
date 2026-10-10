// Microapp __NAME__ (generada con ./scripts/renzo-hub new-microapp). Guía: docs/MICROAPPS.md
// Datos: hub_records · domain "__DOMAIN__" · record_type "__TYPE__" (sin migración; RLS por dueño).
import { createRecords } from "../records.js";
import { esc, shortDate, headerHTML, emptyHTML, noticeHTML } from "../ui.js";

export function __MOUNT__(root, db, getUser, go) {
  const store = createRecords(db, getUser, { domain: "__DOMAIN__", type: "__TYPE__" });
  let rows = [], owner = null, busy = false, notice = "", error = "", confirmId = null;

  function render() {
    if (!owner) { root.innerHTML = ""; return; }
    root.innerHTML = headerHTML("__ID__")
      + `<div class="mx-stack">${noticeHTML(error, "error")}${noticeHTML(notice)}
      <form class="card worldform" data-add>
        <label>Título<input name="title" required maxlength="200" autocomplete="off"></label>
        <label>Detalle<textarea name="body" rows="3" maxlength="5000"></textarea></label>
        <div class="mx-actions"><button class="primary" ${busy ? "disabled" : ""}>Guardar</button></div>
      </form>
      ${rows.length ? `<ul class="mx-list">${rows.map(r => `<li class="card mx-item">
        <span class="small">${esc(shortDate(r.occurred_at))}</span>
        <h3>${esc(r.title)}</h3>${r.payload?.body ? `<p>${esc(r.payload.body)}</p>` : ""}
        <div class="mx-actions"><button class="secondary" data-remove="${esc(r.id)}" ${busy ? "disabled" : ""}>${confirmId === r.id ? "Pulsa otra vez para eliminar" : "Eliminar"}</button></div>
      </li>`).join("")}</ul>` : emptyHTML()}</div>`;
  }

  async function load() {
    const uid = getUser()?.id; if (!uid) return;
    owner = uid; error = ""; render();
    try { const data = await store.list(); if (owner !== uid) return; rows = data; }
    catch (e) { if (owner === uid) error = e.message; }
    if (owner === uid) render();
  }

  async function run(action, ok) {
    const uid = owner; busy = true; error = ""; notice = ""; render();
    try { await action(); if (owner !== uid) return; notice = ok; rows = await store.list(); }
    catch (e) { if (owner === uid) error = e.message; }
    if (owner === uid) { busy = false; render(); }
  }

  root.addEventListener("submit", event => {
    const form = event.target.closest("[data-add]"); if (!form) return;
    event.preventDefault(); if (busy) return;
    const f = Object.fromEntries(new FormData(form));
    run(() => store.add({ title: f.title.trim(), payload: { body: f.body.trim() } }), "Guardado.");
  });
  root.addEventListener("click", event => {
    const b = event.target.closest("[data-remove]"); if (!b || busy) return;
    if (confirmId !== b.dataset.remove) { confirmId = b.dataset.remove; render(); return; }
    confirmId = null; run(() => store.remove(b.dataset.remove), "Eliminado.");
  });

  return {
    open() { if (getUser()?.id !== owner) load(); else render(); },
    close() { notice = ""; confirmId = null; },
    reset() { rows = []; owner = null; busy = false; confirmId = null; notice = error = ""; root.innerHTML = ""; }
  };
}
