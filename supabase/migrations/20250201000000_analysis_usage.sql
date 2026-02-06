-- Table pour le suivi d'usage des analyses (tokens + coût estimé) pour pricing
CREATE TABLE IF NOT EXISTS public.analysis_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision_id uuid NOT NULL,
  provider text NOT NULL,
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  estimated_cost_usd numeric(12, 6) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analysis_usage_user_created ON public.analysis_usage (user_id, created_at DESC);

ALTER TABLE public.analysis_usage ENABLE ROW LEVEL SECURITY;

-- RLS: l'utilisateur ne voit et n'insère que ses propres lignes
CREATE POLICY "Users can view own analysis_usage"
  ON public.analysis_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis_usage"
  ON public.analysis_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Pas de UPDATE/DELETE prévus pour l'instant (historique en lecture seule)

COMMENT ON TABLE public.analysis_usage IS 'Suivi tokens et coût estimé par analyse pour pricing / coût moyen';
