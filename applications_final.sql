-- Applications SQL - Clean run

-- 1. Drop view first (depends on table)
DROP VIEW IF EXISTS dashboard_applications_view;

-- 2. Recreate table with all columns
DROP TABLE IF EXISTS applications CASCADE;

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  matric_number VARCHAR(20),
  room_type VARCHAR(50),
  application_date TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Index
CREATE INDEX idx_applications_status ON applications(status);

-- 4. RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins update applications" ON applications;
CREATE POLICY "Admins update applications"
  ON applications FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins view applications" ON applications;
CREATE POLICY "Admins view applications"
  ON applications FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. View
CREATE VIEW dashboard_applications_view AS
SELECT 
  a.id,
  a.profile_id,
  a.status,
  a.matric_number,
  a.room_type,
  a.application_date,
  p.full_name AS applicant_name
FROM applications a
LEFT JOIN profiles p ON a.profile_id = p.id
ORDER BY a.application_date DESC;

GRANT SELECT ON dashboard_applications_view TO authenticated;
