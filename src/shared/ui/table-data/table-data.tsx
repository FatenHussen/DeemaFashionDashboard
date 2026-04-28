import type { ICategory } from '@/types/items/categories';
import type { RecycleBinType } from '@/types/recycleBin/recycleBin';
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  Table as TanStackTable,
} from '@tanstack/react-table';

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
// table-data.tsx
import { Table, TableRow, TableBody, TableCell, TableHead, TableHeader } from '../table';

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue> & { defaultHidden?: boolean }>;
  data: TData[];
  tableName: string;
  createPath?: string;
  hasDetails?: boolean;
  /** When false, row click does not navigate to details; only the actions menu does */
  rowClickToDetails?: boolean;
  /** When set, row cells call this instead of navigating to `detailsLink` (actions column unchanged). */
  onRowClick?: (row: TData) => void;
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
  /** When set, replaces default pagination row-count options (e.g. cap at API `per_page` max). */
  pageSizeOptions?: number[];
  defaultHiddenColumns?: string[];
  /** Custom filter content rendered in the toolbar (top of table), or render fn with table instance */
  toolbarFilter?: React.ReactNode | ((ctx: { table: TanStackTable<TData> }) => React.ReactNode);
  /** Content rendered inside the slide-in filter sidebar drawer */
  filterSidebar?: React.ReactNode;
  /** Number of active sidebar filters — shows a badge on the filter button */
  activeFilterCount?: number;
  /** Called when the sidebar "Reset" button is clicked */
  onFilterReset?: () => void;
  /** Called when the user confirms filters in the sidebar footer (before the drawer closes). */
  onFilterApply?: () => void;
  /** Renders above the toolbar inside a card container (e.g. shared breadcrumb) */
  tableTop?: React.ReactNode;
  /**
   * Server-side search handler. When provided, the built-in search input becomes debounced
   * (400ms) and forwards its value via this callback instead of filtering the table client-side.
   */
  onSearchChange?: (value: string) => void;
  /** Optional placeholder for the search input. */
  searchPlaceholder?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  createPath,
  hasDetails,
  rowClickToDetails = true,
  onRowClick,
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
  pageSizeOptions,
  defaultHiddenColumns = [],
  toolbarFilter,
  filterSidebar,
  activeFilterCount,
  onFilterReset,
  onFilterApply,
  tableTop,
  onSearchChange,
  searchPlaceholder,
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

  const initialColumnVisibility = React.useMemo(() => {
    const vis: Record<string, boolean> = {};
    for (const col of columns) {
      const id = col.id;
      if (id === undefined || id === '') continue;
      vis[id] = !col.defaultHidden && !defaultHiddenColumns.includes(id);
    }
    return vis;
  }, [columns, defaultHiddenColumns]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      columnFilters,
    },
    initialState: {
      columnVisibility: initialColumnVisibility,
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
  /** Reserve width for the sticky actions column — two 50% data cols alone = 100%, which squeezes actions and forces horizontal overflow */
  const twoDataPlusActionsWidths = (isActions: boolean) => {
    if (!isTwoColumns) return undefined;
    if (isActions) return '4.5rem';
    return 'calc((100% - 4.5rem) / 2)';
  };

  return (
    <div className="w-full min-w-0 space-y-4 px-3 py-4 sm:px-4 md:px-6 md:py-5">
      {tableTop ? (
        <div className="rounded-xl border border-border/50 bg-card/80 px-4 py-3 shadow-sm sm:px-5 sm:py-3.5">
          {tableTop}
        </div>
      ) : null}

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
        defaultColumns={defaultColumnsConfig}
        columnTranslations={columnTranslations}
        toolbarFilter={toolbarFilter}
        filterSidebar={filterSidebar}
        activeFilterCount={activeFilterCount}
        onFilterReset={onFilterReset}
        onFilterApply={onFilterApply}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
      />

      {/* Table — responsive horizontal scroll + shell */}
      <div
        className={`
          group/table-shell relative w-full min-w-0 rounded-xl
          border border-border/50 bg-card
          shadow-sm transition-all duration-300
          hover:border-border/70 hover:shadow-md
          overflow-x-auto
        `}
      >
        <div
          className="pointer-events-none sticky inset-x-0 top-0 z-[12] h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          aria-hidden
        />
        <Table
          id="table-container"
          className="relative z-[1] min-w-full"
          style={{ tableLayout: isTwoColumns ? 'fixed' : 'auto' }}
        >
          <TableHeader className="sticky top-0 z-10 border-b border-border/40 bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-b-0"
              >
                {expandedRowRender && (
                  <TableHead className="w-12 sticky start-0 z-20 bg-background/95 backdrop-blur">
                    {/* Empty header for expand/collapse column */}
                  </TableHead>
                )}
                {headerGroup.headers.map((header) => {
                  const isActionsColumn = header.id === 'actions';
                  const columnWidth = twoDataPlusActionsWidths(isActionsColumn) ?? (isActionsColumn ? 'auto' : undefined);
                  const meta = header.column.columnDef.meta;
                  return (
                    <TableHead
                      key={header.id}
                      className={[
                        'transition-all duration-200 hover:bg-muted/30 first:ps-3 sm:first:ps-6 last:pe-3 sm:last:pe-6 whitespace-nowrap',
                        meta?.headerClassName ?? '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
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
          <TableBody className="divide-y divide-border/20 relative">
            {isLoading ? (
              <TableSkeleton
                columns={table.getAllColumns().length + (expandedRowRender ? 1 : 0)}
                rows={pagination?.per_page || table.getState().pagination.pageSize || 5}
              />
            ) : !isLoading && table.getRowModel().rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns?.length + (expandedRowRender ? 1 : 0)}
                  className="h-48 text-center"
                >
                  <div className="flex flex-col items-center justify-center py-12 animate-[tableRowSlideUp_0.5s_ease-out]">
                    <div className="relative mb-6">
                      <div className="text-6xl animate-[float_3s_ease-in-out_infinite]">📭</div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 bg-muted/50 rounded-full blur-sm animate-pulse" />
                    </div>
                    <p className="text-muted-foreground text-lg font-medium mb-2">
                      {t('noResults')}
                    </p>
                    <p className="text-muted-foreground/60 text-sm">
                      {t('noResultsHelper')}
                    </p>
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
                      style={{ '--row-index': rowIndex } as React.CSSProperties}
                      className={`
                          group min-h-12 sm:min-h-14 ${rowClickToDetails || onRowClick ? 'cursor-pointer' : 'cursor-default'}
                          table-modern-row
                          transition-colors duration-150
                          hover:bg-primary/5
                          hover:shadow-[inset_3px_0_0_0_rgb(var(--primary))] rtl:hover:shadow-[inset_-3px_0_0_0_rgb(var(--primary))]
                          active:bg-muted/50
                          ${isSelected ? 'bg-primary/8 shadow-[inset_3px_0_0_0_rgb(var(--primary))] rtl:shadow-[inset_-3px_0_0_0_rgb(var(--primary))]' : ''}
                          ${rowIndex % 2 === 0 ? 'bg-card' : 'bg-muted/20'}
                        `}
                    >
                      {expandedRowRender && (
                        <TableCell className="w-12 sticky start-0 z-10 bg-background/95 backdrop-blur">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpansion(row.id);
                            }}
                            className="p-2.5 rounded-xl transition-all duration-300 hover:bg-primary/20 hover:scale-110 hover:rotate-90 active:scale-90 group-hover:text-primary bg-muted/30 hover:shadow-lg hover:shadow-primary/20"
                          >
                            <Iconify
                              icon={
                                isExpanded ? 'eva:arrow-downward-fill' : 'eva:arrow-forward-fill'
                              }
                              width={18}
                              className={`transition-transform duration-300 ${isExpanded ? 'rotate-0' : ''}`}
                            />
                          </button>
                        </TableCell>
                      )}
                      {row.getVisibleCells().map((cell) => {
                        const isActionsColumn = cell.column.id === 'actions';
                        const columnWidth =
                          twoDataPlusActionsWidths(isActionsColumn) ?? (isActionsColumn ? 'auto' : undefined);
                        const meta = cell.column.columnDef.meta;
                        return (
                          <TableCell
                            key={cell.id}
                            onClick={(e) => {
                              if (isActionsColumn) return;
                              if (onRowClick) {
                                onRowClick(row.original as TData);
                                return;
                              }
                              if (rowClickToDetails) {
                                const id = (row.original as ICategory)?.id;
                                if (hasDetails && id && detailsLink) {
                                  navigate(`${detailsLink}/${id}`);
                                }
                              }
                            }}
                            style={
                              {
                                '--cell-index': cell.column.getIndex(),
                                ...(columnWidth ? { width: columnWidth } : {}),
                              } as React.CSSProperties
                            }
                            className={[
                              'transition-all duration-200 first:ps-3 sm:first:ps-6 last:pe-3 sm:last:pe-6 table-cell-animated group-hover:text-foreground',
                              isActionsColumn
                                ? 'sticky end-0 z-10 bg-background/95 shadow-[-12px_0_24px_-8px_rgb(var(--background))] backdrop-blur-sm'
                                : '',
                              meta?.cellClassName ?? '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
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
                      <TableRow className="bg-linear-to-r from-primary/5 via-muted/30 to-transparent table-expanded-content">
                        <TableCell colSpan={table.getAllColumns().length + 1} className="p-6">
                          <div className="border-s-4 border-s-primary ps-6 py-2 bg-linear-to-r from-muted/30 to-transparent rounded-r-lg animate-[tableRowFadeIn_0.4s_ease-out]">
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
          pageSizeOptions={pageSizeOptions}
        />
      </div>
    </div>
  );
}
