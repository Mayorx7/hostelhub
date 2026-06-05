-- Paystack Payments Schema

-- Drop existing objects (clean slate)
DROP VIEW IF EXISTS student_payments_view;
DROP TABLE IF EXISTS student_payments CASCADE;

-- Payments table
CREATE TABLE student_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL, -- Amount in naira (not kobo)
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  reference VARCHAR(100) UNIQUE, -- Our reference
  paystack_reference VARCHAR(100), -- Paystack's reference
  payment_date TIMESTAMPTZ,
  description TEXT,
  metadata JSONB, -- Store Paystack response details
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_resident ON student_payments(resident_id);
CREATE INDEX idx_payments_booking ON student_payments(booking_id);
CREATE INDEX idx_payments_status ON student_payments(status);
CREATE INDEX idx_payments_reference ON student_payments(reference);

-- RLS
ALTER TABLE student_payments ENABLE ROW LEVEL SECURITY;

-- Students see only their own payments
CREATE POLICY "Students view own payments"
  ON student_payments FOR SELECT
  TO authenticated
  USING (resident_id = auth.uid());

-- Edge function can create payments (service role)
CREATE POLICY "Service role can manage payments"
  ON student_payments FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Add payment_status to bookings if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending' 
      CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded'));
  END IF;
END $$;

-- View for student payments with details
CREATE VIEW student_payments_view AS
SELECT 
  p.*,
  pr.full_name AS resident_name,
  pr.email AS resident_email,
  b.rooms AS booking_details
FROM student_payments p
LEFT JOIN profiles pr ON p.resident_id = pr.id
LEFT JOIN bookings b ON p.booking_id = b.id;

-- Grant permissions
GRANT SELECT ON student_payments_view TO authenticated;
GRANT SELECT, INSERT ON student_payments TO authenticated;

-- Sample test data (uncomment to test)
/*
INSERT INTO student_payments (resident_id, booking_id, amount, status, reference, description, payment_date)
SELECT 
  b.resident_id,
  b.id,
  b.total_amount,
  'pending',
  'TEST_' || gen_random_uuid(),
  'Hostel accommodation fee',
  NULL
FROM bookings b
WHERE b.status = 'confirmed'
  AND NOT EXISTS (SELECT 1 FROM student_payments WHERE booking_id = b.id)
LIMIT 3;
*/
