
import React, { useState, useEffect } from 'react';
import { getImageFromUnsplash, getPlaceholderImage } from '@/services/imageService';

interface DecisionImageProps {
  imageQuery: string;
  alt: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const DecisionImage: React.FC<DecisionImageProps> = ({ 
  imageQuery, 
  alt, 
  className = "",
  size = 'medium'
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
        const url = await getImageFromUnsplash(imageQuery);
        if (url) {
          setImageUrl(url);
        } else {
          setImageUrl(getPlaceholderImage(imageQuery));
        }
      } catch (error) {
        console.error('Error loading image:', error);
        setImageUrl(getPlaceholderImage(imageQuery));
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (imageQuery) {
      fetchImage();
    }
  }, [imageQuery]);

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
        src={imageUrl || getPlaceholderImage(imageQuery)}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setImageUrl(getPlaceholderImage(imageQuery));
          }
        }}
      />
    </div>
  );
};
