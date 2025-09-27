import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  fcp?: number; // First Contentful Paint
  navigation?: PerformanceNavigationTiming;
  resources?: PerformanceResourceTiming[];
}

interface PerformanceReport {
  url: string;
  timestamp: number;
  metrics: PerformanceMetrics;
  userAgent: string;
  connection?: string;
}

/**
 * Composant de monitoring des performances en temps réel
 */
export const PerformanceMonitor = () => {
  const location = useLocation();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Activer le monitoring seulement en production ou si explicitement demandé
    const shouldMonitor = import.meta.env.PROD || 
                         import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true';
    
    if (!shouldMonitor) return;

    setIsEnabled(true);

    // Observer les métriques de performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          setMetrics(prev => ({
            ...prev,
            navigation: entry as PerformanceNavigationTiming
          }));
        } else if (entry.entryType === 'paint') {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({
              ...prev,
              fcp: entry.startTime
            }));
          }
        } else if (entry.entryType === 'largest-contentful-paint') {
          setMetrics(prev => ({
            ...prev,
            lcp: entry.startTime
          }));
        } else if (entry.entryType === 'first-input') {
          setMetrics(prev => ({
            ...prev,
            fid: (entry as any).processingStart - entry.startTime
          }));
        } else if (entry.entryType === 'layout-shift') {
          if (!(entry as any).hadRecentInput) {
            setMetrics(prev => ({
              ...prev,
              cls: (prev.cls || 0) + (entry as any).value
            }));
          }
        }
      });
    });

    // Observer différents types d'entrées
    try {
      observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Performance Observer not fully supported:', error);
    }

    // Observer les ressources
    const resourceObserver = new PerformanceObserver((list) => {
      const resources = list.getEntries() as PerformanceResourceTiming[];
      setMetrics(prev => ({
        ...prev,
        resources: [...(prev.resources || []), ...resources]
      }));
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Resource Performance Observer not supported:', error);
    }

    // Charger les Web Vitals si disponibles
    if (import.meta.env.PROD) {
      import('web-vitals').then(({ onCLS, onFID, onLCP, onTTFB, onFCP }) => {
        onCLS((metric) => {
          setMetrics(prev => ({ ...prev, cls: metric.value }));
          reportMetric('CLS', metric.value);
        });

        onFID((metric) => {
          setMetrics(prev => ({ ...prev, fid: metric.value }));
          reportMetric('FID', metric.value);
        });

        onLCP((metric) => {
          setMetrics(prev => ({ ...prev, lcp: metric.value }));
          reportMetric('LCP', metric.value);
        });

        onTTFB((metric) => {
          setMetrics(prev => ({ ...prev, ttfb: metric.value }));
          reportMetric('TTFB', metric.value);
        });

        onFCP((metric) => {
          setMetrics(prev => ({ ...prev, fcp: metric.value }));
          reportMetric('FCP', metric.value);
        });
      }).catch(() => {
        console.warn('Web Vitals not available');
      });
    }

    return () => {
      observer.disconnect();
      resourceObserver.disconnect();
    };
  }, []);

  // Reporter les métriques
  const reportMetric = (name: string, value: number) => {
    if (import.meta.env.PROD) {
      // En production, envoyer les métriques à un service d'analytics
      console.log(`Performance Metric - ${name}:`, value);
      
      // Exemple d'envoi à un service d'analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'web_vitals', {
          metric_name: name,
          metric_value: Math.round(value),
          metric_rating: getMetricRating(name, value)
        });
      }
    }
  };

  // Déterminer la qualité d'une métrique
  const getMetricRating = (name: string, value: number): string => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      TTFB: { good: 800, poor: 1800 },
      FCP: { good: 1800, poor: 3000 }
    };

    const threshold = thresholds[name];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  // Envoyer un rapport complet lors du changement de route
  useEffect(() => {
    if (!isEnabled || !metrics.navigation) return;

    const report: PerformanceReport = {
      url: location.pathname,
      timestamp: Date.now(),
      metrics,
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType
    };

    // Envoyer le rapport
    sendPerformanceReport(report);
  }, [location.pathname, metrics, isEnabled]);

  const sendPerformanceReport = async (report: PerformanceReport) => {
    if (!import.meta.env.PROD) {
      console.log('Performance Report:', report);
      return;
    }

    try {
      // Envoyer à votre service d'analytics
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      });
    } catch (error) {
      console.warn('Failed to send performance report:', error);
    }
  };

  // En mode développement, afficher les métriques
  if (import.meta.env.DEV && isEnabled) {
    return (
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs font-mono max-w-xs">
        <div className="font-bold mb-2">Performance Metrics</div>
        {metrics.lcp && <div>LCP: {metrics.lcp.toFixed(0)}ms</div>}
        {metrics.fid && <div>FID: {metrics.fid.toFixed(0)}ms</div>}
        {metrics.cls && <div>CLS: {metrics.cls.toFixed(3)}</div>}
        {metrics.ttfb && <div>TTFB: {metrics.ttfb.toFixed(0)}ms</div>}
        {metrics.fcp && <div>FCP: {metrics.fcp.toFixed(0)}ms</div>}
        {metrics.navigation && (
          <div>DOM Load: {metrics.navigation.domContentLoadedEventEnd - metrics.navigation.navigationStart}ms</div>
        )}
      </div>
    );
  }

  return null;
};

/**
 * Hook pour accéder aux métriques de performance
 */
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

  useEffect(() => {
    if (!import.meta.env.PROD) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          setMetrics(prev => ({
            ...prev,
            navigation: entry as PerformanceNavigationTiming
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });

    return () => observer.disconnect();
  }, []);

  return metrics;
};

/**
 * Utilitaires de performance
 */
export const performanceUtils = {
  /**
   * Mesurer le temps d'exécution d'une fonction
   */
  measureFunction: function<T>(fn: () => T, label: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  },

  /**
   * Mesurer le temps d'exécution d'une fonction asynchrone
   */
  measureAsyncFunction: async function<T>(fn: () => Promise<T>, label: string): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    console.log(`${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  },

  /**
   * Marquer un point de performance
   */
  mark: (name: string) => {
    performance.mark(name);
  },

  /**
   * Mesurer entre deux marques
   */
  measure: (name: string, startMark: string, endMark?: string) => {
    if (endMark) {
      performance.measure(name, startMark, endMark);
    } else {
      performance.measure(name, startMark);
    }
    
    const measures = performance.getEntriesByName(name, 'measure');
    const lastMeasure = measures[measures.length - 1];
    console.log(`${name}: ${lastMeasure.duration.toFixed(2)}ms`);
  },

  /**
   * Obtenir les métriques de navigation
   */
  getNavigationMetrics: () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return null;

    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      dom: navigation.domContentLoadedEventEnd - navigation.navigationStart,
      load: navigation.loadEventEnd - navigation.navigationStart
    };
  },

  /**
   * Obtenir les métriques des ressources
   */
  getResourceMetrics: () => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources.map(resource => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize,
      type: resource.initiatorType
    }));
  }
};