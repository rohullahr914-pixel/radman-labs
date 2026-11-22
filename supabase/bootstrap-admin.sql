-- Run AFTER inviting the owner in Supabase Authentication → Users.
-- Never insert a password here. This grants access only to the exact invited owner.
insert into public.admin_profiles(id,email,role)
select id,email,'admin' from auth.users where email='rohullahr914@gmail.com'
on conflict(id) do update set email=excluded.email,role=excluded.role;
-- Must return exactly one row. If zero, invite the owner first and rerun.
select id,email,role from public.admin_profiles;
