
import { supabase } from '@/integrations/supabase/client';
import { searchGoogleImages } from './googleImageService';

// Cache pour éviter de régénérer les mêmes images
const imageCache = new Map<string, string>();

// File d'attente pour limiter les requêtes simultanées
class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private running = 0;
  private maxConcurrent = 3; // Augmenté car Google est plus rapide

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

const requestQueue = new RequestQueue();

// Fonction pour générer un prompt contextuel optimisé (gardée pour l'IA en fallback)
export const generateContextualPrompt = (option: string, dilemma?: string): string => {
  const cleanOption = option.replace(/^Option\s+\d+:\s*/i, '').trim();
  
  const dilemmaLower = dilemma?.toLowerCase() || '';
  let style = 'high quality';
  
  if (dilemmaLower.includes('voyage') || dilemmaLower.includes('destination')) {
    style = 'travel destination';
  } else if (dilemmaLower.includes('restaurant') || dilemmaLower.includes('manger')) {
    style = 'food photography';
  } else if (dilemmaLower.includes('voiture') || dilemmaLower.includes('acheter')) {
    style = 'product photo';
  } else if (dilemmaLower.includes('emploi') || dilemmaLower.includes('travail')) {
    style = 'professional workplace';
  } else if (dilemmaLower.includes('maison') || dilemmaLower.includes('appartement')) {
    style = 'modern interior';
  }
  
  return `${cleanOption}, ${style}`;
};

// Fonction pour générer une image via l'edge function IA (fallback)
const generateAIImage = async (option: string, dilemma?: string): Promise<string | null> => {
  try {
    const prompt = generateContextualPrompt(option, dilemma);
    console.log('🎨 Trying AI generation with prompt:', prompt);
    
    const { data, error } = await supabase.functions.invoke('generate-image-hf', {
      body: { prompt }
    });
    
    if (error || !data?.success) {
      console.log('🎨 FLUX failed, trying DALL-E 2...');
      const fallbackData = await supabase.functions.invoke('generate-image', {
        body: { prompt: prompt.substring(0, 800) }
      });
      
      if (fallbackData.error || !fallbackData.data?.success) {
        throw new Error('Both AI image generation methods failed');
      }
      
      return fallbackData.data.imageUrl;
    }
    
    return data.imageUrl;
  } catch (error) {
    console.error('❌ AI image generation failed:', error);
    return null;
  }
};

// Fonction principale pour obtenir une image contextuelle (Google en priorité)
export const generateContextualImage = async (option: string, dilemma?: string): Promise<string | null> => {
  const cacheKey = `${option}-${dilemma}`;
  
  // Vérifier le cache d'abord
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }
  
  try {
    console.log('🔍 Starting image search for option:', option);
    
    // Utiliser la file d'attente pour éviter de surcharger les APIs
    const result = await requestQueue.add(async () => {
      // 1. Essayer Google Images d'abord (plus rapide et meilleure qualité)
      console.log('🔍 Trying Google Images search...');
      const googleImage = await searchGoogleImages(option, dilemma);
      
      if (googleImage) {
        console.log('✅ Found Google image successfully');
        return googleImage;
      }
      
      // 2. Fallback vers la génération IA si Google échoue
      console.log('🎨 Google failed, trying AI generation...');
      const aiImage = await generateAIImage(option, dilemma);
      
      if (aiImage) {
        console.log('✅ AI generation successful');
        return aiImage;
      }
      
      // 3. Dernier recours : placeholder Unsplash
      console.log('📷 All methods failed, using Unsplash placeholder');
      return null;
    });
    
    if (result) {
      // Mettre en cache l'image trouvée
      imageCache.set(cacheKey, result);
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('💥 Error in contextual image generation:', error);
    return null;
  }
};

// Fonction pour créer des placeholders variés et contextuels (améliorée)
export const getVariedPlaceholder = (option: string, index: number = 0): string => {
  const cleanOption = option.replace(/^Option\s+\d+:\s*/i, '').trim();
  const colors = ['4F46E5', '7C3AED', 'DC2626', '059669', 'D97706', '0891B2'];
  const color = colors[index % colors.length];
  
  // Utiliser des mots-clés pour des placeholders plus pertinents
  const keywords = cleanOption.toLowerCase();
  let category = 'abstract';
  
  if (keywords.includes('voyage') || keywords.includes('destination')) {
    category = 'travel';
  } else if (keywords.includes('restaurant') || keywords.includes('food')) {
    category = 'food';
  } else if (keywords.includes('voiture') || keywords.includes('car')) {
    category = 'transportation';
  } else if (keywords.includes('maison') || keywords.includes('home')) {
    category = 'architecture';
  } else if (keywords.includes('work') || keywords.includes('emploi')) {
    category = 'business';
  }
  
  // Utiliser Unsplash avec des catégories plus pertinentes
  return `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop&auto=format&q=80&category=${category}&color=${color}`;
};
