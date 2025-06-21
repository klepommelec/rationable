
import { supabase } from '@/integrations/supabase/client';

// Cache pour éviter les recherches répétées
const searchCache = new Map<string, string>();

// Interface pour les résultats de recherche Google
interface GoogleImageResult {
  url: string;
  thumbnail: string;
  title: string;
  context: string;
  width: number;
  height: number;
}

interface GoogleSearchResponse {
  success: boolean;
  images: GoogleImageResult[];
  query?: string;
  error?: string;
}

// Fonction pour optimiser les termes de recherche selon le contexte
export const optimizeSearchQuery = (option: string, dilemma?: string): string => {
  // Nettoyer l'option des préfixes comme "Option 1:", etc.
  const cleanOption = option.replace(/^Option\s+\d+:\s*/i, '').trim();
  
  // Détecter le type de décision pour adapter les mots-clés
  const dilemmaLower = dilemma?.toLowerCase() || '';
  let searchTerms = cleanOption;
  
  if (dilemmaLower.includes('voyage') || dilemmaLower.includes('destination')) {
    searchTerms += ' destination travel beautiful';
  } else if (dilemmaLower.includes('restaurant') || dilemmaLower.includes('manger')) {
    searchTerms += ' restaurant food cuisine';
  } else if (dilemmaLower.includes('voiture') || dilemmaLower.includes('acheter')) {
    searchTerms += ' product quality';
  } else if (dilemmaLower.includes('emploi') || dilemmaLower.includes('travail')) {
    searchTerms += ' professional workplace office';
  } else if (dilemmaLower.includes('maison') || dilemmaLower.includes('appartement')) {
    searchTerms += ' home interior modern';
  } else {
    searchTerms += ' high quality';
  }
  
  return searchTerms;
};

// Fonction principale pour rechercher des images via Google
export const searchGoogleImages = async (option: string, dilemma?: string): Promise<string | null> => {
  const cacheKey = `google-${option}-${dilemma}`;
  
  // Vérifier le cache d'abord
  if (searchCache.has(cacheKey)) {
    console.log('📋 [CACHE] Using cached Google image result');
    return searchCache.get(cacheKey)!;
  }
  
  try {
    const searchQuery = optimizeSearchQuery(option, dilemma);
    console.log('🔍 Searching Google Images for:', searchQuery);
    
    const { data, error } = await supabase.functions.invoke('google-image-search', {
      body: { 
        query: searchQuery,
        safeSearch: 'active',
        imageType: 'photo'
      }
    });
    
    if (error) {
      console.error('❌ Google Image Search error:', error);
      return null;
    }
    
    const response: GoogleSearchResponse = data;
    
    if (!response.success || !response.images || response.images.length === 0) {
      console.log('🔍 No Google images found for query:', searchQuery);
      return null;
    }
    
    // Prendre la première image de qualité
    const bestImage = response.images.find(img => 
      img.width >= 400 && img.height >= 300 && img.url.includes('https')
    ) || response.images[0];
    
    if (bestImage) {
      // Mettre en cache le résultat
      searchCache.set(cacheKey, bestImage.url);
      console.log('✅ Found Google image:', bestImage.title);
      return bestImage.url;
    }
    
    return null;
    
  } catch (error) {
    console.error('💥 Error in Google Image search:', error);
    return null;
  }
};

// Fonction pour nettoyer le cache (optionnel)
export const clearSearchCache = () => {
  searchCache.clear();
  console.log('🧹 Google image search cache cleared');
};

// Fonction pour obtenir des statistiques du cache
export const getCacheStats = () => {
  return {
    size: searchCache.size,
    keys: Array.from(searchCache.keys())
  };
};
