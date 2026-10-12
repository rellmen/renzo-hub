// Categorías de gastos e ingresos a partir de los movimientos del banco (hub_records money/bank_tx).
// Orden de prioridad: 1) categoría que el usuario puso a ese movimiento, 2) sus reglas por comercio,
// 3) reglas por defecto de este archivo, 4) "Sin categoría". Nada se inventa: lo que no encaja queda sin categoría.

// kind: expense = gasto (los abonos en esa categoría restan: devoluciones, aportes) · income = ingreso · transfer = no cuenta
export const CATEGORIES = Object.freeze([
  { id: "supermercado", name: "Supermercado", kind: "expense", icon: "🛒" },
  { id: "restaurantes", name: "Restaurantes y comida fuera", kind: "expense", icon: "🍽" },
  { id: "alquiler", name: "Alquiler", kind: "expense", icon: "🏠" },
  { id: "gasolina", name: "Gasolina", kind: "expense", icon: "⛽" },
  { id: "coche", name: "Coche y parking", kind: "expense", icon: "🚗" },
  { id: "transporte", name: "Transporte", kind: "expense", icon: "🚆" },
  { id: "seguros", name: "Seguros", kind: "expense", icon: "🛡" },
  { id: "suscripciones", name: "Suscripciones", kind: "expense", icon: "🔁" },
  { id: "telefono", name: "Teléfono e internet", kind: "expense", icon: "📶" },
  { id: "energia", name: "Luz, gas y agua", kind: "expense", icon: "💡" },
  { id: "salud", name: "Salud y cuidado personal", kind: "expense", icon: "💊" },
  { id: "compras", name: "Compras y ropa", kind: "expense", icon: "🛍" },
  { id: "ocio", name: "Ocio y deporte", kind: "expense", icon: "🎳" },
  { id: "viajes", name: "Viajes y alojamiento", kind: "expense", icon: "✈" },
  { id: "impuestos", name: "Impuestos y tasas", kind: "expense", icon: "🏛" },
  { id: "banco", name: "Banco y tarjetas", kind: "expense", icon: "🏦" },
  { id: "personas_enviado", name: "Enviado a personas", kind: "expense", icon: "↗" },
  { id: "familia", name: "Ayuda a la familia", kind: "expense", icon: "👪" },
  { id: "deudas", name: "Pago de deudas", kind: "expense", icon: "🧾" },
  { id: "otros_gastos", name: "Otros gastos", kind: "expense", icon: "•" },
  { id: "nomina", name: "Nómina", kind: "income", icon: "💼" },
  { id: "toeslagen", name: "Toeslagen y ayudas", kind: "income", icon: "🏛" },
  { id: "personas_recibido", name: "Recibido de personas", kind: "income", icon: "↙" },
  { id: "otros_ingresos", name: "Otros ingresos", kind: "income", icon: "+" },
  { id: "traspaso", name: "Traspaso entre tus cuentas", kind: "transfer", icon: "⇄" },
  { id: "prestamos", name: "Préstamos y devoluciones", kind: "transfer", icon: "↔" },
  { id: "sin_categoria", name: "Sin categoría", kind: "expense", icon: "?" }
].map(Object.freeze));
export const CATEGORY = Object.freeze(Object.fromEntries(CATEGORIES.map(c => [c.id, c])));

