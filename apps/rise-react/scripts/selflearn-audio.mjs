// Rise / SelfLearn · audios pregenerados para que las clases suenen con el iPhone en silencio.
//
// Uso (desde apps/rise-react):
//   node scripts/selflearn-audio.mjs list  > /tmp/selflearn-audio.json   # frases que necesitan audio
//   python3 scripts/selflearn-audio-synth.py /tmp/selflearn-audio.json  # genera los MP3 que falten
//   node scripts/selflearn-audio.mjs index                              # reescribe el índice de la app
//   node scripts/selflearn-audio.mjs check                              # falla si falta algún audio
//
// Voces Piper (libres): nl_NL-pim-medium (dataset CC0) y en_GB-cori-high (LibriVox, dominio público).
import {existsSync, readdirSync, writeFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {NL_COURSE} from "../src/lib/legacy-selflearn/courses/nl.js";
import {EN_COURSE} from "../src/lib/legacy-selflearn/courses/en.js";
import {AUDIO_LANGS, audioKey, audioText} from "../src/lib/selflearn-audio-key.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = lang => join(root, "public", "audio", "selflearn", lang);
const indexFile = join(root, "src", "lib", "selflearn-audio-index.json");
const COURSES = {nl: NL_COURSE, en: EN_COURSE};

// Exactamente lo que el motor puede leer en voz alta: palabras (learn/listen/repaso) y frases (speak).
export function spokenTexts(lang) {
  const seen = new Map();
  for (const unit of COURSES[lang].units) {
    for (const [t] of [...unit.words, ...unit.sentences]) {
      const text = audioText(t);
      if (!text) continue;
      const key = audioKey(lang, text);
      const prev = seen.get(key);
      if (prev && prev !== text) throw Error(`Colisión de clave ${key}: «${prev}» / «${text}»`);
      seen.set(key, text);
    }
  }
  return [...seen].map(([key, text]) => ({lang, key, text}));
}

const all = () => AUDIO_LANGS.flatMap(spokenTexts);
const have = lang => new Set(existsSync(outDir(lang)) ? readdirSync(outDir(lang)).filter(f => f.endsWith(".mp3")).map(f => f.slice(0, -4)) : []);

const cmd = process.argv[2];
if (cmd === "list") {
  console.log(JSON.stringify(all().map(x => ({...x, file: join(outDir(x.lang), `${x.key}.mp3`)})), null, 1));
} else if (cmd === "index") {
  const index = {};
  for (const lang of AUDIO_LANGS) {
    const files = have(lang);
    index[lang] = spokenTexts(lang).map(x => x.key).filter(k => files.has(k)).sort();
  }
  writeFileSync(indexFile, JSON.stringify(index) + "\n");
  console.log(AUDIO_LANGS.map(l => `${l}: ${index[l].length}`).join(" · "));
} else if (cmd === "check") {
  const missing = all().filter(x => !have(x.lang).has(x.key));
  if (missing.length) {
    console.error(`Faltan ${missing.length} audios, p. ej.: ${missing.slice(0, 5).map(x => `${x.lang}:${x.text}`).join(" | ")}`);
    process.exit(1);
  }
  console.log(`OK: ${all().length} audios`);
} else if (cmd) {
  console.error("Uso: node scripts/selflearn-audio.mjs list|index|check");
  process.exit(2);
}
