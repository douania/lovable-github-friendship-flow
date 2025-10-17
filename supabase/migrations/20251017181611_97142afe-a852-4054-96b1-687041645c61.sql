-- Create storage bucket for patient photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'patient-photos',
  'patient-photos',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create patient_photos table
CREATE TABLE IF NOT EXISTS public.patient_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('before', 'after', 'progress')),
  storage_path TEXT NOT NULL,
  photo_date DATE NOT NULL DEFAULT CURRENT_DATE,
  treatment_area TEXT,
  notes TEXT,
  is_visible_to_client BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.patient_photos ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all photos
CREATE POLICY "Admins can view all patient photos"
ON public.patient_photos
FOR SELECT
USING (true);

-- Policy: Admins can insert photos
CREATE POLICY "Admins can insert patient photos"
ON public.patient_photos
FOR INSERT
WITH CHECK (true);

-- Policy: Admins can update photos
CREATE POLICY "Admins can update patient photos"
ON public.patient_photos
FOR UPDATE
USING (true);

-- Policy: Admins can delete photos
CREATE POLICY "Admins can delete patient photos"
ON public.patient_photos
FOR DELETE
USING (true);

-- Storage policies for patient-photos bucket
CREATE POLICY "Admins can upload patient photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'patient-photos');

CREATE POLICY "Admins can view patient photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'patient-photos');

CREATE POLICY "Admins can update patient photos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'patient-photos');

CREATE POLICY "Admins can delete patient photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'patient-photos');

-- Trigger for updated_at
CREATE TRIGGER update_patient_photos_updated_at
BEFORE UPDATE ON public.patient_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_patient_photos_patient_id ON public.patient_photos(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_photos_consultation_id ON public.patient_photos(consultation_id);
CREATE INDEX IF NOT EXISTS idx_patient_photos_photo_date ON public.patient_photos(photo_date DESC);