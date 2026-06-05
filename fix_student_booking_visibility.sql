-- Fix the RLS policy for the student to ensure they can view their own booking
drop policy if exists "Select bookings" on public.bookings;
create policy "Select bookings"
  on public.bookings for select
  using (
    auth.uid() = resident_id
    or public.is_admin()
  );
