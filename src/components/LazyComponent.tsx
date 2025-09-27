import React, { Suspense, lazy, ComponentType } from 'react';

/**
 * Crée un composant lazy avec des options de configuration
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: {
    preload?: boolean;
    preloadDelay?: number;
    retryCount?: number;
  } = {}
) {
  const LazyComponent = lazy(importFunc);
  
  // Préchargement si activé
  if (options.preload && options.preloadDelay) {
    setTimeout(() => {
      importFunc().catch(() => {
        // Ignorer les erreurs de préchargement
      });
    }, options.preloadDelay);
  }
  
  return LazyComponent;
}

/**
 * Composant de fallback pour le lazy loading
 */
export const SkeletonFallback: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
);

/**
 * Composant lazy avec Intersection Observer
 */
export const IntersectionLazyComponent: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = <SkeletonFallback /> }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
};

/**
 * Utilitaires pour le lazy loading
 */
export const lazyUtils = {
  /**
   * Précharge un composant
   */
  preload: (importFunc: () => Promise<any>) => {
    importFunc().catch(() => {
      console.warn('Failed to preload component');
    });
  },

  /**
   * Précharge plusieurs composants
   */
  preloadMultiple: (importFuncs: (() => Promise<any>)[]) => {
    Promise.all(importFuncs.map(func => func())).catch(() => {
      console.warn('Failed to preload some components');
    });
  },
};