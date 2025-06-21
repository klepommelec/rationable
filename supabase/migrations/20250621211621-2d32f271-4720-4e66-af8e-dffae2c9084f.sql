
-- Create enum for template status
CREATE TYPE public.template_status AS ENUM ('pending', 'approved', 'rejected');

-- Create table for community templates
CREATE TABLE public.community_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  public_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  author_name TEXT, -- Optional: can be anonymous
  decision_data JSONB NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  status template_status DEFAULT 'pending',
  copy_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_community_templates_status ON public.community_templates(status);
CREATE INDEX idx_community_templates_category ON public.community_templates(category);
CREATE INDEX idx_community_templates_created_at ON public.community_templates(created_at DESC);
CREATE INDEX idx_community_templates_copy_count ON public.community_templates(copy_count DESC);
CREATE INDEX idx_community_templates_like_count ON public.community_templates(like_count DESC);
CREATE INDEX idx_community_templates_tags ON public.community_templates USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE public.community_templates ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to read approved templates
CREATE POLICY "Anyone can view approved templates" 
  ON public.community_templates 
  FOR SELECT 
  USING (status = 'approved');

-- Create policy that allows anyone to insert templates (for community sharing)
CREATE POLICY "Anyone can create templates" 
  ON public.community_templates 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that allows updating copy count and like count
CREATE POLICY "Anyone can update counters" 
  ON public.community_templates 
  FOR UPDATE 
  USING (status = 'approved')
  WITH CHECK (status = 'approved');

-- Function to generate a unique public ID for templates
CREATE OR REPLACE FUNCTION generate_template_public_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN 'tpl_' || result;
END;
$$ LANGUAGE plpgsql;

-- Function to increment copy count
CREATE OR REPLACE FUNCTION increment_template_copy_count(template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.community_templates 
  SET copy_count = copy_count + 1,
      updated_at = now()
  WHERE id = template_id AND status = 'approved';
END;
$$ LANGUAGE plpgsql;

-- Function to increment like count
CREATE OR REPLACE FUNCTION increment_template_like_count(template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.community_templates 
  SET like_count = like_count + 1,
      updated_at = now()
  WHERE id = template_id AND status = 'approved';
END;
$$ LANGUAGE plpgsql;
