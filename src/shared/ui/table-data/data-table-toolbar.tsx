import type { Table } from '@tanstack/react-table';
import type { RecycleBinType } from '@/types/recycleBin/recycleBin';

import { createPortal } from 'react-dom';
import { Input } from '@/shared/ui/input';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect, type ReactNode } from 'react';
import { X, Plus, Search, Filter, Download, Sparkles, RotateCcw, SlidersHorizontal } from 'lucide-react';

import { Import } from './import';
import DataTableFilterButtons from './data-table-filter-buttons';
import { CustomizeColumnsModal } from './customize-columns-modal';
import DataTableRecycleFilterButton from './data-Table-RecycleFilter-Button ';

const VALID_IMPORT_TYPES = ['products'];

const TEMPLATE_FILES: Record<string, string> = {
  products: '/templates/products_import_template.xlsx',
};

interface ColumnItem {
  id: number;
  column_name: string;
  checked: boolean;
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  tableName: string;
  createPath?: string;
  permissions?: {
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  searchColumns?: string[];
  hasFilter?: boolean;
  hasRecycleFilter?: boolean;
  onRecycleFilterChange?: (type: RecycleBinType) => void;
  onImport?: () => void;
  onImportSuccess?: () => void;
  defaultColumns?: ColumnItem[];
  columnTranslations?: Record<string, string>;
  toolbarFilter?: ReactNode | ((ctx: { table: Table<TData> }) => ReactNode);
  filterSidebar?: ReactNode;
  activeFilterCount?: number;
  onFilterReset?: () => void;
  /** Called when the user confirms the filter sidebar (footer primary). Omit to only close the drawer. */
  onFilterApply?: () => void;
  /**
   * When set, the built-in search becomes server-side: the input is debounced (400ms) and the
   * value is forwarded via this callback instead of `table.setGlobalFilter` (client-side filter).
   */
  onSearchChange?: (value: string) => void;
  /** Optional placeholder for the search input (defaults to t('search')). */
  searchPlaceholder?: string;
}

// ---------------------------------------------------------------------------
// Filter Sidebar Drawer
// ---------------------------------------------------------------------------

interface FilterSidebarProps {
  open: boolean;
  onClose: () => void;
  onReset?: () => void;
  /** When set, primary footer button runs this (e.g. submit API filters) then closes. When omitted, primary button only closes the drawer. */
  onApply?: () => void;
  children: ReactNode;
  activeFilterCount?: number;
}

function FilterSidebar({ open, onClose, onReset, onApply, children, activeFilterCount }: FilterSidebarProps) {
  const { t } = useTranslation('table');
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hasActive = activeFilterCount != null && activeFilterCount > 0;

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /** Portal to `body` so backdrop/panel stack above fixed dashboard nav (z-1200); in-page stacking was capped by main column `z-[1]`. */
  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  const drawer = (
    <>
      {/* Backdrop — above chrome (--layout-nav-zIndex / --layout-header-zIndex) */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[var(--layout-modal-zIndex)] transition-all duration-300 ${
          open
            ? 'opacity-100 pointer-events-auto bg-black/40 backdrop-blur-sm'
            : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden
      />

      {/* Drawer — above backdrop */}
      <div
        ref={sidebarRef}
        className={`
          fixed top-0 end-0 h-full z-[calc(var(--layout-modal-zIndex)+100)]
          w-[360px] max-w-[94vw]
          flex flex-col
          bg-card
          border-s border-border/60
          shadow-2xl
          transition-all duration-300 ease-out
          ${open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 rtl:-translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
      >
        {/* Accent bar at top */}
        <div className="h-[3px] w-full bg-gradient-to-r from-primary via-primary/70 to-transparent shrink-0" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-5 py-4 border-b border-border/40 shrink-0">
          {/* Subtle header tint */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/[0.04] to-transparent" />

          <div className="relative flex items-center gap-3 min-w-0">
            <div className={`
              flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
              border transition-colors duration-200
              ${hasActive
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-border/60 bg-muted/60 text-muted-foreground'}
            `}>
              <SlidersHorizontal className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {t('filterSidebarTitle')}
                </p>
                {hasActive && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground shadow-sm shadow-primary/30">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {hasActive && (
                <p className="text-xs mt-0.5 text-primary/70 font-medium">
                  {t('filterSidebarActive', { count: activeFilterCount })}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
            aria-label={t('form.closeFiltersAria')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-5">
          {children}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border/40 bg-muted/20">
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            {onReset ? (
              <button
                type="button"
                onClick={() => { onReset(); onClose(); }}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/8"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('filterSidebarReset')}</span>
              </button>
            ) : <div />}

            <Button
              variant="contained"
              onClick={() => {
                onApply?.();
                onClose();
              }}
              className="h-9 px-6 text-sm font-semibold shadow-sm shadow-primary/20"
            >
              {t(onApply ? 'filterSidebarApply' : 'filterSidebarDone')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  if (!portalTarget) {
    return null;
  }

  return createPortal(drawer, portalTarget);
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

export function DataTableToolbar<TData>({
  table,
  createPath,
  permissions,
  tableName,
  searchColumns,
  hasFilter,
  hasRecycleFilter,
  onRecycleFilterChange,
  onImportSuccess,
  defaultColumns = [],
  columnTranslations = {},
  toolbarFilter,
  filterSidebar,
  activeFilterCount,
  onFilterReset,
  onFilterApply,
  onSearchChange,
  searchPlaceholder,
}: DataTableToolbarProps<TData>) {
  const [searchValue, setSearchValue] = useState('');
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('table');

  const isServerSearch = typeof onSearchChange === 'function';

  const availableColumns = isServerSearch
    ? ['__server_search__']
    : searchColumns ||
      table
        .getAllLeafColumns()
        .filter((column) => column.getCanFilter())
        .map((column) => column.id);

  const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter;

  // Debounce server-side search so we don't fire a request per keystroke.
  useEffect(() => {
    if (!isServerSearch) {
      return undefined;
    }
    const id = window.setTimeout(() => {
      onSearchChange?.(searchValue.trim());
    }, 400);
    return () => window.clearTimeout(id);
  }, [searchValue, isServerSearch, onSearchChange]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (isServerSearch) {
      // Debounced useEffect above will call onSearchChange — don't filter client-side.
      return;
    }
    if (availableColumns.length === 1) {
      table.getColumn(availableColumns[0])?.setFilterValue(value);
    } else if (availableColumns.length > 1) {
      table.setGlobalFilter(value);
    }
  };

  const resetFilters = () => {
    table.resetColumnFilters();
    table.resetGlobalFilter();
    setSearchValue('');
    if (isServerSearch) {
      onSearchChange?.('');
    }
  };

  const canImport = VALID_IMPORT_TYPES.includes(tableName);

  const downloadTemplate = () => {
    const templatePath = TEMPLATE_FILES[tableName];
    if (templatePath) {
      const link = document.createElement('a');
      link.href = templatePath;
      link.download = `${tableName}-template.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const hasActiveFilters = activeFilterCount != null && activeFilterCount > 0;

  return (
    <>
      {/* Filter Sidebar Drawer */}
      {filterSidebar && (
        <FilterSidebar
          open={filterSidebarOpen}
          onClose={() => setFilterSidebarOpen(false)}
          onReset={onFilterReset}
          onApply={onFilterApply}
          activeFilterCount={activeFilterCount}
        >
          {filterSidebar}
        </FilterSidebar>
      )}

      <div className="
        flex flex-col gap-3
        sm:flex-row sm:items-center sm:justify-between sm:rtl:flex-row-reverse
        p-3 sm:p-4
        bg-card rounded-xl border border-border/50 shadow-sm
        animate-[tableRowSlideUp_0.4s_ease-out]
      ">
        {/* ── Left: Search + Custom Toolbar Filters ── */}
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          {/* Built-in column search */}
          {availableColumns.length > 0 && (
            <div className={`relative flex items-center transition-all duration-300 ${isSearchFocused ? 'scale-[1.01]' : ''}`}>
              <div className={`absolute start-3 z-10 transition-all duration-300 ${isSearchFocused ? 'text-primary scale-110' : 'text-muted-foreground'}`}>
                <Search className="w-4 h-4" />
              </div>
              <Input
                placeholder={searchPlaceholder || t('search')}
                value={searchValue}
                onChange={(event) => handleSearchChange(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="h-10 w-full sm:w-55 lg:w-70 ps-10 pe-4 bg-background/80 border-border/50 rounded-xl transition-all duration-300 focus:border-primary/50 focus:bg-background focus:shadow-md focus:shadow-primary/10 hover:border-primary/30 placeholder:text-muted-foreground/60"
              />
            </div>
          )}

          {/* Custom toolbar filters (e.g. custom search) */}
          {toolbarFilter && (
            <div className="flex min-w-0 w-full flex-1 items-stretch gap-2">
              {typeof toolbarFilter === 'function' ? toolbarFilter({ table }) : toolbarFilter}
            </div>
          )}

          {/* Reset built-in filter */}
          {isFiltered && (
            <Button
              variant="text"
              onClick={resetFilters}
              className="h-10 px-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 hover:border-destructive/40 hover:scale-105 active:scale-95 transition-all duration-300 group shrink-0"
            >
              <span className="font-medium">{t('resetFilter')}</span>
              <X className="ms-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            </Button>
          )}
        </div>

        {/* ── Right: Actions ── */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Legacy toolbar date range — only when no filter sidebar (sidebar replaces this) */}
          {hasFilter && !filterSidebar && <DataTableFilterButtons />}

          {/* Recycle Bin Filter */}
          {hasRecycleFilter && (
            <DataTableRecycleFilterButton onFilterChange={onRecycleFilterChange} />
          )}

          {/* Sidebar Filter Button */}
          {filterSidebar && (
            <button
              type="button"
              onClick={() => setFilterSidebarOpen(true)}
              className={`
                relative h-10 px-3.5 rounded-xl inline-flex items-center gap-2 text-sm font-medium
                border transition-all duration-200 group
                ${hasActiveFilters
                  ? 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:border-primary/60'
                  : 'border-border/60 bg-background/80 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5'
                }
              `}
            >
              <Filter className={`w-4 h-4 shrink-0 transition-transform duration-200 ${hasActiveFilters ? '' : 'group-hover:scale-110'}`} />
              <span>{t('filters')}</span>
              {hasActiveFilters && (
                <span className="absolute -top-2 -end-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm shadow-primary/40 ring-2 ring-card">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          {/* Customize Columns */}
          {defaultColumns.length > 0 && (
            <CustomizeColumnsModal
              table={table}
              tableName={tableName}
              defaultColumns={defaultColumns}
              columnTranslations={columnTranslations}
            />
          )}

          {/* Import Section */}
          {canImport && (
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                size="small"
                onClick={downloadTemplate}
                className="h-10 px-4 rounded-xl bg-background/80 border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md hover:shadow-primary/10 hover:scale-105 active:scale-95 transition-all duration-300 group"
              >
                <Download className="w-4 h-4 me-2 transition-transform duration-300 group-hover:translate-y-0.5" />
                <span className="font-medium">{t('downloadTemplate')}</span>
              </Button>
              <Import tableName={tableName} onImportSuccess={onImportSuccess} />
            </div>
          )}

          {/* Create Button */}
          {permissions?.create && (
            <Button
              variant="outlined"
              onClick={() => navigate(createPath ? createPath : '')}
              className="
                h-10 px-5 rounded-xl
                bg-linear-to-r from-primary to-primary/90
                text-primary-foreground font-semibold
                border-0 shadow-md shadow-primary/20
                hover:shadow-lg hover:shadow-primary/30
                hover:scale-105 hover:from-primary/90 hover:to-primary
                active:scale-95
                transition-all duration-300
                group relative overflow-hidden
              "
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <div className="relative flex items-center">
                <Plus className="w-5 h-5 me-1.5 transition-all duration-300 group-hover:rotate-90 group-hover:scale-110" />
                <span>{t('create')}</span>
                <Sparkles className="w-4 h-4 ms-1.5 opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:animate-pulse" />
              </div>
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
