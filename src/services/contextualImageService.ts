
import { supabase } from '@/integrations/supabase/client';

// Cache pour éviter de régénérer les mêmes images
const imageCache = new Map<string, string>();

// File d'attente pour limiter les requêtes simultanées
class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private running = 0;
  private maxConcurrent = 2; // Limite le nombre de requêtes simultanées

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

// Fonction pour générer un prompt contextuel optimisé et plus court
export const generateContextualPrompt = (option: string, dilemma?: string): string => {
  // Nettoyer l'option des préfixes comme "Option 1:", etc.
  const cleanOption = option.replace(/^Option\s+\d+:\s*/i, '').trim();
  
  // Détecter le type de décision pour adapter le style (version simplifiée)
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
  
  // Prompt plus court et optimisé pour la vitesse
  return `${cleanOption}, ${style}`;
};

// Fonction pour générer une image via l'edge function (optimisée pour la vitesse)
export const generateContextualImage = async (option: string, dilemma?: string): Promise<string | null> => {
  const cacheKey = `${option}-${dilemma}`;
  
  // Vérifier le cache d'abord
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }
  
  try {
    const prompt = generateContextualPrompt(option, dilemma);
    console.log('Generating image with optimized prompt:', prompt);
    
    // Utiliser la file d'attente pour éviter de surcharger les APIs
    const result = await requestQueue.add(async () => {
      // Essayer FLUX.1-schnell d'abord (plus rapide)
      const { data, error } = await supabase.functions.invoke('generate-image-hf', {
        body: { prompt }
      });
      
      if (error || !data?.success) {
        // Fallback rapide vers DALL-E 2 si FLUX échoue
        console.log('FLUX failed, trying DALL-E 2...');
        const fallbackData = await supabase.functions.invoke('generate-image', {
          body: { prompt: prompt.substring(0, 800) } // Limiter la taille pour DALL-E
        });
        
        if (fallbackData.error || !fallbackData.data?.success) {
          throw new Error('Both image generation methods failed');
        }
        
        return fallbackData.data.imageUrl;
      }
      
      return data.imageUrl;
    });
    
    if (result) {
      // Mettre en cache l'image générée
      imageCache.set(cacheKey, result);
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating contextual image:', error);
    return null;
  }
};

// Fonction pour créer des placeholders variés et contextuels (optimisée)
export const getVariedPlaceholder = (option: string, index: number = 0): string => {
  const cleanOption = option.replace(/^Option\s+\d+:\s*/i, '').trim();
  const colors = ['4F46E5', '7C3AED', 'DC2626', '059669', 'D97706', '0891B2'];
  const color = colors[index % colors.length];
  const text = encodeURIComponent(cleanOption.slice(0, 12));
  
  // Utiliser une URL plus simple et rapide
  return `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop&auto=format&overlay-text=${text}&overlay-color=${color}`;
};
