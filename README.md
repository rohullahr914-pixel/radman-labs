# Radman Labs

Next.js App Router, TypeScript, Tailwind CSS, shadcn-style accessible Button, Motion, Lucide, Supabase Auth/Postgres/Storage, and Vercel. Actual source code; no passwords, service-role keys, fake APKs, or fabricated screenshots.

## Run locally

Requires Node.js 22. Run `npm ci`, copy `.env.example` to `.env.local`, then `npm run dev`. Open http://localhost:3000. Without Supabase settings, the public site displays a clearly marked HesabKo preview and fetches real GitHub releases; admin writes remain unavailable. With Supabase configured, only database products are displayed (no sample fallback on database errors).

Commands: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:db`, `npm run build`, `npm run start`. Browser checks: `npx playwright install chromium`, then `npm run test:e2e` after building. Browser tests assume an unconfigured Supabase preview instance. Do not point them at production.

## Supabase bootstrap

1. Create a free Supabase project. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from its API settings. Never add a service-role key to the app. Set `NEXT_PUBLIC_SITE_URL` to your exact site origin (no trailing slash).
2. Apply every SQL file in `supabase/migrations/` in filename order using the SQL editor, or use `npx supabase link --project-ref YOUR_REF` and `npx supabase db push`. The migrations create products, releases, admin profiles, indexes, RLS, a public `product-images` bucket with an 8 MB limit, and storage policies. The seed creates HesabKo as a **draft** so the owner can review the actual APK before publishing. No project or database has been created on your behalf.
3. In Authentication settings, **disable new user signups**. Set the Site URL and allow only `https://YOUR-DOMAIN/auth/confirm` plus localhost during development. Set minimum password length to 12, enable leaked-password protection if available, and configure Auth rate limits (sign-ins/token verification 10 per 5 minutes per IP, emails 2/hour; review project limits in the dashboard). `supabase/config.toml` sets these for local development; it does not silently change hosted settings. Supabase is the authentication authority and applies its rate limits even if someone calls its API directly.
4. Set the Invite User email template link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite`. Set the Reset Password template to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`. Tokens are exchanged server-side; the redirect destination is fixed. Configure a mail provider for reliable production email delivery.
5. In Authentication → Users, invite **rohullahr914@gmail.com**. Run `supabase/bootstrap-admin.sql` in the SQL editor; verify it returns exactly one row. There is no public admin registration and no client policy that grants admin membership.
6. Open the invitation email, set the initial password at `/admin/password`, then sign in at `/admin/login`. The reset link on the login page supports later resets. Passwords go directly through Supabase Auth and are never stored in application tables, source, or environment variables.
7. Open HesabKo, review the listed features against the APK, upload the real icon/screenshots/cover, load stable GitHub releases, select the APK, and publish. No fictional screenshots or app icon have been supplied; the generic placeholder is deliberately neutral.

Optional local database: install Docker and the Supabase CLI, run `supabase start` then `supabase db reset`. Invite/provision the owner with local Auth tools and use the local key/URL. Local mail is captured by the Supabase development mailbox.

## Simple publishing workflow

Login → Add application → Enter details → Upload images → Select download source → Publish. Slugs use lowercase letters, digits, and hyphens. Save as draft also unpublishes. Deletion requires confirmation. Release history can be added/updated by version below the editor. Product deletion cascades its release history.

The browser accepts JPEG/PNG/WebP originals up to 8 MB and 24 megapixels, resizes them to at most 1600×1600, and compresses them before upload. The server limits the request body to 4 MB and the compressed image to 3 MB, independently decodes and validates it with a 24-megapixel limit, strips metadata, and re-encodes it as WebP. Filenames are random UUIDs. Replacing an image creates a new object. Removing it from a product does not immediately delete storage data, avoiding broken shared references. `/admin/media` lets the owner delete unused images; both the server check and storage policy reject referenced images. The library displays the 100 newest images. Review older unused files through Supabase Storage when needed. Because this bucket is public, anyone with a media URL can view it, including draft media; do not upload confidential files.

