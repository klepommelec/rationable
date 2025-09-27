import React, { useState } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  quality?: number;
  loading?: 'lazy' | 'eager';
}

/**
 * Composant d'image optimisé avec lazy loading
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  quality = 75,
  loading = 'lazy',
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      className={`${props.className || ''} ${!loaded ? 'animate-pulse bg-gray-200' : ''} ${error ? 'bg-gray-100' : ''}`}
      {...props}
    />
  );
};

/**
 * Composant d'image responsive
 */
export const ResponsiveImage: React.FC<OptimizedImageProps & {
  breakpoints?: Record<string, number>;
}> = ({ breakpoints, ...props }) => {
  return <OptimizedImage {...props} />;
};

/**
 * Composant d'image avec ratio d'aspect
 */
export const AspectRatioImage: React.FC<OptimizedImageProps & {
  aspectRatio: number;
}> = ({ aspectRatio, ...props }) => {
  return (
    <div style={{ aspectRatio: aspectRatio.toString() }}>
      <OptimizedImage {...props} />
    </div>
  );
};