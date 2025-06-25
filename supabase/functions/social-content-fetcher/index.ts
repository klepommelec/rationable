
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

    // Construire une requête contextuelle beaucoup plus pertinente
    const contextualQuery = buildContextualQuery(query, dilemma, recommendation);
    console.log('📺 Fetching YouTube videos for contextual query:', contextualQuery);
    
    // Recherche de vidéos YouTube pertinentes
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('q', contextualQuery);
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('order', 'relevance');
    searchUrl.searchParams.set('publishedAfter', '2022-01-01T00:00:00Z');
    searchUrl.searchParams.set('relevanceLanguage', 'fr');
    searchUrl.searchParams.set('maxResults', '8');
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

    // Filtrer rigoureusement les vidéos pertinentes
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
  console.log('🔍 Building contextual query with:', { query, dilemma, recommendation });
  
  // Analyser le dilemme pour extraire le contexte principal
  if (dilemma) {
    const dilemmaContext = extractMainContext(dilemma);
    console.log('📋 Extracted context:', dilemmaContext);
    
    if (dilemmaContext.isRestaurant) {
      const cityKeywords = extractCityFromText(dilemma);
      const cuisineKeywords = extractCuisineFromText(dilemma);
      
      // Construire une requête spécialisée pour les restaurants
      let restaurantQuery = `meilleurs restaurants ${cityKeywords}`;
      if (cuisineKeywords) {
        restaurantQuery += ` ${cuisineKeywords}`;
      }
      if (recommendation && recommendation.length > 3) {
        restaurantQuery += ` ${recommendation.replace(/^(Le |La |Les |L')/i, '')}`;
      }
      restaurantQuery += ' avis test gastronomie';
      
      console.log('🍽️ Restaurant query built:', restaurantQuery);
      return restaurantQuery;
    }
    
    if (dilemmaContext.isTravel) {
      const destination = extractDestinationFromText(dilemma);
      let travelQuery = `voyage ${destination} guide`;
      if (recommendation) {
        travelQuery += ` ${recommendation}`;
      }
      travelQuery += ' visite tourisme';
      return travelQuery;
    }
    
    if (dilemmaContext.isTech) {
      let techQuery = recommendation || query;
      techQuery += ' test review comparaison tech';
      return techQuery;
    }
  }
  
  // Fallback: utiliser la recommandation avec le contexte du dilemme
  const cleanQuery = query.trim();
  if (recommendation && dilemma) {
    const keywords = extractKeywords(dilemma).slice(0, 2);
    return `${recommendation} ${keywords.join(' ')} test avis guide`;
  }
  
  return cleanQuery + ' test avis guide';
}

function extractMainContext(text: string): { isRestaurant: boolean, isTravel: boolean, isTech: boolean } {
  const lowerText = text.toLowerCase();
  
  const restaurantKeywords = ['restaurant', 'manger', 'cuisine', 'gastronomie', 'repas', 'dîner', 'déjeuner', 'food', 'chef', 'menu'];
  const travelKeywords = ['voyage', 'vacances', 'destination', 'visite', 'tourisme', 'séjour', 'week-end', 'city break'];
  const techKeywords = ['smartphone', 'ordinateur', 'tech', 'app', 'logiciel', 'gadget', 'électronique'];
  
  return {
    isRestaurant: restaurantKeywords.some(keyword => lowerText.includes(keyword)),
    isTravel: travelKeywords.some(keyword => lowerText.includes(keyword)),
    isTech: techKeywords.some(keyword => lowerText.includes(keyword))
  };
}

function extractCityFromText(text: string): string {
  const cityPattern = /(Londres|Paris|New York|Tokyo|Rome|Barcelona|Amsterdam|Berlin|Prague|Vienna|Zurich|Geneva|Lyon|Marseille|Nice|Bordeaux|Strasbourg|Toulouse|Nantes|Lille)/gi;
  const matches = text.match(cityPattern);
  return matches ? matches[0] : '';
}

