
import { supabase } from '@/integrations/supabase/client';

// Cache en mémoire pour éviter les appels répétés dans la même session
const imageCache = new Map<string, string>();

// Fonction pour rechercher des images via Google Custom Search API
export const searchGoogleImages = async (query: string): Promise<string | null> => {
  const cacheKey = `google_${query.toLowerCase()}`;
  
  // Vérifier le cache en mémoire
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('search-google-images', {
      body: { query: query.substring(0, 100) } // Limiter la longueur pour économiser
    });
    
    if (error || !data?.success) {
      console.log('Google Image Search failed:', error);
      return null;
    }
    
    const imageUrl = data.imageUrl;
    if (imageUrl) {
      // Mettre en cache
      imageCache.set(cacheKey, imageUrl);
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error in Google Image Search:', error);
    return null;
  }
};

// Images par défaut par catégorie pour éviter les générations IA
const DEFAULT_IMAGES_BY_CATEGORY = {
  tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop&auto=format',
  travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop&auto=format',
  car: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop&auto=format',
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&auto=format',
  work: 'https://images.unsplash.com/photo-1497032205916-ac775f0649ae?w=400&h=300&fit=crop&auto=format',
  house: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400&h=300&fit=crop&auto=format',
  sport: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&auto=format',
  education: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&auto=format',
  finance: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop&auto=format',
  health: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&auto=format'
};

// Détecter la catégorie basée sur les mots-clés
export const detectImageCategory = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('ordinateur') || lowerText.includes('laptop') || lowerText.includes('tech') || lowerText.includes('smartphone')) return 'tech';
  if (lowerText.includes('voyage') || lowerText.includes('vacation') || lowerText.includes('destination')) return 'travel';
  if (lowerText.includes('voiture') || lowerText.includes('car') || lowerText.includes('auto')) return 'car';
  if (lowerText.includes('restaurant') || lowerText.includes('manger') || lowerText.includes('food')) return 'food';
  if (lowerText.includes('emploi') || lowerText.includes('travail') || lowerText.includes('job') || lowerText.includes('work')) return 'work';
  if (lowerText.includes('maison') || lowerText.includes('appartement') || lowerText.includes('house')) return 'house';
  if (lowerText.includes('sport') || lowerText.includes('gym') || lowerText.includes('fitness')) return 'sport';
  if (lowerText.includes('formation') || lowerText.includes('cours') || lowerText.includes('study')) return 'education';
  if (lowerText.includes('investir') || lowerText.includes('argent') || lowerText.includes('finance')) return 'finance';
  if (lowerText.includes('santé') || lowerText.includes('médical') || lowerText.includes('health')) return 'health';
  
  return 'tech'; // Défaut
};

// Obtenir une image par défaut basée sur la catégorie
export const getDefaultImage = (text: string): string => {
  const category = detectImageCategory(text);
  return DEFAULT_IMAGES_BY_CATEGORY[category as keyof typeof DEFAULT_IMAGES_BY_CATEGORY] || DEFAULT_IMAGES_BY_CATEGORY.tech;
};

// Stratégie économique : Google d'abord, puis défaut, puis IA en dernier recours
export const getEconomicalImage = async (query: string, dilemma?: string): Promise<string> => {
  // 1. Essayer Google Images (le plus économique)
  const googleImage = await searchGoogleImages(query);
  if (googleImage) {
    console.log('✅ Image trouvée via Google (économique):', query);
    return googleImage;
  }
  
  // 2. Utiliser une image par défaut (gratuit)
  console.log('📷 Utilisation image par défaut pour:', query);
  return getDefaultImage(dilemma || query);
};
