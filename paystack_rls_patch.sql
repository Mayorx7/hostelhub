-- ============================================================
-- HostelHub — Paystack Payment RLS Patch
-- Run this in Supabase SQL Editor to allow students to
-- insert their own payment records after Paystack confirms.
-- ============================================================

-- Allow students to insert their own payment records
drop policy if exists "Students can insert own payments" on public.student_payments;
create policy "Students can insert own payments"
  on public.student_payments for insert
  with check (auth.uid() = resident_id);
