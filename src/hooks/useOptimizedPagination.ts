
import { useMemo, useCallback, useEffect } from 'react';
import { usePaginatedData } from './usePaginatedData';
import { useDebounce } from './useDebounce';
import { useSmartPreloader } from './useSmartPreloader';
import { usePerformanceMetrics } from './usePerformanceMetrics';
import { useAdvancedCache } from './useAdvancedCache';

interface UseOptimizedPaginationOptions<T> {
  data: T[];
  searchTerm: string;
  searchFields: (keyof T)[];
  initialPageSize?: number;
  sortKey?: keyof T;
  sortDirection?: 'asc' | 'desc';
  componentName: string;
  debounceMs?: number;
  enablePreloading?: boolean;
  preloadThreshold?: number;
  enableAdvancedCache?: boolean;
}

export function useOptimizedPagination<T extends Record<string, any>>(
  options: UseOptimizedPaginationOptions<T>
) {
  const {
    data,
    searchTerm,
    searchFields,
    initialPageSize = 20,
    sortKey,
    sortDirection,
    componentName,
    debounceMs = 300,
    enablePreloading = true,
    preloadThreshold = 2,
    enableAdvancedCache = true
  } = options;

  const { recordPaginationMetric, startMetric, endMetric } = usePerformanceMetrics();
  
  // Cache avancé pour la pagination
  const { 
    fetchWithCache, 
    invalidateByTags, 
    getCacheStats 
  } = useAdvancedCache([], {
    ttl: 10 * 60 * 1000, // 10 minutes
    persist: false,
    key: `pagination_${componentName}`,
    tags: [componentName, 'pagination'],
    priority: 'high',
    autoCleanup: true
  });
  
  // Debouncer la recherche pour éviter les re-rendus excessifs
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  // Utiliser la pagination de base avec le terme de recherche debouncé
  const paginationResult = usePaginatedData({
    data,
    searchTerm: debouncedSearchTerm,
    searchFields,
    initialPageSize,
    sortKey,
    sortDirection
  });

  const {
    pagination,
    totalItems,
    isFiltered
  } = paginationResult;

  // Fonction de préchargement avec cache
  const preloadNextPage = useCallback(async () => {
    if (!enableAdvancedCache) {
      return new Promise<T[]>((resolve) => {
        setTimeout(() => resolve([]), 100);
      });
    }

    const cacheKey = `preload_${componentName}_page_${pagination.currentPage + 1}`;
    
    return fetchWithCache(
      cacheKey,
      async () => {
        // Simulation du préchargement avec cache
        await new Promise(resolve => setTimeout(resolve, 100));
        return [] as T[];
      },
      false,
      ['preload', componentName]
    );
  }, [enableAdvancedCache, componentName, pagination.currentPage, fetchWithCache]);

  // Smart preloader avec cache
  const {
    preloadNextPages,
    isPreloading,
    preloadedPagesCount
  } = useSmartPreloader(
    pagination.currentPage,
    pagination.totalPages,
    preloadNextPage,
    {
      enabled: enablePreloading,
      threshold: preloadThreshold,
      maxPreloadPages: 2
    }
  );

  // Mesurer les performances de rendu avec cache
  const measureRenderPerformance = useCallback(() => {
    const metricName = `${componentName}_render`;
    startMetric(metricName, {
      totalItems,
      pageSize: pagination.pageSize,
      currentPage: pagination.currentPage,
      searchTerm: debouncedSearchTerm,
      cacheEnabled: enableAdvancedCache
    });

    setTimeout(() => {
      const metric = endMetric(metricName);
      if (metric && metric.duration) {
        recordPaginationMetric({
          component: componentName,
          totalItems,
          pageSize: pagination.pageSize,
          currentPage: pagination.currentPage,
          searchTerm: debouncedSearchTerm || undefined,
          renderTime: metric.duration
        });
      }
    }, 0);
  }, [
    componentName,
    totalItems,
    pagination.pageSize,
    pagination.currentPage,
    debouncedSearchTerm,
    enableAdvancedCache,
    startMetric,
    endMetric,
    recordPaginationMetric
  ]);

  // Invalider le cache quand les données changent
  useEffect(() => {
    if (enableAdvancedCache && data.length > 0) {
      invalidateByTags([componentName, 'pagination']);
    }
  }, [data.length, enableAdvancedCache, invalidateByTags, componentName]);

  // Déclencher le préchargement quand nécessaire
  useEffect(() => {
    if (enablePreloading) {
      preloadNextPages();
    }
  }, [pagination.currentPage, enablePreloading, preloadNextPages]);

  // Mesurer les performances à chaque changement
  useEffect(() => {
    measureRenderPerformance();
  }, [measureRenderPerformance]);

  // Métriques de performance pour ce composant
  const performanceStats = useMemo(() => ({
    isSearching: searchTerm !== debouncedSearchTerm,
    isPreloading,
    preloadedPagesCount,
    cacheStats: enableAdvancedCache ? getCacheStats() : null,
    renderMetrics: {
      totalItems,
      currentPage: pagination.currentPage,
      pageSize: pagination.pageSize,
      isFiltered
    }
  }), [
    searchTerm,
    debouncedSearchTerm,
    isPreloading,
    preloadedPagesCount,
    enableAdvancedCache,
    getCacheStats,
    totalItems,
    pagination.currentPage,
    pagination.pageSize,
    isFiltered
  ]);

  return {
    ...paginationResult,
    performanceStats,
    isSearching: searchTerm !== debouncedSearchTerm,
    debouncedSearchTerm
  };
}
