
import { supabase } from '@/integrations/supabase/client';

// Cache pour éviter de régénérer les mêmes images
const imageCache = new Map<string, string>();

// Fonction pour générer un prompt contextuel spécifique optimisé pour FLUX.1-schnell
export const generateContextualPrompt = (option: string, dilemma?: string): string => {
  // Nettoyer l'option des préfixes comme "Option 1:", etc.
  const cleanOption = option.replace(/^Option\s+\d+:\s*/i, '').trim();
  
  // Détecter le type de décision pour adapter le style
  const dilemmaLower = dilemma?.toLowerCase() || '';
  let style = 'high quality, professional, detailed, vibrant colors';
  
  if (dilemmaLower.includes('voyage') || dilemmaLower.includes('destination') || dilemmaLower.includes('vacances')) {
    style = 'beautiful destination, travel photography, scenic landscape, vibrant colors';
  } else if (dilemmaLower.includes('restaurant') || dilemmaLower.includes('manger') || dilemmaLower.includes('cuisine')) {
    style = 'delicious food photography, appetizing presentation, professional lighting';
  } else if (dilemmaLower.includes('voiture') || dilemmaLower.includes('acheter') || dilemmaLower.includes('produit')) {
    style = 'product photography, clean background, commercial style, sharp focus';
  } else if (dilemmaLower.includes('emploi') || dilemmaLower.includes('travail') || dilemmaLower.includes('carrière')) {
    style = 'professional workplace, modern office environment, business setting';
  } else if (dilemmaLower.includes('maison') || dilemmaLower.includes('appartement') || dilemmaLower.includes('logement')) {
    style = 'real estate photography, modern interior design, architectural';
  }
  
  // Construire le prompt final optimisé pour FLUX.1-schnell
  return `${cleanOption}, ${style}, sharp focus`;
};

// Fonction pour générer une image via l'edge function Hugging Face FLUX.1-schnell (rapide)
export const generateContextualImage = async (option: string, dilemma?: string): Promise<string | null> => {
  const cacheKey = `${option}-${dilemma}`;
  
  // Vérifier le cache d'abord
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }
  
  try {
    const prompt = generateContextualPrompt(option, dilemma);
    console.log('Generating image with FLUX.1-schnell, prompt:', prompt);
    
    // Essayer FLUX.1-schnell d'abord (rapide)
    const { data, error } = await supabase.functions.invoke('generate-image-hf', {
      body: { prompt }
    });
    
    if (error) {
      console.error('Error calling generate-image-hf function:', error);
      
      // Fallback vers DALL-E 2 si FLUX échoue
      console.log('Falling back to DALL-E 2...');
      const fallbackData = await supabase.functions.invoke('generate-image', {
        body: { prompt: generateContextualPrompt(option, dilemma).substring(0, 900) }
      });
      
      if (fallbackData.error) {
        console.error('Both image generation methods failed');
        return null;
      }
      
      if (fallbackData.data?.success && fallbackData.data?.imageUrl) {
        imageCache.set(cacheKey, fallbackData.data.imageUrl);
        return fallbackData.data.imageUrl;
      }
      
      return null;
    }
    
    if (data?.success && data?.imageUrl) {
      // Mettre en cache l'image générée
      imageCache.set(cacheKey, data.imageUrl);
      return data.imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating contextual image with FLUX.1-schnell:', error);
    return null;
  }
};

// Fonction pour créer des placeholders variés et contextuels
export const getVariedPlaceholder = (option: string, index: number = 0): string => {
  const cleanOption = option.replace(/^Option\s+\d+:\s*/i, '').trim();
  const colors = ['4F46E5', '7C3AED', 'DC2626', '059669', 'D97706', '0891B2'];
  const patterns = ['circuit-board', 'topography', 'texture', 'geometric'];
  
  const color = colors[index % colors.length];
  const pattern = patterns[index % patterns.length];
  const text = cleanOption.slice(0, 15);
  
  return `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop&auto=format&overlay-text=${encodeURIComponent(text)}&overlay-color=${color}&pattern=${pattern}`;
};
