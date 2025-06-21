
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    const SEARCH_ENGINE_ID = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
    
    if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
      console.log('Google API credentials not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Google API not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Searching Google Images for:', query);
    
    // Optimiser la requête pour de meilleurs résultats
    const searchQuery = encodeURIComponent(`${query} high quality`);
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${searchQuery}&searchType=image&num=3&imgSize=medium&safe=active`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      // Prendre la première image de qualité
      const imageUrl = data.items[0].link;
      console.log('✅ Google Image found:', imageUrl);
      
      return new Response(
        JSON.stringify({ success: true, imageUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('No Google Images found for:', query);
    return new Response(
      JSON.stringify({ success: false, error: 'No images found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in Google Image Search:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
