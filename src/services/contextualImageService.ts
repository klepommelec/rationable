
import { supabase } from '@/integrations/supabase/client';

// Cache pour éviter de régénérer les mêmes images
const imageCache = new Map<string, string>();

// Fonction pour générer un prompt contextuel spécifique optimisé pour DALL-E 2
export const generateContextualPrompt = (option: string, dilemma?: string): string => {
  // Nettoyer l'option des préfixes comme "Option 1:", etc.
  const cleanOption = option.replace(/^Option\s+\d+:\s*/i, '').trim();
  
  // Détecter le type de décision pour adapter le style
  const dilemmaLower = dilemma?.toLowerCase() || '';
  let style = 'high quality, professional';
  
  if (dilemmaLower.includes('voyage') || dilemmaLower.includes('destination') || dilemmaLower.includes('vacances')) {
    style = 'beautiful destination, travel photography';
  } else if (dilemmaLower.includes('restaurant') || dilemmaLower.includes('manger') || dilemmaLower.includes('cuisine')) {
    style = 'delicious food photography';
  } else if (dilemmaLower.includes('voiture') || dilemmaLower.includes('acheter') || dilemmaLower.includes('produit')) {
    style = 'product photography, clean background';
  } else if (dilemmaLower.includes('emploi') || dilemmaLower.includes('travail') || dilemmaLower.includes('carrière')) {
    style = 'professional workplace';
  } else if (dilemmaLower.includes('maison') || dilemmaLower.includes('appartement') || dilemmaLower.includes('logement')) {
    style = 'real estate photography';
  }
  
  // Construire le prompt final optimisé pour DALL-E 2 (limité à 1000 caractères)
  const prompt = `${cleanOption}, ${style}, detailed`;
  return prompt.length > 900 ? prompt.substring(0, 900) + '...' : prompt;
};

// Fonction pour générer une image via l'edge function OpenAI DALL-E 2
export const generateContextualImage = async (option: string, dilemma?: string): Promise<string | null> => {
  const cacheKey = `${option}-${dilemma}`;
  
  // Vérifier le cache d'abord
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }
  
  try {
    const prompt = generateContextualPrompt(option, dilemma);
    console.log('Generating image with DALL-E 2, prompt:', prompt);
    
    const { data, error } = await supabase.functions.invoke('generate-image', {
      body: { prompt }
    });
    
    if (error) {
      console.error('Error calling generate-image function:', error);
      return null;
    }
    
    if (data?.success && data?.imageUrl) {
      // Mettre en cache l'image générée
      imageCache.set(cacheKey, data.imageUrl);
      return data.imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating contextual image with DALL-E 2:', error);
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
