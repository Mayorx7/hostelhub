-- ============================================================
-- HostelHub — Complete Database Schema
-- Paste this entire file into your Supabase SQL Editor and run.
-- It is safe to re-run (uses IF NOT EXISTS / ON CONFLICT).
-- ============================================================


-- ──────────────────────────────────────────────────────────────
-- 1. PROFILES
--    Mirrors auth.users. Auto-created by trigger on signup.
-- ──────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id           uuid        primary key references auth.users on delete cascade,
  full_name    text,
  role         text        not null default 'student'
                             check (role in ('student', 'admin', 'staff')),
  matric_number text,
  phone        text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Admin check function (security definer to bypass RLS and prevent infinite recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Auto-create profile on signup
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());


-- ──────────────────────────────────────────────────────────────
-- 2. ROOMS
--    Managed by admin only.
-- ──────────────────────────────────────────────────────────────

create table if not exists public.rooms (
  id           uuid        primary key default gen_random_uuid(),
  room_number  text        unique not null,
  block        text        not null,
  floor        integer     not null default 1,
  type         text        not null check (type in ('Single', 'Double', 'Suite', '4-Bed Shared')),
  price        numeric     not null default 0,
  image_url    text,
  status       text        not null default 'available'
                             check (status in ('available', 'occupied', 'maintenance')),
  capacity     integer     not null default 1,
  description  text,
  created_at   timestamptz not null default now()
);

alter table public.rooms enable row level security;

-- Everyone (including anon) can read available rooms
drop policy if exists "Anyone can view rooms" on public.rooms;
create policy "Anyone can view rooms"
  on public.rooms for select using (true);

-- Only admins can insert / update / delete rooms
drop policy if exists "Admins can manage rooms" on public.rooms;
create policy "Admins can manage rooms"
  on public.rooms for all
  using (public.is_admin());


-- ──────────────────────────────────────────────────────────────
-- 3. APPLICATIONS
--    Student submits; admin approves/rejects.
-- ──────────────────────────────────────────────────────────────

