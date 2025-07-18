-- Create workspace_documents table for centralized document management
CREATE TABLE public.workspace_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  content_extracted TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

-- Create document_content table for searchable content
CREATE TABLE public.document_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.workspace_documents(id) ON DELETE CASCADE,
  content_text TEXT NOT NULL,
  content_chunks TEXT[] DEFAULT '{}', -- For semantic search chunks
  extracted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  extraction_method TEXT DEFAULT 'text' -- 'text', 'ocr', 'pdf_parse'
);

-- Enable RLS
ALTER TABLE public.workspace_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_content ENABLE ROW LEVEL SECURITY;

-- RLS policies for workspace_documents
CREATE POLICY "Users can view documents from their workspaces" 
ON public.workspace_documents 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.workspaces 
  WHERE workspaces.id = workspace_documents.workspace_id 
  AND workspaces.user_id = auth.uid()
));

CREATE POLICY "Users can insert documents to their workspaces" 
ON public.workspace_documents 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.workspaces 
  WHERE workspaces.id = workspace_documents.workspace_id 
  AND workspaces.user_id = auth.uid()
));

CREATE POLICY "Users can update documents from their workspaces" 
ON public.workspace_documents 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.workspaces 
  WHERE workspaces.id = workspace_documents.workspace_id 
  AND workspaces.user_id = auth.uid()
));

CREATE POLICY "Users can delete documents from their workspaces" 
ON public.workspace_documents 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.workspaces 
  WHERE workspaces.id = workspace_documents.workspace_id 
  AND workspaces.user_id = auth.uid()
));

-- RLS policies for document_content
CREATE POLICY "Users can view content from their workspace documents" 
ON public.document_content 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.workspace_documents wd
  JOIN public.workspaces w ON w.id = wd.workspace_id
  WHERE wd.id = document_content.document_id 
  AND w.user_id = auth.uid()
));

CREATE POLICY "Users can manage content from their workspace documents" 
ON public.document_content 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.workspace_documents wd
  JOIN public.workspaces w ON w.id = wd.workspace_id
  WHERE wd.id = document_content.document_id 
  AND w.user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_workspace_documents_workspace_id ON public.workspace_documents(workspace_id);
CREATE INDEX idx_workspace_documents_category ON public.workspace_documents(category);
CREATE INDEX idx_workspace_documents_tags ON public.workspace_documents USING GIN(tags);
CREATE INDEX idx_document_content_document_id ON public.document_content(document_id);
CREATE INDEX idx_document_content_text_search ON public.document_content USING GIN(to_tsvector('english', content_text));

-- Create function to update usage stats
CREATE OR REPLACE FUNCTION public.update_document_usage(doc_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.workspace_documents 
  SET usage_count = usage_count + 1,
      last_used_at = now()
  WHERE id = doc_id;
END;
$$;