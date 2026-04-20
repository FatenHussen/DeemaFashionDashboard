import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect } from 'react';
import { formatTranslated } from '@/utils/format-translated';

import { shopVariantOptionColorHex } from '@/utils/shop-variant-image';

import { Iconify } from './iconify';
import { ShopVariantColorSwatch } from './shop-variant-color-swatch';
import { useInfiniteSelect, type InfiniteSelectOption } from '../hooks/use-infinite-select';

// ----------------------------------------------------------------------

interface InfiniteScrollSelectProps {
  value: number | 0;
  onChange: (value: number) => void;
  /** TanStack Query cache key */
  queryKey: (string | number | undefined | null)[];
  /** Fetches one page of options */
  fetcher: (page: number, limit: number) => Promise<any>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Fallback label shown when value is set but item hasn't loaded yet (e.g. edit mode) */
  initialLabel?: string;
  /** Fallback image URL when value is set but the option row is not in loaded pages (e.g. edit mode) */
  initialImage?: string | null;
  /** Fallback color hex when value is set but the option row is not loaded (e.g. edit mode) */
  initialColorHex?: string | null;
  /** If set, thumbnails are shown in the list and on the trigger (resolved absolute URLs) */
  getOptionImage?: (item: InfiniteSelectOption & Record<string, unknown>) => string | null | undefined;
  /** If set, a color swatch with hex text is shown (e.g. shop product variant labels). */
  getOptionColorHex?: (item: InfiniteSelectOption & Record<string, unknown>) => string | null | undefined;
  /** Items per page — defaults to 10 */
  pageSize?: number;
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
  placeholder: placeholderProp,
  className,
  disabled,
  initialLabel,
  initialImage,
  initialColorHex,
  getOptionImage,
  getOptionColorHex,
  pageSize = 10,
}: InfiniteScrollSelectProps) {
  const { t } = useTranslation('table');
  const placeholder = placeholderProp ?? t('select');

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const { allItems, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteSelect(queryKey, fetcher, pageSize);

  // Position dropdown below trigger (render in portal to avoid overflow clipping)
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return undefined;
    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const width = Math.max(rect.width, 200);
      const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
      setDropdownPosition({
        top: rect.bottom + 4,
        left: isRtl ? rect.right - width : rect.left,
        width,
      });
    };
    updatePosition();
    const rafId = requestAnimationFrame(() => requestAnimationFrame(updatePosition));
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Scroll listener — loads next page when user scrolls near the bottom of the list
  useEffect(() => {
    if (!isOpen) return () => {};
    const container = listContainerRef.current;
    if (!container) return () => {};

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 60 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isOpen, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const selectedOption = allItems.find(
    (item: InfiniteSelectOption) => Number(item.id) === Number(value)
  );
  // Use initialLabel as fallback when item hasn't been fetched yet (edit mode)
  // formatTranslated handles label as string or { ar, en } object
  const displayLabel = selectedOption
    ? formatTranslated((selectedOption as any).label)
    : value > 0 && initialLabel
      ? initialLabel
      : null;

  const selectedImageSrc =
    getOptionImage && value > 0
      ? selectedOption
        ? getOptionImage(selectedOption as InfiniteSelectOption & Record<string, unknown>)
        : initialImage ?? null
      : null;
  const selectedImageResolved =
    selectedImageSrc != null && String(selectedImageSrc).trim() !== '' ? String(selectedImageSrc).trim() : null;

  const selectedColorHex =
    getOptionColorHex && value > 0
      ? selectedOption
        ? getOptionColorHex(selectedOption as InfiniteSelectOption & Record<string, unknown>) ?? null
        : initialColorHex ??
          (initialLabel ? shopVariantOptionColorHex({ label: initialLabel }) : null)
      : null;
  const selectedColorHexOk = selectedColorHex != null && String(selectedColorHex).trim() !== '';

  const showLeadMedia = Boolean(getOptionImage || getOptionColorHex);

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
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        className="w-full h-10 rounded-xl border border-border/70 bg-background/30 px-3.5 text-sm text-start shadow-sm flex items-center justify-between gap-2 outline-none transition-all duration-200 hover:border-primary/30 hover:bg-muted/20 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {showLeadMedia ? (
          <span className="flex min-w-0 flex-1 items-center gap-2">
            {selectedColorHexOk ? <ShopVariantColorSwatch hex={String(selectedColorHex).trim()} /> : null}
            {getOptionImage ? (
              selectedImageResolved ? (
                <img
                  src={selectedImageResolved}
                  alt=""
                  className="h-7 w-7 shrink-0 rounded-md border border-border/50 object-cover bg-muted"
                />
              ) : (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/30">
                  <Iconify icon="solar:gallery-minimalistic-bold" width={14} className="text-muted-foreground/60" />
                </span>
              )
            ) : null}
            <span
              className={`min-w-0 truncate ${displayLabel ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              {displayLabel ?? placeholder}
            </span>
          </span>
        ) : (
          <span className={`truncate ${displayLabel ? 'text-foreground' : 'text-muted-foreground'}`}>
            {displayLabel ?? placeholder}
          </span>
        )}
        <Iconify
          icon="solar:alt-arrow-down-bold"
          width={14}
          className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown - rendered in portal to avoid overflow clipping */}
      {isOpen &&
        createPortal(
          <>
            {/* Above app modals (`--layout-modal-zIndex`); z-40/z-50 stayed behind modal overlays. */}
            <div
              className="fixed inset-0 z-[calc(var(--layout-modal-zIndex)+10)]"
              onClick={handleClose}
              aria-hidden
            />

            <div
              className="fixed z-[calc(var(--layout-modal-zIndex)+20)] min-w-[200px] rounded-md border border-border bg-background shadow-lg"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
              }}
            >
            {/* Search input */}
            <div className="p-2 border-b border-border/50">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                autoFocus
                className="w-full h-7 rounded px-2 text-xs border border-input bg-muted/50 placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            {/* Options list */}
            <div ref={listContainerRef} className="max-h-52 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                  <Iconify icon="svg-spinners:ring-resize" width={16} />
                  {t('loading')}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  {t('noOptionsFound')}
                </div>
              ) : (
                filtered.map((item: InfiniteSelectOption) => {
                  const rowImg = getOptionImage?.(item as InfiniteSelectOption & Record<string, unknown>);
                  const rowImgOk = rowImg != null && String(rowImg).trim() !== '';
                  const rowHex = getOptionColorHex?.(item as InfiniteSelectOption & Record<string, unknown>);
                  const rowHexOk = rowHex != null && String(rowHex).trim() !== '';
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onChange(item.id);
                        handleClose();
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-start hover:bg-muted transition-colors min-w-0 ${
                        Number(value) === Number(item.id) ? 'bg-primary/10 text-primary font-medium' : ''
                      }`}
                    >
                      {rowHexOk ? (
                        <ShopVariantColorSwatch hex={String(rowHex).trim()} size="lg" />
                      ) : null}
                      {getOptionImage &&
                        (rowImgOk ? (
                          <img
                            src={String(rowImg).trim()}
                            alt=""
                            className="h-8 w-8 shrink-0 rounded-md border border-border/50 object-cover bg-muted"
                          />
                        ) : (
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/30">
                            <Iconify
                              icon="solar:gallery-minimalistic-bold"
                              width={16}
                              className="text-muted-foreground/60"
                            />
                          </span>
                        ))}
                      <span className="min-w-0 flex-1 truncate">{formatTranslated((item as any).label)}</span>
                    </button>
                  );
                })
              )}

              {isFetchingNextPage && (
                <div className="flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground">
                  <Iconify icon="svg-spinners:ring-resize" width={12} />
                  {t('loadingMore')}
                </div>
              )}
            </div>
          </div>
          </>,
          document.body
        )}
    </div>
  );
}
