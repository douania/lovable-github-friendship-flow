-- Phase 1: Critical Security Fixes
-- Add user_id to patients table and implement proper RLS policies

-- Step 1: Add user_id column to patients table (nullable for existing data)
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);

-- Step 3: Drop overly permissive policies and create restrictive ones

-- PATIENTS TABLE
DROP POLICY IF EXISTS "Admin and authenticated full access to patients" ON public.patients;
DROP POLICY IF EXISTS "patients_authenticated_access" ON public.patients;

-- Admins and praticiens can manage all patients
CREATE POLICY "Admins and praticiens full access to patients"
ON public.patients
FOR ALL
TO authenticated
USING (
  has_role('admin') OR has_role('praticien')
)
WITH CHECK (
  has_role('admin') OR has_role('praticien')
);

-- Patients can view and update only their own record
CREATE POLICY "Patients view own record"
ON public.patients
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Patients update own record"
ON public.patients
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- APPOINTMENTS TABLE
DROP POLICY IF EXISTS "Admin and authenticated full access to appointments" ON public.appointments;
DROP POLICY IF EXISTS "appointments_authenticated_access" ON public.appointments;
DROP POLICY IF EXISTS "Anonymous can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "appointments_anon_select" ON public.appointments;

-- Staff can manage all appointments
CREATE POLICY "Staff manage all appointments"
ON public.appointments
FOR ALL
TO authenticated
USING (
  has_role('admin') OR has_role('praticien') OR has_role('staff')
)
WITH CHECK (
  has_role('admin') OR has_role('praticien') OR has_role('staff')
);

-- Patients can view their own appointments
CREATE POLICY "Patients view own appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (
  patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  )
);

-- CONSULTATIONS TABLE (already has good policies, but let's ensure they're comprehensive)
DROP POLICY IF EXISTS "Patients view own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Practitioners create consultations" ON public.consultations;
DROP POLICY IF EXISTS "Practitioners update own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Admins delete consultations" ON public.consultations;

-- Staff full access to consultations
CREATE POLICY "Staff full access to consultations"
ON public.consultations
FOR ALL
TO authenticated
USING (
  has_role('admin') OR has_role('praticien')
)
WITH CHECK (
  has_role('admin') OR has_role('praticien')
);

-- Patients view their own consultations
CREATE POLICY "Patients view own consultations"
ON public.consultations
FOR SELECT
TO authenticated
USING (
  patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  )
);

-- PATIENT PHOTOS TABLE
DROP POLICY IF EXISTS "Admins can view all patient photos" ON public.patient_photos;
DROP POLICY IF EXISTS "Admins can insert patient photos" ON public.patient_photos;
DROP POLICY IF EXISTS "Admins can update patient photos" ON public.patient_photos;
DROP POLICY IF EXISTS "Admins can delete patient photos" ON public.patient_photos;

-- Staff full access to patient photos
CREATE POLICY "Staff full access to patient photos"
ON public.patient_photos
FOR ALL
TO authenticated
USING (
  has_role('admin') OR has_role('praticien')
)
WITH CHECK (
  has_role('admin') OR has_role('praticien')
);

-- Patients view their own visible photos
CREATE POLICY "Patients view own visible photos"
ON public.patient_photos
FOR SELECT
TO authenticated
USING (
  patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  )
  AND is_visible_to_client = true
);

-- INVOICES TABLE (already has good policies, ensure they're using patient link properly)
DROP POLICY IF EXISTS "Patients view own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Staff manage invoices" ON public.invoices;

-- Staff full access
CREATE POLICY "Staff manage all invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (
  has_role('admin') OR has_role('praticien') OR has_role('staff')
)
WITH CHECK (
  has_role('admin') OR has_role('praticien') OR has_role('staff')
);

-- Patients view their own invoices
CREATE POLICY "Patients view own invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (
  patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  )
);