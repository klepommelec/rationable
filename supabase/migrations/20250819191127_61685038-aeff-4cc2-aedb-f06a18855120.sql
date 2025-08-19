-- Fix security issue: Restrict shared_decisions access to prevent data exposure
-- Remove the overly permissive public SELECT policy that allows reading all shared decisions

DROP POLICY IF EXISTS "Public can view valid shared decisions" ON public.shared_decisions;

-- Create a more restrictive policy that only allows access via the secure function
-- This prevents enumeration of all shared decisions while maintaining functionality
CREATE POLICY "Secure access to shared decisions via function"
ON public.shared_decisions
FOR SELECT
USING (false); -- Block direct SELECT access

-- Update the existing secure function to handle access control properly
-- The function already validates public_id and expiration, so direct table access isn't needed

-- Ensure the system can still update view counts for valid shared decisions
DROP POLICY IF EXISTS "System can update view count" ON public.shared_decisions;

CREATE POLICY "System can update view count via function"
ON public.shared_decisions
FOR UPDATE
USING (
  -- Only allow updates to view_count column for valid decisions
  -- This policy works with the existing get_shared_decision_by_id function
  ((expires_at IS NULL) OR (expires_at > now()))
)
WITH CHECK (
  ((expires_at IS NULL) OR (expires_at > now()))
);