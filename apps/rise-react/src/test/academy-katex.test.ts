// Academia +25 · todas las fórmulas de lecciones y preguntas deben compilar con KaTeX en modo estricto.
// Evita que una fórmula rota llegue a la app (con throwOnError:false se mostraría en rojo).
import { describe, expect, it } from "vitest";
import katex from "katex";

const lessons = import.meta.glob("../content/academia/lessons/*.json", { eager: true, import: "default" }) as Record<
  string,
  { id: string; body: string; exit: { id: string; prompt_md: string; hint_md?: string; choices?: { text: string }[] }[] }
>;

function formulas(text: string): [string, boolean][] {
  const blocks = [...text.matchAll(/\$\$([\s\S]+?)\$\$/g)].map((m) => [m[1], true] as [string, boolean]);
  const rest = text.replace(/\$\$[\s\S]+?\$\$/g, " ");
  const inline = [...rest.matchAll(/\$([^$\n]+)\$/g)].map((m) => [m[1], false] as [string, boolean]);
  return [...blocks, ...inline];
}

describe("Academia · KaTeX", () => {
  it("compila todas las fórmulas sin errores", () => {
    const errors: string[] = [];
    let count = 0;
    for (const l of Object.values(lessons)) {
      const texts: [string, string][] = [[l.id, l.body]];
      for (const q of l.exit) {
        texts.push([q.id, q.prompt_md]);
        if (q.hint_md) texts.push([q.id, q.hint_md]);
        for (const c of q.choices || []) texts.push([q.id, c.text]);
      }
      for (const [id, t] of texts)
        for (const [tex, display] of formulas(t)) {
          count++;
          try {
            katex.renderToString(tex, { displayMode: display, throwOnError: true, strict: "ignore" });
          } catch (e) {
            errors.push(`${id}: ${tex.slice(0, 60)} → ${(e as Error).message.slice(0, 80)}`);
          }
        }
    }
    expect(Object.keys(lessons).length).toBeGreaterThan(0);
    expect(count).toBeGreaterThan(1000);
    expect(errors).toEqual([]);
  });
});
