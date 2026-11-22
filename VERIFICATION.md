# Verification — 2026-11-21

Executed locally on Windows with Node.js 22.22.2 and npm 10.9.7. Supabase environment values were absent. These results verify the delivered source locally, not a deployed production service.

| Check | Result |
| --- | --- |
| `npm run lint` | Passed, no warnings/errors |
| `npm run typecheck` | Passed |
| `npm test` | 4/4 passed |
| `npm run test:db` | All three migrations applied and policy assertions passed |
| `npm run build` | Passed compilation, TypeScript and prerendering |
| `npm run test:e2e` | 8/8 passed against the production build |
| `npm audit --audit-level=moderate` | 0 reported vulnerabilities |

Browser checks used installed Google Chrome through `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`, with desktop and Pixel 7 emulation. They covered navigation, catalog search, product details, founder/contact links, horizontal overflow, unauthenticated admin redirects, rejected upload requests, sitemap, robots, both Open Graph image routes, and the custom 404. Homepage screenshots at 1440px and 393px were inspected visually. Mobile emulation is not a physical-device test. The GitHub API can take up to six seconds before the failure fallback appears.

Database tests use disposable PGlite PostgreSQL with minimal stand-ins for Supabase's `auth` and `storage` schemas. They execute the actual migration SQL, bootstrap and RLS assertions. Verified: anonymous draft/write denial, normal-user write/admin-escalation denial, owner access/publishing, published catalog visibility, future-release exclusion, referenced-media deletion rejection and orphan deletion. They do **not** exercise Supabase's live Auth service, Storage HTTP service, hosted configuration or mail delivery.

The live GitHub API returned the stable HesabKo release tag `v1.0.0` and uploaded asset `HesabKo-v1.4-release.apk`, with a size of 18,336,628 bytes. The application resolver selected its actual GitHub URL. An HTTP HEAD request to the asset returned 200 and the matching content length. A complete binary download, checksum, installation and feature/security review were not performed; no APK is bundled with this website.

Dependency remediation upgraded Sharp to 0.35.5 and Zod to 4.6.7. Exact overrides pin available TypeScript ESLint and browser-mapping releases; the TypeScript ESTree-specific Minimatch override uses patched 11.0.1. Lint passed with these overrides. The audit result is a point-in-time advisory check, not a security certification.

## Requires the owner's services before launch

- Apply migrations in an actual Supabase project; disable signups, configure Auth URLs/templates/rate limits and invite the specified owner; execute the admin bootstrap.
- Test invitation, password setup/reset, session refresh/logout, owner CRUD, image compression/upload/deletion and published/draft behavior with a separate anonymous browser.
- Review the HesabKo draft against the actual APK, add genuine icon/screenshots and publish it. No fictional artwork is substituted.
- Configure the final site origin and public Supabase values, deploy to Vercel, and verify HTTPS, email delivery, redirects and mobile behavior on that domain.

The README contains the setup steps and a live verification checklist. No Supabase project, credentials, cloud database, GitHub repository or Vercel deployment was created or assumed.
