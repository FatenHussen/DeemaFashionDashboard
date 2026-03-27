import type { Table } from '@tanstack/react-table';
import type { RecycleBinType } from '@/types/recycleBin/recycleBin';

import { Input } from '@/shared/ui/input';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useState, type ReactNode } from 'react';
import { X, Plus, Search, Download, Sparkles } from 'lucide-react';

import { Import } from './import';
import DataTableFilterButtons from './data-table-filter-buttons';
import { CustomizeColumnsModal } from './customize-columns-modal';
import DataTableRecycleFilterButton from './data-Table-RecycleFilter-Button ';

const VALID_IMPORT_TYPES = ['products'];

const TEMPLATE_FILES: Record<string, string> = {
  products: '/templates/products_import_template.xlsx',
  // users: "/templates/users-template.xlsx",
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
  /** Custom filter content rendered in the toolbar (or a render function that receives the table instance) */
  toolbarFilter?: ReactNode | ((ctx: { table: Table<TData> }) => ReactNode);
}

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
}: DataTableToolbarProps<TData>) {
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation('table');

  const availableColumns =
    searchColumns ||
    table
      .getAllLeafColumns()
      .filter((column) => column.getCanFilter())
      .map((column) => column.id);

  const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter;

  const handleSearchChange = (value: string) => {
    setSearchValue(value);

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

  return (
    <div className="flex items-center justify-between flex-wrap space-y-3 md:space-y-0 md:flex-nowrap gap-3 p-4 bg-linear-to-r from-muted/30 via-transparent to-muted/30 rounded-xl border border-border/30 backdrop-blur-sm animate-[tableRowSlideUp_0.4s_ease-out] rtl:flex-row-reverse">
      {/* Search Section */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 text-foreground md:flex-row md:items-center">
        {availableColumns.length > 0 && (
          <div
            className={`
              relative group flex items-center transition-all duration-300
              ${isSearchFocused ? 'scale-[1.02]' : ''}
            `}
          >
            {/* Search Icon with Animation */}
            <div
              className={`
                absolute start-3 z-10 transition-all duration-300
                ${isSearchFocused ? 'text-primary scale-110' : 'text-muted-foreground'}
              `}
            >
              <Search className="w-4 h-4" />
            </div>

            {/* Search Input */}
            <Input
              placeholder={t('search')}
              value={searchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`
                h-10 w-55 lg:w-70 ps-10 pe-4
                bg-background/80 backdrop-blur-sm
                border-border/50 rounded-xl
                transition-all duration-300
                focus:border-primary/50 focus:bg-background
                focus:shadow-lg focus:shadow-primary/10
                hover:border-primary/30 hover:bg-background/90
                placeholder:text-muted-foreground/60
              `}
            />

            {/* Animated Border Glow */}
            <div
              className={`
                absolute inset-0 rounded-xl pointer-events-none
                transition-opacity duration-300
                ${isSearchFocused ? 'opacity-100' : 'opacity-0'}
                bg-linear-to-r from-primary/20 via-transparent to-primary/20
                blur-xl -z-10
              `}
            />
          </div>
        )}

        {/* Custom toolbar filters (e.g. status, search) */}
        {toolbarFilter && (
          <div className="flex min-w-0 w-full flex-1 items-stretch gap-2">
            {typeof toolbarFilter === 'function' ? toolbarFilter({ table }) : toolbarFilter}
          </div>
        )}

        {/* Reset Button with Animation */}
        {isFiltered && (
          <Button
            variant="text"
            onClick={resetFilters}
            className="
              h-10 px-4 rounded-xl
              bg-destructive/10 text-destructive
              border border-destructive/20
              hover:bg-destructive/20 hover:border-destructive/40
              hover:scale-105 active:scale-95
              transition-all duration-300
              animate-[tableCellReveal_0.3s_ease-out]
              group
            "
          >
            <span className="font-medium">{t('resetFilter')}</span>
            <X className="ms-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
          </Button>
        )}
      </div>

      {/* Filter Buttons */}
      {hasFilter && (
        <div className="animate-[tableCellReveal_0.3s_ease-out_0.1s_both]">
          <DataTableFilterButtons />
        </div>
      )}

      {hasRecycleFilter && (
        <div className="animate-[tableCellReveal_0.3s_ease-out_0.15s_both]">
          <DataTableRecycleFilterButton onFilterChange={onRecycleFilterChange} />
        </div>
      )}

      {/* Actions Section */}
      <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
        {/* Customize Columns */}
        {defaultColumns.length > 0 && (
          <div className="animate-[tableCellReveal_0.3s_ease-out_0.18s_both]">
            <CustomizeColumnsModal
              table={table}
              tableName={tableName}
              defaultColumns={defaultColumns}
              columnTranslations={columnTranslations}
            />
          </div>
        )}

        {/* Import Section */}
        {canImport && (
          <div className="flex items-center gap-2 animate-[tableCellReveal_0.3s_ease-out_0.3s_both]">
            <Button
              variant="outlined"
              size="small"
              onClick={downloadTemplate}
              className="
                h-10 px-4 rounded-xl
                bg-background/80 backdrop-blur-sm
                border-border/50
                hover:border-primary/50 hover:bg-primary/5
                hover:shadow-lg hover:shadow-primary/10
                hover:scale-105 active:scale-95
                transition-all duration-300
                group
              "
            >
              <Download className="w-4 h-4 me-2 transition-transform duration-300 group-hover:translate-y-0.5" />
              <span className="font-medium">{t('downloadTemplate')}</span>
            </Button>

            <Import tableName={tableName} onImportSuccess={onImportSuccess} />
          </div>
        )}

        {/* Create Button with Special Animation */}
        {permissions?.create && (
          <Button
            variant="outlined"
            onClick={() => navigate(createPath ? createPath : '')}
            className="
              h-10 px-5 rounded-xl
              bg-linear-to-r from-primary to-primary/90
              text-primary-foreground font-semibold
              border-0 shadow-lg shadow-primary/25
              hover:shadow-xl hover:shadow-primary/30
              hover:scale-105 hover:from-primary/90 hover:to-primary
              active:scale-95
              transition-all duration-300
              animate-[tableCellReveal_0.3s_ease-out_0.35s_both]
              group relative overflow-hidden
            "
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            {/* Icon with Animation */}
            <div className="relative flex items-center">
              <Plus className="w-5 h-5 me-2 transition-all duration-300 group-hover:rotate-90 group-hover:scale-110" />
              <span>{t('create')}</span>
              <Sparkles className="w-4 h-4 ms-2  group-hover:opacity-100 transition-all duration-300 group-hover:animate-pulse" />
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}
