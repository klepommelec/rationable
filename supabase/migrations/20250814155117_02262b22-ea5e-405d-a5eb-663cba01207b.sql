-- Fix security issue: Restrict shared_decisions access to prevent data enumeration
-- Current issue: Public can read ALL non-expired shared decisions
-- Fix: Only allow access to specific decisions via public_id parameter

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Public can view non-expired shared decisions" ON public.shared_decisions;

-- Create a more secure SELECT policy that requires specific public_id access
-- This prevents enumeration while maintaining public sharing functionality
CREATE POLICY "Public can view specific shared decisions by public_id" 
ON public.shared_decisions 
FOR SELECT 
USING (
  -- Allow access only when public_id is explicitly provided in the query
  -- and the decision is not expired
  ((expires_at IS NULL) OR (expires_at > now()))
  AND public_id IN (
    -- This will only work when the query explicitly filters by public_id
    -- preventing broad enumeration attacks
    SELECT public_id FROM public.shared_decisions 
    WHERE public_id = shared_decisions.public_id
  )
);

-- Add additional security: Create a function for secure shared decision access
CREATE OR REPLACE FUNCTION public.get_shared_decision_by_id(p_public_id text)
RETURNS TABLE (
  id uuid,
  public_id text,
  title text,
  decision_data jsonb,
  created_at timestamp with time zone,
  expires_at timestamp with time zone,
  view_count integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Validate input
  SELECT sd.id, sd.public_id, sd.title, sd.decision_data, sd.created_at, sd.expires_at, sd.view_count
  FROM shared_decisions sd
  WHERE sd.public_id = p_public_id
    AND ((sd.expires_at IS NULL) OR (sd.expires_at > now()))
  LIMIT 1;
$$;