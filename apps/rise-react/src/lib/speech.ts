// Voz del navegador para SelfLearn, pensada para iPhone/Android.
// Problemas que corrige:
// · iPhone en modo silencio: la síntesis sale por la sesión «ambient» y se calla. Con la API Audio Session
//   de WebKit (Safari 16.4+) pasamos a «playback», como un reproductor de audio.
// · cancel() seguido de speak() en el mismo instante se pierde en iOS: solo cancelamos si algo suena.
// · La utterance sin referencia la recoge el recolector antes de terminar (onend nunca llega): la guardamos.
// · Chrome Android a veces deja la síntesis en pausa: resume() antes de hablar.
// · Las voces llegan tarde (voiceschanged): se precargan y se elige una del idioma si existe.
export type SpeakResult = "ok" | "unsupported" | "no-voice";
export type SpeechLang = "nl" | "en";
const LANG: Record<SpeechLang, string> = { nl: "nl-NL", en: "en-GB" };
let current: SpeechSynthesisUtterance | null = null;
let voices: SpeechSynthesisVoice[] = [];

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}
function loadVoices() {
  try { voices = window.speechSynthesis.getVoices() || []; } catch { voices = []; }
  return voices;
}
/** Llamar al montar: precarga las voces para que el primer toque ya tenga voz. */
export function primeSpeech() {
  if (!speechSupported()) return () => {};
  loadVoices();
  const on = () => loadVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", on);
  return () => window.speechSynthesis.removeEventListener?.("voiceschanged", on);
}
export function voiceFor(lang: SpeechLang, list: Pick<SpeechSynthesisVoice, "lang" | "localService" | "default">[] = voices) {
  const want = LANG[lang].toLowerCase();
  const same = list.filter((v) => String(v.lang || "").toLowerCase().replace("_", "-").startsWith(lang));
  return same.find((v) => v.lang.toLowerCase().replace("_", "-") === want && v.localService)
    || same.find((v) => v.lang.toLowerCase().replace("_", "-") === want)
    || same.find((v) => v.localService) || same[0] || null;
}
function playbackSession() {
  try {
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession && nav.audioSession.type !== "playback") nav.audioSession.type = "playback";
  } catch { /* navegador sin Audio Session API */ }
}
/** Debe llamarse directamente desde el toque del usuario (sin await antes). */
export function speak(text: string, lang: SpeechLang, { rate = 0.85, onEnd }: { rate?: number; onEnd?: () => void } = {}): SpeakResult {
  if (!speechSupported() || !text.trim()) return "unsupported";
  const synth = window.speechSynthesis;
  playbackSession();
  if (synth.speaking || synth.pending) synth.cancel();
  try { synth.resume(); } catch { /* sin efecto */ }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = LANG[lang];
  u.rate = rate;
  const list = voices.length ? voices : loadVoices();
  const v = voiceFor(lang, list);
  if (v) u.voice = v as SpeechSynthesisVoice;
  u.onend = u.onerror = () => { if (current === u) current = null; onEnd?.(); };
  current = u;
  synth.speak(u);
  // Si las voces ya cargaron y no hay ninguna del idioma, el móvil leerá con otra voz o nada.
  return list.length > 0 && !v ? "no-voice" : "ok";
}
export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel();
  current = null;
}
