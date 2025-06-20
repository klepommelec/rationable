
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    const huggingFaceToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

    if (!huggingFaceToken) {
      throw new Error('Hugging Face token not configured');
    }

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log('Generating image with FLUX.1-schnell for prompt:', prompt);

    const hf = new HfInference(huggingFaceToken);

    const image = await hf.textToImage({
      inputs: prompt,
      model: 'black-forest-labs/FLUX.1-schnell',
    });

    // Convert the blob to a base64 string
    const arrayBuffer = await image.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    return new Response(JSON.stringify({ 
      imageUrl: `data:image/png;base64,${base64}`,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-image-hf function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
