"""Saca los archivos (PDF de nóminas, fotos…) de una copia de "Exportar mis datos" a una carpeta.
Uso: python3 tools/backup/extract_files.py renzo-hub-copia-AAAA-MM-DD.json carpeta_destino
Después se pueden volver a subir desde Supabase → Storage (mismo bucket y misma ruta).
"""
import base64, json, os, sys

snap = json.load(open(sys.argv[1]))
dest = sys.argv[2]
for f in snap.get("files", []):
    bucket, path = f["bucket"], f["path"]
    if ".." in path.split("/") or path.startswith("/"):
        print(f"omitido (ruta no válida): {bucket}/{path}"); continue
    out = os.path.join(dest, bucket, path)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "wb") as fh:
        fh.write(base64.b64decode(f["base64"]))
    print(f"{bucket}/{path} ({f.get('size', 0)} bytes)")
print(f"{len(snap.get('files', []))} archivos en {dest}")
