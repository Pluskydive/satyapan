# Satyapan — SIH 2026 prototype

Satyapan is a prototype for exploring institution-scoped enrolment review workflows. It is not an official AICTE or Government of India service, is not a regulatory decision system, and does not produce certified NIRF, NAAC or NBA reports. The live data path is not ready for real student records until the database migration, provider settings, privacy review and security verification below are completed.

## Local demonstration

Requirements: Node.js 20.9 or newer and npm.

```powershell
npm install
$env:SATYAPAN_MODE = "demo"
npm run dev
```

Open `http://localhost:3000`. Demo records are synthetic and held in temporary application memory. Do not enter personal or real student information. Demo mode does not provide user accounts and does not persist uploads.

## Authentication and roles

There is no public registration. Platform administrators invite accounts and assign one of these roles:

| Role | View | Create/update | Export/review | Account administration |
| --- | --- | --- | --- | --- |
| Platform administrator | Cross-institution summaries and records, masked identifiers | No student edits | Read audit events and export permitted summaries | Invite users, assign roles and institutions, activate/deactivate accounts |
| Institution administrator | Assigned institution records and review flags | Insert or update records for that institution | Export the institution's permitted summaries | None |
| Institution staff | Assigned institution records and review flags | Insert records for that institution; no updates or deletes | Export the institution's permitted summaries | None |
| Reviewer | Cross-institution records and review flags | Change review status; no student-record edits | Read audit events and export permitted summaries | None |

Database RLS is intended to enforce the same record scope. Raw APAAR values and demographic fields are not directly selectable by application roles; application views return masked APAAR values. User-profile role and institution fields cannot be changed through the public application API. Account changes go through a server-checked, serialized database function and write an audit event. Deactivation removes refresh sessions; existing access-token JWTs may remain valid until expiry, while application RLS checks block inactive profiles.

## Supabase setup for a separate test project

Do not use the demo seed data for live mode. Work in a separate non-production Supabase project first.

1. Create a Supabase project and configure the email provider and SMTP delivery. Use administrator invitations; disable public sign-up.
2. In the SQL editor, apply `supabase/schema.sql`, then `supabase/migrations/20261027090000_auth_and_rls.sql`. Review both against your current schema first. This repository does not apply migrations automatically.
3. Create and verify the first administrator account through Supabase Auth. In the SQL editor, edit and run `supabase/bootstrap_first_platform_admin.sql` for that verified account. Keep the project owner credentials private.
4. Configure Auth's Site URL to the production origin. Allow the exact callback routes for local and production, for example `http://localhost:3000/auth/callback` and `https://your-domain.example/auth/callback`. Configure invite and recovery email templates to use the Supabase PKCE link flow.
5. Configure environment variables. `SUPABASE_SECRET_KEY` is preferred; `SUPABASE_SERVICE_ROLE_KEY` is accepted for legacy projects. Either secret is server-only and must never use a `NEXT_PUBLIC_` prefix.
6. Set `NEXT_PUBLIC_SITE_URL` to the exact site origin used for invitations. Keep `SATYAPAN_MODE=live` off until the separate test project has passed the RLS and account-flow checks.

Copy `.env.example` to `.env.local` and fill it locally. Never commit `.env.local` or paste secret values into chat.

## Environment variable names

- `SATYAPAN_MODE`: `demo` for synthetic data, `live` to opt into authenticated Supabase mode.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public client key.
- `SUPABASE_SECRET_KEY` or legacy `SUPABASE_SERVICE_ROLE_KEY`: server-only key used only for user administration.
- `NEXT_PUBLIC_SITE_URL`: exact application origin used to build invitation links.

Without an explicit mode and valid public Supabase configuration, the app fails closed. Production must set the mode explicitly.

## Database access checks

`supabase/tests/rls_access.test.sql` covers anonymous reads, profile role changes, raw APAAR column access, institution isolation, staff update denial, reviewer scope and audit privacy. Run it only against a disposable Supabase test database after applying the schema and migration, using Supabase CLI/pgTAP. The current workstation did not have Supabase CLI or `psql`, so the SQL has not been executed here.

Also verify through a browser and direct API requests in that isolated project:

- No session: pages redirect to sign-in; protected APIs return 401.
- Expired/revoked session: protected reads fail and mutation requests are rejected.
- Pending/deactivated account: no protected page or database record access.
- Each role: only its documented capabilities work.
- Institution A cannot read, add, update or export Institution B records by changing a path, query or body.
- Invitation, email confirmation, password reset, expired/reused link, password change and logout.
- Verify that service-role credentials are absent from browser bundles and client requests.

These live checks have not been performed by this repository session because no connected Supabase test project was supplied. Do not treat the presence of tests or a successful build as a security certification.

## Quality checks

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

## Deployment gate

The current changes are local only. Before any real deployment, apply and verify the reviewed schema/migration in a separate test project, configure provider emails and exact redirects, bootstrap a second administrator, test RLS and all roles, review the session lifetime settings, run the checks above, and complete privacy/legal and operational review. Do not upload actual student data to the SIH demonstration deployment.
