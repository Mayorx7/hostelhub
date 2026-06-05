-- Applications table for hostel management system
-- This enables the approve/reject functionality in the admin dashboard

-- ─── Applications Table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign keys
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    
    -- Application details
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    matric_number VARCHAR(20),
    room_type VARCHAR(50),
    application_date TIMESTAMPTZ DEFAULT NOW(),
    processed_date TIMESTAMPTZ,
    processed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Additional metadata
    notes TEXT,
    preferred_block VARCHAR(10),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX idx_applications_profile_id ON applications(profile_id);
CREATE INDEX idx_applications_room_id ON applications(room_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_date ON applications(application_date DESC);

-- ─── Updated At Trigger ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ─── Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

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

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
    ON applications
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Admins can update all applications (for approve/reject)
CREATE POLICY "Admins can update all applications"
    ON applications
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Admins can delete applications
CREATE POLICY "Admins can delete applications"
    ON applications
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ─── Dashboard View ───────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW dashboard_applications_view AS
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

-- ─── Function to Process Application ────────────────────────────────────────

CREATE OR REPLACE FUNCTION process_application(
    app_id UUID,
    new_status VARCHAR(20),
    admin_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    app_record RECORD;
    is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT EXISTS(
        SELECT 1 FROM profiles 
        WHERE id = admin_id AND role = 'admin'
    ) INTO is_admin;
    
    IF NOT is_admin THEN
        RAISE EXCEPTION 'Only admins can process applications';
    END IF;
    
    -- Validate status
    IF new_status NOT IN ('approved', 'rejected') THEN
        RAISE EXCEPTION 'Invalid status. Must be approved or rejected';
    END IF;
    
    -- Get application
    SELECT * INTO app_record 
    FROM applications 
    WHERE id = app_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application not found or already processed';
    END IF;
    
    -- Update application
    UPDATE applications
    SET 
        status = new_status,
        processed_date = NOW(),
        processed_by = admin_id,
        updated_at = NOW()
    WHERE id = app_id;
    
    -- If approved, create booking (optional - customize as needed)
    IF new_status = 'approved' AND app_record.room_id IS NOT NULL THEN
        -- Insert into bookings table if you have one
        -- INSERT INTO bookings (...) VALUES (...);
        
        -- Update room occupancy if needed
        -- UPDATE rooms SET occupied_count = occupied_count + 1 WHERE id = app_record.room_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Grant Permissions ────────────────────────────────────────────────────────

GRANT SELECT, INSERT ON applications TO authenticated;
GRANT UPDATE, DELETE ON applications TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE applications_id_seq TO authenticated;
GRANT SELECT ON dashboard_applications_view TO authenticated;

-- ─── Sample Data (Optional - for testing) ───────────────────────────────────

-- Uncomment to insert test data:
/*
INSERT INTO applications (profile_id, room_id, status, matric_number, room_type, preferred_block)
SELECT 
    p.id,
    (SELECT id FROM rooms ORDER BY RANDOM() LIMIT 1),
    'pending',
    'CST/' || LPAD((ROW_NUMBER() OVER ())::text, 5, '0'),
    (ARRAY['4-Bed Shared', 'Double', 'Single'])[floor(random() * 3 + 1)],
    (ARRAY['A', 'B', 'C', 'D'])[floor(random() * 4 + 1)]
FROM profiles p
WHERE p.role = 'student'
LIMIT 10;
*/