Published products are read dynamically with an anonymous Supabase client and an explicit published filter, with RLS as the final boundary. Content changes appear on the next request without deployment. GitHub API metadata is cached for 5 minutes. Only stable, nondraft releases with uploaded APK assets from the selected repository are accepted. Admins can pin a tag and filename or use the latest stable release containing an APK. Up to the most recent 100 releases are listed.

The product page displays the GitHub release tag, original asset filename, size, date, and release notes. The HesabKo release is tagged **v1.0.0** but its APK is named **HesabKo-v1.4-release.apk**; the application does not pretend these match. Only returned asset URLs become download buttons. On API failure, no APK URL is invented; a clearly labeled Releases-page fallback is shown. Direct download sources must use HTTPS; the owner is responsible for choosing a trustworthy file host. Download binaries are hosted externally, never in Postgres.

### Owner invitation and password setup

In Authentication → Email Templates, set the **Invite user** link to:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=invite">Set up your Radman Labs password</a>
```

Set the **Reset password** template link to:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=recovery">Reset your Radman Labs password</a>
```

In Authentication → Users, invite **rohullahr914@gmail.com**. Then run `supabase/bootstrap-admin.sql` in the SQL editor and confirm it returns exactly that owner. Open the invitation, choose a password on `/admin/password`, and sign in at `/admin/login`. There is no public registration flow. The login page’s reset button sends a fresh secure link when needed. Do not use templates that put access tokens in URL fragments: this app verifies token hashes on the server and keeps session cookies HttpOnly. Use the final HTTPS Site URL for production and test the templates before inviting the owner.

## Deploy to Vercel

1. Push this directory to your own GitHub repository. The `.gitignore` excludes local environment files and includes `.env.example`.
2. Import into Vercel with this directory as the project root. `vercel.json` defines install/build commands. Use Node.js 22. Add the three public environment values and optional server-only `GITHUB_TOKEN` (a minimally privileged token increases GitHub's API quota).
3. Set the final HTTPS domain in `NEXT_PUBLIC_SITE_URL`, Supabase Site URL, and Auth redirect allowlist. Redeploy when changing environment settings; content changes need no redeploy.
4. Enable a Vercel Firewall rate-limit rule for `/admin/login`, `/admin/password`, `/auth/confirm`, and `/api/admin/*` appropriate to your plan. Supabase Auth's own limits remain mandatory. Validate mail templates and redirect behavior on the final domain.
5. Complete the live verification checklist below before making the catalog public.

Admin routes validate identity using Supabase Auth `getUser()` plus the exact owner email and the administrator table. Every privileged server action and upload independently repeats authorization. Session cookies refresh through Next.js Proxy, and admin responses are private/no-store. Server Actions use Next.js origin checks; the upload handler separately checks same origin. Image reads are limited to the configured Supabase hostname in Next Image. Security headers include frame protection, MIME sniffing protection, referrer restrictions, and a basic content security policy. No HTML from product descriptions or GitHub release notes is executed.

SEO includes page/product metadata, canonical product URLs, dynamic sitemap, robots exclusions for private routes, generated Open Graph artwork, custom 404, loading/error pages, semantic controls, keyboard focus styles, reduced-motion support, and responsive navigation.

## Verification and remaining live checks

See `VERIFICATION.md` for checks actually executed in this workspace. No successful cloud test should be inferred from a local build. With a disposable Supabase project, verify:

- Anonymous users can read published products and their past releases, but cannot read drafts or future releases, modify products/releases, list storage, upload images, or grant themselves admin membership.
- A normal authenticated account cannot access admin pages, write products/releases/storage, or read another user's profile. Invite the owner and confirm login/reset/logout.
- Create/edit/delete a draft; upload and replace an icon, cover, and screenshots; confirm invalid formats/oversized images are rejected; publish/unpublish and verify in a separate anonymous browser immediately.
- Confirm an image used by any product cannot be deleted; remove references and save before deleting the orphan.
- Confirm actual GitHub APK download, tag/filename distinction, API-outage fallback, and direct HTTPS source behavior. Independently review the binary's actual features.
- Confirm mobile layout, keyboard use, email callbacks, and rate limiting on the deployed domain.

Design and product copy use only the supplied founder identity and release information. No employees, partnerships, funding, or awards are claimed.


