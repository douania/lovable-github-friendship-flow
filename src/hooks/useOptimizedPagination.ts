
import { useMemo, useCallback, useEffect } from 'react';
import { usePaginatedData } from './usePaginatedData';
import { useDebounce } from './useDebounce';
import { useSmartPreloader } from './useSmartPreloader';
import { usePerformanceMetrics } from './usePerformanceMetrics';

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
    preloadThreshold = 2
  } = options;

  const { recordPaginationMetric, startMetric, endMetric } = usePerformanceMetrics();
  
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
    paginatedData,
    pagination,
    totalItems,
    isFiltered
  } = paginationResult;

  // Fonction de préchargement simulée (à adapter selon vos besoins)
  const preloadNextPage = useCallback(async (page: number) => {
    // Ici, vous pourriez précharger les données de la page suivante
    // Pour l'instant, on simule juste le préchargement
    return new Promise<T[]>((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 100);
    });
  }, []);

  // Smart preloader
  const {
    preloadNextPages,
    isPreloading,
    preloadedPagesCount
  } = useSmartPreloader(
    paginatedData,
    pagination.pageSize,
    pagination.currentPage,
    pagination.totalPages,
    preloadNextPage,
    {
      enabled: enablePreloading,
      threshold: preloadThreshold,
      maxPreloadPages: 2
    }
  );

  // Mesurer les performances de rendu
  const measureRenderPerformance = useCallback(() => {
    const metricName = `${componentName}_render`;
    startMetric(metricName, {
      totalItems,
      pageSize: pagination.pageSize,
      currentPage: pagination.currentPage,
      searchTerm: debouncedSearchTerm
    });

    // Simuler la fin de rendu avec setTimeout
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
    startMetric,
    endMetric,
    recordPaginationMetric
  ]);

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
