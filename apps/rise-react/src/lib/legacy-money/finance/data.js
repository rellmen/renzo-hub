// My Finance · carga compartida de movimientos del banco y reglas del usuario.
// Datos: hub_records (domain money) record_type bank_tx y money_rule. RLS por dueño; sin migraciones.
import { categorizeAll } from "../gastos/categories.js";

const PAGE = 1000;

export async function loadBankTxs(db, uid) {
  const out = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db.from("hub_records").select("id,payload,occurred_at,updated_at").eq("owner_id", uid).eq("record_type", "bank_tx").order("occurred_at", { ascending: false }).range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    out.push(...(data || []));
    if ((data || []).length < PAGE) return out;
  }
}

export async function loadRules(db, uid) {
  const { data, error } = await db.from("hub_records").select("id,title,payload,occurred_at,updated_at").eq("owner_id", uid).eq("record_type", "money_rule").order("occurred_at", { ascending: false }).limit(1000);
  if (error) throw new Error(error.message);
  return data || [];
}

// Entradas de AI Inbox (Jarvis y capturas) pendientes de revisar que son de dinero.
const MONEY_INBOX = new Set(["expense", "receipt", "payslip", "income", "invoice", "money"]);
export async function loadPendingInbox(db, uid) {
  const { data, error } = await db.from("hub_records").select("id,payload,status").eq("owner_id", uid).eq("record_type", "renzo_inbox").limit(500);
  if (error) throw new Error(error.message);
  return (data || []).filter(r => {
    const p = r.payload || {}, status = p.status || r.status;
    return !["reviewed", "archived", "confirmed"].includes(status) && MONEY_INBOX.has(String(p.category || "").toLowerCase());
  }).length;
}

// Presupuesto semanal: un solo registro money_budget con payload.weekly = { categoria: límite }.
export async function loadBudget(db, uid) {
  const { data, error } = await db.from("hub_records").select("id,title,payload,occurred_at,updated_at").eq("owner_id", uid).eq("record_type", "money_budget").order("updated_at", { ascending: false }).limit(1);
  if (error) throw new Error(error.message);
  return (data || [])[0] || null;
}

export async function loadFinance(db, uid) {
  const [txs, rules, budget] = await Promise.all([loadBankTxs(db, uid), loadRules(db, uid), loadBudget(db, uid)]);
  return { txs, rules, budget, items: categorizeAll(txs, rules) };
}

// Mes y foco compartidos entre Resumen y Gastos: al pulsar "Ver en Gastos" se abre el mismo mes.
export const financeNav = { month: "", focus: "" };
