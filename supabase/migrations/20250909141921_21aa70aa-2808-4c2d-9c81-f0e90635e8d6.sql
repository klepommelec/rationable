-- Create workspace_invitations table
CREATE TABLE public.workspace_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  token TEXT UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, email)
);

-- Enable RLS
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Workspace owners can view invitations for their workspaces"
ON public.workspace_invitations
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.workspaces 
  WHERE workspaces.id = workspace_invitations.workspace_id 
  AND workspaces.user_id = auth.uid()
));

CREATE POLICY "Workspace owners can create invitations for their workspaces"
ON public.workspace_invitations
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.workspaces 
  WHERE workspaces.id = workspace_invitations.workspace_id 
  AND workspaces.user_id = auth.uid()
));

CREATE POLICY "Workspace owners can update invitations for their workspaces"
ON public.workspace_invitations
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.workspaces 
  WHERE workspaces.id = workspace_invitations.workspace_id 
  AND workspaces.user_id = auth.uid()
));

CREATE POLICY "Workspace owners can delete invitations for their workspaces"
ON public.workspace_invitations
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.workspaces 
  WHERE workspaces.id = workspace_invitations.workspace_id 
  AND workspaces.user_id = auth.uid()
));

-- Create function to generate invitation token
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..32 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_workspace_invitations_updated_at
BEFORE UPDATE ON public.workspace_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to cleanup expired invitations
CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  UPDATE public.workspace_invitations 
  SET status = 'expired'
  WHERE expires_at < now() AND status = 'pending';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;