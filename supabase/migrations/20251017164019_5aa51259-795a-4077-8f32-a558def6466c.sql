-- Fix Critical Security Issues: RLS Policies and Remove Deprecated Auth Tables

-- =====================================================
-- 1. FIX PATIENTS TABLE - Remove Anonymous Access
-- =====================================================
DROP POLICY IF EXISTS "Anonymous can view patients" ON patients;
DROP POLICY IF EXISTS "patients_anon_select" ON patients;

-- Keep existing authenticated access policies
-- (Admin and authenticated full access to patients already exists)


-- =====================================================
-- 2. FIX INVOICES TABLE - Implement Patient Isolation
-- =====================================================
DROP POLICY IF EXISTS "invoices_authenticated_access" ON invoices;
DROP POLICY IF EXISTS "Admin and authenticated full access to invoices" ON invoices;

-- Patients can only view their own invoices
CREATE POLICY "Patients view own invoices"
ON invoices FOR SELECT
TO authenticated
USING (
  patient_id IN (
    SELECT id FROM patients 
    WHERE id = auth.uid()
  )
  OR
  has_role('admin') OR has_role('praticien')
);

-- Only staff can insert/update/delete invoices
CREATE POLICY "Staff manage invoices"
ON invoices FOR ALL
TO authenticated
USING (has_role('admin') OR has_role('praticien'))
WITH CHECK (has_role('admin') OR has_role('praticien'));


-- =====================================================
-- 3. REMOVE DEPRECATED CLIENT AUTH TABLES
-- =====================================================
-- Drop all deprecated client authentication tables and functions
DROP TABLE IF EXISTS client_sessions CASCADE;
DROP TABLE IF EXISTS client_activity_logs CASCADE;
DROP TABLE IF EXISTS client_access CASCADE;
DROP FUNCTION IF EXISTS create_client_access_for_patient() CASCADE;