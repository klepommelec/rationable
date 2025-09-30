-- Fix RLS policies for voting system (Version 2)
-- This script handles existing policies and fixes the infinite recursion issue

-- 1. Drop existing problematic policies (with IF EXISTS to avoid errors)
DROP POLICY IF EXISTS "Users can view participants of decisions they participate in" ON public.decision_participants;
DROP POLICY IF EXISTS "Users can join decisions they are invited to" ON public.decision_participants;
DROP POLICY IF EXISTS "Users can update their own role if they are contributors" ON public.decision_participants;
DROP POLICY IF EXISTS "Users can leave decisions" ON public.decision_participants;
DROP POLICY IF EXISTS "Users can view their own participation" ON public.decision_participants;
DROP POLICY IF EXISTS "Users can insert their own participation" ON public.decision_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.decision_participants;
DROP POLICY IF EXISTS "Users can delete their own participation" ON public.decision_participants;

DROP POLICY IF EXISTS "Users can view votes on decisions they participate in" ON public.decision_votes;
DROP POLICY IF EXISTS "Participants can vote on decision options" ON public.decision_votes;
DROP POLICY IF EXISTS "Users can remove their own votes" ON public.decision_votes;
DROP POLICY IF EXISTS "Authenticated users can view all votes" ON public.decision_votes;
DROP POLICY IF EXISTS "Authenticated users can vote" ON public.decision_votes;

-- 2. Create simplified policies without recursion
-- For decision_participants: Allow users to see their own participation and manage their own records
CREATE POLICY "Users can view their own participation" 
ON public.decision_participants 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own participation" 
ON public.decision_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" 
ON public.decision_participants 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own participation" 
ON public.decision_participants 
FOR DELETE 
USING (auth.uid() = user_id);

-- For decision_votes: Allow any authenticated user to vote (simplified approach)
CREATE POLICY "Authenticated users can view all votes" 
ON public.decision_votes 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can vote" 
ON public.decision_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own votes" 
ON public.decision_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Update the functions to work with simplified policies
CREATE OR REPLACE FUNCTION public.get_decision_vote_counts(decision_id_param TEXT)
RETURNS TABLE(option_name TEXT, vote_count BIGINT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    dv.option_name,
    COUNT(*) as vote_count
  FROM public.decision_votes dv
  WHERE dv.decision_id = decision_id_param
  GROUP BY dv.option_name
  ORDER BY vote_count DESC, option_name;
$$;

CREATE OR REPLACE FUNCTION public.has_user_voted(decision_id_param TEXT, option_name_param TEXT, user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.decision_votes 
    WHERE decision_id = decision_id_param 
    AND option_name = option_name_param 
    AND user_id = user_id_param
  );
$$;

-- 4. Add the current user as a participant for their own decisions (optional)
-- This ensures they can see their own votes
INSERT INTO public.decision_participants (decision_id, user_id, role)
SELECT DISTINCT 
  d.id as decision_id,
  d.user_id,
  'contributor'::participant_role
FROM public.decisions d
WHERE d.user_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.decision_participants dp 
  WHERE dp.decision_id = d.id AND dp.user_id = d.user_id
)
ON CONFLICT (decision_id, user_id) DO NOTHING;
