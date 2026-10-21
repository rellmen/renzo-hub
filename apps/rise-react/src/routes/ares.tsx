import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarCheck, Check, Dumbbell, GraduationCap, Inbox, RotateCcw, ShieldCheck, Sparkles, Wallet, X } from "lucide-react";
import orb from "@/assets/ares.jpg";
import { pageHead } from "@/lib/seo";
import { ARES_SUGGESTIONS, AresComposer, AresThread, useAresChat } from "@/components/rise/AresDemoPanel";
import { EmptyState, SectionCard } from "@/components/rise/primitives";

export const Route = createFileRoute("/ares")({
  head: () => pageHead("Ares AI", "Vista conceptual del asistente Ares: conversación simulada, sugerencias y aprobaciones."),
  component: AresPage,
});

const ICONS = { week: CalendarCheck, learn: GraduationCap, gym: Dumbbell, budget: Wallet } as const;

type Proposal = { id: string; text: string; status: "pending" | "ok" | "no" };

function AresPage() {
  const chat = useAresChat();
  const [props, setProps] = useState<Proposal[]>([
    { id: "a", text: "Mover «Revisión de gastos» al domingo 18:00", status: "pending" },
    { id: "b", text: "Añadir 15 min de escucha en neerlandés", status: "pending" },
  ]);
  const pending = props.filter((p) => p.status === "pending");

  return (
    <div className="space-y-6">
      <section className="surface rim relative overflow-hidden" style={{ background: "var(--ink)" }}>
        <img src={orb} alt="" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover object-center opacity-80 sm:object-[70%_center]" />
        <div className="absolute inset-0 bg-hero-side" />
        <div className="relative p-6 sm:p-10 lg:p-12">
          <div className="eyebrow mb-3 text-ares">Ares AI · Vista conceptual</div>
          <h1 className="max-w-lg font-display text-5xl font-medium leading-[0.95] sm:text-6xl">Piensa contigo, <em className="text-gold-gradient">no por ti.</em></h1>
          <p className="mt-4 max-w-md text-sm text-platinum/80">Asistente guionizado para este prototipo. Las respuestas son simuladas en tu navegador; no hay modelo ni servicio conectado.</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-ink/50 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5 text-gold" /> Modo demostración · sin conexión
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <SectionCard
          eyebrow={<span className="text-ares">Conversación</span>} title="Hilo con Ares" accent="var(--ares)"
          action={chat.msgs.length > 0 && <button type="button" onClick={chat.clear} className="btn-ghost min-h-9 px-3 text-xs"><RotateCcw className="h-3.5 w-3.5" />Nuevo</button>}
        >
          <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ARES_SUGGESTIONS.map((s) => {
              const I = ICONS[s.id];
              return (
                <button key={s.id} type="button" onClick={() => chat.send(s.label, s.id)} disabled={chat.thinking}
                  className="group flex min-h-14 items-center gap-3 rounded-2xl border border-hairline bg-foreground/[0.02] px-4 text-left text-sm transition hover:border-ares/50 hover:bg-ares/10 disabled:opacity-50">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ares/15 text-ares"><I className="h-4 w-4" /></span>
                  {s.label}
                </button>
              );
            })}
          </div>
          {chat.msgs.length === 0 && !chat.thinking ? (
            <EmptyState icon={<Sparkles className="h-5 w-5" />} title="Empieza una conversación" text="Usa una sugerencia o escribe libremente. Ares responderá con texto de ejemplo." />
          ) : (
            <AresThread chat={chat} minHeight={280} />
          )}
          <div className="mt-5"><AresComposer chat={chat} /></div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard eyebrow="Aprobaciones" title="Propuestas de Ares" accent="var(--gold)">
            {pending.length === 0 ? (
              <EmptyState icon={<Inbox className="h-5 w-5" />} title="Todo revisado" text="No hay propuestas pendientes. En la versión real, Ares pediría permiso antes de cambiar algo."
                action={<button type="button" className="btn-ghost" onClick={() => setProps((p) => p.map((x) => ({ ...x, status: "pending" })))}>Restaurar ejemplo</button>} />
            ) : (
              <ul className="space-y-3">
                {pending.map((p) => (
                  <li key={p.id} className="rounded-2xl border border-hairline bg-foreground/[0.02] p-4">
                    <p className="text-sm">{p.text}</p>
                    <div className="mt-3 flex gap-2">
                      <button type="button" className="btn-gold min-h-10 flex-1" onClick={() => setProps((ps) => ps.map((x) => (x.id === p.id ? { ...x, status: "ok" } : x)))}><Check className="h-4 w-4" />Aprobar</button>
                      <button type="button" className="btn-ghost min-h-10" aria-label="Descartar" onClick={() => setProps((ps) => ps.map((x) => (x.id === p.id ? { ...x, status: "no" } : x)))}><X className="h-4 w-4" /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
          <SectionCard eyebrow="Actividad" title="Registro conceptual">
            <ul className="space-y-3 text-sm">
              {props.filter((p) => p.status !== "pending").map((p) => (
                <li key={p.id} className="flex gap-3"><span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${p.status === "ok" ? "bg-gold" : "bg-muted-foreground"}`} /><span className="text-muted-foreground">{p.status === "ok" ? "Aprobado" : "Descartado"} · {p.text}</span></li>
              ))}
              <li className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-ares" /><span className="text-muted-foreground">Sesión de demostración iniciada</span></li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}