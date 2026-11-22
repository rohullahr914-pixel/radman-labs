# Owner authentication diagnostics

## What was established

The production `/admin/login` returned HTTP 200. The old generic error was returned specifically after Supabase `signInWithPassword` failed, before administrator-table authorization. Therefore a missing `admin_profiles` row alone cannot explain that exact old error. The production HTML did not contain the app's missing-configuration notice, but that does not verify whether its configured URL/key belong to the right project.

This workspace has no `.env.local`, Supabase URL/key, Vercel CLI session or connected Supabase/Vercel management tool. It cannot inspect production environment values, the owner Auth record, confirmation state, password-provider settings or actual login logs. **The production root cause remains unconfirmed.** No successful owner login is claimed.

The browser automation tool also failed during initialization (missing runtime assets), so it could not establish whether a dashboard session was available. No production login attempts using guessed passwords were made.

## Code corrections

- Accept the current publishable-key variable and the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` consistently across public reads, server sessions and the proxy. Reject malformed origins and secret/service-role keys in application configuration.
- Validate sessions with Supabase and authorize the exact owner email plus the database admin record on every privileged operation. Keep HttpOnly, SameSite cookies and production Secure cookies; refresh through the existing proxy.
- Distinguish invalid credentials, unconfirmed email, disabled Email provider, rate limits, connectivity and public-key rejection with safe recovery guidance. Authentication success followed by missing authorization now directs the owner to bootstrap the existing account.
- Report password-reset delivery/configuration failures instead of displaying a success state when configuration is absent. Invitation/recovery continue through token-hash verification and fixed redirects.

These fix observable code weaknesses; they are not evidence that one was the production account's root cause.

## Minimum live investigation

1. In the **existing Vercel project**, check the Production environment: Supabase URL, matching public publishable/anon key, exact site origin. Do not paste keys into chat. Pull them into a local ignored `.env.local` through your normal secure workflow if you want to run `npm run diagnose:auth`.
2. The read-only diagnostic checks Auth reachability/key acceptance, Email provider, signup settings and the public products endpoint. An optional **server-local** `SUPABASE_SERVICE_ROLE_KEY` allows it to inspect owner existence, confirmation and admin membership; it is never an application requirement, never prefixed `NEXT_PUBLIC_`, and must never be committed. Alternatively inspect those facts directly in Supabase's dashboard without using a service key.
3. In Supabase Authentication, locate `rohullahr914@gmail.com` and check email confirmation. If absent, use **Invite User** and the invitation template documented in README. If present, use the approved password-recovery flow. Do not enable public registration. Confirm the Email provider permits password sign-in.
4. Run the existing `supabase/bootstrap-admin.sql` for the actual invited user only if authorization is missing. It is idempotent. Confirm the owner row and `is_admin()` policies exist; do not bypass RLS or create a public role-granting endpoint.
5. Set Site URL and the allowed `/auth/confirm` callback to the final domain. Use the token-hash invitation/recovery templates. Open the email link, set the password, sign in and verify the session cookie survives `/admin` navigation. Never log passwords, access tokens or recovery links.
6. If login still fails, match the safe error category to Supabase Auth logs and Vercel function logs for that attempt. Correct the observed configuration/account error, redeploy when environment values change, and repeat login/reset/logout and authorization checks.

The diagnostic makes no account or database changes. Cloud account setup and mail delivery must be verified in the owner's project.
