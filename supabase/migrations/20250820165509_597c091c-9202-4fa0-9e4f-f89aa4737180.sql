-- Fix security vulnerability: Replace email pattern matching with proper role-based access control

-- 1. Create an enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table for proper RBAC
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 6. Create helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- 7. Drop the vulnerable RLS policy on rate_limits
DROP POLICY IF EXISTS "System admins can view rate limits" ON public.rate_limits;

-- 8. Create secure RLS policy using proper role-based access control
CREATE POLICY "Admins can view rate limits" 
ON public.rate_limits 
FOR SELECT 
USING (public.is_admin());

-- 9. Create trigger to ensure data validation for user_roles
CREATE OR REPLACE FUNCTION public.validate_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure user_id is provided
  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;
  
  -- Ensure role is provided
  IF NEW.role IS NULL THEN
    RAISE EXCEPTION 'Role cannot be null';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_user_role_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_role();

-- 10. Insert initial admin user if needed (replace with actual admin email)
-- Note: This should be updated with the actual admin email after deployment
-- INSERT INTO public.user_roles (user_id, role, created_by) 
-- SELECT id, 'admin'::app_role, id 
-- FROM auth.users 
-- WHERE email = 'your-admin-email@domain.com'
-- ON CONFLICT (user_id, role) DO NOTHING;