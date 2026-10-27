-- Add administrator-provisioned accounts and least-privilege access policies.
-- Apply only after schema.sql has been applied. This migration is not run by the app.

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  is_email_verified boolean not null default false,
  role text not null default 'pending'
    check (role in ('pending', 'platform_admin', 'institution_admin', 'institution_staff', 'reviewer')),
  institution_id uuid references public.institutions(id) on delete restrict,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_role_scope_check check (
    (role in ('institution_admin', 'institution_staff') and institution_id is not null)
    or (role in ('pending', 'platform_admin', 'reviewer') and institution_id is null)
  )
);

create index if not exists user_profiles_institution_idx
  on public.user_profiles(institution_id) where institution_id is not null;
alter table public.user_profiles
  add column if not exists is_email_verified boolean not null default false;
create index if not exists students_institution_status_roll_idx
  on public.students(institution_id, enrolment_status, institutional_student_id);
create index if not exists flags_institution_status_created_idx
  on public.validation_flags(institution_id, status, created_at desc);
create index if not exists flags_status_created_idx
  on public.validation_flags(status, created_at desc);
create index if not exists audit_logs_created_idx
  on public.audit_logs(created_at desc);

create or replace function public.provision_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_profiles (user_id, email, is_email_verified, role, institution_id, is_active)
  values (new.id, lower(coalesce(new.email, '')), new.email_confirmed_at is not null, 'pending', null, false)
  on conflict (user_id) do update
    set email = excluded.email, is_email_verified = excluded.is_email_verified;
  return new;
end;
$$;

revoke all on function public.provision_user_profile() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_provision_profile on auth.users;
create trigger on_auth_user_created_provision_profile
  after insert on auth.users
  for each row execute function public.provision_user_profile();

drop trigger if exists on_auth_user_updated_sync_profile on auth.users;
create trigger on_auth_user_updated_sync_profile
  after update of email, email_confirmed_at on auth.users
  for each row execute function public.provision_user_profile();

-- Existing Auth users become inactive until a trusted administrator assigns a role.
insert into public.user_profiles (user_id, email, is_email_verified, role, institution_id, is_active)
select id, lower(coalesce(email, '')), email_confirmed_at is not null, 'pending', null, false
from auth.users
on conflict (user_id) do nothing;

update public.user_profiles p
set email = lower(coalesce(u.email, '')),
    is_email_verified = u.email_confirmed_at is not null
from auth.users u
where p.user_id = u.id;

create or replace function public.current_sat_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.user_profiles as p
  where p.user_id = (select auth.uid())
    and p.is_active = true
$$;

create or replace function public.current_sat_institution_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.institution_id
  from public.user_profiles as p
  where p.user_id = (select auth.uid())
    and p.is_active = true
$$;

revoke all on function public.current_sat_role() from public, anon;
revoke all on function public.current_sat_institution_id() from public, anon;
grant execute on function public.current_sat_role() to authenticated;
grant execute on function public.current_sat_institution_id() to authenticated;

alter table public.user_profiles enable row level security;
alter table public.institutions enable row level security;
alter table public.students enable row level security;
alter table public.validation_flags enable row level security;
alter table public.verification_requests enable row level security;
alter table public.audit_logs enable row level security;
alter table public.admission_events enable row level security;

revoke all on table public.user_profiles, public.institutions, public.students,
  public.validation_flags, public.verification_requests, public.audit_logs,
  public.admission_events from anon, authenticated;

grant usage on schema public to authenticated;
grant select on table public.user_profiles, public.institutions,
  public.validation_flags, public.audit_logs, public.admission_events to authenticated;
-- Do not grant direct reads of APAAR or demographic fields. The application
-- reads a scoped view that masks APAAR; write grants below still permit uploads.
grant select (id, institutional_student_id, institution_id, full_name, program,
  admission_year, admission_date, enrolment_status, integrity_score,
  nationality_type, created_at, updated_at)
  on table public.students to authenticated;
grant insert (apaar_id, institutional_student_id, institution_id, full_name, dob_year,
  gender, social_category, nationality_type, program, admission_year, admission_date)
  on table public.students to authenticated;
grant update (apaar_id, institutional_student_id, institution_id, full_name, dob_year,
  gender, social_category, nationality_type, program, admission_year, admission_date)
  on table public.students to authenticated;
grant insert, update on table public.institutions to authenticated;
grant update (status) on table public.validation_flags to authenticated;
-- Verification requests remain unavailable to application roles until a separate
-- one-time-token consent design is reviewed and implemented.

drop policy if exists user_profiles_read_self on public.user_profiles;
create policy user_profiles_read_self on public.user_profiles
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists institutions_read_authorized_scope on public.institutions;
create policy institutions_read_authorized_scope on public.institutions
  for select to authenticated
  using (
    (select public.current_sat_role()) in ('platform_admin', 'reviewer')
    or id = (select public.current_sat_institution_id())
  );

drop policy if exists institutions_create_platform_admin on public.institutions;
create policy institutions_create_platform_admin on public.institutions
  for insert to authenticated
  with check ((select public.current_sat_role()) = 'platform_admin');

