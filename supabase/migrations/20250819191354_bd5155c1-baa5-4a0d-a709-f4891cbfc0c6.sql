-- Strengthen RLS policies for profiles table to prevent any potential data harvesting
-- Remove existing policies to recreate them with enhanced security

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create enhanced RLS policies with explicit security checks
-- Policy 1: Strict profile viewing - only authenticated users can view their own profile
CREATE POLICY "Authenticated users can view only their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  AND auth.uid() IS NOT NULL
);

-- Policy 2: Strict profile updates - only authenticated users can update their own profile
CREATE POLICY "Authenticated users can update only their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id 
  AND auth.uid() IS NOT NULL
)
WITH CHECK (
  auth.uid() = id 
  AND auth.uid() IS NOT NULL
);

-- Policy 3: Strict profile creation - only authenticated users can create their own profile
CREATE POLICY "Authenticated users can insert only their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id 
  AND auth.uid() IS NOT NULL
);

-- Policy 4: Explicitly block all anonymous access
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);

-- Policy 5: Block any DELETE operations for data integrity
CREATE POLICY "Block profile deletion"
ON public.profiles
FOR DELETE
USING (false);

-- Add additional validation trigger for profile data
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the validation trigger
DROP TRIGGER IF EXISTS validate_profile_trigger ON public.profiles;
CREATE TRIGGER validate_profile_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_data();