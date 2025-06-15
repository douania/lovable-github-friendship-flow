
import { useMemo, useEffect } from 'react';
import { usePagination } from './usePagination';

interface UsePaginatedDataConfig<T> {
  data: T[];
  searchTerm?: string;
  filters?: Record<string, any>;
  searchFields?: (keyof T)[];
  initialPageSize?: number;
  sortKey?: keyof T;
  sortDirection?: 'asc' | 'desc';
}

export const usePaginatedData = <T extends Record<string, any>>(config: UsePaginatedDataConfig<T>) => {
  const {
    data,
    searchTerm = '',
    filters = {},
    searchFields = [],
    initialPageSize = 20,
    sortKey,
    sortDirection = 'asc'
  } = config;

  const pagination = usePagination({
    initialPageSize,
    pageSizeOptions: [10, 20, 50, 100]
  });

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm && searchFields.length > 0) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        result = result.filter(item => {
          const itemValue = item[key];
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }
          return itemValue === value;
        });
      }
    });

    // Apply sorting
    if (sortKey) {
      result.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, filters, searchFields, sortKey, sortDirection]);

  // Update total items when filtered data changes
  useEffect(() => {
    pagination.setTotalItems(filteredData.length);
  }, [filteredData.length, pagination]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, pagination.currentPage, pagination.pageSize]);

  // Reset to first page when search or filters change
  useEffect(() => {
    pagination.goToFirstPage();
  }, [searchTerm, JSON.stringify(filters)]);

  return {
    paginatedData,
    filteredData,
    pagination,
    totalItems: filteredData.length,
    isFiltered: searchTerm !== '' || Object.values(filters).some(v => v !== undefined && v !== null && v !== '' && v !== 'all')
  };
};
