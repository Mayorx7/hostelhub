-- Applications table for hostel management system
-- SAFE VERSION - No conflicts with existing schema.sql
-- Run this AFTER schema.sql is already applied

-- ─── Applications Table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign keys (profiles and rooms already exist in schema.sql)
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    
    -- Application details
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    matric_number VARCHAR(20),
    room_type VARCHAR(50),
    application_date TIMESTAMPTZ DEFAULT NOW(),
    processed_date TIMESTAMPTZ,
    processed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    notes TEXT,
    preferred_block VARCHAR(10),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_applications_profile_id ON applications(profile_id);
CREATE INDEX IF NOT EXISTS idx_applications_room_id ON applications(room_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_date ON applications(application_date DESC);

-- ─── Updated At Trigger (using unique name to avoid conflicts) ──────────────

CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_applications_updated_at ON applications;
CREATE TRIGGER trg_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_applications_updated_at();

-- ─── Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Students can view own applications" ON applications;
DROP POLICY IF EXISTS "Students can create own applications" ON applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON applications;
DROP POLICY IF EXISTS "Admins can update all applications" ON applications;
DROP POLICY IF EXISTS "Admins can delete applications" ON applications;

-- Students can view their own applications
CREATE POLICY "Students can view own applications"
    ON applications
    FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid());

-- Students can create their own applications
CREATE POLICY "Students can create own applications"
    ON applications
    FOR INSERT
    TO authenticated
    WITH CHECK (profile_id = auth.uid());

-- Admins can view all applications (uses existing is_admin() from schema.sql)
CREATE POLICY "Admins can view all applications"
    ON applications
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Admins can update all applications (for approve/reject)
CREATE POLICY "Admins can update all applications"
    ON applications
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Admins can delete applications
CREATE POLICY "Admins can delete applications"
    ON applications
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ─── Dashboard View ───────────────────────────────────────────────────────────

DROP VIEW IF EXISTS dashboard_applications_view;
CREATE VIEW dashboard_applications_view AS
SELECT 
    a.id,
    a.profile_id,
    a.status,
    a.matric_number,
    a.room_type,
    a.application_date,
    p.full_name AS applicant_name,
    p.email AS applicant_email
FROM applications a
LEFT JOIN profiles p ON a.profile_id = p.id
ORDER BY a.application_date DESC;

-- ─── Grant Permissions ────────────────────────────────────────────────────────

GRANT SELECT, INSERT ON applications TO authenticated;
GRANT UPDATE, DELETE ON applications TO authenticated;
GRANT SELECT ON dashboard_applications_view TO authenticated;

-- ─── Sample Test Data (Optional) ─────────────────────────────────────────────

-- Uncomment and run to create test applications:
/*
INSERT INTO applications (profile_id, room_id, status, matric_number, room_type, preferred_block)
SELECT 
    p.id,
    (SELECT id FROM rooms WHERE status = 'available' LIMIT 1),
    'pending',
    COALESCE(p.matric_number, 'CST/' || LPAD((ROW_NUMBER() OVER ())::text, 5, '0')),
    (ARRAY['4-Bed Shared', 'Double', 'Single'])[1 + (ROW_NUMBER() OVER () % 3)],
    (ARRAY['A', 'B', 'C', 'D'])[1 + (ROW_NUMBER() OVER () % 4)]
FROM profiles p
WHERE p.role = 'student'
  AND NOT EXISTS (SELECT 1 FROM applications WHERE profile_id = p.id)
LIMIT 5;
*/
