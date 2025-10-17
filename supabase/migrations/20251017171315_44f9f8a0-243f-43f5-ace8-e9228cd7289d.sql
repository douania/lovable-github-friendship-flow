-- Fix RLS policies for consultations table
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Admin and authenticated full access to consultations" ON consultations;
DROP POLICY IF EXISTS "Anonymous can view consultations" ON consultations;
DROP POLICY IF EXISTS "Authenticated users can manage consultations" ON consultations;

-- Patients can view their own consultations
CREATE POLICY "Patients view own consultations"
ON consultations FOR SELECT
TO authenticated
USING (
  patient_id IN (
    SELECT id FROM patients WHERE id = auth.uid()
  ) OR
  practitioner_id = auth.uid() OR
  is_admin()
);

-- Only practitioners and admins can create consultations
CREATE POLICY "Practitioners create consultations"
ON consultations FOR INSERT
TO authenticated
WITH CHECK (
  practitioner_id = auth.uid() OR is_admin()
);

-- Only practitioners can update their own consultations
CREATE POLICY "Practitioners update own consultations"
ON consultations FOR UPDATE
TO authenticated
USING (
  practitioner_id = auth.uid() OR is_admin()
);

-- Only admins can delete consultations
CREATE POLICY "Admins delete consultations"
ON consultations FOR DELETE
TO authenticated
USING (is_admin());

-- Create storage bucket for medical photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-photos',
  'medical-photos',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for medical photos storage
-- Patients can view their own photos
CREATE POLICY "Patients view own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-photos' AND
  (
    -- File path structure: patient_id/consultation_id/filename
    (storage.foldername(name))[1] = auth.uid()::text OR
    -- Or if user is practitioner/admin
    EXISTS (
      SELECT 1 FROM consultations c
      WHERE (storage.foldername(name))[2]::uuid = c.id
      AND (c.practitioner_id = auth.uid() OR is_admin())
    )
  )
);

-- Practitioners can upload photos for consultations
CREATE POLICY "Practitioners upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'medical-photos' AND
  (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'praticien')
    )
  )
);

-- Practitioners can update/delete their own consultation photos
CREATE POLICY "Practitioners manage photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'medical-photos' AND
  EXISTS (
    SELECT 1 FROM consultations c
    WHERE (storage.foldername(name))[2]::uuid = c.id
    AND (c.practitioner_id = auth.uid() OR is_admin())
  )
);

CREATE POLICY "Practitioners delete photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'medical-photos' AND
  EXISTS (
    SELECT 1 FROM consultations c
    WHERE (storage.foldername(name))[2]::uuid = c.id
    AND (c.practitioner_id = auth.uid() OR is_admin())
  )
);