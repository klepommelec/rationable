
import { supabase } from '@/integrations/supabase/client';
import { searchGoogleImages, getEconomicalImage, detectImageCategory } from './googleImageService';

// Cache persistant pour éviter les régénérations (coût zéro)
const imageCache = new Map<string, string>();

// File d'attente simplifiée et plus économique
class EconomicalRequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private running = 0;
  private maxConcurrent = 1; // Réduit à 1 pour économiser

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.running++;
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.processNext();
        }
      });
      this.processNext();
    });
  }

  private processNext() {
    if (this.running < this.maxConcurrent && this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }
}

const requestQueue = new EconomicalRequestQueue();

// Prompt simplifié et plus court pour économiser (réduction de 60% vs ancien)
export const generateContextualPrompt = (option: string, dilemma?: string): string => {
  const cleanOption = option.replace(/^Option\s+\d+:\s*/i, '').trim();
  const category = detectImageCategory(dilemma || option);
  
  // Prompt ultra-court pour économiser les tokens
  return `${cleanOption.substring(0, 40)}, ${category}`;
};

// Nouvelle stratégie économique : Google > Défaut > IA (en dernier recours seulement)
export const generateContextualImage = async (option: string, dilemma?: string): Promise<string | null> => {
  const cacheKey = `${option}-${dilemma}`;
  
  // Vérifier le cache d'abord (gratuit)
  if (imageCache.has(cacheKey)) {
    console.log('💰 Image trouvée en cache (gratuit):', option);
    return imageCache.get(cacheKey)!;
  }
  
  try {
    // Stratégie économique prioritaire
    const economicalImage = await getEconomicalImage(option, dilemma);
    
    // Mettre en cache pour éviter les futurs coûts
    imageCache.set(cacheKey, economicalImage);
    return economicalImage;
    
  } catch (error) {
    console.error('Error in economical image generation:', error);
    
    // Fallback sur image par défaut (gratuit)
    const defaultImage = getVariedPlaceholder(option, 0);
    imageCache.set(cacheKey, defaultImage);
    return defaultImage;
  }
};

// IA uniquement pour les cas critiques (fonction séparée, coûteuse)
export const generateAIImageIfCritical = async (option: string, dilemma?: string, forceAI: boolean = false): Promise<string | null> => {
  if (!forceAI) {
    console.log('⚠️ IA non utilisée pour économiser les coûts:', option);
    return null;
  }
  
  console.log('💸 Génération IA coûteuse demandée pour:', option);
  
  try {
    const prompt = generateContextualPrompt(option, dilemma);
    
    // Utiliser la file d'attente pour les requêtes IA coûteuses
    const result = await requestQueue.add(async () => {
      // Essayer FLUX d'abord (moins cher que DALL-E)
      const { data, error } = await supabase.functions.invoke('generate-image-hf', {
        body: { prompt }
      });
      
      if (error || !data?.success) {
        // Fallback DALL-E uniquement si vraiment nécessaire
        console.log('FLUX failed, trying DALL-E (plus cher)...');
        const fallbackData = await supabase.functions.invoke('generate-image', {
          body: { prompt: prompt.substring(0, 400) }
        });
        
        if (fallbackData.error || !fallbackData.data?.success) {
          throw new Error('Both AI image generation methods failed');
        }
        
        return fallbackData.data.imageUrl;
      }
      
      return data.imageUrl;
    });
    
    return result;
  } catch (error) {
    console.error('Error in AI image generation:', error);
    return null;
  }
};

// Placeholders variés mais optimisés
export const getVariedPlaceholder = (option: string, index: number = 0): string => {
  const cleanOption = option.replace(/^Option\s+\d+:\s*/i, '').trim();
  const colors = ['4F46E5', '7C3AED', 'DC2626', '059669', 'D97706'];
  const color = colors[index % colors.length];
  const text = encodeURIComponent(cleanOption.slice(0, 10));
  
  // URL plus simple pour de meilleures performances
  return `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=200&fit=crop&auto=format&overlay-text=${text}&overlay-color=${color}`;
};
