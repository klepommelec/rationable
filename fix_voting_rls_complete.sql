-- Script SQL complet pour corriger les politiques RLS et permettre l'accès aux votes, commentaires et partage
-- À exécuter dans le SQL Editor de Supabase Dashboard

-- ============================================
-- 1. CORRIGER LES POLITIQUES RLS POUR decision_votes
-- ============================================

-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Users can view votes on decisions they participate in" ON public.decision_votes;
DROP POLICY IF EXISTS "Participants can vote on decision options" ON public.decision_votes;
DROP POLICY IF EXISTS "Users can remove their own votes" ON public.decision_votes;
DROP POLICY IF EXISTS "Authenticated users can view all votes" ON public.decision_votes;
DROP POLICY IF EXISTS "Authenticated users can vote" ON public.decision_votes;

-- Nouvelle politique : Les utilisateurs peuvent voir les votes sur leurs propres décisions
-- OU sur les décisions où ils sont participants
CREATE POLICY "Users can view votes on their decisions" 
ON public.decision_votes 
FOR SELECT 
USING (
  -- L'utilisateur peut voir les votes sur ses propres décisions
  EXISTS (
    SELECT 1 FROM public.decisions d
    WHERE d.id::text = decision_votes.decision_id
    AND d.user_id = auth.uid()
  )
  OR
  -- OU l'utilisateur est un participant
  EXISTS (
    SELECT 1 FROM public.decision_participants dp 
    WHERE dp.decision_id = decision_votes.decision_id 
    AND dp.user_id = auth.uid()
  )
);

-- Nouvelle politique : Les utilisateurs peuvent voter sur leurs propres décisions
-- OU sur les décisions où ils sont participants
CREATE POLICY "Users can vote on their decisions" 
ON public.decision_votes 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- L'utilisateur peut voter sur ses propres décisions
    EXISTS (
      SELECT 1 FROM public.decisions d
      WHERE d.id::text = decision_votes.decision_id
      AND d.user_id = auth.uid()
    )
    OR
    -- OU l'utilisateur est un participant
    EXISTS (
      SELECT 1 FROM public.decision_participants dp 
      WHERE dp.decision_id = decision_votes.decision_id 
      AND dp.user_id = auth.uid()
    )
  )
);

-- Les utilisateurs peuvent retirer leurs propres votes
CREATE POLICY "Users can remove their own votes" 
ON public.decision_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- 2. CORRIGER LES POLITIQUES RLS POUR decision_participants
-- ============================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view participants of decisions they participate in" ON public.decision_participants;
DROP POLICY IF EXISTS "Users can join decisions they are invited to" ON public.decision_participants;
DROP POLICY IF EXISTS "Users can update their own role if they are contributors" ON public.decision_participants;
DROP POLICY IF EXISTS "Users can leave decisions" ON public.decision_participants;

-- Nouvelle politique : Les utilisateurs peuvent voir les participants de leurs propres décisions
CREATE POLICY "Users can view participants of their decisions" 
ON public.decision_participants 
FOR SELECT 
USING (
  -- L'utilisateur peut voir les participants de ses propres décisions
  EXISTS (
    SELECT 1 FROM public.decisions d
    WHERE d.id::text = decision_participants.decision_id
    AND d.user_id = auth.uid()
  )
  OR
  -- OU l'utilisateur est lui-même un participant
  auth.uid() = user_id
);

-- Les utilisateurs peuvent s'ajouter comme participants (pour leurs propres décisions ou si invités)
CREATE POLICY "Users can join decisions" 
ON public.decision_participants 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- L'utilisateur peut s'ajouter à ses propres décisions
    EXISTS (
      SELECT 1 FROM public.decisions d
      WHERE d.id::text = decision_participants.decision_id
      AND d.user_id = auth.uid()
    )
    OR
    -- OU l'utilisateur est invité (invited_by est défini)
    invited_by IS NOT NULL
  )
);

-- Les utilisateurs peuvent mettre à jour leur propre rôle
CREATE POLICY "Users can update their own participation" 
ON public.decision_participants 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent quitter une décision
CREATE POLICY "Users can leave decisions" 
ON public.decision_participants 
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- 3. CORRIGER LES POLITIQUES RLS POUR decision_comments
-- ============================================

-- Supprimer toutes les anciennes politiques de commentaires (y compris celles qui causent la récursion)
DROP POLICY IF EXISTS "Users can read comments on their participated decisions" ON public.decision_comments;
DROP POLICY IF EXISTS "Users can read comments on accessible decisions" ON public.decision_comments;
DROP POLICY IF EXISTS "Users can create comments on accessible decisions" ON public.decision_comments;
DROP POLICY IF EXISTS "Authenticated users can read comments" ON public.decision_comments;
DROP POLICY IF EXISTS "Users can read comments from their own decisions" ON public.decision_comments;
DROP POLICY IF EXISTS "Users can read comments on their decisions" ON public.decision_comments;
DROP POLICY IF EXISTS "Allow read access to comments" ON public.decision_comments;
DROP POLICY IF EXISTS "Allow insert comments" ON public.decision_comments;
DROP POLICY IF EXISTS "Allow update comments" ON public.decision_comments;
DROP POLICY IF EXISTS "Allow delete comments" ON public.decision_comments;