drop policy if exists institutions_update_platform_admin on public.institutions;
create policy institutions_update_platform_admin on public.institutions
  for update to authenticated
  using ((select public.current_sat_role()) = 'platform_admin')
  with check ((select public.current_sat_role()) = 'platform_admin');

drop policy if exists students_read_authorized_scope on public.students;
create policy students_read_authorized_scope on public.students
  for select to authenticated
  using (
    (select public.current_sat_role()) in ('platform_admin', 'reviewer')
    or institution_id = (select public.current_sat_institution_id())
  );

drop policy if exists students_create_institution_scope on public.students;
create policy students_create_institution_scope on public.students
  for insert to authenticated
  with check (
    (select public.current_sat_role()) in ('institution_admin', 'institution_staff')
    and institution_id = (select public.current_sat_institution_id())
  );

drop policy if exists students_update_institution_scope on public.students;
create policy students_update_institution_scope on public.students
  for update to authenticated
  using (
    (select public.current_sat_role()) = 'institution_admin'
    and institution_id = (select public.current_sat_institution_id())
  )
  with check (
    (select public.current_sat_role()) = 'institution_admin'
    and institution_id = (select public.current_sat_institution_id())
  );

drop policy if exists validation_flags_read_authorized_scope on public.validation_flags;
create policy validation_flags_read_authorized_scope on public.validation_flags
  for select to authenticated
  using (
    (select public.current_sat_role()) in ('platform_admin', 'reviewer')
    or institution_id = (select public.current_sat_institution_id())
  );

drop policy if exists validation_flags_review_status on public.validation_flags;
create policy validation_flags_review_status on public.validation_flags
  for update to authenticated
  using ((select public.current_sat_role()) in ('platform_admin', 'reviewer'))
  with check (
    status in ('open', 'investigating', 'resolved', 'dismissed')
    and (select public.current_sat_role()) in ('platform_admin', 'reviewer')
  );

drop policy if exists audit_logs_read_regulators on public.audit_logs;
create policy audit_logs_read_regulators on public.audit_logs
  for select to authenticated
  using ((select public.current_sat_role()) in ('platform_admin', 'reviewer'));

drop policy if exists admission_events_read_authorized_scope on public.admission_events;
create policy admission_events_read_authorized_scope on public.admission_events
  for select to authenticated
  using (
    (select public.current_sat_role()) in ('platform_admin', 'reviewer')
    or institution_id = (select public.current_sat_institution_id())
  );

-- Institution uploads may propose student attributes, but cannot certify a
-- record or choose its integrity score. Trusted review processes own those fields.
create or replace function public.keep_institution_uploads_unverified()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select public.current_sat_role()) in ('institution_admin', 'institution_staff') then
    new.enrolment_status := 'pending_apaar_validation';
    new.integrity_score := 100;
  end if;
  return new;
end;
$$;

revoke all on function public.keep_institution_uploads_unverified() from public, anon, authenticated;
drop trigger if exists students_keep_institution_uploads_unverified on public.students;
create trigger students_keep_institution_uploads_unverified
  before insert or update on public.students
  for each row execute function public.keep_institution_uploads_unverified();

-- Keep an append-only application audit event in the same transaction as each
-- student insert/update. The event contains no name, identifier, or demographic data.
create or replace function public.audit_student_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_logs (actor_id, actor_role, action, entity, entity_id, after_data)
  values (
    (select auth.uid()),
    coalesce((select public.current_sat_role()), 'system_integrity_engine'),
    case when tg_op = 'INSERT' then 'STUDENT_RECORD_CREATED' else 'STUDENT_RECORD_UPDATED' end,
    'students',
    new.id,
    jsonb_build_object(
      'institution_id', new.institution_id,
      'admission_year', new.admission_year,
      'operation', tg_op
    )
  );
  return new;
end;
$$;

revoke all on function public.audit_student_change() from public, anon, authenticated;
drop trigger if exists students_audit_changes on public.students;
create trigger students_audit_changes
  after insert or update on public.students
  for each row execute function public.audit_student_change();

-- Views must apply the caller's underlying-table RLS policies instead of the
-- privileges of their owner. Recreate the existing reports as security-invoker views.
create or replace view public.v_institution_summary with (security_invoker = true) as
select
  i.id,
  i.aicte_code,
  i.name,
  i.state,
  i.approved_intake,
  i.supernumerary_capacity,
  count(s.id) filter (where s.enrolment_status in ('verified', 'flagged')) as actual_enrolment,
  count(s.id) filter (where s.enrolment_status = 'flagged') as flagged_students,
  count(s.id) filter (where s.nationality_type = 'nri') as nri_students,
  count(s.id) filter (where s.nationality_type = 'oci') as oci_students,
  count(s.id) filter (where s.nationality_type = 'foreign_national') as fn_students,
  round(coalesce(avg(s.integrity_score), 100.0), 1) as avg_integrity_score
from public.institutions i
left join public.students s on s.institution_id = i.id
group by i.id;