// Marcas conocidas: todas sus tiendas se agrupan con un solo nombre ("Albert Heijn 1234 EINDHOVEN" → "Albert Heijn").
const BRANDS = [
  ["Albert Heijn", /albert ?heijn|^ah\b|\bah to go\b/i], ["Jumbo", /\bjumbo\b/i], ["Lidl", /\blidl\b/i], ["Aldi", /\baldi\b/i],
  ["Plus", /^plus\b/i], ["Dirk", /^dirk\b/i], ["Coop", /^coop\b/i], ["Spar", /^spar\b/i], ["Picnic", /\bpicnic\b/i], ["Vomar", /\bvomar\b/i], ["Hoogvliet", /hoogvliet/i],
  ["Action", /^action\b/i], ["HEMA", /^hema\b/i], ["Kruidvat", /kruidvat/i], ["Etos", /^etos\b/i], ["Primark", /primark/i], ["Uniqlo", /uniqlo/i], ["Zara", /^zara\b/i], ["H&M", /^h ?& ?m\b/i], ["IKEA", /\bikea\b/i], ["Bol.com", /bol\.com/i], ["Amazon", /amazon|amzn/i], ["Coolblue", /coolblue/i], ["MediaMarkt", /media ?markt/i],
  ["Shell", /\bshell\b/i], ["Esso", /\besso\b/i], ["BP", /^bp\b/i], ["TotalEnergies", /totalenergies|^total\b/i], ["Tango", /^tango\b/i], ["TinQ", /^tinq\b/i],
  ["McDonald's", /mcdonald/i], ["Burger King", /burger ?king/i], ["KFC", /^kfc\b/i], ["Starbucks", /starbucks/i], ["Thuisbezorgd", /thuisbezorgd/i], ["Uber Eats", /uber ?eats/i], ["Uber", /^uber\b/i],
  ["NS", /^ns\b|ns groep/i], ["Q-Park", /^q.?park\b/i], ["Revolut", /revolut/i], ["SD Worx", /sd ?worx/i], ["Netflix", /netflix/i], ["Spotify", /spotify/i], ["Apple", /apple\.com|^apple\b/i], ["Google", /^google\b/i], ["Belastingdienst", /belastingdienst/i]
];

