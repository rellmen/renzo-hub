// Rise / SelfLearn · clave estable de cada audio pregenerado.
// La usan la app (para encontrar el MP3) y scripts/selflearn-audio.mjs (para nombrarlo).
// Si cambia esta función, hay que regenerar todos los audios.
export const AUDIO_LANGS = ["nl", "en"];
export const AUDIO_BASE = "/audio/selflearn";

export function audioText(text) {
  return String(text ?? "").normalize("NFC").replace(/\s+/g, " ").trim();
}

// FNV-1a 32 bits sobre "idioma|texto" en UTF-8: corto, determinista y sin dependencias.
export function audioKey(lang, text) {
  const bytes = new TextEncoder().encode(`${lang}|${audioText(text)}`);
  let h = 0x811c9dc5;
  for (const b of bytes) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

export function audioUrl(lang, text) {
  return `${AUDIO_BASE}/${lang}/${audioKey(lang, text)}.mp3`;
}
