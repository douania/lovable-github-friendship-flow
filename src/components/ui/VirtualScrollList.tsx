
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePerformanceMetrics } from '../../hooks/usePerformanceMetrics';

interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number | ((index: number, item: T) => number);
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  className?: string;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

interface VisibleRange {
  start: number;
  end: number;
}

export function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  onScroll,
  className = '',
  loading = false,
  loadingComponent,
  emptyComponent,
  onEndReached,
  endReachedThreshold = 0.8
}: VirtualScrollListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleRange, setVisibleRange] = useState<VisibleRange>({ start: 0, end: 0 });
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const { startMetric, endMetric } = usePerformanceMetrics();

  // Calculate item heights and positions
  const itemMetrics = useMemo(() => {
    let totalHeight = 0;
    const positions: number[] = [];
    const heights: number[] = [];

    items.forEach((item, index) => {
      positions[index] = totalHeight;
      const height = typeof itemHeight === 'function' ? itemHeight(index, item) : itemHeight;
      heights[index] = height;
      totalHeight += height;
    });

    return { positions, heights, totalHeight };
  }, [items, itemHeight]);

  // Binary search to find the start index
  const findStartIndex = useCallback((scrollTop: number) => {
    const { positions } = itemMetrics;
    let low = 0;
    let high = positions.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (positions[mid] <= scrollTop && (positions[mid + 1] || Infinity) > scrollTop) {
        return mid;
      } else if (positions[mid] < scrollTop) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return 0;
  }, [itemMetrics]);

  // Calculate visible range
  const calculateVisibleRange = useCallback(() => {
    startMetric('virtual_scroll_calculation');
    
    const { positions, heights } = itemMetrics;
    const startIndex = Math.max(0, findStartIndex(scrollTop) - overscan);
    let endIndex = startIndex;

    let currentTop = positions[startIndex] || 0;
    const visibleBottom = scrollTop + containerHeight;

    while (endIndex < items.length && currentTop < visibleBottom + (overscan * (heights[0] || 50))) {
      currentTop += heights[endIndex] || 50;
      endIndex++;
    }

    endIndex = Math.min(items.length - 1, endIndex + overscan);

    endMetric('virtual_scroll_calculation');
    return { start: startIndex, end: endIndex };
  }, [scrollTop, containerHeight, itemMetrics, overscan, items.length, findStartIndex, startMetric, endMetric]);

  // Update visible range when dependencies change
  useEffect(() => {
    const newRange = calculateVisibleRange();
    setVisibleRange(newRange);
  }, [calculateVisibleRange]);

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);

    // Check if we've reached the end
    if (onEndReached) {
      const { scrollHeight, clientHeight } = event.currentTarget;
      const scrollPercentage = (newScrollTop + clientHeight) / scrollHeight;
      
      if (scrollPercentage >= endReachedThreshold) {
        onEndReached();
      }
    }
  }, [onScroll, onEndReached, endReachedThreshold]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1).map((item, index) => ({
      item,
      index: visibleRange.start + index,
      top: itemMetrics.positions[visibleRange.start + index] || 0,
      height: itemMetrics.heights[visibleRange.start + index] || 50
    }));
  }, [items, visibleRange, itemMetrics]);

  // Loading state
  if (loading && items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        {loadingComponent || (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        )}
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        {emptyComponent || (
          <div className="text-center text-gray-500">
            <p>Aucun élément à afficher</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: itemMetrics.totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, top, height }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top,
              height,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
        
        {loading && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook pour utiliser le virtual scrolling avec pagination
export function useVirtualScrollPagination<T>(
  initialItems: T[],
  fetchMore: (page: number) => Promise<T[]>,
  pageSize: number = 50
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newItems = await fetchMore(currentPage + 1);
      
      if (newItems.length < pageSize) {
        setHasMore(false);
      }
      
      setItems(prev => [...prev, ...newItems]);
      setCurrentPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, currentPage, fetchMore, pageSize]);

  const reset = useCallback((newItems: T[]) => {
    setItems(newItems);
    setCurrentPage(1);
    setHasMore(true);
    setLoading(false);
  }, []);

  return {
    items,
    loading,
    hasMore,
    loadMore,
    reset
  };
}
