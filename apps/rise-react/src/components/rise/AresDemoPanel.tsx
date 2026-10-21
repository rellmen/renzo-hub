import { useEffect, useRef, useState } from "react";
import { Check, Copy, CornerDownLeft, Sparkles, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

export const ARES_SUGGESTIONS = [
  { id: "week", label: "Organizar mi semana" },
  { id: "learn", label: "Revisar progreso de aprendizaje" },
  { id: "gym", label: "Crear rutina de gym" },
  { id: "budget", label: "Revisar presupuesto" },
] as const;

const REPLIES: Record<string, string> = {
  week:
    "Propuesta de semana (ejemplo):\n• Lun, Mié, Vie — fuerza 07:00, 60 min.\n• Mar, Jue — dos bloques de trabajo profundo de 90 min.\n• Diario — 25 min de neerlandés después de comer.\n• Domingo — revisión semanal y planificación de 20 min.\nDeja un espacio libre el sábado: la constancia también necesita descanso.",
  learn:
    "Resumen de aprendizaje (datos de ejemplo):\n• Neerlandés: unidad 4 de 12 hacia B2 — buen ritmo en vocabulario, refuerza la escucha.\n• Inglés: 68 % del módulo C1 de escritura formal.\nSugerencia: alterna días de producción (escribir/hablar) con días de comprensión.",
  gym:
    "Rutina de ejemplo · Empuje (45–60 min):\n1. Press banca — 4 × 6–8\n2. Press militar — 3 × 8\n3. Fondos — 3 × al fallo técnico\n4. Elevaciones laterales — 3 × 12–15\nDescansa 90–120 s en los compuestos. Ajusta las cargas a tu nivel real.",
  budget:
    "Lectura del presupuesto de ejemplo:\n• Gastos fijos ≈ 48 % de los ingresos de muestra.\n• Ocio por encima del objetivo en ~12 %.\n• Ahorro proyectado: 18 % este mes.\nIdea: automatizar una transferencia al fondo de emergencia el día de cobro.",
};

const FALLBACK =
  "Esto es una simulación local: Ares aún no está conectado a ningún servicio. En la versión real, aquí respondería a tu petición. Prueba una de las sugerencias para ver una respuesta guionizada.";

type Msg = { id: number; role: "user" | "ares"; text: string };

export function useAresChat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [thinking, setThinking] = useState(false);
  const counter = useRef(0);
  const send = (text: string, key?: string) => {
    if (!text.trim() || thinking) return;
    setMsgs((m) => [...m, { id: ++counter.current, role: "user", text }]);
    setThinking(true);
    window.setTimeout(() => {
      setMsgs((m) => [...m, { id: ++counter.current, role: "ares", text: (key && REPLIES[key]) || FALLBACK }]);
      setThinking(false);
    }, 900);
  };
  return { msgs, thinking, send, clear: () => setMsgs([]) };
}

function Bubble({ m }: { m: Msg }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  if (m.role === "user")
    return (
      <div className="flex justify-end animate-rise">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-wine-gradient px-4 py-2.5 text-sm text-foreground">{m.text}</div>
      </div>
    );
  return (
    <div className="flex gap-3 animate-rise">
      <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ares/40 bg-ares/15 text-ares">
        <Sparkles className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 max-w-[90%]">
        <div className="mb-1 text-[0.62rem] font-bold tracking-[0.18em] text-ares">ARES · RESPUESTA SIMULADA</div>
        <div className="whitespace-pre-line rounded-2xl rounded-tl-md border border-hairline bg-raised px-4 py-3 text-sm leading-relaxed text-platinum/90">{m.text}</div>
        <div className="mt-1 flex gap-1">
          <button
            type="button" className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground" aria-label="Copiar respuesta"
            onClick={async () => {
              try { await navigator.clipboard.writeText(m.text); setCopied(true); toast("Respuesta copiada"); window.setTimeout(() => setCopied(false), 1500); }
              catch { toast.error("No se pudo copiar"); }
            }}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button type="button" aria-pressed={liked} onClick={() => setLiked((l) => !l)} className={`grid h-9 w-9 place-items-center rounded-full hover:bg-foreground/5 ${liked ? "text-gold" : "text-muted-foreground"}`} aria-label="Útil">
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AresThread({ chat, minHeight = 220 }: { chat: ReturnType<typeof useAresChat>; minHeight?: number }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [chat.msgs.length, chat.thinking]);
  return (
    <div className="space-y-4 overflow-y-auto pr-1" style={{ minHeight, maxHeight: minHeight + 220 }} aria-live="polite">
      {chat.msgs.map((m) => <Bubble key={m.id} m={m} />)}
      {chat.thinking && (
        <div className="flex items-center gap-2 pl-10 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 animate-glow rounded-full bg-ares" />Simulando respuesta…
        </div>
      )}
      <div ref={end} />
    </div>
  );
}

export function AresComposer({ chat }: { chat: ReturnType<typeof useAresChat> }) {
  const [v, setV] = useState("");
  return (
    <form className="relative" onSubmit={(e) => { e.preventDefault(); chat.send(v); setV(""); }}>
      <label htmlFor="ares-input" className="sr-only">Escribe a Ares</label>
      <input
        id="ares-input" value={v} onChange={(e) => setV(e.target.value)} maxLength={300}
        placeholder="Pide algo a Ares (simulado)…"
        className="h-12 w-full rounded-full border border-input bg-ink pl-5 pr-14 text-sm placeholder:text-muted-foreground/70 focus:border-ares/60"
      />
      <button type="submit" disabled={!v.trim() || chat.thinking} aria-label="Enviar" className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-full bg-gold-gradient text-primary-foreground disabled:opacity-40">
        <CornerDownLeft className="h-4 w-4" />
      </button>
    </form>
  );
}

export function AresDemoPanel() {
  const chat = useAresChat();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {ARES_SUGGESTIONS.map((s) => (
          <button key={s.id} type="button" className="chip" onClick={() => chat.send(s.label, s.id)}>{s.label}</button>
        ))}
      </div>
      {chat.msgs.length === 0 && !chat.thinking ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-input p-6 text-center">
          <Sparkles className="mb-2 h-5 w-5 text-ares" />
          <p className="max-w-xs text-sm text-muted-foreground">Elige una sugerencia para ver una respuesta guionizada. Nada se envía a ningún servidor.</p>
        </div>
      ) : (
        <AresThread chat={chat} minHeight={200} />
      )}
      <AresComposer chat={chat} />
    </div>
  );
}