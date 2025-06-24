
// Fichier remplacé par contextualImageService.ts
// Gardé pour compatibilité temporaire

export const getPlaceholderImage = (query: string): string => {
  const seed = query.toLowerCase().replace(/\s+/g, '-');
  return `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=300&fit=crop&seed=${seed}`;
};

// Fonctions obsolètes - utilisez contextualImageService.ts à la place
export const getImageFromUnsplash = async (query: string): Promise<string | null> => {
  console.warn('getImageFromUnsplash is deprecated, use contextualImageService instead');
  return null;
};

export const generateContextualImageQuery = (option: string, dilemma?: string): string => {
  console.warn('generateContextualImageQuery is deprecated, use contextualImageService instead');
  return option;
};
