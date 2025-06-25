
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
    console.log('🚀 Social Content Fetcher called');
    const { query } = await req.json()
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY')
    
    if (!query) {
      console.error('❌ Missing query in request');
      return new Response(JSON.stringify({ error: 'Query manquant' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!youtubeApiKey) {
      console.error('❌ Missing YOUTUBE_API_KEY secret');
      return new Response(JSON.stringify({ 
        youtubeVideos: [] 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log('📺 Fetching YouTube videos for query:', query);
    
    // Recherche de vidéos YouTube populaires
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('q', query);
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('order', 'viewCount');
    searchUrl.searchParams.set('publishedAfter', '2024-01-01T00:00:00Z');
    searchUrl.searchParams.set('relevanceLanguage', 'fr');
    searchUrl.searchParams.set('maxResults', '3');
    searchUrl.searchParams.set('key', youtubeApiKey);

    const searchResponse = await fetch(searchUrl.toString());
    
    if (!searchResponse.ok) {
      console.error('❌ YouTube Search API Error:', searchResponse.status);
      return new Response(JSON.stringify({ youtubeVideos: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) {
      console.log('📺 No YouTube videos found');
      return new Response(JSON.stringify({ youtubeVideos: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Récupérer les statistiques pour chaque vidéo
    const videoIds = searchData.items.map(item => item.id.videoId).join(',');
    const statsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    statsUrl.searchParams.set('part', 'statistics');
    statsUrl.searchParams.set('id', videoIds);
    statsUrl.searchParams.set('key', youtubeApiKey);

    const statsResponse = await fetch(statsUrl.toString());
    const statsData = await statsResponse.json();

    // Combiner les données
    const youtubeVideos = searchData.items.map((item, index) => {
      const stats = statsData.items?.[index]?.statistics || {};
      const viewCount = parseInt(stats.viewCount || '0');
      
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        viewCount: formatViewCount(viewCount),
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      };
    });

    console.log(`✅ Found ${youtubeVideos.length} YouTube videos`);

    return new Response(JSON.stringify({ youtubeVideos }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('💥 Social Content Fetcher Error:', error);
    return new Response(JSON.stringify({ 
      youtubeVideos: [],
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Retourner 200 avec un tableau vide plutôt qu'une erreur
    })
  }
})

function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${Math.floor(count / 1000000)}M vues`;
  } else if (count >= 1000) {
    return `${Math.floor(count / 1000)}K vues`;
  } else {
    return `${count} vues`;
  }
}
