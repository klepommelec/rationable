
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Liste ultra-stricte de mots interdits
const FORBIDDEN_KEYWORDS = [
  // Politique et controverses
  'politique', 'élection', 'gouvernement', 'ministre', 'président', 'député',
  'scandale', 'polémique', 'controverse', 'manifestation', 'grève', 'syndicat',
  'corruption', 'affaire', 'procès', 'tribunal', 'justice', 'condamnation',
  
  // Violence et contenu inapproprié
  'guerre', 'conflit', 'terrorisme', 'violence', 'mort', 'tué', 'meurtre',
  'accident', 'drame', 'tragédie', 'crime', 'criminel', 'agression',
  'attentat', 'explosion', 'blessé', 'victime', 'danger', 'risque',
  
  // Contenu sensible
  'sexe', 'sexy', 'nu', 'nudité', 'érotique', 'pornographie', 'adulte',
  'drogue', 'alcool', 'cigarette', 'cannabis', 'stupéfiant',
  
  // Contenu négatif
  'arnaque', 'escroquerie', 'fake', 'mensonge', 'trompeur', 'faux',
  'boycott', 'interdiction', 'censure', 'problème', 'danger',
  
  // Contenu discriminatoire
  'racisme', 'discrimination', 'homophobie', 'xénophobie', 'haine',
  
  // Mots anglais équivalents
  'politics', 'scandal', 'controversy', 'war', 'violence', 'death', 'murder',
  'crime', 'terrorist', 'drug', 'fake', 'scam', 'hate', 'discrimination'
];

// Mots-clés positifs requis pour la nourriture/restaurants
const FOOD_POSITIVE_KEYWORDS = [
  'restaurant', 'food', 'cuisine', 'chef', 'cooking', 'recipe', 'dish',
  'meal', 'eat', 'taste', 'delicious', 'kitchen', 'dining', 'menu',
  'gastronomy', 'culinary', 'bistro', 'café', 'bar', 'pizzeria',
  'trattoria', 'brasserie', 'ristorante', 'tavola', 'cucina', 'cibo',
  'manger', 'goûter', 'saveur', 'plat', 'repas', 'déjeuner', 'dîner'
];

function isContentAppropriate(title: string, description: string, channelTitle: string): boolean {
  const fullText = `${title} ${description} ${channelTitle}`.toLowerCase();
  
  // Vérification des mots interdits
  const hasForbiddenContent = FORBIDDEN_KEYWORDS.some(keyword => 
    fullText.includes(keyword.toLowerCase())
  );
  
  if (hasForbiddenContent) {
    console.log('🚫 BLOCKED - Forbidden content detected:', title);
    return false;
  }
  
  // Pour les recherches de restaurants, vérifier la présence de mots-clés positifs
  const hasPositiveKeywords = FOOD_POSITIVE_KEYWORDS.some(keyword => 
    fullText.includes(keyword.toLowerCase())
  );
  
  if (!hasPositiveKeywords) {
    console.log('🚫 BLOCKED - No relevant food keywords:', title);
    return false;
  }
  
  // Vérifications supplémentaires pour les chaînes suspectes
  const suspiciousChannelKeywords = ['news', 'actualité', 'breaking', 'urgent', 'live'];
  const hasSuspiciousChannel = suspiciousChannelKeywords.some(keyword => 
    channelTitle.toLowerCase().includes(keyword)
  );
  
  if (hasSuspiciousChannel) {
    console.log('🚫 BLOCKED - Suspicious channel:', channelTitle);
    return false;
  }
  
  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Social Content Fetcher called');
    const { query, dilemma, recommendation } = await req.json()
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
        youtubeVideos: [],
        error: 'YOUTUBE_API_KEY manquant dans les secrets Supabase'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Utiliser le nom de la recommandation pour une recherche plus précise
    const searchQuery = recommendation || query;
    console.log('📺 Searching YouTube for:', searchQuery);
    
    // Recherche de vidéos YouTube avec filtrage strict
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('q', searchQuery);
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('order', 'relevance');
    searchUrl.searchParams.set('publishedAfter', '2020-01-01T00:00:00Z');
    searchUrl.searchParams.set('maxResults', '20'); // Plus de résultats pour compenser le filtrage strict
    searchUrl.searchParams.set('key', youtubeApiKey);

    console.log('🌐 YouTube API URL:', searchUrl.toString().replace(youtubeApiKey, '[HIDDEN]'));

    const searchResponse = await fetch(searchUrl.toString());
    
    console.log('📡 YouTube API Response Status:', searchResponse.status);
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('❌ YouTube Search API Error:', searchResponse.status, errorText);
      
      return new Response(JSON.stringify({ 
        youtubeVideos: [],
        error: `YouTube API Error ${searchResponse.status}: ${errorText}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const searchData = await searchResponse.json();
    console.log('📊 YouTube Search Response items count:', searchData.items?.length || 0);
    
    if (!searchData.items || searchData.items.length === 0) {
      console.log('📺 No YouTube videos found for query:', searchQuery);
      return new Response(JSON.stringify({ youtubeVideos: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Filtrage ultra-strict du contenu
    const filteredItems = searchData.items.filter(item => {
      const title = item.snippet.title || '';
      const description = item.snippet.description || '';
      const channelTitle = item.snippet.channelTitle || '';
      
      return isContentAppropriate(title, description, channelTitle);
    });

    console.log('🔍 Filtered videos count:', filteredItems.length);
    console.log('📝 Blocked videos count:', (searchData.items?.length || 0) - filteredItems.length);

    if (filteredItems.length === 0) {
      console.log('📺 No appropriate videos found after strict filtering');
      return new Response(JSON.stringify({ youtubeVideos: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Prendre les 6 meilleurs résultats après filtrage
    const finalItems = filteredItems.slice(0, 6);

    // Récupérer les statistiques pour chaque vidéo
    const videoIds = finalItems.map(item => item.id.videoId).join(',');
    const statsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    statsUrl.searchParams.set('part', 'statistics,contentDetails');
    statsUrl.searchParams.set('id', videoIds);
    statsUrl.searchParams.set('key', youtubeApiKey);

    console.log('📊 Fetching video statistics for IDs:', videoIds);

    const statsResponse = await fetch(statsUrl.toString());
    const statsData = statsResponse.ok ? await statsResponse.json() : { items: [] };

    // Combiner les données avec validation finale
    const youtubeVideos = finalItems.map((item, index) => {
      const stats = statsData.items?.[index]?.statistics || {};
      const contentDetails = statsData.items?.[index]?.contentDetails || {};
      const viewCount = parseInt(stats.viewCount || '0');
      
      // Détecter si c'est un Short (durée < 60 secondes)
      const duration = contentDetails.duration || '';
      const isShort = duration.includes('PT') && !duration.includes('M') && 
                     (duration.includes('S') && parseInt(duration.replace(/[^\d]/g, '')) < 60);
      
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        viewCount: formatViewCount(viewCount),
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        isShort: isShort
      };
    });

    console.log(`✅ Found ${youtubeVideos.length} appropriate YouTube videos`);
    console.log('📝 Final video titles:', youtubeVideos.map(v => `${v.title} ${v.isShort ? '(Short)' : ''}`));

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
      status: 200,
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
