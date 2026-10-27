-- Run once in the Supabase SQL Editor after applying the auth/RLS migration.
-- Replace the placeholder with the email of a verified, trusted administrator.
-- This bootstrap is a project-owner action; it is intentionally not exposed by the app.
do $$
declare
  admin_email text := lower('REPLACE-WITH-VERIFIED-ADMIN-EMAIL');
  admin_user_id uuid;
begin
  if admin_email = 'replace-with-verified-admin-email' then
    raise exception 'Replace the administrator email before running this script';
  end if;

  select id into admin_user_id
  from auth.users
  where lower(email) = admin_email
    and email_confirmed_at is not null;

  if admin_user_id is null then
    raise exception 'No verified Auth user was found for the supplied email';
  end if;

  update public.user_profiles
  set role = 'platform_admin', institution_id = null, is_active = true, updated_at = now()
  where user_id = admin_user_id;

  if not found then
    raise exception 'The profile row is missing; verify that the Auth profile trigger was installed';
  end if;
end;
$$;
