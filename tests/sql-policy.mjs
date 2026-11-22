import { readFile, readdir } from "node:fs/promises";
import assert from "node:assert/strict";
const { PGlite } = await import(
  process.env.PGLITE_MODULE || "@electric-sql/pglite"
);
const db = new PGlite();
try {
  // Minimal Supabase-owned schemas, not a replacement for testing hosted Auth/Storage.
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key,email text unique);
    create function auth.uid() returns uuid language sql stable as $$
      select (nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid
    $$;
  `);
  await db.exec(`
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security;
    grant usage on schema public,auth,storage to anon,authenticated;
    grant select on storage.objects to anon;
    grant select,insert,update,delete on storage.objects to authenticated;
  `);
  const folder = new URL("../supabase/migrations/", import.meta.url);
  for (const file of (await readdir(folder))
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    await db.exec(await readFile(new URL(file, folder), "utf8"));
    console.log(`Applied ${file}`);
  }
  await db.exec(
    `insert into auth.users(id,email) values('11111111-1111-1111-1111-111111111111','rohullahr914@gmail.com');`,
  );
  await db.exec(
    await readFile(
      new URL("../supabase/bootstrap-admin.sql", import.meta.url),
      "utf8",
    ),
  );
  await db.exec(
    `insert into public.product_releases(product_id,version,download_url,published_at) select id,'test-future','https://example.com/app.apk',now()+interval '1 day' from public.products where slug='hesabko';`,
  );
  await db.exec(
    await readFile(
      new URL("../supabase/tests/rls.sql", import.meta.url),
      "utf8",
    ),
  );
  console.log("Anonymous/non-admin RLS assertions passed");
  await db.exec(
    `select set_config('request.jwt.claims','{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}',false);set role authenticated;`,
  );
  assert.equal(
    (await db.query("select public.is_admin() as allowed")).rows[0].allowed,
    true,
  );
  assert.equal(
    (
      await db.query(
        "update public.products set status='published',icon_url='https://test.supabase.co/storage/v1/object/public/product-images/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.webp' where slug='hesabko' returning id",
      )
    ).rows.length,
    1,
  );
  await db.exec(
    "insert into storage.objects(bucket_id,name) values('product-images','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.webp');",
  );
  assert.equal(
    (await db.query("delete from storage.objects returning id")).rows.length,
    0,
    "referenced media must be protected",
  );
  await db.exec("update public.products set icon_url='' where slug='hesabko';");
  assert.equal(
    (await db.query("delete from storage.objects returning id")).rows.length,
    1,
    "unused media may be deleted",
  );
  await db.exec(
    `reset role;select set_config('request.jwt.claims','{}',false);set role anon;`,
  );
  assert.equal(
    (await db.query("select * from public.products where slug='hesabko'")).rows
      .length,
    1,
  );
  assert.equal(
    (
      await db.query(
        "select * from public.product_releases where version='test-future'",
      )
    ).rows.length,
    0,
  );
  assert.equal(
    (await db.query("select * from storage.objects")).rows.length,
    0,
  );
  console.log(
    "Owner publishing, public visibility, future releases and safe media deletion passed",
  );
} finally {
  await db.close();
}
