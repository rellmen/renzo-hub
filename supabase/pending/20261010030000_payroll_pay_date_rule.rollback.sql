-- Rollback de 20261010030000: vuelve a ref_date = COALESCE(payment_date, period_end, document_date) en las 3 vistas.
do $$
declare
  v text; d text; opts text;
  old_expr constant text := 'COALESCE(p.payment_date, p.period_end, p.document_date) AS ref_date';
  new_expr constant text := 'CASE WHEN p.period_type = ''weekly''::text AND NOT COALESCE(p.is_correction, false) AND p.period_year IS NOT NULL AND p.period_number >= 1 AND p.period_number <= 53 THEN to_date(p.period_year::text || lpad(p.period_number::text, 2, ''0''::text), ''IYYYIW''::text) + 9 ELSE COALESCE(p.payment_date, CASE WHEN p.period_type = ''weekly''::text AND p.period_year IS NOT NULL AND p.period_number >= 1 AND p.period_number <= 53 THEN to_date(p.period_year::text || lpad(p.period_number::text, 2, ''0''::text), ''IYYYIW''::text) + 9 ELSE NULL::date END, p.period_end, p.document_date) END AS ref_date';
  re constant text := 'CASE\s+WHEN p\.period_type = ''weekly''::text AND NOT COALESCE\(p\.is_correction, false\).*?END AS ref_date';
begin
  foreach v in array array['payroll_v_confirmed','payroll_v_monthly_nl','payroll_v_jaaropgave_nl'] loop
    d := pg_get_viewdef(format('public.%I', v)::regclass, true);
    if position('IYYYIW' in d) = 0 then continue; end if;
    select array_to_string(reloptions, ', ') into opts from pg_class where oid = format('public.%I', v)::regclass;
    execute format('create or replace view public.%I %s as %s', v,
                   case when opts is null then '' else format('with (%s)', opts) end,
                   regexp_replace(d, re, old_expr, 's'));
  end loop;
end $$;
