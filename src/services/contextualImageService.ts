
import { supabase } from '@/integrations/supabase/client';

// Cache pour éviter de régénérer les mêmes images
const imageCache = new Map<string, string>();

// GÉNÉRATION D'IMAGES DÉSACTIVÉE - Mode économie
const IMAGE_GENERATION_ENABLED = false;

// File d'attente pour limiter les requêtes simultanées
class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private running = 0;
  private maxConcurrent = 2;

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

// Fonction pour générer une image via l'edge function (DÉSACTIVÉE)
export const generateContextualImage = async (option: string, dilemma?: string): Promise<string | null> => {
  // GÉNÉRATION DÉSACTIVÉE - Retourner null immédiatement
  if (!IMAGE_GENERATION_ENABLED) {
    console.log('Image generation is disabled to save credits');
    return null;
  }

  const cacheKey = `${option}-${dilemma}`;
  
  // Vérifier le cache d'abord
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }
  
  try {
    const prompt = generateContextualPrompt(option, dilemma);
    console.log('Generating image with optimized prompt:', prompt);
    
    // Code de génération désactivé
    return null;
    
  } catch (error) {
    console.error('Error generating contextual image:', error);
    return null;
  }
};

// Fonction pour créer des placeholders variés et contextuels (DÉSACTIVÉE)
export const getVariedPlaceholder = (option: string, index: number = 0): string => {
  // PLACEHOLDERS DÉSACTIVÉS - Retourner une chaîne vide
  return '';
};