create or replace view public.v_national_summary with (security_invoker = true) as
select
  count(distinct institution_id) as institutions_reporting,
  count(*) as total_students,
  count(*) filter (where enrolment_status = 'verified') as verified_students,
  count(*) filter (where enrolment_status = 'flagged') as flagged_students,
  count(*) filter (where nationality_type = 'nri') as nri_students,
  count(*) filter (where nationality_type = 'oci') as oci_students,
  count(*) filter (where nationality_type = 'foreign_national') as fn_students,
  round(coalesce(avg(integrity_score), 100.0), 1) as avg_integrity_score
from public.students;

create or replace view public.v_state_summary with (security_invoker = true) as
select
  i.state,
  count(distinct i.id) as institutions,
  count(s.id) as students,
  count(s.id) filter (where s.enrolment_status = 'flagged') as flagged_students,
  round(coalesce(avg(s.integrity_score), 100.0), 1) as avg_integrity_score
from public.institutions i
left join public.students s on s.institution_id = i.id
group by i.state
order by students desc;

revoke all on table public.v_institution_summary, public.v_national_summary,
  public.v_state_summary from anon, authenticated;
grant select on table public.v_institution_summary, public.v_national_summary,
  public.v_state_summary to authenticated;

revoke all on function public.run_integrity_checks() from public, anon, authenticated;

-- Return only a masked identifier for an already-authorized student row. The
-- function checks role and institution itself because it runs with its owner.
create or replace function public.masked_student_apaar(p_student_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when s.apaar_id is null then null
    when (select public.current_sat_role()) in ('platform_admin', 'reviewer')
      or s.institution_id = (select public.current_sat_institution_id())
      then '••••-••••-' || right(s.apaar_id, 4)
    else null
  end
  from public.students s
  where s.id = p_student_id
$$;

revoke all on function public.masked_student_apaar(uuid) from public, anon;
grant execute on function public.masked_student_apaar(uuid) to authenticated;

create or replace view public.v_student_records with (security_invoker = true) as
select
  s.id,
  s.institutional_student_id,
  s.institution_id,
  s.full_name,
  s.program,
  s.admission_year,
  s.admission_date,
  s.enrolment_status,
  s.integrity_score,
  s.nationality_type,
  s.created_at,
  s.updated_at,
  public.masked_student_apaar(s.id) as masked_apaar
from public.students s;

revoke all on table public.v_student_records from anon, authenticated;
grant select on table public.v_student_records to authenticated;

-- Serialize privileged account changes. Disabling an account revokes its
-- refresh sessions; the app's RLS role check also blocks already-issued JWTs.
create or replace function public.manage_sat_user(
  p_actor_id uuid,
  p_user_id uuid,
  p_role text,
  p_institution_id uuid,
  p_is_active boolean
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profile public.user_profiles%rowtype;
  target_profile public.user_profiles%rowtype;
  active_admin_count integer;
begin
  perform pg_advisory_xact_lock(24110, 3);

  select * into current_profile
  from public.user_profiles
  where user_id = p_actor_id and role = 'platform_admin' and is_active = true;
  if not found then return 'access_denied'; end if;
  if p_user_id = p_actor_id then return 'self_change'; end if;
  if p_role not in ('platform_admin', 'institution_admin', 'institution_staff', 'reviewer') then
    return 'invalid_role';
  end if;
  if ((p_role in ('institution_admin', 'institution_staff')) and p_institution_id is null)
    or ((p_role not in ('institution_admin', 'institution_staff')) and p_institution_id is not null) then
    return 'invalid_scope';
  end if;
  if p_institution_id is not null and not exists (
    select 1 from public.institutions where id = p_institution_id
  ) then return 'institution_not_found'; end if;

  select * into target_profile
  from public.user_profiles
  where user_id = p_user_id
  for update;
  if not found then return 'user_not_found'; end if;

  if target_profile.role = 'platform_admin' and target_profile.is_active
    and (p_role <> 'platform_admin' or not p_is_active) then
    select count(*) into active_admin_count
    from public.user_profiles
    where role = 'platform_admin' and is_active = true;
    if active_admin_count < 2 then return 'last_platform_admin'; end if;
  end if;

  update public.user_profiles
  set role = p_role,
      institution_id = p_institution_id,
      is_active = p_is_active,
      updated_at = now()
  where user_id = p_user_id;

  if not p_is_active then
    delete from auth.sessions where user_id = p_user_id;
  end if;

  insert into public.audit_logs (actor_id, actor_role, action, entity, entity_id, before_data, after_data)
  values (
    p_actor_id,
    'platform_admin',
    case when target_profile.role = 'pending' then 'ACCOUNT_PROVISIONED' else 'ACCOUNT_ACCESS_UPDATED' end,
    'user_profiles',
    p_user_id,
    jsonb_build_object('role', target_profile.role, 'institution_id', target_profile.institution_id, 'is_active', target_profile.is_active),
    jsonb_build_object('role', p_role, 'institution_id', p_institution_id, 'is_active', p_is_active)
  );

  return 'ok';
end;
$$;

revoke all on function public.manage_sat_user(uuid, uuid, text, uuid, boolean) from public, anon, authenticated;
grant execute on function public.manage_sat_user(uuid, uuid, text, uuid, boolean) to service_role;

