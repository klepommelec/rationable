
import React, { useState, useEffect } from 'react';
import { generateContextualImage, getVariedPlaceholder } from '@/services/contextualImageService';

interface DecisionImageProps {
  imageQuery: string;
  alt: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  option?: string;
  dilemma?: string;
  index?: number; // Pour varier les placeholders
}

export const DecisionImage: React.FC<DecisionImageProps> = ({ 
  imageQuery, 
  alt, 
  className = "",
  size = 'medium',
  option,
  dilemma,
  index = 0
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
        if (option) {
          console.log('Generating contextual image for option:', option);
          const generatedImage = await generateContextualImage(option, dilemma);
          
          if (generatedImage) {
            setImageUrl(generatedImage);
          } else {
            // Fallback vers un placeholder varié
            setImageUrl(getVariedPlaceholder(option, index));
            setHasError(true);
          }
        } else {
          // Fallback générique
          setImageUrl(getVariedPlaceholder(imageQuery, index));
        }
      } catch (error) {
        console.error('Error loading image:', error);
        setImageUrl(getVariedPlaceholder(option || imageQuery, index));
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [option, dilemma, imageQuery, index]);

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-200 animate-pulse rounded-lg ${className}`}>
        <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} overflow-hidden rounded-lg ${className} relative`}>
      <img
        src={imageUrl || getVariedPlaceholder(option || imageQuery, index)}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setImageUrl(getVariedPlaceholder(option || imageQuery, index));
          }
        }}
      />
      {hasError && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <span className="text-white text-xs text-center px-1">
            {option?.slice(0, 10) || 'Image'}
          </span>
        </div>
      )}
    </div>
  );
};
