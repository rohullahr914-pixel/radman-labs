-- Additive upgrade only: preserve every product, release, URL and owner record.
begin;
alter table public.products add column if not exists release_notes text not null default '';
alter table public.products add column if not exists features_confirmed boolean not null default false;
create index if not exists products_catalog_updated_idx on public.products (status, updated_at desc);
create index if not exists products_category_platform_idx on public.products (category, platform) where status = 'published';
commit;
