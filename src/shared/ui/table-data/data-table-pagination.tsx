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
  pageSizeOptions = [25, 50, 75, 100, 500, 1000],
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

  return (
    <div className=" w-full px-2 py-4">
      {/* Mobile Layout */}
      <div className="flex flex-col space-y-4 md:hidden">
        {/* Row Selection Info */}
        <div className="text-xs text-center text-muted-foreground">
          {t('rowsSelected', { selected: selectedCount, total: totalCount })}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center space-x-1">
          <Button
            variant="outlined"
            className="h-8 w-8 p-0 min-w-[32px]"
            onClick={handlePreviousPage}
            disabled={currentPageIndex <= 1}
          >
            <span className="sr-only ">{t('goToPreviousPage')}</span>
            <ChevronLeft className="h-4 w-4 " />
          </Button>

          <div className="flex space-x-1 overflow-x-auto max-w-[200px]">
            {visiblePages.map((page, index) =>
              page === '...' ? (
                <span
                  key={`dots-${index}`}
                  className="h-8 w-8 flex items-center justify-center text-xs font-medium shrink-0"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page as number}
                  onClick={() => handlePageChange(page as number)}
                  className={`h-8 min-w-[32px] px-2 flex items-center justify-center rounded-md text-xs font-medium shrink-0
                    ${
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
            className="h-8 w-8 p-0 min-w-[32px]"
            onClick={handleNextPage}
            disabled={currentPageIndex >= totalPages}
          >
            <span className="sr-only ">{t('goToNextPage')}</span>
            <ChevronRight className="h-4 w-4 " />
          </Button>
        </div>

        {/* Page Info & Rows Per Page */}
        <div className="flex flex-col items-center space-y-2">
          {!isPagePaginateHiddent && (
            <div className="text-xs font-medium ">
              {t('pageOf', { current: currentPageIndex, total: totalPages })}
            </div>
          )}
          <div className="flex items-center space-x-2 ">
            <p className="text-xs font-medium ">{t('rowsperpage')}</p>
            <Select
              value={`${currentPageSize}`}
              onValueChange={(value) => {
                handlePageSizeChange(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px] text-xs border-border">
                <SelectValue placeholder={currentPageSize} />
              </SelectTrigger>
              <SelectContent
                side="top"
                className="bg-popover text-popover-foreground shadow-md border border-border"
              >
                {pageSizeOptions.map((pageSizeOption) => (
                  <SelectItem key={pageSizeOption} value={`${pageSizeOption}`}>
                    {pageSizeOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-col space-y-3 lg:space-y-0 lg:flex-row justify-between items-center ">
        <div className=" text-sm text-muted-foreground ">
          {t('rowsSelected', { selected: selectedCount, total: totalCount })}
        </div>

        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outlined"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleFirstPage}
            disabled={currentPageIndex <= 1}
          >
            <span className="sr-only ">{t('goToFirstPage')}</span>
            <ChevronsLeft className="h-4 w-4 " />
          </Button>
          <Button
            variant="outlined"
            className="h-8 w-8 p-0"
            onClick={handlePreviousPage}
            disabled={currentPageIndex <= 1}
          >
            <span className="sr-only ">{t('goToPreviousPage')}</span>
            <ChevronLeft className="h-4 w-4 " />
          </Button>

          <div className="flex space-x-1 ">
            {visiblePages.map((page, index) =>
              page === '...' ? (
                <span
                  key={`dots-${index}`}
                  className="h-8 w-8 flex items-center justify-center text-sm font-medium"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page as number}
                  onClick={() => handlePageChange(page as number)}
                  className={`h-8 w-8 flex items-center justify-center  rounded-md text-sm font-medium 
                    ${
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
            className="h-8 w-8 p-0"
            onClick={handleNextPage}
            disabled={currentPageIndex >= totalPages}
          >
            <span className="sr-only ">{t('goToNextPage')}</span>
            <ChevronRight className="h-4 w-4 " />
          </Button>
          <Button
            variant="outlined"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleLastPage}
            disabled={currentPageIndex >= totalPages}
          >
            <span className="sr-only ">{t('goToLastPage')}</span>
            <ChevronsRight className="h-4 w-4 " />
          </Button>
        </div>

        <div className="flex flex-row items-center space-x-4 lg:space-x-6">
          <div className="flex items-center space-x-2 ">
            <p className="text-sm font-medium ">{t('rowsperpage')}</p>
            <Select
              value={`${currentPageSize}`}
              onValueChange={(value) => {
                handlePageSizeChange(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px] border-border">
                <SelectValue placeholder={currentPageSize} />
              </SelectTrigger>
              <SelectContent
                side="top"
                className="bg-popover text-popover-foreground shadow-md border border-border"
              >
                {pageSizeOptions.map((pageSizeOption) => (
                  <SelectItem key={pageSizeOption} value={`${pageSizeOption}`}>
                    {pageSizeOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isPagePaginateHiddent && (
            <div className="hidden sm:flex w-[100px] items-center justify-center text-sm font-medium ">
              {t('pageOf', { current: currentPageIndex, total: totalPages })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
