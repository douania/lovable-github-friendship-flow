
import { useCallback, useRef } from 'react';

interface PreloaderOptions {
  enabled?: boolean;
  threshold?: number; // Précharger quand on est à X pages de la fin
  maxPreloadPages?: number;
}

export function useSmartPreloader<T>(
  data: T[],
  pageSize: number,
  currentPage: number,
  totalPages: number,
  preloadFn: (page: number) => Promise<T[]>,
  options: PreloaderOptions = {}
) {
  const { enabled = true, threshold = 2, maxPreloadPages = 3 } = options;
  const preloadedPages = useRef<Set<number>>(new Set());
  const preloadingPages = useRef<Set<number>>(new Set());

  const shouldPreload = useCallback(() => {
    if (!enabled) return false;
    return currentPage + threshold >= totalPages;
  }, [enabled, currentPage, threshold, totalPages]);

  const preloadNextPages = useCallback(async () => {
    if (!shouldPreload()) return;

    const pagesToPreload: number[] = [];
    
    // Calculer les pages à précharger
    for (let i = 1; i <= maxPreloadPages && currentPage + i <= totalPages; i++) {
      const pageToPreload = currentPage + i;
      if (!preloadedPages.current.has(pageToPreload) && !preloadingPages.current.has(pageToPreload)) {
        pagesToPreload.push(pageToPreload);
      }
    }

    // Précharger les pages
    for (const page of pagesToPreload) {
      preloadingPages.current.add(page);
      
      try {
        await preloadFn(page);
        preloadedPages.current.add(page);
        console.log(`Page ${page} preloaded successfully`);
      } catch (error) {
        console.error(`Failed to preload page ${page}:`, error);
      } finally {
        preloadingPages.current.delete(page);
      }
    }
  }, [shouldPreload, maxPreloadPages, currentPage, totalPages, preloadFn]);

  const resetPreloader = useCallback(() => {
    preloadedPages.current.clear();
    preloadingPages.current.clear();
  }, []);

  return {
    preloadNextPages,
    resetPreloader,
    isPreloading: preloadingPages.current.size > 0,
    preloadedPagesCount: preloadedPages.current.size
  };
}
