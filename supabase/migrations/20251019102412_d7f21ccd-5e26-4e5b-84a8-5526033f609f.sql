-- Phase 1: Critical Security Fixes (Clean Version)
-- Fix overly permissive RLS policies

-- PATIENTS TABLE - Replace permissive policies with restrictive ones
DROP POLICY IF EXISTS "Admins and praticiens full access to patients" ON public.patients;
DROP POLICY IF EXISTS "Patients view own record" ON public.patients;
DROP POLICY IF EXISTS "Patients update own record" ON public.patients;

CREATE POLICY "Admins and praticiens full access to patients"
ON public.patients FOR ALL TO authenticated
USING (has_role('admin') OR has_role('praticien'))
WITH CHECK (has_role('admin') OR has_role('praticien'));

CREATE POLICY "Patients view own record"
ON public.patients FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Patients update own record"
ON public.patients FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- APPOINTMENTS TABLE - Restrict to staff and patient's own data
DROP POLICY IF EXISTS "Staff manage all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Patients view own appointments" ON public.appointments;

CREATE POLICY "Staff manage all appointments"
ON public.appointments FOR ALL TO authenticated
USING (has_role('admin') OR has_role('praticien') OR has_role('staff'))
WITH CHECK (has_role('admin') OR has_role('praticien') OR has_role('staff'));

CREATE POLICY "Patients view own appointments"
ON public.appointments FOR SELECT TO authenticated
USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- CONSULTATIONS TABLE - Proper access control
DROP POLICY IF EXISTS "Staff full access to consultations" ON public.consultations;
DROP POLICY IF EXISTS "Patients view own consultations" ON public.consultations;

CREATE POLICY "Staff full access to consultations"
ON public.consultations FOR ALL TO authenticated
USING (has_role('admin') OR has_role('praticien'))
WITH CHECK (has_role('admin') OR has_role('praticien'));

CREATE POLICY "Patients view own consultations"
ON public.consultations FOR SELECT TO authenticated
USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- PATIENT PHOTOS TABLE - Staff access + patients see visible photos only
DROP POLICY IF EXISTS "Staff full access to patient photos" ON public.patient_photos;
DROP POLICY IF EXISTS "Patients view own visible photos" ON public.patient_photos;

CREATE POLICY "Staff full access to patient photos"
ON public.patient_photos FOR ALL TO authenticated
USING (has_role('admin') OR has_role('praticien'))
WITH CHECK (has_role('admin') OR has_role('praticien'));

CREATE POLICY "Patients view own visible photos"
ON public.patient_photos FOR SELECT TO authenticated
USING (
  patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  AND is_visible_to_client = true
);

-- INVOICES TABLE - Staff manage, patients view own
DROP POLICY IF EXISTS "Staff manage all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Patients view own invoices" ON public.invoices;

CREATE POLICY "Staff manage all invoices"
ON public.invoices FOR ALL TO authenticated
USING (has_role('admin') OR has_role('praticien') OR has_role('staff'))
WITH CHECK (has_role('admin') OR has_role('praticien') OR has_role('staff'));

CREATE POLICY "Patients view own invoices"
ON public.invoices FOR SELECT TO authenticated
USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));