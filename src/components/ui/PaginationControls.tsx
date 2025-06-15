
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { UsePaginationReturn } from '../../hooks/usePagination';

interface PaginationControlsProps {
  pagination: UsePaginationReturn;
  className?: string;
  showPageSizeSelector?: boolean;
  showInfo?: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  pagination,
  className = '',
  showPageSizeSelector = true,
  showInfo = true
}) => {
  const {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    isFirstPage,
    isLastPage,
    pageSizeOptions,
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage
  } = pagination;

  if (totalItems === 0) {
    return null;
  }

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className={`flex items-center justify-between bg-white px-6 py-3 border-t border-gray-200 ${className}`}>
      {showInfo && (
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Affichage de {startIndex} à {endIndex} sur {totalItems} résultats
          </span>
          {showPageSizeSelector && (
            <div className="ml-6 flex items-center space-x-2">
              <label className="text-sm text-gray-600">Afficher</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span className="text-sm text-gray-600">par page</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center space-x-2">
        {/* Navigation buttons */}
        <button
          onClick={goToFirstPage}
          disabled={isFirstPage}
          className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Première page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          onClick={previousPage}
          disabled={!hasPreviousPage}
          className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Page précédente"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <button
                  onClick={() => setPage(page as number)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? 'bg-pink-500 text-white'
                      : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={nextPage}
          disabled={!hasNextPage}
          className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Page suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={goToLastPage}
          disabled={isLastPage}
          className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Dernière page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
