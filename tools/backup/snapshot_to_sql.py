"""Convierte una instantánea JSON de Supabase (tablas de public) en SQL de restauración NO destructivo.
Para cada tabla: insert ... select * from json_populate_recordset(...) on conflict do nothing.
No borra ni sobrescribe filas existentes: solo repone las que falten.
Uso: python3 tools/backup/snapshot_to_sql.py <prod_snapshot.json> [tabla ...] > restore.sql
Orden: tablas padre antes que hijas (claves foráneas). El archivo resultante contiene datos personales: no va al repo.
"""
import json, re, sys

ORDER = ["profiles", "user_settings", "system_preferences", "system_records", "hub_user_state", "hub_records",
         "skin_notes", "skin_routine_logs", "gym_plans", "gym_sessions", "news_briefs",
         "payroll_employers", "payroll_documents", "payroll_payslips", "payroll_payslip_versions", "payroll_line_items",
         "payroll_validations", "payroll_anomalies", "payroll_corrections", "payroll_events"]

snap = json.load(open(sys.argv[1], encoding="utf-8"))
only = set(sys.argv[2:])
tables = snap["tables"]
if not isinstance(tables, dict) or snap.get("errors"):
    sys.exit("La copia es parcial o no válida; revisa los errores antes de restaurar.")
# Validate the entire input before printing even the transaction header.
for t, rows in tables.items():
    if not re.fullmatch(r"[a-z][a-z0-9_]{0,62}", t):
        sys.exit("Nombre de tabla no válido.")
    if not isinstance(rows, list) or any(not isinstance(row, dict) for row in rows):
        sys.exit("Las filas deben ser una lista de objetos.")
if only - tables.keys():
    sys.exit("La tabla solicitada no está en esta copia.")
names = [t for t in ORDER if t in tables] + sorted(t for t in tables if t not in ORDER)
# Metadata is data too: never interpolate untrusted newlines into executable SQL.
print("-- Restauración no destructiva: solo inserta filas ausentes; conserva las existentes.")
print("begin;")
for t in names:
    if only and t not in only:
        continue
    rows = tables[t] or []
    if not rows:
        continue
    payload = json.dumps(rows, ensure_ascii=False, allow_nan=False)
    delimiter = "$snap$"
    index = 0
    while delimiter in payload:
        delimiter = f"$restore_{index}$"
        index += 1
    print(f"insert into public.{t} select * from json_populate_recordset(null::public.{t}, {delimiter}{payload}{delimiter}::json) on conflict do nothing;")
print("commit;")
