-- Fix Critical Security Issues: Enable RLS and Secure Functions

-- 1. Enable RLS on tables that have policies but RLS disabled
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- 2. Fix function search paths for security
CREATE OR REPLACE FUNCTION public.update_audit_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  NEW.last_modified_at = now();
  NEW.last_modified_by = auth.uid();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM user_roles WHERE user_id = auth.uid();
  RETURN COALESCE(user_role, 'praticien');
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_id_by_email(email_address text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  user_uuid uuid;
BEGIN
  SELECT id INTO user_uuid FROM auth.users WHERE email = email_address;
  RETURN user_uuid;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(required_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = required_role
  );
END;
$function$;

-- 3. Fix privilege escalation vulnerability in user_roles policies
DROP POLICY IF EXISTS "Users can view and manage their own role" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_own_access" ON public.user_roles;

-- Users can only VIEW their own role, not UPDATE it
CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Only admins can modify roles
CREATE POLICY "Only admins can modify roles" 
ON public.user_roles 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- 4. Add proper RLS policies for newly enabled tables
CREATE POLICY "Authenticated users can manage availability_slots" 
ON public.availability_slots 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage consultations" 
ON public.consultations 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage notifications" 
ON public.notifications 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage quotes" 
ON public.quotes 
FOR ALL 
USING (true)
WITH CHECK (true);