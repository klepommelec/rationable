
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
    // Nettoyer et préparer la requête
    const cleanQuery = query.replace(/[^\w\s]/g, '').trim();
    if (!cleanQuery) return null;

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(cleanQuery)}&per_page=1&orientation=landscape`,
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
      const image: UnsplashImage = data.results[0];
      return image.urls.small;
    }

    return null;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

// Fonction pour obtenir une image placeholder en cas d'échec
export const getPlaceholderImage = (query: string): string => {
  // Utiliser des images placeholder d'Unsplash basées sur la requête
  const seed = query.toLowerCase().replace(/\s+/g, '-');
  return `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=200&fit=crop&seed=${seed}`;
};
