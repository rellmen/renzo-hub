#!/usr/bin/env bash
# Prueba local de 20261010030000_payroll_pay_date_rule (regla de cobro: miércoles siguiente a la semana trabajada).
# Crea tablas/vistas con la misma forma que las de Supabase (alias p, security_invoker, permisos) y datos sintéticos.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGBIN=/usr/lib/postgresql/17/bin
WORK="$(mktemp -d)"; PORT=55433; chmod 777 "$WORK"
run_pg(){ if [ "$(id -u)" = 0 ]; then su postgres -s /bin/bash -c "$*"; else bash -c "$*"; fi; }
cleanup(){ run_pg "$PGBIN/pg_ctl -D $WORK/data -m immediate stop" >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT
run_pg "$PGBIN/initdb -D $WORK/data -U postgres -A trust >/dev/null"
run_pg "$PGBIN/pg_ctl -D $WORK/data -o '-p $PORT -k $WORK' -l $WORK/log -w start >/dev/null"
PSQL="$PGBIN/psql -h $WORK -p $PORT -U postgres -v ON_ERROR_STOP=1 -qtA"
q(){ $PSQL -c "$1"; }
cp "$ROOT/supabase/pending/20261010030000_payroll_pay_date_rule.sql" "$ROOT/supabase/pending/20261010030000_payroll_pay_date_rule.rollback.sql" "$WORK/"; chmod 644 "$WORK"/*.sql
$PSQL <<'SQL'
create role anon; create role authenticated; create role service_role;
create table public.payroll_employers(id int primary key, name text, normalized_code text);
create table public.payroll_payslips(id int primary key, user_id int, employer_id int references payroll_employers, period_type text, period_year int, period_number int, period_label text,
  period_end date, payment_date date, document_date date, is_correction boolean default false, review_status text, validation_status text, gross_salary numeric, net_salary numeric, payslip_number text);
create view public.payroll_v_confirmed with (security_invoker=on) as
  select p.id, p.user_id, p.period_label, p.gross_salary, p.net_salary, p.is_correction, COALESCE(p.payment_date, p.period_end, p.document_date) AS ref_date
  from payroll_payslips p join payroll_employers e on e.id = p.employer_id where p.review_status = any(array['approved','not_required']) and p.validation_status <> 'failed';
create view public.payroll_v_monthly with (security_invoker=on) as
  select user_id, date_trunc('month', ref_date)::date as month, sum(net_salary) as net from payroll_v_confirmed group by 1,2;
create view public.payroll_v_monthly_nl with (security_invoker=on) as
  with base as (select p.*, COALESCE(p.payment_date, p.period_end, p.document_date) AS ref_date from payroll_payslips p where p.validation_status <> 'failed')
  select user_id, date_trunc('month', ref_date)::date as mes, count(*) as pagos, sum(net_salary) as neto from base group by 1,2;
create view public.payroll_v_jaaropgave_nl with (security_invoker=on) as
  with base as (select p.*, COALESCE(p.payment_date, p.period_end, p.document_date) AS ref_date from payroll_payslips p where p.validation_status <> 'failed')
  select user_id, extract(year from ref_date)::int as jaar, sum(gross_salary) as bruto from base group by 1,2;
grant select on payroll_v_confirmed, payroll_v_monthly, payroll_v_monthly_nl, payroll_v_jaaropgave_nl to authenticated;
insert into payroll_employers values (1,'Empresa demo','DEMO');
insert into payroll_payslips values
 (1,7,1,'weekly',2026,19,'2026-W19','2026-05-10',null,null,false,'not_required','verified',100,90,'1'),
 (2,7,1,'weekly',2026,22,'2026-W22','2026-05-31','2026-05-31',null,false,'not_required','warning',100,90,'4'),
 (3,7,1,'weekly',2026,22,'2026-W22','2026-05-31','2026-06-24',null,true,'approved','warning',10,5,'5'),
 (4,7,1,'weekly',2026,26,'2026-W26','2026-06-28',null,null,true,'approved','warning',10,5,'6'),
 (5,7,1,'weekly',2026,53,'2026-W53','2027-01-03',null,null,false,'approved','verified',100,90,'50');
SQL
fail(){ echo "FALLO: $1"; exit 1; }
ok(){ echo "  OK  $1"; }
before=$(q "select string_agg(id||'='||ref_date, ',' order by id) from payroll_v_confirmed")
[ "$before" = "1=2026-05-10,2=2026-05-31,3=2026-06-24,4=2026-06-28,5=2027-01-03" ] || fail "estado inicial $before"
$PSQL -f "$WORK/20261010030000_payroll_pay_date_rule.sql" >/dev/null
r=$(q "select string_agg(id||'='||ref_date, ',' order by id) from payroll_v_confirmed")
[ "$r" = "1=2026-05-13,2=2026-06-03,3=2026-06-24,4=2026-07-01,5=2027-01-06" ] || fail "fechas de cobro $r"
ok "semana normal = miércoles siguiente (W19→13 may, W22→3 jun aunque payment_date diga 31 may, W53→6 ene 2027)"
ok "corrección usa su payment_date (24 jun) y, si falta, la regla (W26→1 jul)"
[ "$(q "select string_agg(mes||':'||pagos, ',' order by mes) from payroll_v_monthly_nl")" = "2026-05-01:1,2026-06-01:2,2026-07-01:1,2027-01-01:1" ] || fail "agrupación mensual"
ok "payroll_v_monthly_nl agrupa por mes de cobro"
[ "$(q "select string_agg(jaar||':'||bruto, ',' order by jaar) from payroll_v_jaaropgave_nl")" = "2026:220,2027:100" ] || fail "jaaropgave por año de cobro"
ok "jaaropgave: W53 cobrada en enero cuenta en el año siguiente"
[ "$(q "select string_agg(month||':'||net, ',' order by month) from payroll_v_monthly")" = "2026-05-01:90,2026-06-01:95,2026-07-01:5,2027-01-01:90" ] || fail "vista dependiente payroll_v_monthly"
ok "vista dependiente payroll_v_monthly sigue funcionando"
[ "$(q "select count(*) from pg_class where relname in ('payroll_v_confirmed','payroll_v_monthly_nl','payroll_v_jaaropgave_nl') and reloptions @> array['security_invoker=on']")" = 3 ] || fail "security_invoker perdido"
ok "security_invoker conservado"
[ "$(q "select count(*) from information_schema.role_table_grants where grantee='authenticated' and table_name in ('payroll_v_confirmed','payroll_v_monthly_nl','payroll_v_jaaropgave_nl') and privilege_type='SELECT'")" = 3 ] || fail "permisos perdidos"
ok "permisos conservados"
$PSQL -f "$WORK/20261010030000_payroll_pay_date_rule.sql" >/dev/null 2>&1 && [ "$(q "select string_agg(id||'='||ref_date, ',' order by id) from payroll_v_confirmed")" = "$r" ] || fail "no idempotente"
ok "idempotente"
$PSQL -f "$WORK/20261010030000_payroll_pay_date_rule.rollback.sql" >/dev/null
[ "$(q "select string_agg(id||'='||ref_date, ',' order by id) from payroll_v_confirmed")" = "$before" ] || fail "rollback"
[ "$(q "select count(*) from pg_views where viewname in ('payroll_v_confirmed','payroll_v_monthly_nl','payroll_v_jaaropgave_nl') and definition like '%COALESCE(p.payment_date, p.period_end, p.document_date) AS ref_date%'")" = 3 ] || fail "rollback definición"
ok "rollback devuelve la definición original"
echo "TODO OK"
