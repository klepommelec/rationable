-- Fix security vulnerability in rate_limits table
-- Remove overly permissive RLS policies and create secure ones

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Rate limits are public for checking" ON public.rate_limits;
DROP POLICY IF EXISTS "Rate limits can be updated" ON public.rate_limits;

-- Create secure policies that only allow system functions to access the table
-- The check_rate_limit() function uses SECURITY DEFINER so it can bypass these policies

-- Policy 1: Only allow system administrators to directly query rate limits for monitoring
CREATE POLICY "System admins can view rate limits" 
ON public.rate_limits 
FOR SELECT 
USING (
  -- Only allow if user has admin role in profiles table
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (
      -- Check if user has admin privileges (can be extended with role system later)
      email ILIKE '%@admin.%' 
      OR email IN ('admin@example.com') -- Add specific admin emails as needed
    )
  )
);

-- Policy 2: Completely block direct INSERT/UPDATE/DELETE operations
-- The system function check_rate_limit() will handle all modifications using SECURITY DEFINER
CREATE POLICY "Block direct modifications" 
ON public.rate_limits 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Create a cleanup function to remove old rate limit records (for maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Remove rate limit records older than 7 days
  DELETE FROM public.rate_limits 
  WHERE window_start < now() - interval '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Add a comment explaining the security model
COMMENT ON TABLE public.rate_limits IS 'Rate limiting data - access restricted to system functions only. Use check_rate_limit() function for rate limit checks.';
COMMENT ON FUNCTION public.check_rate_limit(text, text, integer, integer) IS 'Secure rate limiting function - uses SECURITY DEFINER to bypass RLS policies';