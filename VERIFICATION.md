# Radman Labs 2.0 — verification

Executed in the existing project on Windows, Node.js 22.22.2, npm 10.9.7. No production database changes or authenticated cloud tests were performed.

| Check | Actual result |
| --- | --- |
| ESLint | Passed after correcting the reported React lint issues |
| TypeScript | Passed |
| Production build | Passed compilation, type checking and prerendering |
| Unit tests | 7 passed |
| SQL/RLS tests | All four migrations and assertions passed in PGlite |
| Browser tests | 13 passed, 1 skipped (mobile-only navigation on desktop) |
| Dependency audit | 0 reported vulnerabilities |
| Auth diagnostics | Correctly reports missing local Supabase URL/key/site origin; cloud checks could not run |

## Scope of the executed checks

Browser checks used installed Google Chrome with desktop and Pixel 7 emulation against the production build. Isolated HTTP fixtures supplied one test product through the Supabase REST client path. Tests covered homepage/navigation/contact links, immediate search, combined category/platform/pricing filters, sorting and URL state, details, horizontal overflow, screenshot modal keyboard navigation/Escape/focus restoration, the mobile menu, unauthenticated redirects and rejected uploads, sitemap/robots/Open Graph images and custom 404. Fixture images are clearly test-only local logo files, never imported into the production catalog. These tests do not claim hosted Supabase or actual app screenshots were available.

The desktop/mobile homepage was also rendered with the explicitly labeled local development preview and inspected visually after correcting card styling. The actual app's screenshots/icon were not fabricated.

The SQL suite uses disposable PGlite PostgreSQL with minimal stand-ins for Supabase-owned Auth/Storage schemas. It applies the real migrations and tests anonymous/normal-user RLS denial, owner authorization, product creation/update/deletion and release cascade, new release-note/feature-confirmation persistence, publishing/public visibility, future-release exclusion, and protected versus orphan-media deletion. It does not test Storage HTTP uploads, Auth email/password/session services or hosted project settings.

Unit checks cover repository/asset restrictions, GitHub failure behavior, product validation, combined catalog filters/sorting, safe authentication error messages, configuration alias support and secret-key rejection.

## Live observations

- Production `/admin/login` returned HTTP 200. No successful owner sign-in, password reset or admin write was attempted or claimed. See `AUTH-DIAGNOSTICS.md` for what the old error establishes and what remains unknown.
- GitHub's live Releases API returned stable tag `v1.0.0` with asset **`HesabKo-v1.4-release.9.apk`**, size **18,336,628 bytes**. The actual application resolver selected that asset by its API-provided name and URL. The older expected filename **`HesabKo-v1.4-release.apk`** is absent; its direct URL returned **404**. No file URL was invented.
- The currently available APK began downloading but did not finish within the network timeout. A HEAD attempt also timed out. Full file transfer, checksum, APK installation, internal-version inspection and feature/security review remain unverified.
- The repository's source tree exposed only a README, with no genuine screenshot/icon sources to import.
- Browser automation for inspecting any existing cloud dashboard session could not initialize because its runtime assets were unavailable.

## Required before production sign-off

Apply the additive migration 004 to the existing Supabase project. Validate production URL/key/provider/owner confirmation and authorization, invite or recover the owner securely, and test real login/logout/session refresh. Select the current APK in the owner editor, upload actual artwork, confirm features, and test create/edit/delete, media upload/cleanup, publish/unpublish and anonymous draft denial against that project. Confirm deployment and email callbacks on the final domain.

The exact upgrade order and minimum setup are in `UPGRADE-2.0.md`; no destructive reset is required.
