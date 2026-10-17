// Perfil corporal privado: se guarda en public.user_settings.settings.bodyProfile (RLS por usuario).
// Sustituye los datos personales que antes estaban fijos en index.html. Sin datos, muestra "sin datos".
export const HISTORICAL_BODY_SUGGESTION = Object.freeze({startWeight:84,height:1.70,phases:"78, 74.5",status:"Datos comunicados anteriormente; comprobar vigencia antes de guardar"});
const FIELDS = ["startWeight", "height", "kcalMin", "kcalMax", "proteinMin", "proteinMax", "budgetMin", "budgetMax"];
const fmt = (n, digits = 0) => new Intl.NumberFormat("es-ES", { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(n);
const range = (a, b, unit = "", digits = 0) => {
  const hasA = Number.isFinite(a), hasB = Number.isFinite(b);
  if (!hasA && !hasB) return "sin datos";
  if (hasA && hasB && a !== b) return `${fmt(a, digits)}–${fmt(b, digits)}${unit}`;
  return `${fmt(hasA ? a : b, digits)}${unit}`;
};

export function sanitizeBodyProfile(input = {}) {
  const out = {};
  for (const key of FIELDS) {
    const raw = input[key];
    if (raw === "" || raw === null || raw === undefined) continue;
    const n = Number(String(raw).replace(",", "."));
    if (Number.isFinite(n) && n >= 0) out[key] = Math.round(n * 100) / 100;
  }
  const phases = String(input.phases ?? "").split(",").map(s => s.trim()).filter(Boolean).slice(0, 5)
    .map(s => s.replace(/[^0-9.,–-]/g, "").slice(0, 12)).filter(Boolean);
  if (phases.length) out.phases = phases;
  return out;
}

export function mountProfile(supabase, getUser) {
  let settings = {};
  const $ = id => document.getElementById(id);

  function render() {
    const suggestionText = $("bodyProfileSuggestionText");
    if (suggestionText) suggestionText.textContent = `Referencias históricas comunicadas: ${HISTORICAL_BODY_SUGGESTION.startWeight} kg, ${fmt(HISTORICAL_BODY_SUGGESTION.height, 2)} m y metas ${HISTORICAL_BODY_SUGGESTION.phases} kg.`;
    const p = settings.bodyProfile || {};
    const start = Number.isFinite(p.startWeight)
      ? `Punto de partida: ${fmt(p.startWeight, 1)} kg${Number.isFinite(p.height) ? ` · ${fmt(p.height, 2)} m` : ""}.`
      : "Configura tu perfil corporal en Ajustes.";
    if ($("bpStart")) $("bpStart").textContent = start;
    if ($("bpKcal")) $("bpKcal").textContent = range(p.kcalMin, p.kcalMax);
    if ($("bpProtein")) $("bpProtein").textContent = range(p.proteinMin, p.proteinMax, " g");
    if ($("bpBudget")) $("bpBudget").textContent = range(p.budgetMin, p.budgetMax, " €");
    const phasesBox = $("bpPhases"), note = $("bpPhasesNote");
    if (phasesBox) {
      phasesBox.replaceChildren();
      const steps = [Number.isFinite(p.startWeight) ? `${fmt(p.startWeight, 1)} kg` : null, ...(p.phases || []).map(x => `${x} kg`)].filter(Boolean);
      if (steps.length < 2) {
        const s = document.createElement("span"); s.className = "small";
        s.textContent = "Sin objetivos guardados. Añádelos en Ajustes → Perfil corporal.";
        phasesBox.append(s);
      } else steps.forEach((label, i) => {
        if (i) { const arrow = document.createElement("span"); arrow.setAttribute("aria-hidden", "true"); arrow.textContent = "→"; phasesBox.append(arrow); }
        const pill = document.createElement("span"); pill.className = "pill"; pill.textContent = label; phasesBox.append(pill);
      });
    }
    if (note) note.textContent = p.phases?.length ? `Primera meta: ${p.phases[0]} kg. Reevalúa cintura, fuerza y bienestar en cada fase.` : "";
    const form = $("bodyProfileForm");
    if (form) {
      for (const key of FIELDS) if (form.elements[key]) form.elements[key].value = Number.isFinite(p[key]) ? p[key] : "";
      if (form.elements.phases) form.elements.phases.value = (p.phases || []).join(", ");
    }
  }

  async function load() {
    const user = getUser();
    if (!user) return reset();
    const { data, error } = await supabase.from("user_settings").select("settings").eq("user_id", user.id).maybeSingle();
    if (getUser()?.id !== user.id) return;
    if (error) { if ($("bodyProfileStatus")) $("bodyProfileStatus").textContent = `No se pudo cargar el perfil: ${error.message}`; throw error; }
    settings = data?.settings && typeof data.settings === "object" ? data.settings : {};
    render();
    const suggestion = $("bodyProfileSuggestion");
    if (suggestion) suggestion.hidden = Number.isFinite(settings.bodyProfile?.startWeight) && Number.isFinite(settings.bodyProfile?.height);
  }

  function reset() { settings = {}; render(); if ($("bodyProfileStatus")) $("bodyProfileStatus").textContent = ""; }

  const form = $("bodyProfileForm");
  const suggestButton = $("bodyProfileApplySuggestion");
  if (suggestButton && form) suggestButton.addEventListener("click", () => {
    for (const key of ["startWeight", "height"]) if (form.elements[key] && !form.elements[key].value) form.elements[key].value = HISTORICAL_BODY_SUGGESTION[key];
    if (form.elements.phases && !form.elements.phases.value) form.elements.phases.value = HISTORICAL_BODY_SUGGESTION.phases;
    if ($("bodyProfileStatus")) $("bodyProfileStatus").textContent = "Propuesta histórica cargada. Comprueba los valores y pulsa Guardar perfil para confirmarlos.";
  });
  if (form) form.addEventListener("submit", async event => {
    event.preventDefault();
    const user = getUser(); if (!user) return;
    const status = $("bodyProfileStatus"), button = form.querySelector("button");
    button.disabled = true; status.textContent = "Guardando…";
    const bodyProfile = sanitizeBodyProfile(Object.fromEntries(new FormData(form)));
    // Leer-modificar-escribir: conserva otras claves (p. ej. hábitos) guardadas desde otro módulo o dispositivo.
    const fresh = await supabase.from("user_settings").select("settings").eq("user_id", user.id).maybeSingle();
    if (fresh.error) { button.disabled = false; status.textContent = `No se pudo guardar: ${fresh.error.message}`; return; }
    const current = fresh.data?.settings && typeof fresh.data.settings === "object" ? fresh.data.settings : {};
    const next = { ...current, bodyProfile: { ...bodyProfile, updatedAt: new Date().toISOString() } };
    const { error } = await supabase.from("user_settings").upsert({ user_id: user.id, settings: next, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    button.disabled = false;
    if (error) { status.textContent = `No se pudo guardar: ${error.message}`; return; }
    settings = next; render(); status.textContent = "Perfil guardado.";
  });

  render();
  return { load, reset };
}