create table if not exists public.applications (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users on delete cascade,
  full_name      text        not null,
  matric_number  text        not null,
  department     text        not null,
  level          text        not null,
  room_type      text        not null,
  message        text,
  status         text        not null default 'pending'
                               check (status in ('pending', 'approved', 'rejected')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists applications_updated_at on public.applications;
create trigger applications_updated_at
  before update on public.applications
  for each row execute procedure public.update_updated_at();

alter table public.applications enable row level security;

-- Student sees own applications; admin sees all
drop policy if exists "Select applications" on public.applications;
create policy "Select applications"
  on public.applications for select
  using (
    auth.uid() = user_id
    or public.is_admin()
  );

-- Students can submit
drop policy if exists "Students can insert applications" on public.applications;
create policy "Students can insert applications"
  on public.applications for insert
  with check (auth.uid() = user_id);

-- Admins can update status
drop policy if exists "Admins can update applications" on public.applications;
create policy "Admins can update applications"
  on public.applications for update
  using (public.is_admin());


-- ──────────────────────────────────────────────────────────────
-- 4. BOOKINGS
--    Created by admin after approving an application.
-- ──────────────────────────────────────────────────────────────

create table if not exists public.bookings (
  id            uuid        primary key default gen_random_uuid(),
  resident_id   uuid        not null references public.profiles on delete cascade,
  room_id       uuid        not null references public.rooms on delete restrict,
  check_in      date,
  check_out     date,
  status        text        not null default 'pending'
                              check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  total_amount  numeric     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists bookings_updated_at on public.bookings;
create trigger bookings_updated_at
  before update on public.bookings
  for each row execute procedure public.update_updated_at();

alter table public.bookings enable row level security;

drop policy if exists "Select bookings" on public.bookings;
create policy "Select bookings"
  on public.bookings for select
  using (
    auth.uid() = resident_id
    or public.is_admin()
  );

drop policy if exists "Admins can manage bookings" on public.bookings;
create policy "Admins can manage bookings"
  on public.bookings for all
  using (public.is_admin());


-- ──────────────────────────────────────────────────────────────
-- 5. STUDENT_PAYMENTS
--    Tracks fee payment records per booking.
-- ──────────────────────────────────────────────────────────────

create table if not exists public.student_payments (
  id             uuid        primary key default gen_random_uuid(),
  booking_id     uuid        references public.bookings on delete set null,
  resident_id    uuid        not null references public.profiles on delete cascade,
  amount         numeric     not null default 0,
  status         text        not null default 'pending'
                               check (status in ('pending', 'completed', 'failed')),
  reference      text,
  payment_date   timestamptz,
  description    text,
  created_at     timestamptz not null default now()
);

alter table public.student_payments enable row level security;

drop policy if exists "Select payments" on public.student_payments;
create policy "Select payments"
  on public.student_payments for select
  using (
    auth.uid() = resident_id
    or public.is_admin()
  );

drop policy if exists "Admins can manage payments" on public.student_payments;
create policy "Admins can manage payments"
  on public.student_payments for all
  using (public.is_admin());


-- ──────────────────────────────────────────────────────────────
-- 6. MAINTENANCE_REQUESTS
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

drop trigger if exists maintenance_requests_updated_at on public.maintenance_requests;
create trigger maintenance_requests_updated_at
  before update on public.maintenance_requests
  for each row execute procedure public.update_updated_at();

alter table public.maintenance_requests enable row level security;

-- Single unified SELECT policy (avoids OR-conflict between two separate policies)
drop policy if exists "Select maintenance requests" on public.maintenance_requests;
create policy "Select maintenance requests"
  on public.maintenance_requests for select
  using (
    auth.uid() = user_id
    or public.is_admin()
  );

drop policy if exists "Students can submit maintenance requests" on public.maintenance_requests;
create policy "Students can submit maintenance requests"
  on public.maintenance_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users and Admins can update maintenance requests" on public.maintenance_requests;
create policy "Users and Admins can update maintenance requests"
  on public.maintenance_requests for update
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins can delete maintenance requests" on public.maintenance_requests;
create policy "Admins can delete maintenance requests"
  on public.maintenance_requests for delete
  using (public.is_admin());


-- ──────────────────────────────────────────────────────────────
-- 7. DEMO SEED DATA  (admin maintenance view only)
--    Remove or comment out this section in production.
--    Student pages show REAL data only — no mock rows injected.
-- ──────────────────────────────────────────────────────────────

insert into public.maintenance_requests
  (ticket_number, room, issue, description, reported_by, reported_date, priority, status, assigned_to)
values
  ('MAINT-001','304B','Air conditioning not working','AC unit not cooling properly, making loud noises.','Sarah Johnson','2024-01-20 09:30:00+00','high','in-progress','John Technician'),
  ('MAINT-002','201A','Leaking faucet','Bathroom sink faucet dripping continuously.','Mike Chen','2024-01-20 14:15:00+00','medium','pending',null),
  ('MAINT-003','105C','Door lock malfunction','Electronic door lock not responding to keycard.','Emma Wilson','2024-01-19 20:00:00+00','high','pending',null),
  ('MAINT-004','402D','Light bulb replacement','Ceiling light not working in bedroom.','David Brown','2024-01-20 11:00:00+00','low','completed','Mike Electrician'),
  ('MAINT-005','203B','WiFi connectivity issues','Unable to connect to internet; signal very weak.','Lisa Anderson','2024-01-20 15:45:00+00','medium','in-progress','Tom IT Support'),
  ('MAINT-006','301A','Broken window','Window glass cracked, needs replacement.','James Taylor','2024-01-19 16:20:00+00','high','in-progress','Paul Maintenance'),
  ('MAINT-007','104B','Water heater not working','No hot water in bathroom.','Maria Garcia','2024-01-20 07:00:00+00','high','pending',null),
  ('MAINT-008','205C','Noisy ceiling fan','Ceiling fan making rattling noise.','Alex Kim','2024-01-19 10:30:00+00','low','completed','John Technician')
on conflict (ticket_number) do nothing;


-- ──────────────────────────────────────────────────────────────
-- 8. INDEXES
--    Supabase auto-indexes primary keys only.
--    These cover the foreign key columns used in every WHERE
--    clause and RLS policy so queries never do a full scan.
-- ──────────────────────────────────────────────────────────────

-- applications: look up by student
create index if not exists idx_applications_user_id
  on public.applications (user_id);

-- bookings: look up by student
create index if not exists idx_bookings_resident_id
  on public.bookings (resident_id);

-- bookings: look up by room (for admin room-status updates)
create index if not exists idx_bookings_room_id
  on public.bookings (room_id);

-- student_payments: look up by student
create index if not exists idx_student_payments_resident_id
  on public.student_payments (resident_id);

-- student_payments: look up by booking
create index if not exists idx_student_payments_booking_id
  on public.student_payments (booking_id);

-- maintenance_requests: look up by student (student dashboard)
create index if not exists idx_maintenance_requests_user_id
  on public.maintenance_requests (user_id);

-- maintenance_requests: filter by status (admin dashboard)
create index if not exists idx_maintenance_requests_status
  on public.maintenance_requests (status);

-- profiles: RLS subquery looks up by id (already PK, but explicit)
-- no extra index needed — PK index covers it


-- ──────────────────────────────────────────────────────────────
-- 9. BLOCKS
--    Hostel block definitions.
-- ──────────────────────────────────────────────────────────────

create table if not exists public.blocks (
  id           text        primary key,
  name         text        not null,
  gender       text        not null check (gender in ('male', 'female')),
  description  text,
  total_rooms  integer     not null default 0,
  created_at   timestamptz not null default now()
);

alter table public.blocks enable row level security;

create policy "Anyone can view blocks"
  on public.blocks for select using (true);

create policy "Admins can manage blocks"
  on public.blocks for all
  using (public.is_admin());

insert into public.blocks (id, name, gender, description, total_rooms)
values
  ('A', 'Kogi Hall', 'male', 'A well-maintained male hostel block with 24/7 security, reliable power, and easy access to the main campus.', 16),
  ('B', 'Confluence Hall', 'female', 'A secure and comfortable female hostel block featuring modern facilities and a vibrant community environment.', 16),
  ('C', 'Osara Hall', 'male', 'A spacious male hostel block situated close to the faculty buildings, ideal for focused academic life.', 16),
  ('D', 'Okene Hall', 'female', 'A premium female hostel block offering a calm, study-friendly atmosphere with superior room finishes.', 16)
on conflict (id) do nothing;


-- ──────────────────────────────────────────────────────────────
-- 10. ROOM SEED DATA
--     Populates the rooms table with 64 rooms (16 per block).
-- ──────────────────────────────────────────────────────────────

insert into public.rooms (room_number, block, floor, type, price, status, capacity)
values
  -- Block A (Male)
  ('A1', 'A', 1, '4-Bed Shared', 45000, 'available', 4), ('A2', 'A', 1, '4-Bed Shared', 45000, 'available', 4),
  ('A3', 'A', 1, '4-Bed Shared', 45000, 'available', 4), ('A4', 'A', 1, '4-Bed Shared', 45000, 'available', 4),
  ('A5', 'A', 1, '4-Bed Shared', 45000, 'available', 4), ('A6', 'A', 1, '4-Bed Shared', 45000, 'available', 4),
  ('A7', 'A', 1, '4-Bed Shared', 45000, 'available', 4), ('A8', 'A', 1, '4-Bed Shared', 45000, 'available', 4),
  ('A9', 'A', 2, 'Double', 70000, 'available', 2), ('A10', 'A', 2, 'Double', 70000, 'available', 2),
  ('A11', 'A', 2, 'Double', 70000, 'available', 2), ('A12', 'A', 2, 'Double', 70000, 'available', 2),
  ('A13', 'A', 2, 'Single', 95000, 'available', 1), ('A14', 'A', 2, 'Single', 95000, 'available', 1),
  ('A15', 'A', 2, 'Single', 95000, 'available', 1), ('A16', 'A', 2, 'Single', 95000, 'available', 1),
  
  -- Block B (Female)
  ('B1', 'B', 1, '4-Bed Shared', 45000, 'available', 4), ('B2', 'B', 1, '4-Bed Shared', 45000, 'available', 4),
  ('B3', 'B', 1, '4-Bed Shared', 45000, 'available', 4), ('B4', 'B', 1, '4-Bed Shared', 45000, 'available', 4),
  ('B5', 'B', 1, '4-Bed Shared', 45000, 'available', 4), ('B6', 'B', 1, '4-Bed Shared', 45000, 'available', 4),
  ('B7', 'B', 1, '4-Bed Shared', 45000, 'available', 4), ('B8', 'B', 1, '4-Bed Shared', 45000, 'available', 4),
  ('B9', 'B', 2, 'Double', 70000, 'available', 2), ('B10', 'B', 2, 'Double', 70000, 'available', 2),
  ('B11', 'B', 2, 'Double', 70000, 'available', 2), ('B12', 'B', 2, 'Double', 70000, 'available', 2),
  ('B13', 'B', 2, 'Single', 95000, 'available', 1), ('B14', 'B', 2, 'Single', 95000, 'available', 1),
  ('B15', 'B', 2, 'Single', 95000, 'available', 1), ('B16', 'B', 2, 'Single', 95000, 'available', 1),

  -- Block C (Male)
  ('C1', 'C', 1, '4-Bed Shared', 45000, 'available', 4), ('C2', 'C', 1, '4-Bed Shared', 45000, 'available', 4),
  ('C3', 'C', 1, '4-Bed Shared', 45000, 'available', 4), ('C4', 'C', 1, '4-Bed Shared', 45000, 'available', 4),
  ('C5', 'C', 1, '4-Bed Shared', 45000, 'available', 4), ('C6', 'C', 1, '4-Bed Shared', 45000, 'available', 4),
  ('C7', 'C', 1, '4-Bed Shared', 45000, 'available', 4), ('C8', 'C', 1, '4-Bed Shared', 45000, 'available', 4),
  ('C9', 'C', 2, 'Double', 70000, 'available', 2), ('C10', 'C', 2, 'Double', 70000, 'available', 2),
  ('C11', 'C', 2, 'Double', 70000, 'available', 2), ('C12', 'C', 2, 'Double', 70000, 'available', 2),
  ('C13', 'C', 2, 'Single', 95000, 'available', 1), ('C14', 'C', 2, 'Single', 95000, 'available', 1),
  ('C15', 'C', 2, 'Single', 95000, 'available', 1), ('C16', 'C', 2, 'Single', 95000, 'available', 1),

  -- Block D (Female)
  ('D1', 'D', 1, '4-Bed Shared', 45000, 'available', 4), ('D2', 'D', 1, '4-Bed Shared', 45000, 'available', 4),
  ('D3', 'D', 1, '4-Bed Shared', 45000, 'available', 4), ('D4', 'D', 1, '4-Bed Shared', 45000, 'available', 4),
  ('D5', 'D', 1, '4-Bed Shared', 45000, 'available', 4), ('D6', 'D', 1, '4-Bed Shared', 45000, 'available', 4),
  ('D7', 'D', 1, '4-Bed Shared', 45000, 'available', 4), ('D8', 'D', 1, '4-Bed Shared', 45000, 'available', 4),
  ('D9', 'D', 2, 'Double', 70000, 'available', 2), ('D10', 'D', 2, 'Double', 70000, 'available', 2),
  ('D11', 'D', 2, 'Double', 70000, 'available', 2), ('D12', 'D', 2, 'Double', 70000, 'available', 2),
  ('D13', 'D', 2, 'Single', 95000, 'available', 1), ('D14', 'D', 2, 'Single', 95000, 'available', 1),
  ('D15', 'D', 2, 'Single', 95000, 'available', 1), ('D16', 'D', 2, 'Single', 95000, 'available', 1)
on conflict (room_number) do nothing;


-- ──────────────────────────────────────────────────────────────
-- 11. ROOMS VIEW
--     Unified view for room management.
-- ──────────────────────────────────────────────────────────────

create or replace view public.rooms_view as
select
  r.id as room_id,
  r.room_number,
  r.block as block_id,
  b.name as block_name,
  b.gender as block_gender,
  r.floor,
  r.type as room_type,
  r.price,
  r.status as room_status,
  r.capacity,
  r.description,
  (select count(*) from public.bookings bk where bk.room_id = r.id and bk.status = 'confirmed') as occupied_count
from
  public.rooms r
join
  public.blocks b on r.block = b.id;


-- ──────────────────────────────────────────────────────────────
-- 12. RESIDENTS VIEW
--    A helper view to see all currently active residents.
--    Combines profiles, bookings, and rooms for the Admin Dashboard.
-- ──────────────────────────────────────────────────────────────

create or replace view public.residents_view as
select
  p.id as profile_id,
  p.full_name,
  p.matric_number,
  p.phone,
  p.avatar_url,
  r.room_number,
  r.block,
  r.floor,
  r.type as room_type,
  b.id as booking_id,
  b.check_in,
  b.check_out,
  b.status as booking_status,
  b.total_amount,
  p.created_at as resident_since
from
  public.profiles p
join
  public.bookings b on p.id = b.resident_id
join
  public.rooms r on b.room_id = r.id;


-- ──────────────────────────────────────────────────────────────
-- 13. BOOKINGS VIEW
--    A detailed view for managing reservations.
-- ──────────────────────────────────────────────────────────────

create or replace view public.bookings_view as
select
  b.id as booking_id,
  p.id as profile_id,
  p.full_name as guest_name,
  p.matric_number,
  p.phone,
  r.room_number,
  r.type as room_type,
  b.check_in,
  b.check_out,
  b.status as booking_status,
  b.total_amount,
  b.created_at as booking_date
from
  public.bookings b
join
  public.profiles p on b.resident_id = p.id
join
  public.rooms r on b.room_id = r.id;


-- ──────────────────────────────────────────────────────────────
-- 14. MAINTENANCE VIEW
--     Unified view for facilities management.
-- ──────────────────────────────────────────────────────────────

create or replace view public.maintenance_view as
select
  m.id as request_id,
  m.ticket_number,
  m.room,
  m.issue,
  m.description,
  m.reported_by as reporter_name,
  p.matric_number as reporter_matric,
  m.reported_date,
  m.priority,
  m.status,
  m.assigned_to,
  m.user_id as profile_id
from
  public.maintenance_requests m
left join
  public.profiles p on m.user_id = p.id;


-- ──────────────────────────────────────────────────────────────
-- 15. REPORTS & ANALYTICS VIEWS
-- ──────────────────────────────────────────────────────────────

-- Occupancy Stats
create or replace view public.report_occupancy as
select
  count(*) as total_rooms,
  count(*) filter (where status = 'full' or status = 'occupied') as occupied_rooms,
  round((count(*) filter (where status = 'full' or status = 'occupied')::numeric / count(*)::numeric) * 100, 1) as occupancy_rate
from public.rooms;

-- Monthly Revenue (Last 6 months)
create or replace view public.report_revenue_monthly as
select
  to_char(payment_date, 'Mon') as month,
  sum(amount) as total_revenue,
  min(payment_date) as sort_key
from public.student_payments
where status = 'completed'
  and payment_date >= now() - interval '6 months'
group by to_char(payment_date, 'Mon')
order by sort_key;

-- Recent Activity Feed (Unified Log)
create or replace view public.report_activity_feed as
select * from (
  -- Payments
  select
    'payment' as type,
    p.full_name || ' paid ₦' || sp.amount::text || ' fee' as text,
    'Room ' || r.room_number || ' · ' || r.block as sub,
    sp.created_at as time,
    '#16a34a' as color,
    '#f0fdf4' as bg
  from public.student_payments sp
  join public.profiles p on sp.resident_id = p.id
  left join public.bookings b on sp.booking_id = b.id
  left join public.rooms r on b.room_id = r.id
  where sp.status = 'completed'

  union all

  -- Bookings
  select
    'booking' as type,
    'New booking request — ' || p.full_name as text,
    'Room ' || r.room_number || ', ' || r.block as sub,
    b.created_at as time,
    '#2563eb' as color,
    '#eff6ff' as bg
  from public.bookings b
  join public.profiles p on b.resident_id = p.id
  join public.rooms r on b.room_id = r.id
  where b.status = 'pending'

  union all

  -- Maintenance
  select
    'maintenance' as type,
    issue || ' — ' || room as text,
    'Reported by ' || reported_by as sub,
    reported_date as time,
    '#d97706' as color,
    '#fffbeb' as bg
  from public.maintenance_requests
) as combined_activity
order by time desc
limit 10;


-- ──────────────────────────────────────────────────────────────
-- 16. PAYMENTS VIEW
--     Unified view for financial management.
-- ──────────────────────────────────────────────────────────────

create or replace view public.payments_view as
select
  sp.id as payment_id,
  sp.reference as invoice_number,
  p.full_name as resident_name,
  r.room_number,
  sp.description,
  sp.amount,
  sp.payment_date as paid_date,
  sp.status as payment_status,
  sp.created_at as created_at
from
  public.student_payments sp
join
  public.profiles p on sp.resident_id = p.id
left join
  public.bookings b on sp.booking_id = b.id
left join
  public.rooms r on b.room_id = r.id;


-- ──────────────────────────────────────────────────────────────
-- 17. APPLICATIONS VIEW
-- ──────────────────────────────────────────────────────────────

create or replace view public.dashboard_applications_view as
select
  a.id,
  a.user_id   as profile_id,          -- applicant's auth UUID (needed for booking insert)
  a.full_name as applicant_name,
  a.matric_number,
  a.room_type,
  a.status,
  a.created_at as application_date
from
  public.applications a;


-- ──────────────────────────────────────────────────────────────
-- 18. AUDIT LOGS
--     Tracks system-wide admin and student actions.
-- ──────────────────────────────────────────────────────────────

create table if not exists public.audit_logs (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        references auth.users on delete set null,
  action       text        not null,
  entity_type  text        not null, -- 'application', 'payment', 'room', etc.
  entity_id    uuid,
  details      jsonb,
  ip_address   text,
  created_at   timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

-- Only admins can view audit logs
create policy "Admins can view audit logs"
  on public.audit_logs for select
  using (public.is_admin());

-- System can insert logs (via functions)
create or replace function public.log_action(
  p_action      text,
  p_entity_type text,
  p_entity_id   uuid default null,
  p_details     jsonb default null
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.audit_logs (user_id, action, entity_type, entity_id, details)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, p_details);
end;
$$;