// Nombre limpio del comercio: "SP KBEAUTY STORE ROTTERDAM NLD" → "Kbeauty Store", "de Brouwer Weert B.V. Weert NLD" → "De Brouwer Weert"
export function merchantName(raw) {
  const original = String(raw ?? "").trim();
  let s = original.replace(/^(?:ccv|sp|nyx|sumup|zettle|izettle|bck|sq|pay\.nl|mollie|stripe|paypal|tikkie)\s*[*\s]\s*(?=\S)/i, "");
  const brand = BRANDS.find(([, re]) => re.test(s));
  if (brand) return brand[0];
  s = s.replace(/,.*$/, "").replace(/\s+via\s+.*$/i, "");                      // "Golazo Athletics B.V., Golazo Let's via Stichting Mollie" → "Golazo Athletics B.V."
  s = s.replace(/\*+\d*\*?/g, " ");
  s = s.replace(/\s+(?:NLD|NL|BEL|BE|DEU|DE|IRL|IE|ESP|ES|FRA|FR|GBR|GB|LUX|USA|US)$/i, "");
  s = s.replace(/\s+b\.\s*(?:v\.?)?(?:\s.*)?$/i, "").replace(/\s+bv(?:\s.*)?$/i, "").replace(/\s+(?:n\.v\.|gmbh|ltd|s\.l\.)(?:\s.*)?$/i, "");
  if (/\s/.test(s)) s = s.replace(/\s+[A-Z][A-Z'-]{2,}$/, "");                    // ciudad en mayúsculas al final ("… ROTTERDAM")
  s = s.replace(/\s+\d{2,}\b.*$/, "");                                            // número de tienda y lo que sigue
  s = s.replace(/\s{2,}/g, " ").trim();
  if (!s) s = original;
  return s.toLowerCase().replace(/(^|[\s(/&.-])\p{L}/gu, m => m.toUpperCase()).slice(0, 60);
}
export const merchantKey = raw => merchantName(raw).toLowerCase();

const R = (category, pattern, when = "any") => ({ category, re: new RegExp(pattern, "i"), when });
// when: debit (salida) · credit (entrada) · any
export const DEFAULT_RULES = Object.freeze([
  R("traspaso", "recarga desde tu tarjeta|geld toevoegen|\\btop.?up\\b|\\brevolut\\b|\\bbunq\\b.*(top ?up|opwaarderen)|spaarrekening|oranje spaar|eigen rekening"),
  R("nomina", "loonslip|salaris|salary|\\bsd ?worx\\b", "credit"),
  R("toeslagen", "toeslag|belastingdienst", "credit"),
  R("impuestos", "belastingdienst|kvk|gemeente(?!lijk auto)|waterschap|\\bbsgw\\b|cjib", "debit"),
  R("alquiler", "\\b(rent|huur|alquiler|kale huur)\\b"),
  R("supermercado", "albert ?heijn|\\bah\\b|\\bah to go\\b|jumbo|lidl|aldi|\\bplus\\b|\\bdirk\\b|\\bcoop\\b|\\bspar\\b|ekoplaza|vomar|hoogvliet|\\bdeen\\b|supermarkt|supermarket|picnic|crisp|nettorama|poiesz|boni|dekamarkt|carrefour|mercadona|delhaize|colruyt"),
  R("gasolina", "\\bumans|\\bshell\\b|\\besso\\b|\\bbp\\b|totalenergies|\\btotal\\b|tango|tinq|texaco|\\bgulf\\b|\\bavia\\b|argos|fieten|\\bq8\\b|tamoil|firezone|tankstation|tank\\s|benzine"),
  R("coche", "parking|q.?park|parkeren|parkeer|carwash|car ?w(ash)?|wasstraat|\\banwb\\b|\\bapk\\b|kwik.?fit|halfords|autobedrijf|garage|bandencentrale|\\brdw\\b"),
  R("transporte", "\\bns\\b|ns groep|ov.?chipkaart|translink|arriva|hermes|connexxion|qbuzz|\\bret\\b|\\bgvb\\b|\\bhtm\\b|\\buber\\b(?!.*eats)|\\bbolt\\b|flixbus"),
  R("viajes", "airbnb|booking\\.com|hotel|hostel|expedia|ryanair|transavia|\\bklm\\b|vueling|easyjet|iberia|wizz ?air|camping"),
  R("seguros", "verzekering|verzekeraar|insurance|zilveren kruis|\\bcz\\b|\\bvgz\\b|menzis|\\bohra\\b|centraal beheer|interpolis|\\bnn\\b|allianz|aegon|\\bfbto\\b|unive|ditzo|\\bdsw\\b|aon\\b"),
  R("telefono", "\\bkpn\\b|vodafone|t-?mobile|odido|ziggo|simyo|lebara|\\bben\\b|tele2|youfone|hollandsnieuwe|lycamobile|delta fiber"),
  R("energia", "vattenfall|eneco|essent|greenchoice|budget energie|energiedirect|vandebron|waterbedrijf|brabant water|vitens|evides|\\bpwn\\b|enexis|stedin|liander"),
  R("suscripciones", "netflix|spotify|disney|\\bhbo\\b|videoland|apple\\.com|icloud|google|youtube|amazon prime|prime video|transip|chatgpt|openai|anthropic|\\bclaude\\b|microsoft|adobe|dropbox|notion|patreon|audible|duolingo|linkedin|coursera|udemy"),
  R("ocio", "bowling|golazo|bioscoop|path[eé]|kinepolis|vue cinema|ticketmaster|eventim|museum|steam|playstation|xbox|nintendo|basic.?fit|sportcity|fit for free|anytime fitness|\\bgym\\b|escape room|efteling|concert"),
  R("restaurantes", "smaeck|feg exploitatie|de brouwer weert|restaurant|ristorante|\\bcaf[eé]\\b|bakery|bakkerij|lunchroom|cuisine|eetcaf|snackbar|friet|mcdonald|burger ?king|\\bkfc\\b|subway|domino|pizza|thuisbezorgd|uber ?eats|deliveroo|starbucks|sushi|grill|brasserie|\\bbar\\b|kebab|shoarma|vending|bistro|taverne|pub\\b|hmshost|\\brest\\b|grieks|matcha|ijssalon|gelato"),
  R("salud", "body supplies|suplement|supplement|myprotein|kapper|barber|golden scissors|\\bhair|rituals|apotheek|pharmacy|farmacia|huisarts|tandarts|fysio|ziekenhuis|kruidvat|\\betos\\b|trekpleister|da drogist|opticien|specsavers|pearle"),
  R("compras", "\\baction\\b|\\bhema\\b|primark|\\bzara\\b|h&m|\\bh ?& ?m\\b|uniqlo|bol\\.com|amazon|coolblue|mediamarkt|\\bikea\\b|beauty|scents|douglas|zalando|wehkamp|blokker|gamma|praxis|karwei|hornbach|decathlon|intertoys|bershka|pull ?& ?bear|mango|c&a|wibra|xenos|flying tiger|shein|temu|aliexpress"),
  R("banco", "kosten|oranjepakket|betaalpakket|creditcard|credit card|\\brente\\b|bankkosten|incasso ing")
]);

// Movimiento → { category, source: "manual"|"rule"|"default"|"none", merchant }
export function categorize(tx, userRules = []) {
  const t = tx.payload || tx;
  const merchant = merchantName(t.name);
  if (t.category && CATEGORY[t.category]) return { category: t.category, source: "manual", merchant };
  const key = merchant.toLowerCase();
  const own = userRules.find(r => (r.payload?.merchant ?? r.merchant) === key);
  if (own && CATEGORY[own.payload?.category ?? own.category]) return { category: own.payload?.category ?? own.category, source: "rule", merchant };
  if ((t.payslip_numbers || []).length && t.amount > 0) return { category: "nomina", source: "default", merchant };
  if (t.code === "TOPUP") return { category: "traspaso", source: "default", merchant };
  const text = `${t.name || ""} ${t.description || ""}`;
  const dir = t.amount < 0 ? "debit" : "credit";
  for (const rule of DEFAULT_RULES) if ((rule.when === "any" || rule.when === dir) && rule.re.test(text)) return { category: rule.category, source: "default", merchant };
  // Transferencias entre personas (banca online, con IBAN de la contraparte)
  if (t.code === "GT" && t.counterparty) return { category: t.amount < 0 ? "personas_enviado" : "personas_recibido", source: "default", merchant };
  return { category: t.amount > 0 ? "otros_ingresos" : "sin_categoria", source: "none", merchant };
}

// Aporte al alquiler: un ingreso de una persona por el mismo importe que el alquiler o la mitad (±1 €),
// a 10 días o menos de un pago de alquiler, cuenta dentro de "Alquiler" y resta de ese gasto.
export function rentContributions(items) {
  const rents = items.filter(i => i.category === "alquiler" && i.amount < 0);
  const ids = new Set();
  for (const i of items) {
    if (i.category !== "personas_recibido" || i.source === "manual" || i.source === "rule") continue;
    const near = rents.find(r => Math.abs(Date.parse(r.date) - Date.parse(i.date)) <= 10 * 86400000
      && [Math.abs(r.amount), Math.abs(r.amount) / 2].some(v => Math.abs(v - i.amount) <= 1));
    if (near) ids.add(i.id);
  }
  return ids;
}

const round = n => Math.round(n * 100) / 100;

// Todos los movimientos categorizados (id, fecha, importe, comercio, categoría, origen de la categoría).
export function categorizeAll(txs, userRules = []) {
  const items = txs.map(tx => {
    const t = tx.payload || tx;
    const c = categorize(tx, userRules);
    return { id: tx.id, date: t.date, amount: Number(t.amount), name: t.name, description: t.description || "", bank: t.bank || "", ...c, contribution: false };
  });
  const contrib = rentContributions(items);
  for (const i of items) if (contrib.has(i.id)) { i.category = "alquiler"; i.contribution = true; }
  return items.sort((a, b) => b.date.localeCompare(a.date) || a.amount - b.amount);
}

export const monthsOf = items => [...new Set(items.map(i => i.date.slice(0, 7)))].sort().reverse();

// Resumen de un mes: gasto total y por categoría (con comercios), ingresos, traspasos.
export function monthSummary(items, month) {
  const list = items.filter(i => i.date.startsWith(month));
  const byCat = new Map();
  for (const i of list) {
    const cat = CATEGORY[i.category] || CATEGORY.sin_categoria;
    if (!byCat.has(cat.id)) byCat.set(cat.id, { ...cat, total: 0, count: 0, merchants: new Map(), items: [] });
    const g = byCat.get(cat.id);
    const value = cat.kind === "expense" ? -i.amount : i.amount; // gasto en positivo; abonos restan
    g.total += value; g.count++; g.items.push(i);
    const m = g.merchants.get(i.merchant) || { name: i.merchant, total: 0, count: 0 };
    m.total += value; m.count++; g.merchants.set(i.merchant, m);
  }
  const groups = [...byCat.values()].map(g => ({ ...g, total: round(g.total), merchants: [...g.merchants.values()].map(m => ({ ...m, total: round(m.total) })).sort((a, b) => b.total - a.total) }));
  const expenses = groups.filter(g => g.kind === "expense").sort((a, b) => b.total - a.total);
  const income = groups.filter(g => g.kind === "income").sort((a, b) => b.total - a.total);
  const transfers = groups.filter(g => g.kind === "transfer");
  const spent = round(expenses.reduce((s, g) => s + g.total, 0));
  const earned = round(income.reduce((s, g) => s + g.total, 0));
  return { month, count: list.length, spent, earned, net: round(earned - spent), expenses, income, transfers,
    transferTotal: round(transfers.reduce((s, g) => s + g.total, 0)), uncategorized: list.filter(i => i.category === "sin_categoria").length };
}
