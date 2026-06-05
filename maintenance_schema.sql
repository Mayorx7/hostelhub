-- ============================================================
-- HostelHub — Maintenance Schema
-- Run this entire file in your Supabase SQL Editor (once).
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. PROFILES TABLE
--    Mirrors auth.users; auto-populated by the trigger below.
--    Required by the admin RLS check on maintenance_requests.
-- ──────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text,
  role        text not null default 'student'
                check (role in ('student', 'admin', 'staff')),
  created_at  timestamptz not null default now()
);

-- Automatically create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'role', 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop the trigger first (so re-running this script is safe)
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS for profiles
alter table public.profiles enable row level security;

-- Users can always read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Admins can view all profiles
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );


-- ──────────────────────────────────────────────────────────────
-- 2. MAINTENANCE_REQUESTS TABLE
-- ──────────────────────────────────────────────────────────────

create table if not exists public.maintenance_requests (
  id             uuid        primary key default gen_random_uuid(),
  ticket_number  text        unique not null,
  room           text        not null,
  issue          text        not null,
  description    text        not null,
  reported_by    text        not null,
  reported_date  timestamptz not null default now(),
  priority       text        not null default 'medium'
                   check (priority in ('high', 'medium', 'low')),
  status         text        not null default 'pending'
                   check (status in ('pending', 'in-progress', 'completed')),
  assigned_to    text,
  user_id        uuid        references auth.users on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Auto-update updated_at on every row change
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists maintenance_requests_updated_at on public.maintenance_requests;

create trigger maintenance_requests_updated_at
  before update on public.maintenance_requests
  for each row execute procedure public.update_updated_at();


-- ──────────────────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY for maintenance_requests
--
--    NOTE: Supabase combines multiple SELECT policies with OR.
--    To avoid conflicts we use ONE unified SELECT policy that
--    handles both student and admin cases in a single expression.
-- ──────────────────────────────────────────────────────────────

alter table public.maintenance_requests enable row level security;

-- ── SELECT: student sees own rows; admin sees all ──
create policy "Select maintenance requests"
  on public.maintenance_requests for select
  using (
    auth.uid() = user_id          -- student owns this request
    or
    exists (                      -- OR the caller is an admin
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ── INSERT: students can submit their own requests ──
create policy "Students can submit maintenance requests"
  on public.maintenance_requests for insert
  with check (auth.uid() = user_id);

-- ── UPDATE: only admins can update (change status / assign) ──
create policy "Admins can update maintenance requests"
  on public.maintenance_requests for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ── DELETE: only admins ──
create policy "Admins can delete maintenance requests"
  on public.maintenance_requests for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- ──────────────────────────────────────────────────────────────
-- 4. DEMO SEED DATA  (optional — for local development only)
--
--    This data exists ONLY to demonstrate how the UI looks when
--    real requests are present.  Delete these rows at any time;
--    the app will show real user-submitted data instead.
--
--    To skip seeding entirely, comment out this entire section.
-- ──────────────────────────────────────────────────────────────

insert into public.maintenance_requests
  (ticket_number, room, issue, description, reported_by, reported_date, priority, status, assigned_to)
values
  ('MAINT-001', '304B', 'Air conditioning not working',
   'AC unit not cooling properly, making loud noises.',
   'Sarah Johnson', '2024-01-20 09:30:00+00', 'high', 'in-progress', 'John Technician'),

  ('MAINT-002', '201A', 'Leaking faucet',
   'Bathroom sink faucet dripping continuously.',
   'Mike Chen', '2024-01-20 14:15:00+00', 'medium', 'pending', null),

  ('MAINT-003', '105C', 'Door lock malfunction',
   'Electronic door lock not responding to keycard.',
   'Emma Wilson', '2024-01-19 20:00:00+00', 'high', 'pending', null),

  ('MAINT-004', '402D', 'Light bulb replacement',
   'Ceiling light not working in bedroom.',
   'David Brown', '2024-01-20 11:00:00+00', 'low', 'completed', 'Mike Electrician'),

  ('MAINT-005', '203B', 'WiFi connectivity issues',
   'Unable to connect to internet; signal very weak.',
   'Lisa Anderson', '2024-01-20 15:45:00+00', 'medium', 'in-progress', 'Tom IT Support'),

  ('MAINT-006', '301A', 'Broken window',
   'Window glass cracked, needs replacement.',
   'James Taylor', '2024-01-19 16:20:00+00', 'high', 'in-progress', 'Paul Maintenance'),

  ('MAINT-007', '104B', 'Water heater not working',
   'No hot water in bathroom.',
   'Maria Garcia', '2024-01-20 07:00:00+00', 'high', 'pending', null),

  ('MAINT-008', '205C', 'Noisy ceiling fan',
   'Ceiling fan making rattling noise.',
   'Alex Kim', '2024-01-19 10:30:00+00', 'low', 'completed', 'John Technician')

on conflict (ticket_number) do nothing;   -- safe to re-run
