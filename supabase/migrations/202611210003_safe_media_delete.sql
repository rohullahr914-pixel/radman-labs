-- Storage listing is administrator-only; public images remain readable by URL.
begin;
drop policy admin_image_delete on storage.objects;
drop policy public_product_images on storage.objects;
drop policy admin_image_insert on storage.objects;
drop policy admin_image_update on storage.objects;
create policy admin_image_delete on storage.objects for delete to authenticated
using(bucket_id='product-images' and (select public.is_admin()) and not exists (
 select 1 from public.products p where
 p.icon_url like '%/product-images/' || storage.objects.name or
 p.cover_url like '%/product-images/' || storage.objects.name or
 exists(select 1 from unnest(p.screenshots) s where s like '%/product-images/' || storage.objects.name)
));
create policy admin_image_list on storage.objects for select to authenticated using(bucket_id='product-images' and (select public.is_admin()));
create policy admin_image_insert on storage.objects for insert to authenticated with check(bucket_id='product-images' and (select public.is_admin()) and name ~ '^[a-f0-9-]+\.webp$');
-- Unique, immutable image names: replacement uploads a new object, never overwrites.
commit;
