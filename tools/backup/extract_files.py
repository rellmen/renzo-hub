"""Saca los archivos (PDF de nóminas, fotos…) de una copia de "Exportar mis datos" a una carpeta.
Uso: python3 tools/backup/extract_files.py renzo-hub-copia-AAAA-MM-DD.json carpeta_destino
Después se pueden volver a subir desde Supabase → Storage (mismo bucket y misma ruta).
"""
import base64, json, os, re, sys
from pathlib import Path

snap = json.load(open(sys.argv[1], encoding="utf-8"))
dest = Path(sys.argv[2]).resolve()
prepared = []
# Validate and decode the whole export before creating any files.
for f in snap.get("files", []):
    bucket, path = f["bucket"], f["path"]
    if not re.fullmatch(r"[a-zA-Z0-9_-]+", bucket) or not path or any(p in ("", ".", "..") for p in path.split("/")) or "\\" in path:
        sys.exit("Ruta de archivo no válida.")
    out = dest / bucket / path
    if not out.resolve().is_relative_to(dest) or out.exists() or any(p == out for p, _, _ in prepared):
        sys.exit("La copia saldría del destino o sobrescribiría un archivo existente.")
    content = base64.b64decode(f["base64"], validate=True)
    if "size" in f and len(content) != f["size"]:
        sys.exit("El tamaño del archivo no coincide con la copia.")
    prepared.append((out, content, f))
for out, content, f in prepared:
    os.makedirs(out.parent, mode=0o700, exist_ok=True)
    with open(out, "xb") as fh:
        os.chmod(out, 0o600)
        fh.write(content)
    bucket, path = f["bucket"], f["path"]
    print(f"{bucket}/{path} ({f.get('size', 0)} bytes)")
print(f"{len(snap.get('files', []))} archivos en {dest}")
