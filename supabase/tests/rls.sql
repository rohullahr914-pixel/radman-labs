-- Run in Supabase SQL editor AFTER migrations and owner bootstrap.
-- All fixtures and writes are rolled back. Errors mean a failed assertion.
begin;
insert into public.products(name,slug,category,platform,status) values
 ('RLS draft fixture','rls-test-draft','Test','Test','draft'),
 ('RLS public fixture','rls-test-public','Test','Test','published');
insert into public.product_releases(product_id,version,download_url,published_at)
select id,'test-future','https://example.com/file.apk',now()+interval '1 day' from public.products where slug='rls-test-public';
set local role anon;
do $$ begin
 if exists(select 1 from public.products where slug='rls-test-draft') then raise exception 'Anonymous draft disclosure';end if;
 if not exists(select 1 from public.products where slug='rls-test-public') then raise exception 'Published product unavailable';end if;
 if exists(select 1 from public.product_releases where version='test-future') then raise exception 'Future release disclosure';end if;
 begin
  insert into public.products(name,slug,category,platform) values('Attack','rls-attack','Test','Test');
  raise exception 'Anonymous insert unexpectedly succeeded';
 exception when insufficient_privilege then null;end;
end $$;
reset role;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated","email":"attacker@example.com"}',true);
set local role authenticated;
do $$ begin
 if public.is_admin() then raise exception 'Non-admin escalation';end if;
 if exists(select 1 from public.products where slug='rls-test-draft') then raise exception 'Non-admin draft disclosure';end if;
 if exists(select 1 from public.admin_profiles) then raise exception 'Other admin profile disclosed';end if;
 begin
  insert into public.admin_profiles(id,email) values('00000000-0000-0000-0000-000000000001','rohullahr914@gmail.com');
  raise exception 'Membership escalation unexpectedly succeeded';
 exception when insufficient_privilege then null;end;
 begin
  insert into public.products(name,slug,category,platform) values('Attack','rls-attack','Test','Test');
  raise exception 'Non-admin insert unexpectedly succeeded';
 exception when insufficient_privilege then null;end;
end $$;
reset role;
select set_config('request.jwt.claims',json_build_object('sub',id,'role','authenticated','email',email)::text,true) from public.admin_profiles where email='rohullahr914@gmail.com';
set local role authenticated;
do $$ begin
 if not public.is_admin() then raise exception 'Owner bootstrap missing or rejected';end if;
 if not exists(select 1 from public.products where slug='rls-test-draft') then raise exception 'Owner cannot read drafts';end if;
 update public.products set tagline='Owner update verified' where slug='rls-test-draft';
 if not exists(select 1 from public.products where slug='rls-test-draft' and tagline='Owner update verified') then raise exception 'Owner cannot update';end if;
end $$;
reset role;
rollback;
