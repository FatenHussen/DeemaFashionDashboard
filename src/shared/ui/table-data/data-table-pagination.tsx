import { useMemo } from 'react';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
// data-table-pagination.tsx
import { type Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Select, SelectItem, SelectValue, SelectContent, SelectTrigger } from '@/shared/ui/select';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  isPagePaginateHiddent?: boolean;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 25, 50, 75, 100, 500, 1000],
  isPagePaginateHiddent = false,
  pagination,
  currentPage = 1,
  pageSize = 25,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps<TData>) {
  const { t } = useTranslation('table');

  // Safe access with fallbacks
  const selectedCount = table?.getFilteredSelectedRowModel()?.rows?.length || 0;
  const totalCount = pagination?.total || table?.getFilteredRowModel()?.rows?.length || 0;
  const currentPageIndex = pagination?.current_page || currentPage;
  const totalPages = pagination?.last_page || table?.getPageCount() || 1;
  const currentPageSize = pagination?.per_page || pageSize;

  const getVisiblePages = () => {
    // If no table instance or pagination data, return minimal pages
    if (!table && !pagination) {
      return [0];
    }

    if (!pagination) {
      const pageIndex = table?.getState().pagination.pageIndex || 0;
      const totalPageCount = table?.getPageCount() || 1;
      const delta = 2;
      const range = [];
      const rangeWithDots = [];
      
      // Use pageIndex instead of currentPageIndex to avoid shadowing

      for (
        let i = Math.max(0, pageIndex - delta);
        i <= Math.min(totalPageCount - 1, pageIndex + delta);
        i++
      ) {
        range.push(i);
      }

      if (range[0] > 0) {
        rangeWithDots.push(0);
        if (range[0] > 1) {
          rangeWithDots.push('...');
        }
      }

      rangeWithDots.push(...range);

      if (range[range.length - 1] < totalPageCount - 1) {
        if (range[range.length - 1] < totalPageCount - 2) {
          rangeWithDots.push('...');
        }
        rangeWithDots.push(totalPageCount - 1);
      }

      return rangeWithDots;
    }

    // Backend pagination
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    const current = currentPageIndex - 1; // Convert to 0-based index

    for (
      let i = Math.max(0, current - delta);
      i <= Math.min(totalPages - 1, current + delta);
      i++
    ) {
      range.push(i);
    }

    if (range[0] > 0) {
      rangeWithDots.push(0);
      if (range[0] > 1) {
        rangeWithDots.push('...');
      }
    }

    rangeWithDots.push(...range);

    if (range[range.length - 1] < totalPages - 1) {
      if (range[range.length - 1] < totalPages - 2) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(totalPages - 1);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  /** Ensure Select always has a matching option (e.g. API `per_page` 10 vs default list). */
  const resolvedPageSizeOptions = useMemo(() => {
    const next = new Set(pageSizeOptions);
    next.add(currentPageSize);
    return [...next].sort((a, b) => a - b);
  }, [pageSizeOptions, currentPageSize]);

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page + 1); // Convert to 1-based for backend
    } else {
      table?.setPageIndex(page); // Safe fallback to frontend pagination
    }
  };

  const handlePageSizeChange = (size: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(size);
    } else {
      table?.setPageSize(size); // Safe fallback to frontend pagination
    }
  };

  const handleFirstPage = () => {
    handlePageChange(0);
  };

  const handlePreviousPage = () => {
    handlePageChange(currentPageIndex - 2); // -2 لأن currentPageIndex 1-based
  };

  const handleNextPage = () => {
    handlePageChange(currentPageIndex); // currentPageIndex is 1-based, so no conversion needed
  };

  const handleLastPage = () => {
    handlePageChange(totalPages - 1);
  };

  // Early return if table is not available
  if (!table && !pagination) {
    return (
      <div className="relative flex flex-col space-y-2 md:space-y-0 md:flex-row items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {t('noData')}
        </div>
      </div>
    );
  }

  const pageButtons = (
    <>
      <Button
        variant="outlined"
        className="hidden h-8 w-8 shrink-0 p-0 sm:flex"
        onClick={handleFirstPage}
        disabled={currentPageIndex <= 1}
      >
        <span className="sr-only">{t('goToFirstPage')}</span>
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outlined"
        className="h-8 w-8 shrink-0 p-0"
        onClick={handlePreviousPage}
        disabled={currentPageIndex <= 1}
      >
        <span className="sr-only">{t('goToPreviousPage')}</span>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex max-w-[min(100%,280px)] items-center gap-0.5 overflow-x-auto sm:max-w-none">
        {visiblePages.map((page, index) =>
          page === '...' ? (
            <span
              key={`dots-${index}`}
              className="flex h-8 w-8 shrink-0 items-center justify-center text-xs font-medium sm:text-sm"
            >
              ...
            </span>
          ) : (
            <button
              key={page as number}
              type="button"
              onClick={() => handlePageChange(page as number)}
              className={`flex h-8 min-w-8 shrink-0 items-center justify-center rounded-md px-2 text-xs font-medium sm:min-w-8 sm:text-sm ${
                (page as number) === currentPageIndex - 1
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
              disabled={(page as number) === currentPageIndex - 1}
            >
              {(page as number) + 1}
            </button>
          )
        )}
      </div>

      <Button
        variant="outlined"
        className="h-8 w-8 shrink-0 p-0"
        onClick={handleNextPage}
        disabled={currentPageIndex >= totalPages}
      >
        <span className="sr-only">{t('goToNextPage')}</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outlined"
        className="hidden h-8 w-8 shrink-0 p-0 sm:flex"
        onClick={handleLastPage}
        disabled={currentPageIndex >= totalPages}
      >
        <span className="sr-only">{t('goToLastPage')}</span>
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </>
  );

  const rowsPerPageSelect = (
    <Select
      value={`${currentPageSize}`}
      onValueChange={(value) => {
        handlePageSizeChange(Number(value));
      }}
    >
      <SelectTrigger className="h-8 w-[4.25rem] min-w-[4.25rem] shrink-0 border-border text-xs sm:w-[4.5rem] sm:text-sm">
        <SelectValue placeholder={`${currentPageSize}`} />
      </SelectTrigger>
      <SelectContent
        side="top"
        className="bg-popover text-popover-foreground shadow-md border border-border"
      >
        {resolvedPageSizeOptions.map((pageSizeOption) => (
          <SelectItem key={pageSizeOption} value={`${pageSizeOption}`}>
            {pageSizeOption}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="w-full min-w-0 px-2 py-3 sm:py-4">
      {/* Narrow: two compact rows */}
      <div className="flex min-[640px]:hidden flex-col gap-2.5">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="min-w-0 truncate">
            {t('rowsSelected', { selected: selectedCount, total: totalCount })}
          </span>
          {!isPagePaginateHiddent && (
            <span className="shrink-0 font-medium text-foreground/90">
              {t('pageOf', { current: currentPageIndex, total: totalPages })}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center justify-center gap-1 sm:justify-start">
            {pageButtons}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="whitespace-nowrap text-xs font-medium text-foreground">
              {t('rowsperpage')}
            </span>
            {rowsPerPageSelect}
          </div>
        </div>
      </div>

      {/* Wide: single bar */}
      <div className="hidden min-[640px]:flex min-w-0 flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 max-w-[min(100%,220px)] truncate text-sm text-muted-foreground lg:max-w-none">
          {t('rowsSelected', { selected: selectedCount, total: totalCount })}
        </p>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1">{pageButtons}</div>
        <div className="flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-1">
          {!isPagePaginateHiddent && (
            <span className="whitespace-nowrap text-sm font-medium text-foreground">
              {t('pageOf', { current: currentPageIndex, total: totalPages })}
            </span>
          )}
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-sm font-medium">{t('rowsperpage')}</span>
            {rowsPerPageSelect}
          </div>
        </div>
      </div>
    </div>
  );
}
