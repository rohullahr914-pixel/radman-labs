# Radman Labs 2.0 — upgrade the existing deployment

This is an in-place upgrade of the existing repository. `/products`, `/products/[slug]`, admin URLs, product IDs, slugs, owner authorization and Vercel configuration are preserved. No production database was reset or modified from this workspace.

## Apply before deploying the new editor

1. Back up the existing Supabase database using your normal project backup process.
2. Inspect `products`, `product_releases` and `admin_profiles` in the existing project's Table Editor. If the original migrations were already applied, run **only** `supabase/migrations/202611210004_marketplace.sql`. It adds `release_notes`, `features_confirmed` and two indexes; it does not replace or delete records. Do not rerun the seed on an existing database. For a new database, apply all migration files in order.
3. Keep the existing Vercel project and environment values. Set `NEXT_PUBLIC_SUPABASE_URL`, either `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` **or** `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL=https://radman-labs.vercel.app` (or your actual custom domain). A key must belong to the same Supabase project as the URL. Redeploy after changing environment variables.
4. Follow `AUTH-DIAGNOSTICS.md` to verify the owner. Invite/reset through Supabase; never create a password in SQL or source code. Existing valid owner accounts and passwords continue to work.
5. Open HesabKo in the admin editor. Load stable releases and select an available APK. During this upgrade the API returned **`HesabKo-v1.4-release.9.apk`** under tag **`v1.0.0`** (18,336,628 bytes); the formerly specified **`HesabKo-v1.4-release.apk`** URL returned **404**. The code intentionally respects the saved selection and does not silently repoint a pinned download. Save the currently available asset after reviewing it.
6. Upload genuine app artwork/screenshots. Verify the features against the released app and check the feature-confirmation box. Existing feature text is retained in the editor, but unconfirmed feature lists are hidden publicly. GitHub release notes remain attributed to GitHub.
7. Test create/edit/delete, image uploads, publish/unpublish, reset/login/logout and anonymous draft denial on the actual project before launch.

## Marketplace behavior

- Published database products supply the catalog and category tiles. No fake products, ratings, installs or reviews are generated. HesabKo is first when it is published; draft products stay private.
- Search, category/platform/pricing filters and sorting update immediately; filter state is reflected in the URL. Load more displays 12 additional items. This implementation loads the published catalog for client filtering (up to the Supabase API row limit, normally 1,000). For catalogs beyond that limit, use server pagination and indexed search before expanding the catalog.
- Homepage category collections appear when enough products exist to avoid repeating one app across identical grids. Recently updated apps use a compact row layout.
- Screenshot previews use a native modal dialog with focus containment/restoration, Escape, arrow keys, touch swipes and a scrollable thumbnail rail.
- The editor supports image drop zones, multiple screenshots, reordering, replacement/removal, release notes and verified feature confirmation. Save/publish feedback appears on the dashboard.
- API-provided GitHub filename, release tag, size, date and notes take priority. Stable release selection rejects drafts/prereleases and assets outside the specified repository. An exact saved asset that disappears is unavailable, with a Releases-page fallback. `GITHUB_RELEASE_CACHE_SECONDS` controls caching (30–3,600 seconds, default 300).
- Without Supabase, the public catalog is empty with a preparation message. An explicitly enabled, labeled `CATALOG_PREVIEW=true` development preview is available locally and is ignored on Vercel production. It never replaces a failed database query.

No genuine screenshots or app icon were available in the repository's source tree. The APK download did not complete within this environment's network timeout; no APK artwork, internal version or binary features were inferred. Neutral placeholders are used until the owner uploads actual assets.

See `VERIFICATION.md` for executed checks and the remaining service-dependent tests.
