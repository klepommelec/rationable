
import React, { useState, useEffect } from 'react';
import { getImageFromUnsplash, getPlaceholderImage, generateContextualImageQuery } from '@/services/imageService';

interface DecisionImageProps {
  imageQuery: string;
  alt: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  option?: string; // Nouvelle prop pour l'option spécifique
  dilemma?: string; // Nouvelle prop pour le contexte du dilemme
}

export const DecisionImage: React.FC<DecisionImageProps> = ({ 
  imageQuery, 
  alt, 
  className = "",
  size = 'medium',
  option,
  dilemma
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-full h-32'
  };

  useEffect(() => {
    const fetchImage = async () => {
      setIsLoading(true);
      setHasError(false);
      
      try {
        // Utiliser l'option pour générer une requête plus contextuelle
        const contextualQuery = option 
          ? generateContextualImageQuery(option, dilemma)
          : imageQuery;
        
        console.log('Fetching image for query:', contextualQuery);
        
        const url = await getImageFromUnsplash(contextualQuery);
        if (url) {
          setImageUrl(url);
        } else {
          setImageUrl(getPlaceholderImage(contextualQuery));
        }
      } catch (error) {
        console.error('Error loading image:', error);
        setImageUrl(getPlaceholderImage(option || imageQuery));
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (imageQuery || option) {
      fetchImage();
    }
  }, [imageQuery, option, dilemma]);

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-200 animate-pulse rounded-lg ${className}`}>
        <div className="w-full h-full bg-gray-300 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} overflow-hidden rounded-lg ${className}`}>
      <img
        src={imageUrl || getPlaceholderImage(option || imageQuery)}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setImageUrl(getPlaceholderImage(option || imageQuery));
          }
        }}
      />
    </div>
  );
};
