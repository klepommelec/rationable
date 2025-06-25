
import { useCallback, useMemo, useRef, useEffect } from 'react';

export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
}

export function useIntersectionObserver(
  options?: IntersectionObserverInit
) {
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  const isIntersecting = useMemo(() => {
    if (!elementRef.current) return false;

    let intersecting = false;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        intersecting = entry.isIntersecting;
      },
      options
    );

    observerRef.current.observe(elementRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [options]);

  return { elementRef, isIntersecting };
}

export function useMemoizedComputation<T>(
  computation: () => T,
  dependencies: React.DependencyList
): T {
  return useMemo(computation, dependencies);
}

// Nouveau hook pour optimiser les calculs complexes
export function useDeepMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  const ref = useRef<{ deps: React.DependencyList; value: T }>();
  
  if (!ref.current || !areEqual(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() };
  }
  
  return ref.current.value;
}

// Helper pour comparaison profonde
function areEqual(a: React.DependencyList, b: React.DependencyList): boolean {
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  
  return true;
}

// Hook pour les calculs coûteux avec cache
export function useExpensiveCalculation<T, Args extends any[]>(
  calculation: (...args: Args) => T,
  dependencies: React.DependencyList
) {
  const cacheRef = useRef<Map<string, T>>(new Map());
  
  return useCallback((...args: Args): T => {
    const key = JSON.stringify(args);
    
    if (cacheRef.current.has(key)) {
      return cacheRef.current.get(key)!;
    }
    
    const result = calculation(...args);
    cacheRef.current.set(key, result);
    
    // Nettoyer le cache si il devient trop gros
    if (cacheRef.current.size > 100) {
      const entries = Array.from(cacheRef.current.entries());
      cacheRef.current.clear();
      // Garder les 50 derniers
      entries.slice(-50).forEach(([k, v]) => cacheRef.current.set(k, v));
    }
    
    return result;
  }, dependencies);
}
