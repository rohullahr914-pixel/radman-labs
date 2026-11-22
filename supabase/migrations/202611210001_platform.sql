begin;
create table public.admin_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 email text not null unique check (email = 'rohullahr914@gmail.com'),
 role text not null default 'admin' check (role = 'admin'),
 created_at timestamptz not null default now()
);
alter table public.admin_profiles enable row level security;
create function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.admin_profiles a join auth.users u on u.id=a.id where a.id=(select auth.uid()) and a.role='admin' and a.email='rohullahr914@gmail.com' and u.email=a.email)
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon,authenticated;
create policy own_profile on public.admin_profiles for select to authenticated using (id=(select auth.uid()));
-- No client INSERT/UPDATE/DELETE policy: admin membership requires SQL-owner provisioning.
create table public.products (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(name) between 1 and 160), slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 tagline text not null default '', description text not null default '', category text not null,platform text not null,
 version text not null default '',pricing text not null default 'Free' check(pricing in ('Free','Paid')),
 icon_url text not null default '',cover_url text not null default '',screenshots text[] not null default '{}',features text[] not null default '{}',
 download_provider text not null default 'github' check(download_provider in ('github','direct')),
 download_url text not null default '' check(download_url='' or download_url ~ '^https://'),github_repository text not null default '',github_tag text not null default '',github_asset text not null default '',
 status text not null default 'draft' check(status in ('draft','published')),installation text not null default '',language text not null default '',
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 constraint screenshot_limit check(cardinality(screenshots)<=12)
);
create index products_public on public.products(status,created_at desc);
create function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now();return new;end $$;
create trigger products_updated before update on public.products for each row execute function public.touch_updated_at();
alter table public.products enable row level security;
create policy published_products on public.products for select to anon,authenticated using(status='published');
create policy admin_products on public.products for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create table public.product_releases (
 id uuid primary key default gen_random_uuid(),product_id uuid not null references public.products(id) on delete cascade,
 version text not null,release_notes text not null default '',download_url text not null check(download_url ~ '^https://'),file_size bigint check(file_size>=0),published_at timestamptz not null default now(),
 unique(product_id,version)
);
create index releases_product on public.product_releases(product_id,published_at desc);
alter table public.product_releases enable row level security;
create policy public_releases on public.product_releases for select to anon,authenticated using(published_at<=now() and exists(select 1 from public.products p where p.id=product_id and p.status='published'));
create policy admin_releases on public.product_releases for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));
grant select on public.products,public.product_releases to anon;
grant select,insert,update,delete on public.products,public.product_releases to authenticated;
grant select on public.admin_profiles to authenticated;
revoke insert,update,delete on public.admin_profiles from anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('product-images','product-images',true,8388608,array['image/webp','image/jpeg','image/png']);
create policy public_product_images on storage.objects for select to anon,authenticated using(bucket_id='product-images');
create policy admin_image_insert on storage.objects for insert to authenticated with check(bucket_id='product-images' and (select public.is_admin()));
create policy admin_image_update on storage.objects for update to authenticated using(bucket_id='product-images' and (select public.is_admin())) with check(bucket_id='product-images' and (select public.is_admin()));
create policy admin_image_delete on storage.objects for delete to authenticated using(bucket_id='product-images' and (select public.is_admin()));
commit;
