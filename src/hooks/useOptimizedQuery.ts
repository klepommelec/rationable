import { useState, useEffect, useCallback, useRef } from 'react';
import { apiCache, cacheUtils } from '@/utils/cache';

interface QueryOptions<T> {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  retry?: number | boolean;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  tags?: string[]; // Tags pour l'invalidation du cache
}

interface QueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

/**
 * Hook optimisé pour les requêtes avec cache intelligent
 */
export function useOptimizedQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options: QueryOptions<T> = {}
): QueryResult<T> {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus = true,
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    tags = []
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Fonction de requête avec retry et cache
   */
  const executeQuery = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    // Vérifier le cache d'abord
    if (!forceRefresh) {
      const cachedData = apiCache.get<T>(queryKey);
      if (cachedData) {
        setData(cachedData);
        setIsLoading(false);
        setIsError(false);
        setError(null);
        onSuccess?.(cachedData);
        return;
      }
    }

    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau AbortController
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await queryFn();
      
      // Vérifier si la requête a été annulée
      if (signal.aborted) return;

      // Mettre en cache le résultat
      apiCache.set(queryKey, result, tags, cacheTime);
      
      setData(result);
      setIsLoading(false);
      retryCountRef.current = 0;
      onSuccess?.(result);
    } catch (err) {
      // Vérifier si la requête a été annulée
      if (signal.aborted) return;

      const error = err instanceof Error ? err : new Error('Unknown error');
      
      // Gérer les retries
      if (retryCountRef.current < (typeof retry === 'boolean' ? (retry ? 3 : 0) : retry)) {
        retryCountRef.current++;
        setTimeout(() => {
          executeQuery(forceRefresh);
        }, retryDelay * retryCountRef.current);
        return;
      }

      setIsError(true);
      setError(error);
      setIsLoading(false);
      onError?.(error);
    }
  }, [queryKey, queryFn, enabled, cacheTime, tags, retry, retryDelay, onSuccess, onError]);

  /**
   * Fonction de refetch
   */
  const refetch = useCallback(async () => {
    await executeQuery(true);
  }, [executeQuery]);

  /**
   * Fonction d'invalidation du cache
   */
  const invalidate = useCallback(() => {
    apiCache.delete(queryKey);
    if (tags.length > 0) {
      apiCache.invalidateByTags(tags);
    }
  }, [queryKey, tags]);

  // Effet principal
  useEffect(() => {
    executeQuery();
  }, [executeQuery]);

  // Gestion du focus de la fenêtre
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      // Vérifier si les données sont stale
      const cachedData = apiCache.get<T>(queryKey);
      if (cachedData) {
        // Les données sont en cache, pas besoin de refetch
        return;
      }
      executeQuery();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, executeQuery, queryKey]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    invalidate
  };
}

/**
 * Hook pour les requêtes avec pagination
 */
export function useOptimizedPaginatedQuery<T>(
  queryKey: string,
  queryFn: (page: number, limit: number) => Promise<{ data: T[]; total: number; page: number; limit: number }>,
  options: QueryOptions<{ data: T[]; total: number; page: number; limit: number }> & {
    initialPage?: number;
    initialLimit?: number;
  } = {}
) {
  const { initialPage = 1, initialLimit = 10, ...queryOptions } = options;
  
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  
  const paginatedQueryKey = `${queryKey}:page:${page}:limit:${limit}`;
  
  const query = useOptimizedQuery(
    paginatedQueryKey,
    () => queryFn(page, limit),
    {
      ...queryOptions,
      tags: [...(queryOptions.tags || []), queryKey] // Invalider toutes les pages quand la base change
    }
  );

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset à la première page
  }, []);

  return {
    ...query,
    page,
    limit,
    goToPage,
    changeLimit,
    totalPages: query.data ? Math.ceil(query.data.total / limit) : 0
  };
}

/**
 * Hook pour les requêtes avec recherche
 */
export function useOptimizedSearchQuery<T>(
  queryKey: string,
  queryFn: (searchTerm: string) => Promise<T[]>,
  options: QueryOptions<T[]> & {
    debounceMs?: number;
    minSearchLength?: number;
  } = {}
) {
  const { debounceMs = 300, minSearchLength = 2, ...queryOptions } = options;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Debounce du terme de recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  const searchQueryKey = `${queryKey}:search:${debouncedSearchTerm}`;
  
  const query = useOptimizedQuery(
    searchQueryKey,
    () => queryFn(debouncedSearchTerm),
    {
      ...queryOptions,
      enabled: debouncedSearchTerm.length >= minSearchLength,
      tags: [...(queryOptions.tags || []), queryKey]
    }
  );

  return {
    ...query,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm
  };
}

/**
 * Hook pour les mutations avec cache
 */
export function useOptimizedMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: string[]; // Clés de requêtes à invalider
    invalidateTags?: string[]; // Tags à invalider
  } = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await mutationFn(variables);
      
      setData(result);
      setIsLoading(false);
      
      // Invalider les caches
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach(key => apiCache.delete(key));
      }
      
      if (options.invalidateTags) {
        apiCache.invalidateByTags(options.invalidateTags);
      }
      
      options.onSuccess?.(result, variables);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setIsError(true);
      setError(error);
      setIsLoading(false);
      options.onError?.(error, variables);
      throw error;
    }
  }, [mutationFn, options]);

  return {
    mutate,
    isLoading,
    isError,
    error,
    data
  };
}


