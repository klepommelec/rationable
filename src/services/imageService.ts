
interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    thumb: string;
    regular: string;
  };
  alt_description: string;
  description: string;
}

export const getImageFromUnsplash = async (query: string): Promise<string | null> => {
  try {
    // Nettoyer et préparer la requête de manière plus spécifique
    const cleanQuery = query.replace(/[^\w\s]/g, '').trim();
    if (!cleanQuery) return null;

    // Ajouter des termes pour améliorer la pertinence
    const enhancedQuery = `${cleanQuery} product high quality professional`;

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(enhancedQuery)}&per_page=3&orientation=landscape&order_by=relevant`,
      {
        headers: {
          'Authorization': 'Client-ID 8H6lzA8F_NLFo7Ep6kYQHqOwQQfqQ3w0QH0W6LZGbys'
        }
      }
    );

    if (!response.ok) {
      console.warn('Unsplash API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      // Prendre une image aléatoire parmi les 3 premières pour plus de variété
      const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 3));
      const image: UnsplashImage = data.results[randomIndex];
      return image.urls.regular; // Utiliser 'regular' au lieu de 'small' pour une meilleure qualité
    }

    return null;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

// Fonction pour créer une requête d'image contextuelle basée sur l'option
export const generateContextualImageQuery = (option: string, dilemma?: string): string => {
  // Nettoyer l'option des préfixes comme "Option 1:", etc.
  const cleanOption = option.replace(/^Option\s+\d+:\s*/i, '').trim();
  
  // Extraire les mots-clés principaux
  const keywords = cleanOption.split(' ').slice(0, 3).join(' ');
  
  // Si on a le contexte du dilemme, l'utiliser pour affiner
  if (dilemma) {
    const dilemmaKeywords = dilemma.split(' ').slice(0, 2).join(' ');
    return `${keywords} ${dilemmaKeywords}`;
  }
  
  return keywords;
};

// Fonction pour obtenir une image placeholder en cas d'échec
export const getPlaceholderImage = (query: string): string => {
  // Utiliser des images placeholder d'Unsplash basées sur la requête
  const seed = query.toLowerCase().replace(/\s+/g, '-');
  return `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=300&fit=crop&seed=${seed}`;
};
