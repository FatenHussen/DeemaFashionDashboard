import { useRef, useState, useEffect } from 'react';
import { formatTranslated } from '@/utils/format-translated';

import { Iconify } from './iconify';
import { useInfiniteSelect, type InfiniteSelectOption } from '../hooks/use-infinite-select';

// ----------------------------------------------------------------------

interface InfiniteScrollSelectProps {
  value: number | 0;
  onChange: (value: number) => void;
  /** TanStack Query cache key */
  queryKey: (string | number | undefined | null)[];
  /** Fetches one page of options */
  fetcher: (page: number) => Promise<any>;
  placeholder?: string;
  className?: string;
  /** Fallback label shown when value is set but item hasn't loaded yet (e.g. edit mode) */
  initialLabel?: string;
}

/**
 * A select dropdown that loads options lazily via infinite scroll.
 * Compatible with react-hook-form's Controller.
 */
export function InfiniteScrollSelect({
  value,
  onChange,
  queryKey,
  fetcher,
  placeholder = 'Select...',
  className,
  initialLabel,
}: InfiniteScrollSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { allItems, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteSelect(queryKey, fetcher);

  // Intersection Observer — triggers next page load when sentinel enters view
  useEffect(() => {
    if (!isOpen) return () => {};
    const sentinel = sentinelRef.current;
    if (!sentinel) return () => {};

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isOpen, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const selectedOption = allItems.find((item: InfiniteSelectOption) => item.id === value);
  // Use initialLabel as fallback when item hasn't been fetched yet (edit mode)
  // formatTranslated handles label as string or { ar, en } object
  const displayLabel = selectedOption
    ? formatTranslated((selectedOption as any).label)
    : value > 0 && initialLabel
      ? initialLabel
      : null;

  const filtered = search
    ? allItems.filter((item: InfiniteSelectOption) => {
        const label = formatTranslated((item as any).label, '');
        return label.toLowerCase().includes(search.toLowerCase());
      })
    : allItems;

  const handleClose = () => {
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`relative ${className || ''}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-left flex items-center justify-between gap-2 hover:bg-muted/30 transition-colors"
      >
        <span className={`truncate ${displayLabel ? 'text-foreground' : 'text-muted-foreground'}`}>
          {displayLabel ?? placeholder}
        </span>
        <Iconify
          icon="solar:alt-arrow-down-bold"
          width={14}
          className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Click-outside overlay */}
          <div className="fixed inset-0 z-40" onClick={handleClose} />

          <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
            {/* Search input */}
            <div className="p-2 border-b border-border/50">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                autoFocus
                className="w-full h-7 rounded px-2 text-xs border border-input bg-muted/50 placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            {/* Options list */}
            <div className="max-h-52 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                  <Iconify icon="svg-spinners:ring-resize" width={16} />
                  Loading...
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No options found
                </div>
              ) : (
                filtered.map((item: InfiniteSelectOption) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item.id);
                      handleClose();
                    }}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors truncate ${
                      value === item.id ? 'bg-primary/10 text-primary font-medium' : ''
                    }`}
                  >
                    {formatTranslated((item as any).label)}
                  </button>
                ))
              )}

              {/* Sentinel — triggers next page load */}
              <div ref={sentinelRef} className="h-px" />

              {isFetchingNextPage && (
                <div className="flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground">
                  <Iconify icon="svg-spinners:ring-resize" width={12} />
                  Loading more...
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
