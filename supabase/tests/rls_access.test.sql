begin;
select plan(11);

\set platform_admin_id '10000000-0000-4000-8000-000000000001'
\set institution_user_id '10000000-0000-4000-8000-000000000002'
\set reviewer_id '10000000-0000-4000-8000-000000000003'
\set institution_staff_id '10000000-0000-4000-8000-000000000004'
\set institution_a '20000000-0000-4000-8000-000000000001'
\set institution_b '20000000-0000-4000-8000-000000000002'
\set student_a '30000000-0000-4000-8000-000000000001'
\set student_b '30000000-0000-4000-8000-000000000002'

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values
  (:'platform_admin_id', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-admin@example.invalid', '', now(), now()),
  (:'institution_user_id', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-institution@example.invalid', '', now(), now()),
  (:'reviewer_id', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-reviewer@example.invalid', '', now(), now()),
  (:'institution_staff_id', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-staff@example.invalid', '', now(), now());

insert into public.institutions (id, aicte_code, name, state, approved_intake, supernumerary_capacity)
values
  (:'institution_a', 'TEST-RLS-A', 'RLS Test Institution A', 'Test State', 10, 0),
  (:'institution_b', 'TEST-RLS-B', 'RLS Test Institution B', 'Test State', 10, 0);

update public.user_profiles
set role = 'platform_admin', is_active = true
where user_id = :'platform_admin_id';
update public.user_profiles
set role = 'institution_admin', institution_id = :'institution_a', is_active = true
where user_id = :'institution_user_id';
update public.user_profiles
set role = 'reviewer', is_active = true
where user_id = :'reviewer_id';
update public.user_profiles
set role = 'institution_staff', institution_id = :'institution_a', is_active = true
where user_id = :'institution_staff_id';

insert into public.students (id, institutional_student_id, institution_id, full_name, program, admission_year)
values
  (:'student_a', 'RLS-STUDENT-A', :'institution_a', 'Synthetic RLS Student A', 'Test Programme', 2026),
  (:'student_b', 'RLS-STUDENT-B', :'institution_b', 'Synthetic RLS Student B', 'Test Programme', 2026);

select ok(not has_table_privilege('anon', 'public.students', 'select'), 'anonymous visitors cannot read student rows');
select ok(not has_table_privilege('authenticated', 'public.user_profiles', 'update'), 'users cannot change their own account role');
select ok(not has_column_privilege('authenticated', 'public.students', 'apaar_id', 'select'), 'raw APAAR identifiers cannot be selected directly');

set local role authenticated;
select set_config('request.jwt.claim.sub', :'institution_user_id', true);
select is((select count(*) from public.students), 1::bigint, 'institution administrators can see only their institution records');
select is((select count(*) from public.institutions), 1::bigint, 'institution administrators can see only their institution');
select throws_ok(
  $$insert into public.students (institutional_student_id, institution_id, full_name, program, admission_year)
    values ('RLS-CROSS-INSTITUTION', '20000000-0000-4000-8000-000000000002', 'Synthetic test', 'Test', 2026)$$,
  '42501',
  null,
  'institution administrators cannot create records for another institution'
);
select throws_ok(
  $$update public.students set institution_id = '20000000-0000-4000-8000-000000000002'
    where id = '30000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'institution administrators cannot move a record to another institution'
);

select set_config('request.jwt.claim.sub', :'institution_staff_id', true);
select is((with updated as (
  update public.students set program = 'Unauthorized change'
  where id = :'student_a' returning id
) select count(*) from updated), 0::bigint, 'institution staff cannot update existing records');

select set_config('request.jwt.claim.sub', :'reviewer_id', true);
select is((select count(*) from public.students), 2::bigint, 'reviewers can review records across institutions');
select is((select count(*) from public.audit_logs where entity = 'students' and entity_id in (:'student_a', :'student_b')), 2::bigint, 'student changes create audit events in the same transaction');
select ok(not exists (
  select 1 from public.audit_logs
  where entity = 'students' and entity_id in (:'student_a', :'student_b')
    and (after_data ? 'full_name' or after_data ? 'apaar_id')
), 'student audit events do not contain direct identifiers');

reset role;
select * from finish();
rollback;

