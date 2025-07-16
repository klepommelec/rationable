-- Create workspaces table
CREATE TABLE public.workspaces (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#3b82f6',
    user_id UUID NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspace_members table for sharing workspaces
CREATE TABLE public.workspace_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(workspace_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Create policies for workspaces
CREATE POLICY "Users can view their own workspaces" 
ON public.workspaces 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workspaces" 
ON public.workspaces 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workspaces" 
ON public.workspaces 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workspaces" 
ON public.workspaces 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for workspace_members
CREATE POLICY "Users can view workspace members for their workspaces" 
ON public.workspace_members 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.workspaces 
        WHERE workspaces.id = workspace_members.workspace_id 
        AND workspaces.user_id = auth.uid()
    ) OR workspace_members.user_id = auth.uid()
);

CREATE POLICY "Workspace owners can manage members" 
ON public.workspace_members 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.workspaces 
        WHERE workspaces.id = workspace_members.workspace_id 
        AND workspaces.user_id = auth.uid()
    )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_workspaces_updated_at
BEFORE UPDATE ON public.workspaces
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();