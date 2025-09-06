-- Create table for template previews
CREATE TABLE public.template_previews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  preview_id text NOT NULL UNIQUE,
  decision_data jsonb NOT NULL,
  client_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Enable Row Level Security
ALTER TABLE public.template_previews ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Anyone can view non-expired template previews" 
ON public.template_previews 
FOR SELECT 
USING (expires_at > now());

CREATE POLICY "Anyone can create template previews" 
ON public.template_previews 
FOR INSERT 
WITH CHECK (expires_at > now());

-- Create index for performance
CREATE INDEX idx_template_previews_preview_id ON public.template_previews(preview_id);
CREATE INDEX idx_template_previews_expires ON public.template_previews(expires_at);
CREATE INDEX idx_template_previews_client_id ON public.template_previews(client_id);

-- Function to cleanup expired previews
CREATE OR REPLACE FUNCTION public.cleanup_expired_template_previews()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.template_previews 
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;