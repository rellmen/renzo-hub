// My Finance · Fase 2B "Patrimonio". Funciones puras (tests/finance-networth.test.mjs).
// Cuentas: saldo del último movimiento importado de cada cuenta (ING trae "saldo resultante", Revolut su saldo).
// Inversiones y deudas: valoraciones a mano con fecha (hub_records money/money_asset). Nada se inventa: sin saldo → null.
const round = n => Math.round(n * 100) / 100;
const DAY = 86400000;
export const STALE_DAYS = 45;
// Importes escritos a mano: "1.234,56" · "1234,56" · "1234.56" · "1 234 €" → número (NaN si vacío o inválido).
export const parseEuro = v => { const s = String(v ?? "").trim().replace(/\s|€/g, ""); if (!s) return NaN; return Number(s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s); };

export const monthEnd = month => { const [y, m] = month.split("-").map(Number); return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10); };
const daysBetween = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY);
const accountKey = t => `${/revolut/i.test(t.bank || "") ? "Revolut" : "ING"}|${t.account || ""}`;

// Saldo de cierre de un día: el movimiento cuyo saldo no es el punto de partida de otro movimiento del mismo día.
function closingOfDay(list) {
  if (list.length === 1) return list[0];
  const starts = new Set(list.map(t => Math.round((t.balance - t.amount) * 100)));
  const ends = list.filter(t => !starts.has(Math.round(t.balance * 100)));
  return ends.length === 1 ? ends[0] : list[list.length - 1];
}

// Saldo de cada cuenta a una fecha (incluida). txs: hub_records bank_tx (con payload) o payloads.
export function accountBalances(txs, asOf) {
  const byAcc = new Map();
  for (const tx of txs) {
    const t = tx.payload || tx;
    if (t.balance == null || !Number.isFinite(Number(t.balance)) || !t.date || t.date > asOf) continue;
    const k = accountKey(t);
    const cur = byAcc.get(k);
    if (!cur || t.date > cur.date) byAcc.set(k, { date: t.date, list: [t] });
    else if (t.date === cur.date) cur.list.push(t);
  }
  return [...byAcc.entries()].map(([k, { date, list }]) => {
    const t = closingOfDay(list.map(x => ({ ...x, balance: Number(x.balance), amount: Number(x.amount) })));
    const [bank, account] = k.split("|");
    return { key: k, bank, account: account || null, balance: round(t.balance), date, stale: daysBetween(date, asOf) > STALE_DAYS };
  }).sort((a, b) => a.bank.localeCompare(b.bank) || String(a.account).localeCompare(String(b.account)));
}

// Última valoración de cada inversión o deuda a una fecha. assets: hub_records money_asset.
export function latestValuations(assets, asOf) {
  const by = new Map();
  for (const r of assets) {
    const p = r.payload || r;
    const kind = p.kind === "debt" ? "debt" : p.kind === "investment" ? "investment" : null;
    const name = String(p.name || "").trim();
    const value = Number(p.value);
    if (!kind || !name || !Number.isFinite(value) || value < 0 || !p.date || p.date > asOf) continue;
    const k = `${kind}|${name.toLowerCase()}`;
    const cur = by.get(k);
    if (!cur || p.date > cur.date || (p.date === cur.date && String(r.updated_at || "") > String(cur.updated_at || ""))) by.set(k, { kind, name, value: round(value), date: p.date, updated_at: r.updated_at || "" });
  }
  return [...by.values()].map(({ updated_at, ...v }) => ({ ...v, stale: daysBetween(v.date, asOf) > STALE_DAYS }))
    .sort((a, b) => a.kind.localeCompare(b.kind) || b.value - a.value);
}

export function netWorth(txs, assets, asOf) {
  const accounts = accountBalances(txs, asOf);
  const vals = latestValuations(assets, asOf);
  const investments = vals.filter(v => v.kind === "investment"), debts = vals.filter(v => v.kind === "debt");
  const cash = round(accounts.reduce((s, a) => s + a.balance, 0));
  const invested = round(investments.reduce((s, v) => s + v.value, 0));
  const owed = round(debts.reduce((s, v) => s + v.value, 0));
  const known = accounts.length > 0 || vals.length > 0;
  return { asOf, accounts, investments, debts, cash, invested, owed, total: known ? round(cash + invested - owed) : null,
    stale: [...accounts, ...vals].filter(x => x.stale).length };
}

// Evolución: patrimonio al cierre de cada mes con datos (más antiguo primero), con variación frente al mes anterior.
export function netWorthHistory(txs, assets, months) {
  const out = [];
  for (const m of [...months].sort()) {
    const nw = netWorth(txs, assets, monthEnd(m));
    if (nw.total == null) continue;
    const prev = out[out.length - 1];
    out.push({ month: m, total: nw.total, cash: nw.cash, invested: nw.invested, owed: nw.owed, change: prev ? round(nw.total - prev.total) : null });
  }
  return out;
}
