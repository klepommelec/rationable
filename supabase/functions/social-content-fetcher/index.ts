
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

    // Construire une requête contextuelle plus pertinente
    const contextualQuery = buildContextualQuery(query, dilemma, recommendation);
    console.log('📺 Fetching YouTube videos for contextual query:', contextualQuery);
    
    // Recherche de vidéos YouTube populaires
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('q', contextualQuery);
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('order', 'relevance'); // Changé de viewCount à relevance pour plus de pertinence
    searchUrl.searchParams.set('publishedAfter', '2023-01-01T00:00:00Z'); // Élargi la période
    searchUrl.searchParams.set('relevanceLanguage', 'fr');
    searchUrl.searchParams.set('maxResults', '6'); // Augmenté pour avoir plus de choix avant filtrage
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
      console.log('📺 No YouTube videos found for query:', contextualQuery);
      return new Response(JSON.stringify({ youtubeVideos: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Filtrer les vidéos non pertinentes
    const filteredItems = filterRelevantVideos(searchData.items, dilemma, recommendation);
    console.log('🔍 Filtered videos count:', filteredItems.length);

    if (filteredItems.length === 0) {
      console.log('📺 No relevant videos found after filtering');
      return new Response(JSON.stringify({ youtubeVideos: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Limiter à 3 vidéos les plus pertinentes
    const finalItems = filteredItems.slice(0, 3);

    // Récupérer les statistiques pour chaque vidéo
    const videoIds = finalItems.map(item => item.id.videoId).join(',');
    const statsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    statsUrl.searchParams.set('part', 'statistics');
    statsUrl.searchParams.set('id', videoIds);
    statsUrl.searchParams.set('key', youtubeApiKey);

    console.log('📊 Fetching video statistics for IDs:', videoIds);

    const statsResponse = await fetch(statsUrl.toString());
    const statsData = statsResponse.ok ? await statsResponse.json() : { items: [] };

    // Combiner les données
    const youtubeVideos = finalItems.map((item, index) => {
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

    console.log(`✅ Found ${youtubeVideos.length} contextual YouTube videos`);
    console.log('📝 Final video titles:', youtubeVideos.map(v => v.title));

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

function buildContextualQuery(query: string, dilemma?: string, recommendation?: string): string {
  // Nettoyer et extraire les mots-clés pertinents
  const cleanQuery = query.trim();
  
  // Si on a le dilemme et la recommandation, construire une requête plus contextuelle
  if (dilemma && recommendation) {
    // Extraire les mots-clés du dilemme (restaurants, hôtels, etc.)
    const dilemmaKeywords = extractKeywords(dilemma);
    const recKeywords = extractKeywords(recommendation);
    
    // Combiner intelligemment
    const keywords = [...new Set([...dilemmaKeywords, ...recKeywords])].slice(0, 4);
    return keywords.join(' ') + ` ${cleanQuery}`;
  }
  
  return cleanQuery;
}

function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Catégories de mots-clés pertinents
  const categories = {
    restaurant: ['restaurant', 'cuisine', 'chef', 'gastronomie', 'repas', 'dîner', 'déjeuner'],
    hotel: ['hôtel', 'hotel', 'hébergement', 'chambre', 'séjour', 'nuit'],
    travel: ['voyage', 'vacances', 'destination', 'tourisme', 'visite'],
    tech: ['technologie', 'smartphone', 'ordinateur', 'app', 'logiciel'],
    car: ['voiture', 'automobile', 'véhicule', 'conduite'],
    health: ['santé', 'médecin', 'traitement', 'exercice', 'nutrition'],
    finance: ['argent', 'banque', 'investissement', 'épargne', 'budget']
  };
  
  // Identifier la catégorie principale
  for (const [category, terms] of Object.entries(categories)) {
    if (terms.some(term => lowerText.includes(term))) {
      keywords.push(category);
      break;
    }
  }
  
  // Extraire les noms propres (mots qui commencent par une majuscule)
  const words = text.split(/\s+/);
  const properNouns = words.filter(word => 
    word.length > 2 && 
    word[0] === word[0].toUpperCase() && 
    !/^(Le|La|Les|Un|Une|Des|Du|De|À|Au|Aux)$/.test(word)
  );
  
  keywords.push(...properNouns.slice(0, 2));
  
  return keywords;
}

function filterRelevantVideos(items: any[], dilemma?: string, recommendation?: string): any[] {
  // Mots-clés à éviter (contenu non pertinent)
  const irrelevantKeywords = [
    'politique', 'élection', 'gouvernement', 'ministre', 'président',
    'scandale', 'polémique', 'controverse', 'manifestation',
    'guerre', 'conflit', 'terrorisme', 'violence',
    'people', 'célébrité', 'star', 'buzz', 'clash'
  ];
  
  // Mots-clés pertinents basés sur le contexte
  const contextKeywords = [];
  if (dilemma) {
    contextKeywords.push(...extractKeywords(dilemma));
  }
  if (recommendation) {
    contextKeywords.push(...extractKeywords(recommendation));
  }
  
  return items.filter(item => {
    const title = item.snippet.title.toLowerCase();
    const description = item.snippet.description?.toLowerCase() || '';
    const channel = item.snippet.channelTitle.toLowerCase();
    
    // Exclure le contenu clairement non pertinent
    const hasIrrelevantContent = irrelevantKeywords.some(keyword => 
      title.includes(keyword) || description.includes(keyword)
    );
    
    if (hasIrrelevantContent) {
      console.log('🚫 Filtered out irrelevant video:', item.snippet.title);
      return false;
    }
    
    // Si on a des mots-clés contextuels, privilégier les vidéos qui les contiennent
    if (contextKeywords.length > 0) {
      const hasRelevantContent = contextKeywords.some(keyword => 
        title.includes(keyword.toLowerCase()) || 
        description.includes(keyword.toLowerCase()) ||
        channel.includes(keyword.toLowerCase())
      );
      
      if (!hasRelevantContent) {
        console.log('🔍 Less relevant video:', item.snippet.title);
        // Ne pas exclure complètement, mais noter comme moins pertinent
      }
    }
    
    return true;
  });
}

function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${Math.floor(count / 1000000)}M vues`;
  } else if (count >= 1000) {
    return `${Math.floor(count / 1000)}K vues`;
  } else {
    return `${count} vues`;
  }
}
