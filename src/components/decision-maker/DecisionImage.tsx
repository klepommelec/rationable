
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
  allowAI?: boolean; // Nouveau prop pour contrôler l'usage de l'IA
}

export const DecisionImage: React.FC<DecisionImageProps> = ({ 
  imageQuery, 
  alt, 
  className = "",
  size = 'medium',
  option,
  dilemma,
  index = 0,
  allowAI = false // Par défaut, pas d'IA pour économiser
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
      
      // Animation de progression plus rapide pour l'UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 20, 90));
      }, 100);
      
      try {
        if (option) {
          console.log('🔍 Recherche image économique pour:', option);
          
          // Utiliser la nouvelle stratégie économique (Google > Défaut)
          const economicalImage = await generateContextualImage(option, dilemma);
          
          clearInterval(progressInterval);
          setProgress(100);
          
          if (economicalImage) {
            setImageUrl(economicalImage);
          } else {
            // Fallback sur placeholder
            setImageUrl(getVariedPlaceholder(option, index));
            setHasError(true);
          }
        } else {
          // Fallback direct pour les requêtes génériques
          clearInterval(progressInterval);
          setProgress(100);
          setImageUrl(getVariedPlaceholder(imageQuery, index));
        }
      } catch (error) {
        clearInterval(progressInterval);
        console.error('Error loading economical image:', error);
        setImageUrl(getVariedPlaceholder(option || imageQuery, index));
        setHasError(true);
      } finally {
        setTimeout(() => setIsLoading(false), 150); // Plus rapide
      }
    };

    fetchImage();
  }, [option, dilemma, imageQuery, index, allowAI]);

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-lg ${className} relative overflow-hidden`}>
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer absolute"></div>
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mb-1"></div>
          <div className="text-xs font-medium">Recherche...</div>
          <div className="w-6 h-1 bg-gray-300 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-primary transition-all duration-200 ease-out"
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
      {hasError && !allowAI && (
        <div className="absolute top-1 right-1">
          <span className="bg-green-500 text-white text-xs px-1 py-0.5 rounded" title="Mode économique">
            💰
          </span>
        </div>
      )}
    </div>
  );
};
