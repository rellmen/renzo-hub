-- Nóminas: cada nómina semanal cuenta en el mes en que se COBRA (Renzo: "trabajo una semana y cobro el miércoles siguiente").
-- Cambia SOLO el cálculo de ref_date en payroll_v_confirmed, payroll_v_monthly_nl y payroll_v_jaaropgave_nl:
--   · nómina semanal normal  -> miércoles siguiente a la semana ISO trabajada (lunes ISO + 9 días)
--   · corrección / otros     -> payment_date de la nómina; si falta, la misma regla; después period_end / document_date
-- No toca datos. Mantiene columnas, permisos y opciones (security_invoker). Idempotente.
-- Rollback: 20261010030000_payroll_pay_date_rule.rollback.sql
do $$
declare
  v text; d text; opts text;
  old_expr constant text := 'COALESCE(p.payment_date, p.period_end, p.document_date) AS ref_date';
  new_expr constant text := 'CASE WHEN p.period_type = ''weekly''::text AND NOT COALESCE(p.is_correction, false) AND p.period_year IS NOT NULL AND p.period_number >= 1 AND p.period_number <= 53 THEN to_date(p.period_year::text || lpad(p.period_number::text, 2, ''0''::text), ''IYYYIW''::text) + 9 ELSE COALESCE(p.payment_date, CASE WHEN p.period_type = ''weekly''::text AND p.period_year IS NOT NULL AND p.period_number >= 1 AND p.period_number <= 53 THEN to_date(p.period_year::text || lpad(p.period_number::text, 2, ''0''::text), ''IYYYIW''::text) + 9 ELSE NULL::date END, p.period_end, p.document_date) END AS ref_date';
begin
  foreach v in array array['payroll_v_confirmed','payroll_v_monthly_nl','payroll_v_jaaropgave_nl'] loop
    d := pg_get_viewdef(format('public.%I', v)::regclass, true);
    if position('IYYYIW' in d) > 0 then
      raise notice '% ya tiene la regla de cobro; sin cambios', v;
      continue;
    end if;
    if position(old_expr in d) = 0 then
      raise exception 'La vista % no tiene la expresión esperada; no se cambia nada', v;
    end if;
    select array_to_string(reloptions, ', ') into opts from pg_class where oid = format('public.%I', v)::regclass;
    execute format('create or replace view public.%I %s as %s', v,
                   case when opts is null then '' else format('with (%s)', opts) end,
                   replace(d, old_expr, new_expr));
  end loop;
end $$;

-- Comprobación (solo lectura): fechas de cobro por semana
select p.period_label as semana, p.is_correction as correccion, c.ref_date as cobro, to_char(c.ref_date, 'YYYY-MM') as mes
from public.payroll_payslips p left join public.payroll_v_confirmed c on c.id = p.id
order by p.period_year, p.period_number, p.is_correction;
