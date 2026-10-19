// SelfLearn · audio de las clases (voz del navegador). Arreglos para iPhone/iPad (Safari y app en pantalla de inicio):
// 1. Desbloqueo en el primer toque: iOS no deja hablar si la primera voz no nace de un gesto del usuario.
// 2. Sesión de audio "playback" (Safari 17+) y un silencio de 0,1 s por <audio> para que suene aunque el
//    interruptor de silencio esté activado. No es 100 % seguro en todas las versiones: si no suena, se avisa.
// 3. No llamar a cancel() y speak() seguidos cuando no hay nada sonando (WebKit descarta la frase).
// 4. Guardar la frase en curso (si no, el recolector de basura puede cortarla) y reanudar si se queda en pausa.
// 5. Si en 1,5 s no empieza a sonar, se avisa con pasos concretos en lugar de quedarse en silencio.

let unlocked = false, current = null, voices = [], onIssue = () => {}, silentUrl = null;

export function pickVoice(list, lang) {
  const all = Array.isArray(list) ? list : [], base = String(lang || "").slice(0, 2).toLowerCase();
  const norm = v => String(v?.lang || "").replace("_", "-").toLowerCase();
  const exact = all.filter(v => norm(v) === String(lang).toLowerCase()), near = all.filter(v => norm(v).startsWith(base));
  const pool = exact.length ? exact : near;
  // Preferimos voces locales (funcionan sin red) y, entre ellas, las "mejoradas" de Apple.
  return pool.find(v => v.localService && /enhanced|premium|mejorad/i.test(v.name || "")) || pool.find(v => v.localService) || pool[0] || null;
}

export function issueText(lang) {
  const idioma = String(lang).startsWith("nl") ? "neerlandés" : "inglés";
  return `No se oye el audio. En el iPhone: 1) quita el modo silencio y sube el volumen; 2) si sigue sin sonar, ve a Ajustes → Accesibilidad → Contenido leído → Voces y descarga una voz de ${idioma}. Mientras tanto puedes ver el texto.`;
}

function silentWavUrl(scope) {
  if (silentUrl || !scope.Blob || !scope.URL?.createObjectURL) return silentUrl;
  // WAV PCM mono 8 kHz, 0,1 s de silencio (800 muestras de 8 bits a 128).
  const n = 800, buf = new Uint8Array(44 + n), dv = new DataView(buf.buffer), w = (o, s) => [...s].forEach((c, i) => buf[o + i] = c.charCodeAt(0));
  w(0, "RIFF"); dv.setUint32(4, 36 + n, true); w(8, "WAVEfmt "); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
  dv.setUint32(24, 8000, true); dv.setUint32(28, 8000, true); dv.setUint16(32, 1, true); dv.setUint16(34, 8, true); w(36, "data"); dv.setUint32(40, n, true); buf.fill(128, 44);
  silentUrl = scope.URL.createObjectURL(new scope.Blob([buf], { type: "audio/wav" }));
  return silentUrl;
}

// Se llama dentro de un toque del usuario (el primero basta).
export function unlockAudio(scope = globalThis) {
  if (unlocked) return true;
  const synth = scope.speechSynthesis;
  if (!synth || !scope.SpeechSynthesisUtterance) return false;
  try { if (scope.navigator?.audioSession) scope.navigator.audioSession.type = "playback"; } catch { /* Safari < 17 */ }
  try { const url = silentWavUrl(scope); if (url && scope.Audio) { const a = new scope.Audio(url); a.setAttribute?.("playsinline", ""); a.volume = 0.01; a.play?.()?.catch?.(() => {}); } } catch { /* sin <audio> */ }
  try { const u = new scope.SpeechSynthesisUtterance(" "); u.volume = 0; synth.speak(u); } catch { return false; }
  unlocked = true;
  return true;
}

export function initAudio(scope = globalThis, { issue } = {}) {
  if (issue) onIssue = issue;
  const synth = scope.speechSynthesis;
  if (!synth) return { supported: false };
  const load = () => { try { voices = synth.getVoices() || []; } catch { voices = []; } };
  load();
  try { synth.addEventListener ? synth.addEventListener("voiceschanged", load) : (synth.onvoiceschanged = load); } catch { /* opcional */ }
  // Desbloqueo en el primer toque de cualquier parte de la app.
  const once = () => { unlockAudio(scope); scope.document?.removeEventListener?.("pointerdown", once, true); scope.document?.removeEventListener?.("touchend", once, true); };
  scope.document?.addEventListener?.("pointerdown", once, true);
  scope.document?.addEventListener?.("touchend", once, true);
  return { supported: true };
}

export function speakText(text, lang, scope = globalThis, { timeoutMs = 1500 } = {}) {
  const synth = scope.speechSynthesis, Utt = scope.SpeechSynthesisUtterance;
  if (!text || !synth || !Utt) { if (text) onIssue("Este navegador no puede leer en voz alta. Puedes ver el texto."); return null; }
  unlockAudio(scope);
  if (!voices.length) { try { voices = synth.getVoices() || []; } catch { /* sin voces todavía */ } }
  const u = new Utt(String(text)); u.lang = lang; u.rate = 0.86; u.volume = 1;
  const v = pickVoice(voices, lang); if (v) u.voice = v;
  let started = false;
  u.onstart = () => { started = true; };
  u.onend = () => { if (current === u) current = null; };
  u.onerror = e => { if (current === u) current = null; if (!["interrupted", "canceled"].includes(e?.error)) onIssue(issueText(lang)); };
  const go = () => { current = u; try { if (synth.paused) synth.resume(); synth.speak(u); } catch { onIssue(issueText(lang)); } };
  if (synth.speaking || synth.pending) { synth.cancel(); scope.setTimeout ? scope.setTimeout(go, 60) : go(); } else go();
  if (scope.setTimeout && timeoutMs > 0) scope.setTimeout(() => { if (!started && current === u) { onIssue(issueText(lang)); try { if (synth.paused) synth.resume(); } catch {} } }, timeoutMs);
  return u;
}

export function _resetAudioForTests() { unlocked = false; current = null; voices = []; onIssue = () => {}; silentUrl = null; }
