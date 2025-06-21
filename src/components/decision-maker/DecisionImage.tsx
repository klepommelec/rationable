
import React, { useState, useEffect } from 'react';
import { generateContextualImage, getVariedPlaceholder } from '@/services/contextualImageService';

interface DecisionImageProps {
  imageQuery: string;
  alt: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  option?: string;
  dilemma?: string;
  index?: number;
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
  const [loadingMessage, setLoadingMessage] = useState('Recherche d\'image...');

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
      setLoadingMessage('Recherche d\'image...');
      
      // Animation de progression optimisée
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 30) return prev + 10; // Recherche Google (rapide)
          if (prev < 70) return prev + 5;  // Traitement
          return Math.min(prev + 2, 90);   // Finalisation
        });
      }, 200);
      
      try {
        if (option) {
          console.log('🔍 Searching image for option:', option);
          
          // Changer le message selon l'étape
          setTimeout(() => setLoadingMessage('Analyse des résultats...'), 1000);
          setTimeout(() => setLoadingMessage('Optimisation...'), 2000);
          
          const foundImage = await generateContextualImage(option, dilemma);
          
          clearInterval(progressInterval);
          setProgress(100);
          
          if (foundImage) {
            setImageUrl(foundImage);
            setLoadingMessage('Image trouvée !');
          } else {
            // Fallback vers un placeholder varié
            setImageUrl(getVariedPlaceholder(option, index));
            setHasError(true);
            setLoadingMessage('Placeholder utilisé');
          }
        } else {
          // Fallback générique
          clearInterval(progressInterval);
          setProgress(100);
          setImageUrl(getVariedPlaceholder(imageQuery, index));
          setLoadingMessage('Image par défaut');
        }
      } catch (error) {
        clearInterval(progressInterval);
        console.error('❌ Error loading image:', error);
        setImageUrl(getVariedPlaceholder(option || imageQuery, index));
        setHasError(true);
        setLoadingMessage('Erreur - placeholder');
      } finally {
        setTimeout(() => setIsLoading(false), 300); // Transition fluide
      }
    };

    fetchImage();
  }, [option, dilemma, imageQuery, index]);

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-100 via-purple-50 to-blue-100 animate-pulse rounded-lg ${className} relative overflow-hidden`}>
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer absolute"></div>
        <div className="w-full h-full flex flex-col items-center justify-center text-blue-600">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-1"></div>
          <div className="text-xs font-medium text-center px-1">{loadingMessage}</div>
          <div className="w-8 h-1 bg-blue-200 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-out"
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
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <span className="text-white text-xs text-center px-1">
            {option?.slice(0, 10) || 'Image'}
          </span>
        </div>
      )}
      
      {/* Indicateur de source de l'image */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 rounded">
          {hasError ? '📷' : '🔍'}
        </div>
      </div>
    </div>
  );
};
