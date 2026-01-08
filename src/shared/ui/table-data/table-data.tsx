import type { ICategory } from '@/types/items/categories';
import type { RecycleBinType } from '@/types/recycleBin/recycleBin';
import type { ColumnDef, SortingState, ColumnFiltersState } from '@tanstack/react-table';

import * as React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  flexRender,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getFacetedUniqueValues,
} from '@tanstack/react-table';

import { Iconify } from 'src/shared/components/iconify';

import { TableSkeleton } from './data-table-skeleton';
import { DataTableToolbar } from './data-table-toolbar';
import { DataTablePagination } from './data-table-pagination';
import { CustomizeColumnsModal } from './customize-columns-modal';
// table-data.tsx
import { Table, TableRow, TableBody, TableCell, TableHead, TableHeader } from '../table';

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue> & { defaultHidden?: boolean }>;
  data: TData[];
  tableName: string;
  createPath?: string;
  hasDetails?: boolean;
  isPagePaginateHiddent?: boolean;
  detailsLink?: string;
  permissions?: {
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  searchColumns?: string[];
  isLoading?: boolean;
  hasFilter?: boolean;
  hasRecycleFilter?: boolean;
  onRecycleFilterChange?: (type: RecycleBinType) => void;
  expandedRowRender?: (row: TData) => React.ReactNode;
  columnTranslations?: Record<string, string>;
  onImportSuccess?: () => void;
  // إضافة خصائص Pagination الجديدة
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
  defaultHiddenColumns?: string[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  createPath,
  hasDetails,
  hasRecycleFilter = false,
  onRecycleFilterChange,
  isPagePaginateHiddent,
  detailsLink,
  permissions,
  tableName,
  searchColumns,
  isLoading = false,
  hasFilter,
  expandedRowRender,
  columnTranslations = {},
  onImportSuccess,
  pagination,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  defaultHiddenColumns = [],
}: DataTableProps<TData, TValue>) {
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const { t } = useTranslation('table');

  // Prepare default columns configuration
  const defaultColumnsConfig = columns.map((col, index) => ({
    id: index + 1,
    column_name: col.id || '',
    //checked: !col.defaultHidden,
    checked: !col.defaultHidden && !defaultHiddenColumns.includes(col.id || ''),
  }));

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // تعطيل frontend pagination إذا كان backend pagination مفعل
    manualPagination: !!pagination,
  });

  const navigate = useNavigate();

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  // Calculate visible columns count (excluding expand, customize, and actions columns)
  const visibleColumns = table.getVisibleLeafColumns().filter((col) => col.id !== 'actions');
  const visibleColumnsCount = visibleColumns.length;
  const isTwoColumns = visibleColumnsCount === 2;

  return (
    <div className="w-full space-y-4 transition-opacity duration-500 p-6">
      <DataTableToolbar
        table={table}
        createPath={createPath}
        permissions={permissions}
        tableName={tableName}
        searchColumns={searchColumns}
        hasFilter={hasFilter}
        hasRecycleFilter={hasRecycleFilter}
        onRecycleFilterChange={onRecycleFilterChange}
        onImportSuccess={onImportSuccess}
      />

      {/* Table View - Full Width */}
      <div className="w-full border border-border/50 bg-background overflow-hidden">
        <Table
          id="table-container"
          className="w-full"
          style={{ tableLayout: isTwoColumns ? 'fixed' : 'auto', width: '100%' }}
        >
          <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-b border-border/30"
              >
                {expandedRowRender && (
                  <TableHead className="w-12 sticky left-0 z-20 bg-background/95 backdrop-blur">
                    {/* Empty header for expand/collapse column */}
                  </TableHead>
                )}
                <TableHead
                  colSpan={1}
                  className=" px-0 sticky left-0 z-30 bg-background/95 backdrop-blur"
                >
                  <div className="absolute -top-1 left-0">
                    <CustomizeColumnsModal
                      table={table}
                      tableName={tableName}
                      defaultColumns={defaultColumnsConfig}
                      columnTranslations={columnTranslations}
                    />
                  </div>
                </TableHead>
                {headerGroup.headers.map((header) => {
                  const isActionsColumn = header.id === 'actions';
                  // For 2 columns, distribute 50% each (excluding actions column)
                  const columnWidth =
                    isTwoColumns && !isActionsColumn ? '50%' : isActionsColumn ? 'auto' : undefined;
                  return (
                    <TableHead
                      key={header.id}
                      className="transition-all duration-200 hover:bg-muted/30 first:pl-6 last:pr-6"
                      style={columnWidth ? { width: columnWidth } : undefined}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y divide-border/30">
            {isLoading ? (
              <TableSkeleton
                columns={table.getAllColumns().length + (expandedRowRender ? 1 : 0)}
                rows={pagination?.per_page || table.getState().pagination.pageSize || 5}
              />
            ) : !isLoading && table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns?.length + (expandedRowRender ? 1 : 0) + 1}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="text-4xl mb-4 opacity-50">📭</div>
                    <p className="text-muted-foreground text-lg font-medium">{t('noResults')}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row, rowIndex) => {
                const isExpanded = expandedRows[row.id];
                const isSelected = row.getIsSelected();
                return (
                  <React.Fragment key={row.id}>
                    <TableRow
                      data-state={isSelected && 'selected'}
                      className={`
                          group cursor-pointer transition-all duration-200
                          hover:bg-gradient-to-r hover:from-primary/5 hover:via-primary/3 hover:to-transparent
                          hover:shadow-sm hover:border-l-4 hover:border-l-primary
                          active:scale-[0.99] active:bg-muted/70
                          ${isSelected ? 'bg-primary/10 border-l-4 border-l-primary' : ''}
                          ${rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                          transition-all duration-300 ease-in-out
                        `}
                    >
                      {expandedRowRender && (
                        <TableCell className="w-12 sticky left-0 z-10 bg-background/95 backdrop-blur">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpansion(row.id);
                            }}
                            className="p-2 rounded-lg transition-all duration-200 hover:bg-primary/20 hover:scale-110 active:scale-95 group-hover:text-primary"
                          >
                            <Iconify
                              icon={
                                isExpanded ? 'eva:arrow-downward-fill' : 'eva:arrow-forward-fill'
                              }
                              width={18}
                              className="transition-transform duration-300"
                            />
                          </button>
                        </TableCell>
                      )}
                      <TableHead
                        colSpan={1}
                        className="w-fit px-0 sticky left-0 z-10 bg-background/95 backdrop-blur"
                      />
                      {row.getVisibleCells().map((cell) => {
                        const isActionsColumn = cell.column.id === 'actions';
                        // For 2 columns, distribute 50% each (excluding actions column)
                        const columnWidth =
                          isTwoColumns && !isActionsColumn
                            ? '50%'
                            : isActionsColumn
                              ? 'auto'
                              : undefined;
                        return (
                          <TableCell
                            key={cell.id}
                            onClick={(e) => {
                              if (!isActionsColumn) {
                                const id = (row.original as ICategory)?.id;
                                if (hasDetails && id) {
                                  navigate(`${detailsLink}/${id}`);
                                }
                              }
                            }}
                            className={`
                                transition-all duration-200 first:pl-6 last:pr-6
                                ${isActionsColumn ? 'sticky right-0 z-10 bg-background/95 backdrop-blur' : ''}
                                group-hover:text-foreground
                              `}
                            style={columnWidth ? { width: columnWidth } : undefined}
                          >
                            {isActionsColumn ? (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-end"
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                            ) : (
                              <div className="truncate">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    {expandedRowRender && isExpanded && (
                      <TableRow className="bg-gradient-to-r from-muted/50 via-muted/30 to-transparent transition-all duration-300 ease-in-out">
                        <TableCell colSpan={table.getAllColumns().length + 1} className="p-6">
                          <div className="border-l-4 border-l-primary pl-4">
                            {expandedRowRender(row.original)}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="transition-opacity duration-500">
        <DataTablePagination
          table={table}
          isPagePaginateHiddent={isPagePaginateHiddent}
          pagination={pagination}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
}
