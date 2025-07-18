import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, fileUrl, fileType } = await req.json();

    console.log('Processing document:', { documentId, fileType });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let extractedText = '';
    let extractionMethod = 'text';

    // Simple text extraction based on file type
    if (fileType === 'text/plain' || fileType === 'text/csv') {
      try {
        const response = await fetch(fileUrl);
        extractedText = await response.text();
        extractionMethod = 'text';
      } catch (error) {
        console.error('Error extracting text file:', error);
        throw new Error('Failed to extract text content');
      }
    } else if (fileType === 'application/pdf') {
      // For now, we'll store a placeholder for PDF content
      // In a real implementation, you'd use a PDF parsing library
      extractedText = '[PDF Content - Extraction coming soon]';
      extractionMethod = 'pdf_parse';
    } else if (fileType.startsWith('application/vnd.openxmlformats') || 
               fileType.startsWith('application/msword')) {
      // For now, we'll store a placeholder for Word documents
      extractedText = '[Word Document Content - Extraction coming soon]';
      extractionMethod = 'text';
    } else {
      extractedText = '[Unsupported file type for text extraction]';
      extractionMethod = 'text';
    }

    // Create content chunks for semantic search (split by paragraphs/sentences)
    const chunks = extractedText
      .split(/\n\s*\n|\. /)
      .filter(chunk => chunk.trim().length > 20)
      .slice(0, 50); // Limit to 50 chunks

    // Store extracted content
    const { error: contentError } = await supabase
      .from('document_content')
      .insert({
        document_id: documentId,
        content_text: extractedText,
        content_chunks: chunks,
        extraction_method: extractionMethod
      });

    if (contentError) {
      console.error('Error storing document content:', contentError);
      throw contentError;
    }

    // Update the document with extracted content preview
    const preview = extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : '');
    const { error: updateError } = await supabase
      .from('workspace_documents')
      .update({
        content_extracted: preview
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document:', updateError);
      throw updateError;
    }

    console.log('Document content extracted successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedLength: extractedText.length,
        chunksCount: chunks.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-document-content function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});