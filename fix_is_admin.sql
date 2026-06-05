-- Fix is_admin() so it respects the user_metadata 'role' from the JWT,
-- fixing RLS issues when a user is an admin in Auth but not in the profiles table.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin',
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
$$;
