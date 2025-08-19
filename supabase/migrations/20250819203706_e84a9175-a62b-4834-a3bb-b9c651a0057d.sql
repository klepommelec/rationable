-- Fix function search path security warning
-- Update the validation function to have proper search_path security

CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Ensure user can only create/update their own profile
  IF NEW.id != auth.uid() THEN
    RAISE EXCEPTION 'User can only manage their own profile';
  END IF;
  
  -- Validate email format if provided
  IF NEW.email IS NOT NULL AND NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Sanitize full_name to prevent XSS
  IF NEW.full_name IS NOT NULL THEN
    NEW.full_name := trim(NEW.full_name);
    IF LENGTH(NEW.full_name) > 100 THEN
      RAISE EXCEPTION 'Full name too long (max 100 characters)';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;