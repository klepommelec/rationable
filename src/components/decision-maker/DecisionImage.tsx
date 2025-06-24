
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
  const [progress, setProgress] = useState(0);

  const sizeClasses = {
    small: 'w-16 h-12',
    medium: 'w-24 h-18',
    large: 'w-full aspect-[4/3]'
  };

  useEffect(() => {
    const fetchImage = async () => {
      setIsLoading(true);
      setHasError(false);
      setProgress(0);
      
      // Animation de progression plus rapide pour améliorer l'UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 85));
      }, 100);
      
      try {
        if (option) {
          console.log('Generating contextual image for option:', option);
          const generatedImage = await generateContextualImage(option, dilemma);
          
          clearInterval(progressInterval);
          setProgress(100);
          
          if (generatedImage) {
            setImageUrl(generatedImage);
          } else {
            // Fallback vers un placeholder varié
            setImageUrl(getVariedPlaceholder(option, index));
            setHasError(true);
          }
        } else {
          // Fallback générique
          clearInterval(progressInterval);
          setProgress(100);
          setImageUrl(getVariedPlaceholder(imageQuery, index));
        }
      } catch (error) {
        clearInterval(progressInterval);
        console.error('Error loading image:', error);
        setImageUrl(getVariedPlaceholder(option || imageQuery, index));
        setHasError(true);
      } finally {
        setTimeout(() => setIsLoading(false), 200); // Transition plus rapide
      }
    };

    fetchImage();
  }, [option, dilemma, imageQuery, index]);

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-lg ${className} relative overflow-hidden`}>
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer absolute"></div>
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-1"></div>
          <div className="text-xs font-medium">Génération...</div>
          <div className="w-8 h-1 bg-gray-300 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} overflow-hidden rounded-lg ${className} relative group`}>
      <img
        src={imageUrl || getVariedPlaceholder(option || imageQuery, index)}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
