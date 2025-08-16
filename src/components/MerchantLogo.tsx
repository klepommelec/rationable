import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { getFaviconSources } from '@/utils/favicon';

interface MerchantLogoProps {
  url: string;
  size: number;
  alt?: string;
  className?: string;
}

export const MerchantLogo: React.FC<MerchantLogoProps> = ({ 
  url, 
  size, 
  alt = "", 
  className = "" 
}) => {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  const sources = getFaviconSources(url, size);
  
  const handleError = () => {
    if (currentSourceIndex < sources.length - 1) {
      setCurrentSourceIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  if (hasError || sources.length === 0) {
    return (
      <div 
        className={`bg-background border border-border rounded-full flex items-center justify-center ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      >
        <ShoppingBag className="text-muted-foreground" size={Math.floor(size * 0.6)} />
      </div>
    );
  }

  const currentSource = sources[currentSourceIndex];
  
  return (
    <div 
      className={`bg-background border border-border rounded-full flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <img 
        src={currentSource.url}
        srcSet={currentSource.srcSet}
        alt={alt}
        width={size}
        height={size}
        className="object-contain"
        onError={handleError}
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
};