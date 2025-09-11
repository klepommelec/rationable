-- Create monthly_templates table for auto-generated templates
CREATE TABLE public.monthly_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month_key text NOT NULL, -- format: "2025-09"
  context text NOT NULL CHECK (context IN ('personal', 'professional')),
  language text NOT NULL CHECK (language IN ('fr', 'en')),
  prompt text NOT NULL,
  news_sources jsonb DEFAULT '[]'::jsonb,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_monthly_templates_lookup ON public.monthly_templates (month_key, context, language, is_active);

-- Enable RLS
ALTER TABLE public.monthly_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can view active templates
CREATE POLICY "Anyone can view active monthly templates" 
ON public.monthly_templates 
FOR SELECT 
USING (is_active = true);

-- Only admins can manage templates
CREATE POLICY "Admins can manage monthly templates" 
ON public.monthly_templates 
FOR ALL 
USING (is_admin());

-- Create function to archive old templates and activate new ones
CREATE OR REPLACE FUNCTION public.rotate_monthly_templates(new_month_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Deactivate all current active templates
  UPDATE public.monthly_templates 
  SET is_active = false, updated_at = now()
  WHERE is_active = true;
  
  -- Activate templates for the new month
  UPDATE public.monthly_templates 
  SET is_active = true, updated_at = now()
  WHERE month_key = new_month_key;
  
  RAISE LOG 'Monthly templates rotated to month: %', new_month_key;
END;
$$;

-- Insert current September 2025 templates
INSERT INTO public.monthly_templates (month_key, context, language, prompt, news_sources) VALUES
-- Personal FR (September 2025)
('2025-09', 'personal', 'fr', 'Avec la rentrée scolaire, comment réorganiser mon budget familial face à l''inflation ?', '[{"source": "INSEE inflation report", "category": "economy"}]'),
('2025-09', 'personal', 'fr', 'Dois-je commencer une nouvelle activité ou formation cet automne ?', '[{"source": "Trends in adult education", "category": "lifestyle"}]'),
('2025-09', 'personal', 'fr', 'Comment mieux équilibrer vie professionnelle et personnelle à la rentrée ?', '[{"source": "Work-life balance studies", "category": "wellness"}]'),

-- Personal EN (September 2025)
('2025-09', 'personal', 'en', 'With back-to-school costs rising, how should I adjust my family budget strategy?', '[{"source": "Consumer price index", "category": "economy"}]'),
('2025-09', 'personal', 'en', 'Should I start a new hobby or skill development this fall?', '[{"source": "Lifelong learning trends", "category": "lifestyle"}]'),
('2025-09', 'personal', 'en', 'How can I better manage work-life balance during the autumn transition?', '[{"source": "Workplace wellness reports", "category": "wellness"}]'),

-- Professional FR (September 2025)
('2025-09', 'professional', 'fr', 'Face aux évolutions de l''IA, dois-je me former à de nouvelles compétences ?', '[{"source": "AI impact on jobs", "category": "technology"}]'),
('2025-09', 'professional', 'fr', 'Comment atteindre mes objectifs du dernier trimestre 2025 ?', '[{"source": "Q4 business strategies", "category": "business"}]'),
('2025-09', 'professional', 'fr', 'Dois-je négocier une évolution de poste avant la fin d''année ?', '[{"source": "Job market trends", "category": "career"}]'),

-- Professional EN (September 2025)  
('2025-09', 'professional', 'en', 'With AI reshaping industries, should I invest in new skill development?', '[{"source": "Future of work reports", "category": "technology"}]'),
('2025-09', 'professional', 'en', 'How should I approach my Q4 goals and year-end performance review?', '[{"source": "Performance management trends", "category": "business"}]'),
('2025-09', 'professional', 'en', 'Should I pursue new career opportunities before 2026?', '[{"source": "Labor market analysis", "category": "career"}]');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_monthly_templates_updated_at
BEFORE UPDATE ON public.monthly_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();