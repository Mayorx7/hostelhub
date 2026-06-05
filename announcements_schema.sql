-- ============================================================
-- Notifications & Announcements Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

create table if not exists public.announcements (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null,
  message     text        not null,
  type        text        not null default 'info' 
                          check (type in ('info', 'warning', 'success')),
  target      text        not null default 'all'
                          check (target in ('all', 'students', 'staff')),
  created_by  uuid        references auth.users on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.announcements enable row level security;

-- Everyone can view announcements
drop policy if exists "Anyone can view announcements" on public.announcements;
create policy "Anyone can view announcements"
  on public.announcements for select using (true);

-- Only admins can manage announcements
drop policy if exists "Admins can manage announcements" on public.announcements;
drop policy if exists "Admins can insert announcements" on public.announcements;
drop policy if exists "Admins can update announcements" on public.announcements;
drop policy if exists "Admins can delete announcements" on public.announcements;

create policy "Admins can insert announcements"
  on public.announcements for insert
  with check (public.is_admin());

create policy "Admins can update announcements"
  on public.announcements for update
  using (public.is_admin());

create policy "Admins can delete announcements"
  on public.announcements for delete
  using (public.is_admin());

-- Create a view to join with profile for creator name (optional but useful)
create or replace view public.announcements_view as
select 
  a.*,
  p.full_name as creator_name
from public.announcements a
left join public.profiles p on a.created_by = p.id;
