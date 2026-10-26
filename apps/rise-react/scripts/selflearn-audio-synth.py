"""Rise / SelfLearn: genera los MP3 que falten a partir de `node scripts/selflearn-audio.mjs list`.

Requisitos: pip install piper-tts, ffmpeg con libmp3lame y los modelos en ./.piper-voices (o PIPER_VOICES):
  https://huggingface.co/rhasspy/piper-voices/resolve/main/nl/nl_NL/pim/medium/nl_NL-pim-medium.onnx(.json)
  https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/cori/high/en_GB-cori-high.onnx(.json)
Los archivos existentes no se tocan: solo se generan las frases nuevas.
"""
import json
import os
import re
import subprocess
import sys
import tempfile
import wave

from piper import PiperVoice

VOICES = {"nl": "nl_NL-pim-medium", "en": "en_GB-cori-high"}
voice_dir = os.environ.get("PIPER_VOICES", os.path.join(os.getcwd(), ".piper-voices"))
items = json.load(open(sys.argv[1], encoding="utf-8"))
loaded = {}
made = 0
for item in items:
    if os.path.exists(item["file"]):
        continue
    lang = item["lang"]
    if lang not in loaded:
        loaded[lang] = PiperVoice.load(os.path.join(voice_dir, VOICES[lang] + ".onnx"))
    os.makedirs(os.path.dirname(item["file"]), exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        with wave.open(tmp.name, "wb") as w:
            loaded[lang].synthesize_wav(item["text"], w)
        # Volumen uniforme: pico a -1 dB (ganancia fija, sin compresor que apague el arranque de la frase).
        probe = subprocess.run(["ffmpeg", "-v", "info", "-i", tmp.name, "-af", "volumedetect", "-f", "null", "-"],
                               capture_output=True, text=True).stderr
        peak = float(re.search(r"max_volume: (-?[\d.]+) dB", probe).group(1))
        # Mono 22 kHz, 0,25 s de silencio al inicio (iOS a veces se come el primer instante) y 0,15 s al final.
        subprocess.run([
            "ffmpeg", "-v", "error", "-y", "-i", tmp.name,
            "-af", f"volume={-1.0 - peak:.2f}dB,adelay=250:all=1,apad=pad_dur=0.15",
            "-ar", "22050", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "48k",
            "-map_metadata", "-1", item["file"],
        ], check=True)
    made += 1
    if made % 100 == 0:
        print(f"{made} generados…", flush=True)
print(f"Listo: {made} audios nuevos de {len(items)} frases.")
