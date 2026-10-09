"""Convierte una instantánea JSON de Supabase (tablas de public) en SQL de restauración NO destructivo.
Para cada tabla: insert ... select * from json_populate_recordset(...) on conflict do nothing.
No borra ni sobrescribe filas existentes: solo repone las que falten.
Uso: python3 tools/backup/snapshot_to_sql.py <prod_snapshot.json> [tabla ...] > restore.sql
Orden: tablas padre antes que hijas (claves foráneas). El archivo resultante contiene datos personales: no va al repo.
"""
import json, sys

ORDER = ["profiles", "user_settings", "system_preferences", "system_records", "hub_user_state", "hub_records",
         "skin_notes", "skin_routine_logs", "gym_plans", "gym_sessions", "news_briefs",
         "payroll_employers", "payroll_documents", "payroll_payslips", "payroll_payslip_versions", "payroll_line_items",
         "payroll_validations", "payroll_anomalies", "payroll_corrections", "payroll_events"]

snap = json.load(open(sys.argv[1]))
only = set(sys.argv[2:])
tables = snap["tables"]
names = [t for t in ORDER if t in tables] + sorted(t for t in tables if t not in ORDER)
print(f"-- Restauración no destructiva desde la instantánea {snap['taken_at']} ({snap['project']})")
print("begin;")
for t in names:
    if only and t not in only:
        continue
    rows = tables[t] or []
    if not rows:
        continue
    payload = json.dumps(rows, ensure_ascii=False).replace("$snap$", "")
    print(f"insert into public.{t} select * from json_populate_recordset(null::public.{t}, $snap${payload}$snap$::json) on conflict do nothing;")
print("commit;")
