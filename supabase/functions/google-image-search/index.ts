
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 Google Image Search function called');
    const { query, safeSearch = 'active', imageType = 'photo' } = await req.json()
    
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY')
    const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID')

    if (!query) {
      console.error('❌ Missing query in request');
      return new Response(JSON.stringify({ error: 'La requête de recherche est manquante.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    if (!googleApiKey || !searchEngineId) {
      console.error('❌ Missing Google API credentials');
      return new Response(JSON.stringify({ 
        error: "Les clés API Google ne sont pas configurées côté serveur.",
        success: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    console.log(`🔍 Searching Google Images for: ${query}`);
    const startTime = Date.now();

    // Construct Google Custom Search API URL
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.append('key', googleApiKey);
    searchUrl.searchParams.append('cx', searchEngineId);
    searchUrl.searchParams.append('q', query);
    searchUrl.searchParams.append('searchType', 'image');
    searchUrl.searchParams.append('num', '3'); // Get 3 results for variety
    searchUrl.searchParams.append('safe', safeSearch);
    searchUrl.searchParams.append('imgType', imageType);
    searchUrl.searchParams.append('imgSize', 'medium');
    searchUrl.searchParams.append('rights', 'cc_publicdomain,cc_attribute,cc_sharealike,cc_noncommercial,cc_nonderived');

    const response = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const duration = Date.now() - startTime;
    console.log(`⏱️ Google API call took ${duration}ms`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Google API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(`Erreur de l'API Google: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log(`📄 Google search returned ${data.items?.length || 0} results`);

    if (!data.items || data.items.length === 0) {
      console.log("🔍 No images found for query");
      return new Response(JSON.stringify({ 
        success: false,
        images: [],
        message: 'Aucune image trouvée pour cette recherche' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Extract image URLs and metadata
    const images = data.items.map((item: any) => ({
      url: item.link,
      thumbnail: item.image.thumbnailLink,
      title: item.title,
      context: item.image.contextLink,
      width: item.image.width,
      height: item.image.height,
    }));

    console.log(`✅ Successfully found ${images.length} images`);
    
    return new Response(JSON.stringify({ 
      success: true,
      images,
      query: data.queries?.request?.[0]?.searchTerms || query 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('💥 Google Image Search Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
