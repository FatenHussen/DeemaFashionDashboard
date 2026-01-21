import type { Table } from '@tanstack/react-table';
import type { RecycleBinType } from '@/types/recycleBin/recycleBin';
import type { ExportType } from '@/types/ExportExcelPdf/exportExcelPdf';

import { useState } from 'react';
import { Input } from '@/shared/ui/input';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { X, Plus, Download } from 'lucide-react';

import { Import } from './import';
import DataTableFilterButtons from './data-table-filter-buttons';
import { DataTableViewOptions } from './data-table-view-options';
import { DataTableViewOptionsCustom } from './data-table-view-custom';
import DataTableRecycleFilterButton from './data-Table-RecycleFilter-Button ';

const VALID_EXPORT_TYPES: ExportType[] = [
  'brands',
  'categories',
  'taxes',
  'warranties',
  'units',
  'sales',
  'purchases',
  'jobcards',
  'order-request',
  'sales-order',
];

const VALID_IMPORT_TYPES = ['products'];

const TEMPLATE_FILES: Record<string, string> = {
  products: '/templates/products_import_template.xlsx',
  // users: "/templates/users-template.xlsx",
};

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

  return (
    <div className="flex items-center justify-between flex-wrap space-y-2 md:space-y-0 md:flex-nowrap gap-1">
      <div className="flex flex-1 items-center space-x-2 text-foreground">
        {availableColumns.length > 0 && (
          <Input
            placeholder={t('search')}
            value={searchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="h-8 w-[200px] lg:w-[250px]"
          />
        )}

        {isFiltered && (
          <Button variant="text" onClick={resetFilters} className="h-8 px-2 lg:px-3">
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {hasFilter && <DataTableFilterButtons />}

      {hasRecycleFilter && <DataTableRecycleFilterButton onFilterChange={onRecycleFilterChange} />}

      <div className="flex flex-wrap md:flex-nowrap items-center md:space-x-2">
        {VALID_EXPORT_TYPES.includes(tableName as ExportType) && (
          <DataTableViewOptionsCustom table={table} tableName={tableName as ExportType} />
        )}

        <DataTableViewOptions table={table} tableName={tableName} />

        {canImport && (
          <div className="flex items-center space-x-2">
            <Button variant="outlined" size="small" onClick={downloadTemplate} className="h-8">
              <Download className="w-4 h-4 mr-2" />
              {t('downloadTemplate')}
            </Button>

            <Import tableName={tableName} onImportSuccess={onImportSuccess} />
          </div>
        )}

        {permissions?.create && (
          <Button
            variant="outlined"
            className="h-8 px-2 md:mr-2 lg:px-3 bg-primary md:mt-0 text-primary-foreground border-border"
            onClick={() => navigate(createPath ? createPath : '')}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('create')}
          </Button>
        )}
      </div>
    </div>
  );
}