function extractDestinationFromText(text: string): string {
  const destinationPattern = /(Londres|Paris|New York|Tokyo|Rome|Barcelona|Amsterdam|Berlin|Prague|Vienna|Zurich|Geneva|Lyon|Marseille|Nice|Bordeaux|Strasbourg|Toulouse|Nantes|Lille|France|Italie|Espagne|Allemagne|Angleterre|Japon|États-Unis)/gi;
  const matches = text.match(destinationPattern);
  return matches ? matches[0] : '';
}

function extractCuisineFromText(text: string): string {
  const cuisinePattern = /(française|italienne|japonaise|chinoise|indienne|mexicaine|thai|coréenne|libanaise|grecque|espagnole|américaine|fusion|gastronomique|bistronomie)/gi;
  const matches = text.match(cuisinePattern);
  return matches ? matches[0] : '';
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
    !/^(Le|La|Les|Un|Une|Des|Du|De|À|Au|Aux|Et|Ou|Avec|Sans|Pour|Dans|Sur|Sous)$/.test(word)
  );
  
  keywords.push(...properNouns.slice(0, 2));
  
  return keywords;
}

function filterRelevantVideos(items: any[], dilemma?: string, recommendation?: string): any[] {
  // Mots-clés à ABSOLUMENT éviter
  const strictlyForbiddenKeywords = [
    // Politique et actualités sensibles
    'politique', 'élection', 'gouvernement', 'ministre', 'président', 'macron', 'le pen', 'mélenchon',
    'scandale', 'polémique', 'controverse', 'manifestation', 'grève',
    // Violence et faits divers
    'guerre', 'conflit', 'terrorisme', 'violence', 'mort', 'tué', 'poignardé', 
    'accident', 'drame', 'tragédie', 'victime', 'police', 'crime', 'criminel',
    // Contenu non pertinent
    'people', 'célébrité', 'star', 'buzz', 'clash', 'drama',
    // Memes et contenu humoristique non contextuel
    'mew', 'meme', 'fail', 'wtf', 'omg', 'lol', 'xd'
  ];
  
  // Mots-clés pertinents selon le contexte
  const contextKeywords = [];
  if (dilemma) {
    const context = extractMainContext(dilemma);
    if (context.isRestaurant) {
      contextKeywords.push('restaurant', 'cuisine', 'chef', 'food', 'gastronomie', 'test', 'avis', 'review');
    }
    if (context.isTravel) {
      contextKeywords.push('voyage', 'visite', 'guide', 'tourism', 'destination');
    }
    if (context.isTech) {
      contextKeywords.push('test', 'review', 'tech', 'comparaison', 'unboxing');
    }
  }
  
  console.log('🎯 Context keywords for filtering:', contextKeywords);
  
  return items.filter(item => {
    const title = item.snippet.title.toLowerCase();
    const description = item.snippet.description?.toLowerCase() || '';
    const channel = item.snippet.channelTitle.toLowerCase();
    const fullText = `${title} ${description} ${channel}`;
    
    // Exclure absolument tout contenu avec des mots-clés interdits
    const hasForbiddenContent = strictlyForbiddenKeywords.some(keyword => 
      fullText.includes(keyword.toLowerCase())
    );
    
    if (hasForbiddenContent) {
      console.log('🚫 BLOCKED - Forbidden content:', item.snippet.title);
      return false;
    }
    
    // Si on a des mots-clés contextuels, exiger qu'au moins un soit présent
    if (contextKeywords.length > 0) {
      const hasRelevantContent = contextKeywords.some(keyword => 
        fullText.includes(keyword.toLowerCase())
      );
      
      if (!hasRelevantContent) {
        console.log('🔍 FILTERED - Not contextually relevant:', item.snippet.title);
        return false;
      }
    }
    
    console.log('✅ ACCEPTED - Relevant video:', item.snippet.title);
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
