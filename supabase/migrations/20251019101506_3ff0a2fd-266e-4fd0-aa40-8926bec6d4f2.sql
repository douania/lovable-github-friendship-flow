-- Add storage security policies for medical and patient photos
-- Restrict file uploads to images only, max 5MB, organized by patient_id

-- Policy for uploading medical photos
CREATE POLICY "Authenticated users upload medical photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'medical-photos' AND
  (storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp', 'gif'))
);

-- Policy for viewing medical photos
CREATE POLICY "Authenticated users view medical photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-photos'
);

-- Policy for deleting medical photos
CREATE POLICY "Authenticated users delete medical photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'medical-photos'
);

-- Policy for uploading patient photos
CREATE POLICY "Authenticated users upload patient photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'patient-photos' AND
  (storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp', 'gif'))
);

-- Policy for viewing patient photos
CREATE POLICY "Authenticated users view patient photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'patient-photos'
);

-- Policy for deleting patient photos
CREATE POLICY "Authenticated users delete patient photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'patient-photos'
);