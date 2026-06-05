-- ============================================================
-- HostelHub — Booking Flow Patch
-- Run this in the Supabase SQL Editor after schema.sql
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. EXPOSE profile_id IN dashboard_applications_view
--    The Bookings page uses this to match an application to a
--    user when the admin approves it from the Bookings screen.
-- ──────────────────────────────────────────────────────────────

create or replace view public.dashboard_applications_view as
select
  a.id,
  a.user_id   as profile_id,          -- ← exposes the applicant's UUID
  a.full_name as applicant_name,
  a.matric_number,
  a.room_type,
  a.status,
  a.created_at as application_date
from
  public.applications a;


-- ──────────────────────────────────────────────────────────────
-- 2. ALLOW ADMINS TO INSERT BOOKINGS
--    The existing "Admins can manage bookings" policy covers
--    SELECT / UPDATE / DELETE via the ALL shorthand, but some
--    Supabase versions require an explicit INSERT policy.
--    This is idempotent (uses IF NOT EXISTS pattern via DROP).
-- ──────────────────────────────────────────────────────────────

drop policy if exists "Admins can insert bookings" on public.bookings;
create policy "Admins can insert bookings"
  on public.bookings for insert
  with check (public.is_admin());


-- ──────────────────────────────────────────────────────────────
-- 3. ALLOW STUDENTS TO READ THEIR OWN BOOKINGS
--    Confirms the select policy is correct so StudentDashboard
--    can fetch booking status without 403 errors.
-- ──────────────────────────────────────────────────────────────

drop policy if exists "Select bookings" on public.bookings;
create policy "Select bookings"
  on public.bookings for select
  using (
    auth.uid() = resident_id
    or public.is_admin()
  );


-- ──────────────────────────────────────────────────────────────
-- 4. REFRESH BOOKINGS_VIEW (no-op — ensures it reflects latest)
-- ──────────────────────────────────────────────────────────────

create or replace view public.bookings_view as
select
  b.id            as booking_id,
  p.id            as profile_id,
  p.full_name     as guest_name,
  p.matric_number,
  p.phone,
  r.room_number,
  r.type          as room_type,
  b.check_in,
  b.check_out,
  b.status        as booking_status,
  b.total_amount,
  b.created_at    as booking_date
from
  public.bookings b
join
  public.profiles p on b.resident_id = p.id
join
  public.rooms r on b.room_id = r.id;
