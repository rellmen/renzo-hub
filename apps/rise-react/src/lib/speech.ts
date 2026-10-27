// Audio de SelfLearn, pensado para iPhone/Android.
// 1) Primero: MP3 pregenerado (public/audio/selflearn) reproducido con <audio>. En iPhone, <audio> va por el
//    canal de medios y SUENA CON EL MODO SILENCIO, como YouTube o Spotify. La voz del navegador no.
// 2) Respaldo: voz del navegador (speechSynthesis) para frases sin MP3. Problemas que corrige:
//    · cancel() seguido de speak() en el mismo instante se pierde en iOS: solo cancelamos si algo suena.
//    · La utterance sin referencia la recoge el recolector antes de terminar (onend nunca llega): la guardamos.
//    · Chrome Android a veces deja la síntesis en pausa: resume() antes de hablar.
//    · Las voces llegan tarde (voiceschanged): se precargan y se elige una del idioma si existe.
import {audioKey, audioUrl} from "./selflearn-audio-key.mjs";
import index from "./selflearn-audio-index.json";

export type SpeakResult = "ok" | "unsupported" | "no-voice";
export type SpeechLang = "nl" | "en";
const LANG: Record<SpeechLang, string> = { nl: "nl-NL", en: "en-GB" };
const recorded: Record<SpeechLang, Set<string>> = { nl: new Set(index.nl), en: new Set(index.en) };
let current: SpeechSynthesisUtterance | null = null;
let player: HTMLAudioElement | null = null;
let voices: SpeechSynthesisVoice[] = [];

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}
function audioSupported() {
  return typeof window !== "undefined" && typeof Audio !== "undefined";
}
/** URL del MP3 pregenerado de esa frase, o null si no existe. */
export function recordedAudioUrl(text: string, lang: SpeechLang) {
  return recorded[lang].has(audioKey(lang, text)) ? audioUrl(lang, text) : null;
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
function stopAll() {
  if (player) { try { player.pause(); } catch { /* ya parado */ } player.onended = player.onerror = null; player = null; }
  if (speechSupported() && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) window.speechSynthesis.cancel();
  current = null;
}
function speakWithVoice(text: string, lang: SpeechLang, rate: number, onEnd?: () => void): SpeakResult {
  if (!speechSupported()) { onEnd?.(); return "unsupported"; }
  const synth = window.speechSynthesis;
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
/** Debe llamarse directamente desde el toque del usuario (sin await antes): iOS solo deja sonar así. */
export function speak(text: string, lang: SpeechLang, { rate = 0.85, onEnd }: { rate?: number; onEnd?: () => void } = {}): SpeakResult {
  if (!text.trim()) return "unsupported";
  playbackSession();
  stopAll();
  const url = audioSupported() ? recordedAudioUrl(text, lang) : null;
  if (url) {
    const a = new Audio(url);
    a.preload = "auto";
    // Velocidad de estudio parecida a la voz del navegador, sin cambiar el tono.
    a.playbackRate = Math.min(1, Math.max(0.5, rate / 0.85 * 0.9));
    (a as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
    let done = false;
    const finish = () => { if (done) return; done = true; if (player === a) player = null; onEnd?.(); };
    // Si el MP3 no carga (sin red, archivo ausente), se intenta con la voz del navegador.
    const fallback = () => { if (done || player !== a) return; done = true; player = null; speakWithVoice(text, lang, rate, onEnd); };
    a.onended = finish;
    a.onerror = fallback;
    player = a;
    const p = a.play();
    if (p && typeof p.catch === "function") p.catch((e: unknown) => {
      // NotAllowedError = el navegador bloqueó la reproducción; no tiene sentido reintentar con voz.
      if ((e as { name?: string })?.name === "NotAllowedError") finish(); else fallback();
    });
    return "ok";
  }
  return speakWithVoice(text, lang, rate, onEnd);
}
export function stopSpeaking() {
  stopAll();
}
