// Capa de datos común para microapps sencillas: guarda en la tabla genérica public.hub_records,
// que ya existe en staging y producción con RLS "cada fila solo la ve y cambia su dueño".
// No necesita migraciones: cada microapp usa un `domain` permitido y su propio `type` (record_type).
//
//   const notes = createRecords(db, getUser, { domain: "personal", type: "note" });
//   await notes.list();                       // filas del usuario, más recientes primero
//   await notes.add({ title, payload: {...} });
//   await notes.update(id, { title, payload });
//   await notes.remove(id);
//
// Las apps con datos complejos (como Nóminas) usan tablas propias con su migración en supabase/migrations/.

// Debe coincidir con el CHECK de hub_records.domain (20261007000206_add_shared_hub_records.sql).
export const RECORD_DOMAINS = Object.freeze(["personal", "work", "body", "money", "learning", "news", "system"]);
const TYPE = /^[a-z][a-z0-9_]{0,63}$/;
const COLUMNS = "id,title,status,occurred_at,payload,source,requires_review,created_at,updated_at";

export function createRecords(db, getUser, { domain, type }) {
  if (!RECORD_DOMAINS.includes(domain)) throw new Error(`Dominio no permitido en hub_records: ${domain}`);
  if (!TYPE.test(type || "")) throw new Error(`Tipo de registro no válido: ${type}`);
  const owner = () => {
    const id = getUser()?.id;
    if (!id) throw new Error("Inicia sesión para guardar.");
    return id;
  };
  const clean = (fields = {}) => {
    const row = {};
    if ("title" in fields) row.title = fields.title == null ? null : String(fields.title).slice(0, 500);
    if ("status" in fields) row.status = fields.status ?? null;
    if ("occurred_at" in fields) row.occurred_at = fields.occurred_at;
    if ("payload" in fields) {
      const p = fields.payload ?? {};
      if (typeof p !== "object" || Array.isArray(p)) throw new Error("payload debe ser un objeto");
      row.payload = p;
    }
    return row;
  };
  const check = ({ data, error }) => { if (error) throw new Error(error.message || "No se pudo guardar en Supabase."); return data; };
  return Object.freeze({
    domain, type,
    async list({ limit = 200, status } = {}) {
      let q = db.from("hub_records").select(COLUMNS).eq("owner_id", owner()).eq("domain", domain).eq("record_type", type);
      if (status !== undefined) q = q.eq("status", status);
      return check(await q.order("occurred_at", { ascending: false }).limit(limit)) || [];
    },
    async add(fields) {
      const row = { ...clean(fields), owner_id: owner(), domain, record_type: type, source: "manual" };
      return check(await db.from("hub_records").insert(row).select(COLUMNS).single());
    },
    async update(id, fields) {
      return check(await db.from("hub_records").update(clean(fields)).eq("id", id).eq("owner_id", owner()).eq("domain", domain).eq("record_type", type).select(COLUMNS).single());
    },
    async remove(id) {
      check(await db.from("hub_records").delete().eq("id", id).eq("owner_id", owner()).eq("domain", domain).eq("record_type", type));
    }
  });
}