-- Nouvelle politique : Les utilisateurs peuvent lire les commentaires sur leurs propres décisions
-- IMPORTANT: Pas de récursion - on ne vérifie PAS decision_comments dans cette politique
CREATE POLICY "Users can read comments on their decisions" 
ON public.decision_comments 
FOR SELECT 
USING (
  -- L'utilisateur peut lire ses propres commentaires
  auth.uid() = user_id 
  OR 
  -- OU l'utilisateur peut lire les commentaires sur ses propres décisions (via decisions table)
  EXISTS (
    SELECT 1 FROM public.decisions d
    WHERE d.id::text = decision_comments.decision_id
    AND d.user_id = auth.uid()
  )
  OR
  -- OU l'utilisateur est un participant de la décision (via decision_participants, pas decision_comments)
  EXISTS (
    SELECT 1 FROM public.decision_participants dp
    WHERE dp.decision_id = decision_comments.decision_id
    AND dp.user_id = auth.uid()
  )
  OR
  -- OU la décision est partagée publiquement
  EXISTS (
    SELECT 1 FROM public.shared_decisions sd 
    WHERE sd.decision_data->>'id' = decision_comments.decision_id
    AND ((sd.expires_at IS NULL) OR (sd.expires_at > now()))
  )
);

-- Nouvelle politique : Les utilisateurs peuvent créer des commentaires sur leurs propres décisions
CREATE POLICY "Users can create comments on their decisions" 
ON public.decision_comments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- L'utilisateur peut créer des commentaires sur ses propres décisions
    EXISTS (
      SELECT 1 FROM public.decisions d
      WHERE d.id::text = decision_comments.decision_id
      AND d.user_id = auth.uid()
    )
    OR
    -- OU l'utilisateur est un participant
    EXISTS (
      SELECT 1 FROM public.decision_participants dp
      WHERE dp.decision_id = decision_comments.decision_id
      AND dp.user_id = auth.uid()
    )
    OR
    -- OU la décision est partagée publiquement
    EXISTS (
      SELECT 1 FROM public.shared_decisions sd 
      WHERE sd.decision_data->>'id' = decision_comments.decision_id
      AND ((sd.expires_at IS NULL) OR (sd.expires_at > now()))
    )
  )
);

-- Les utilisateurs peuvent mettre à jour leurs propres commentaires
DROP POLICY IF EXISTS "Users can update their own comments" ON public.decision_comments;
CREATE POLICY "Users can update their own comments" 
ON public.decision_comments 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres commentaires
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.decision_comments;
CREATE POLICY "Users can delete their own comments" 
ON public.decision_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- 4. VÉRIFIER ET CORRIGER LES FONCTIONS RPC
-- ============================================

-- S'assurer que la fonction get_decision_vote_counts existe et fonctionne
-- SECURITY DEFINER permet de contourner RLS, mais on doit quand même vérifier les permissions
CREATE OR REPLACE FUNCTION public.get_decision_vote_counts(decision_id_param TEXT)
RETURNS TABLE(option_name TEXT, vote_count BIGINT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Vérifier que l'utilisateur peut accéder à cette décision
  -- (propriétaire ou participant)
  IF NOT EXISTS (
    SELECT 1 FROM public.decisions d
    WHERE d.id::text = decision_id_param
    AND d.user_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM public.decision_participants dp
    WHERE dp.decision_id = decision_id_param
    AND dp.user_id = auth.uid()
  ) THEN
    -- Retourner un tableau vide si l'utilisateur n'a pas accès
    RETURN;
  END IF;
  
  -- Retourner les comptes de votes
  RETURN QUERY
  SELECT 
    dv.option_name,
    COUNT(*)::BIGINT as vote_count
  FROM public.decision_votes dv
  WHERE dv.decision_id = decision_id_param
  GROUP BY dv.option_name
  ORDER BY vote_count DESC, option_name;
END;
$$;

-- S'assurer que la fonction has_user_voted existe et fonctionne
-- SECURITY DEFINER permet de contourner RLS, mais on doit quand même vérifier les permissions
CREATE OR REPLACE FUNCTION public.has_user_voted(decision_id_param TEXT, option_name_param TEXT, user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Vérifier que l'utilisateur demandé est l'utilisateur authentifié
  IF user_id_param != auth.uid() THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier que l'utilisateur peut accéder à cette décision
  IF NOT EXISTS (
    SELECT 1 FROM public.decisions d
    WHERE d.id::text = decision_id_param
    AND d.user_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM public.decision_participants dp
    WHERE dp.decision_id = decision_id_param
    AND dp.user_id = auth.uid()
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier si l'utilisateur a voté
  RETURN EXISTS (
    SELECT 1 
    FROM public.decision_votes 
    WHERE decision_id = decision_id_param 
    AND option_name = option_name_param 
    AND user_id = user_id_param
  );
END;
$$;

-- ============================================
-- 5. VÉRIFIER QUE LES TABLES EXISTENT ET ONT RLS ACTIVÉ
-- ============================================

-- S'assurer que RLS est activé sur toutes les tables concernées
ALTER TABLE public.decision_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_decisions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. CRÉER UN INDEX POUR AMÉLIORER LES PERFORMANCES
-- ============================================

-- Index pour améliorer les requêtes de votes par decision_id
CREATE INDEX IF NOT EXISTS idx_decision_votes_decision_id_option ON public.decision_votes (decision_id, option_name);
CREATE INDEX IF NOT EXISTS idx_decision_participants_decision_user ON public.decision_participants (decision_id, user_id);

-- ============================================
-- FIN DU SCRIPT
-- ============================================

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Toutes les politiques RLS ont été corrigées avec succès !';
  RAISE NOTICE 'Les utilisateurs peuvent maintenant :';
  RAISE NOTICE '  - Voir et voter sur leurs propres décisions';
  RAISE NOTICE '  - Voir et créer des commentaires sur leurs propres décisions';
  RAISE NOTICE '  - Partager leurs décisions';
END $$;

