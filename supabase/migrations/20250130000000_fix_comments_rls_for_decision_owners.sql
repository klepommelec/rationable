-- Fix RLS policies for comments to allow decision owners to read comments
-- This migration fixes the issue where users cannot see comments on their own decisions
-- until they have already created a comment

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can read comments on their participated decisions" ON public.decision_comments;

-- Create a new policy that allows:
-- 1. Users to read comments on decisions they created (via decisions.user_id)
-- 2. Users to read comments on decisions where they have participated (existing logic)
-- 3. Users to read comments on publicly shared decisions
CREATE POLICY "Users can read comments on accessible decisions" 
ON public.decision_comments 
FOR SELECT 
USING (
  -- Users can read their own comments
  auth.uid() = user_id 
  OR 
  -- Users can read comments on decisions where they have participated
  EXISTS (
    SELECT 1 FROM public.decision_comments dc2 
    WHERE dc2.decision_id = decision_comments.decision_id 
    AND dc2.user_id = auth.uid()
  )
  OR
  -- Users can read comments on decisions they created (NEW - fixes the main issue)
  EXISTS (
    SELECT 1 FROM public.decisions d
    WHERE d.id::text = decision_comments.decision_id
    AND d.user_id = auth.uid()
  )
  OR
  -- Users can read comments on publicly shared decisions
  EXISTS (
    SELECT 1 FROM public.shared_decisions sd 
    WHERE sd.decision_data->>'id' = decision_comments.decision_id
    AND ((sd.expires_at IS NULL) OR (sd.expires_at > now()))
  )
);

-- Also ensure users can create comments on their own decisions
-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.decision_comments;
DROP POLICY IF EXISTS "Users can create comments on their decisions" ON public.decision_comments;

-- Create policy to allow comment creation on:
-- 1. Decisions the user created
-- 2. Decisions where the user is a participant
-- 3. Publicly shared decisions
CREATE POLICY "Users can create comments on accessible decisions" 
ON public.decision_comments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- User created the decision
    EXISTS (
      SELECT 1 FROM public.decisions d
      WHERE d.id::text = decision_comments.decision_id
      AND d.user_id = auth.uid()
    )
    OR
    -- User is a participant
    EXISTS (
      SELECT 1 FROM public.decision_participants dp
      WHERE dp.decision_id = decision_comments.decision_id
      AND dp.user_id = auth.uid()
    )
    OR
    -- Decision is publicly shared
    EXISTS (
      SELECT 1 FROM public.shared_decisions sd 
      WHERE sd.decision_data->>'id' = decision_comments.decision_id
      AND ((sd.expires_at IS NULL) OR (sd.expires_at > now()))
    )
  )
);






