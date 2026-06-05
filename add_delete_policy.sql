-- Add DELETE policy for applications so admins can delete rejected applications
drop policy if exists "Admins can delete applications" on public.applications;
create policy "Admins can delete applications"
  on public.applications for delete
  using (public.is_admin());
