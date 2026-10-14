-- Staging first. No personal values or identifiers. One documented opening per owner.
create table public.payroll_balance_imports (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references auth.users(id),
 payslip_id uuid not null references public.payroll_payslips(id),
 document_id uuid not null references public.payroll_documents(id),
 employer_id uuid not null,
 document_sha256 text not null,
 payslip_updated_at timestamptz not null,
 as_of date not null,
 leave_minutes integer not null check (leave_minutes between 0 and 24000),
 keuzebudget_cents integer not null check (keuzebudget_cents between 0 and 100000000),
 confirmed boolean not null check (confirmed),
 confirmed_at timestamptz not null default now(),
 source text not null default 'document_transcription' check(source='document_transcription'),
 unique(owner_id), unique(owner_id,payslip_id), unique(owner_id,document_id)
);
alter table public.payroll_balance_imports enable row level security;
revoke all on public.payroll_balance_imports from public,anon,authenticated;
grant select,insert on public.payroll_balance_imports to authenticated;
grant all on public.payroll_balance_imports to service_role;
create policy balance_import_read on public.payroll_balance_imports for select to authenticated using(owner_id=(select auth.uid()));
create policy balance_import_write on public.payroll_balance_imports for insert to authenticated with check(owner_id=(select auth.uid()));

create function public.payroll_balance_import_guard() returns trigger
language plpgsql security invoker set search_path='' as $$
declare p public.payroll_payslips; d public.payroll_documents;
begin
 if auth.uid() is null or new.owner_id is distinct from auth.uid() then raise exception 'Inicia sesión con el propietario de la nómina.'; end if;
 if new.confirmed is distinct from true then raise exception 'Confirma expresamente los dos saldos del documento.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(new.owner_id::text,71841));
 select * into p from public.payroll_payslips where id=new.payslip_id and user_id=auth.uid() for share;
 if not found then raise exception 'Nómina no disponible para este usuario.'; end if;
 if p.updated_at is distinct from new.payslip_updated_at then raise exception 'La nómina ha cambiado: vuelve a abrirla y revisa los saldos.'; end if;
 if p.period_end is null or p.employer_id is null or p.review_status='rejected' or p.validation_status='failed' then raise exception 'Revisa la nómina antes de importar saldos.'; end if;
 select * into d from public.payroll_documents where id=p.document_id and user_id=auth.uid() for share;
 if not found or d.file_sha256 is null or coalesce(d.storage_path_archive,d.storage_path_raw) is null then raise exception 'Falta el documento original de la nómina.'; end if;
 if new.document_sha256 is distinct from trim(d.file_sha256) then raise exception 'El documento ha cambiado: vuelve a abrir la nómina.'; end if;
 if exists(select 1 from public.hub_records where owner_id=new.owner_id and record_type='shift_leave_event' and payload->>'kind'='opening') then raise exception 'Ya existe un saldo inicial manual: concílialo antes de importar.'; end if;
 -- Derive provenance on the server, never trust document/user/date fields from the client.
 new.document_id=p.document_id; new.employer_id=p.employer_id;
 new.document_sha256=trim(d.file_sha256); new.as_of=p.period_end; new.confirmed_at=now();
 return new;
end $$;
revoke all on function public.payroll_balance_import_guard() from public,anon,authenticated;
create trigger payroll_balance_import_guard before insert on public.payroll_balance_imports for each row execute function public.payroll_balance_import_guard();

create function public.payroll_import_balances(p_payslip_id uuid,p_expected_updated_at timestamptz,p_leave_minutes integer,p_keuzebudget_cents integer,p_confirmed boolean,p_document_sha256 text)
returns uuid language plpgsql security invoker set search_path='' as $$
declare result uuid;
begin
 if auth.uid() is null then raise exception 'Inicia sesión.'; end if;
 if p_confirmed is distinct from true then raise exception 'Confirma expresamente los dos saldos del documento.'; end if;
 insert into public.payroll_balance_imports(payslip_id,payslip_updated_at,leave_minutes,keuzebudget_cents,confirmed,document_sha256)
 values(p_payslip_id,p_expected_updated_at,p_leave_minutes,p_keuzebudget_cents,p_confirmed,p_document_sha256) returning id into result;
 return result;
end $$;
revoke all on function public.payroll_import_balances(uuid,timestamptz,integer,integer,boolean,text) from public,anon;
grant execute on function public.payroll_import_balances(uuid,timestamptz,integer,integer,boolean,text) to authenticated;

-- Protect direct REST writes too, including changing an unrelated row into a leave row.
create function public.payroll_leave_cutoff_guard() returns trigger
language plpgsql security invoker set search_path='' as $$
declare who uuid; cutoff date; event_date date;
begin
 if tg_op='UPDATE' and old.record_type='shift_leave_event' then
  if new.owner_id is distinct from old.owner_id or new.record_type is distinct from old.record_type or new.domain is distinct from old.domain then raise exception 'No se puede cambiar la identidad del movimiento de vacaciones.'; end if;
 end if;
 if new.record_type<>'shift_leave_event' then return new; end if;
 who=new.owner_id;
 if auth.uid() is null or who is distinct from auth.uid() then raise exception 'Inicia sesión para registrar vacaciones.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(who::text,71841));
 if new.domain<>'money' or coalesce(new.payload->>'kind','') not in ('opening','accrual','used','adjustment') then raise exception 'Movimiento de vacaciones inválido.'; end if;
 if coalesce(new.payload->>'date','') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Fecha inválida.'; end if;
 event_date=(new.payload->>'date')::date;
 if coalesce(new.payload->>'minutes','') !~ '^-?\d+$' or abs((new.payload->>'minutes')::numeric)>24000 then raise exception 'Minutos inválidos.'; end if;
 if (new.payload->>'kind' in ('used','accrual') and (new.payload->>'minutes')::integer<=0) or (new.payload->>'kind'='opening' and (new.payload->>'minutes')::integer<0) then raise exception 'Minutos inválidos.'; end if;
 select as_of into cutoff from public.payroll_balance_imports where owner_id=who;
 if cutoff is not null then
  if new.payload->>'kind'='opening' then raise exception 'Ya existe un saldo inicial documentado.'; end if;
  if event_date<=cutoff or (tg_op='UPDATE' and (old.payload->>'date')::date<=cutoff) then raise exception 'Movimiento incluido en el saldo documentado: no se permite un segundo cómputo retroactivo.'; end if;
 end if;
 if new.payload->>'kind'='opening' and exists(select 1 from public.hub_records where owner_id=who and record_type='shift_leave_event' and payload->>'kind'='opening' and id<>new.id) then raise exception 'Ya existe un saldo inicial.'; end if;
 return new;
end $$;
revoke all on function public.payroll_leave_cutoff_guard() from public,anon,authenticated;
create trigger payroll_leave_cutoff_guard before insert or update on public.hub_records for each row execute function public.payroll_leave_cutoff_guard();
