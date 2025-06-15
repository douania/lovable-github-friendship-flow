
import { useState, useMemo, useCallback } from 'react';

interface PaginationConfig {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

interface PaginationActions {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
}

interface PaginationInfo {
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export interface UsePaginationReturn extends PaginationState, PaginationActions, PaginationInfo {
  pageSizeOptions: number[];
}

export const usePagination = (config: PaginationConfig = {}): UsePaginationReturn => {
  const {
    initialPage = 1,
    initialPageSize = 20,
    pageSizeOptions = [10, 20, 50, 100]
  } = config;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalItems);
    
    return {
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages || totalPages === 0
    };
  }, [currentPage, pageSize, totalItems]);

  const setPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, paginationInfo.totalPages));
    setCurrentPage(validPage);
  }, [paginationInfo.totalPages]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    // Reset to first page when changing page size
    setCurrentPage(1);
  }, []);

  const nextPage = useCallback(() => {
    if (paginationInfo.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [paginationInfo.hasNextPage]);

  const previousPage = useCallback(() => {
    if (paginationInfo.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [paginationInfo.hasPreviousPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(paginationInfo.totalPages);
  }, [paginationInfo.totalPages]);

  return {
    currentPage,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
    setTotalItems,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    pageSizeOptions,
    ...paginationInfo
  };
};
