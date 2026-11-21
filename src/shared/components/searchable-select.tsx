import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useRef, useMemo, useState, useEffect } from 'react';

import { Iconify } from './iconify';

// ----------------------------------------------------------------------

export type SearchableSelectOption = {
  value: string;
  label: string;
  /** Extra text matched by search (e.g. both locales) without changing the visible label. */
  keywords?: string;
};

export type SearchableSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  /** Show a blank first option that clears the value to `""`. */
  clearable?: boolean;
  clearLabel?: string;
};

/**
 * Local searchable dropdown for static string options.
 * Same interaction pattern as InfiniteScrollSelect (portal + search).
 */
export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder: placeholderProp,
  searchPlaceholder: searchPlaceholderProp,
  emptyText: emptyTextProp,
  disabled,
  className,
  clearable = false,
  clearLabel: clearLabelProp,
}: SearchableSelectProps) {
  const { t } = useTranslation('table');
  const placeholder = placeholderProp ?? t('select');
  const searchPlaceholder = searchPlaceholderProp ?? t('searchPlaceholder');
  const emptyText = emptyTextProp ?? t('noOptionsFound');
  const clearLabel = clearLabelProp ?? placeholder;

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

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

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const hay = `${o.label} ${o.keywords ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [options, search]);

  const handleClose = () => {
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`relative ${className || ''}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-sm text-start outline-none transition-colors hover:border-primary/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={`min-w-0 truncate ${displayLabel ? 'text-foreground' : 'text-muted-foreground'}`}>
          {displayLabel ?? placeholder}
        </span>
        <Iconify
          icon="solar:alt-arrow-down-bold"
          width={14}
          className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen &&
        createPortal(
          <>
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
              <div className="border-b border-border/50 p-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  autoFocus
                  className="h-7 w-full rounded border border-input bg-muted/50 px-2 text-xs placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <div className="max-h-52 overflow-y-auto">
                {clearable ? (
                  <button
                    type="button"
                    onClick={() => {
                      onChange('');
                      handleClose();
                    }}
                    className={`flex w-full items-center px-3 py-2 text-start text-sm transition-colors hover:bg-muted ${
                      !value ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {clearLabel}
                  </button>
                ) : null}
                {filtered.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">{emptyText}</div>
                ) : (
                  filtered.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        handleClose();
                      }}
                      className={`flex w-full items-center px-3 py-2 text-start text-sm transition-colors hover:bg-muted ${
                        value === opt.value ? 'bg-primary/10 font-medium text-primary' : ''
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
