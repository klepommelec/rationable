
import { ILink } from '@/types/decision';

interface GoogleSearchResult {
  title: string;
  link: string;
  snippet?: string;
}

interface GoogleSearchResponse {
  items?: GoogleSearchResult[];
}

// Configuration pour Google Custom Search API
const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY'; // À configurer via Supabase secrets
const SEARCH_ENGINE_ID = 'YOUR_SEARCH_ENGINE_ID'; // À configurer via Supabase secrets

/**
 * Effectue une recherche Google et retourne les résultats formatés
 */
async function performGoogleSearch(query: string, limit: number = 5): Promise<ILink[]> {
  try {
    console.log(`🔍 [GoogleSearch] Searching for: "${query}"`);
    
    // Pour l'instant, on utilise une simulation des résultats Google
    // En production, on utilisera l'API Google Custom Search
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=${limit}`;
    
    // Simulation de résultats en attendant la configuration API
    const simulatedResults = generateSimulatedResults(query, limit);
    console.log(`✅ [GoogleSearch] Found ${simulatedResults.length} results`);
    
    return simulatedResults;
    
    /* Code pour la vraie API Google (à décommenter après configuration) :
    const response = await fetch(searchUrl);
    const data: GoogleSearchResponse = await response.json();
    
    if (!data.items) {
      console.log(`⚠️ [GoogleSearch] No results found for: "${query}"`);
      return [];
    }
    
    return data.items.map(item => ({
      title: item.title,
      url: item.link,
      description: item.snippet || ''
    }));
    */
  } catch (error) {
    console.error('❌ [GoogleSearch] Error:', error);
    return generateFallbackResults(query, limit);
  }
}

/**
 * Génère des résultats simulés pour le développement
 */
function generateSimulatedResults(query: string, limit: number): ILink[] {
  const baseResults = [
    {
      title: `Guide complet ${query}`,
      url: `https://www.google.fr/search?q=${encodeURIComponent(query + ' guide complet')}`,
      description: `Guide détaillé et comparatif sur ${query}`
    },
    {
      title: `Avis et tests ${query}`,
      url: `https://www.google.fr/search?q=${encodeURIComponent(query + ' avis test')}`,
      description: `Avis d\'experts et tests utilisateurs sur ${query}`
    },
    {
      title: `${query} - Les Numériques`,
      url: `https://www.lesnumeriques.com/recherche/?q=${encodeURIComponent(query)}`,
      description: `Tests et comparatifs détaillés par Les Numériques`
    },
    {
      title: `${query} - 01net`,
      url: `https://www.01net.com/recherche/?q=${encodeURIComponent(query)}`,
      description: `Actualités et analyses techniques par 01net`
    },
    {
      title: `Forum ${query}`,
      url: `https://www.google.fr/search?q=${encodeURIComponent(query + ' forum discussion')}`,
      description: `Discussions et retours d\'expérience d\'utilisateurs`
    }
  ];
  
  return baseResults.slice(0, limit);
}

/**
 * Génère des résultats de fallback en cas d'erreur
 */
function generateFallbackResults(query: string, limit: number): ILink[] {
  return [
    {
      title: `Rechercher ${query}`,
      url: `https://www.google.fr/search?q=${encodeURIComponent(query)}`,
      description: `Recherche Google pour ${query}`
    }
  ].slice(0, limit);
}

/**
 * Recherche des liens d'information basés sur la recommandation
 */
export async function searchInfoLinks(recommendation: string, dilemma?: string): Promise<ILink[]> {
  const queries = [
    `${recommendation} guide complet avis`,
    `${recommendation} avantages inconvénients`,
    dilemma ? `${dilemma} ${recommendation}` : `${recommendation} comparaison`
  ].filter(Boolean);
  
  console.log(`📚 [GoogleSearch] Searching info links for: ${recommendation}`);
  
  // On prend le premier query et on récupère 3-4 résultats
  const results = await performGoogleSearch(queries[0], 4);
  return results;
}

/**
 * Recherche des liens d'achat basés sur la recommandation
 */
export async function searchShoppingLinks(recommendation: string): Promise<ILink[]> {
  const queries = [
    `${recommendation} prix achat où acheter`,
    `${recommendation} meilleur prix`,
    `acheter ${recommendation} pas cher`
  ];
  
  console.log(`🛒 [GoogleSearch] Searching shopping links for: ${recommendation}`);
  
  // Résultats simulés pour les liens d'achat
  const shoppingResults: ILink[] = [
    {
      title: `${recommendation} - Amazon`,
      url: `https://www.amazon.fr/s?k=${encodeURIComponent(recommendation)}`,
      description: `Trouvez ${recommendation} sur Amazon avec livraison rapide`
    },
    {
      title: `${recommendation} - Fnac`,
      url: `https://www.fnac.com/SearchResult/ResultList.aspx?Search=${encodeURIComponent(recommendation)}`,
      description: `${recommendation} disponible à la Fnac`
    },
    {
      title: `Comparer les prix ${recommendation}`,
      url: `https://www.google.fr/search?q=${encodeURIComponent(recommendation + ' prix')}&tbm=shop`,
      description: `Comparez les prix pour ${recommendation}`
    },
    {
      title: `${recommendation} - Cdiscount`,
      url: `https://www.cdiscount.com/search/10/${encodeURIComponent(recommendation)}.html`,
      description: `Offres et promotions sur ${recommendation}`
    }
  ];
  
  return shoppingResults.slice(0, 3);
}

/**
 * Récupère tous les liens utiles (info + shopping) pour une recommandation
 */
export async function fetchUsefulLinks(recommendation: string, dilemma?: string): Promise<{ infoLinks: ILink[], shoppingLinks: ILink[] }> {
  console.log(`🔗 [GoogleSearch] Fetching all useful links for: ${recommendation}`);
  
  try {
    const [infoLinks, shoppingLinks] = await Promise.all([
      searchInfoLinks(recommendation, dilemma),
      searchShoppingLinks(recommendation)
    ]);
    
    console.log(`✅ [GoogleSearch] Found ${infoLinks.length} info links and ${shoppingLinks.length} shopping links`);
    
    return {
      infoLinks,
      shoppingLinks
    };
  } catch (error) {
    console.error('❌ [GoogleSearch] Error fetching useful links:', error);
    
    // Fallback en cas d'erreur
    return {
      infoLinks: [{
        title: `Rechercher ${recommendation}`,
        url: `https://www.google.fr/search?q=${encodeURIComponent(recommendation)}`,
        description: `Recherche d'informations sur ${recommendation}`
      }],
      shoppingLinks: [{
        title: `Acheter ${recommendation}`,
        url: `https://www.google.fr/search?q=${encodeURIComponent(recommendation + ' achat')}&tbm=shop`,
        description: `Recherche shopping pour ${recommendation}`
      }]
    };
  }
}
