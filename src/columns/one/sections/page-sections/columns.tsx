import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { formatTranslated } from '@/utils/format-translated';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const PageSectionSchema = z.object({
  id: z.number(),
  name: z.union([z.string(), z.array(z.any()), z.record(z.any())]).optional(),
  type: z.enum(['api', 'manual']).optional(),
  position: z.enum(['before', 'after']).optional(),
  order: z.number().optional(),
  display_type_id: z.number().optional(),
  manual_model: z.string().optional(),
});

function filtersKeyCount(filters: unknown): number {
  if (filters == null) return 0;
  if (Array.isArray(filters)) return filters.length;
  if (typeof filters === 'object') return Object.keys(filters as object).length;
  return 0;
}

export interface PageSectionFormValues {
  id: number;
  name: string;
  type: 'api' | 'manual';
  position?: 'before' | 'after';
  order?: number;
  display_type_id?: number;
  manual_model?: string;
  filters?: Record<string, unknown> | unknown[] | null;
  background_color?: string | null;
  background_card_color?: string | null;
  [key: string]: any;
}

export const pageSectionColumns = (
  permissions: {
    update: boolean;
    delete: boolean;
  },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null
): ColumnDef<PageSectionFormValues>[] => [
  {
    id: 'name',
    accessorKey: 'name',
    meta: {
      headerClassName: 'min-w-0',
      cellClassName: 'min-w-0 max-w-[min(48vw,12rem)] sm:max-w-[18rem] lg:max-w-none',
    },
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => (
      <div className="font-medium">{formatTranslated(row.original.name)}</div>
    ),
  },
  {
    id: 'type',
    accessorKey: 'type',
    meta: {
      headerClassName: 'whitespace-nowrap',
      cellClassName: 'whitespace-nowrap',
    },
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.type')} />,
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <div
          className={`text-xs px-2 py-1 rounded-full w-fit uppercase ${
            type === 'api'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
          }`}
        >
          {type}
        </div>
      );
    },
  },
  {
    id: 'manual_model',
    accessorKey: 'manual_model',
    meta: {
      headerClassName: 'hidden sm:table-cell min-w-0',
      cellClassName: 'hidden sm:table-cell min-w-0 max-w-[10rem] md:max-w-none',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.manualModel')} />
    ),
    cell: ({ row }) => {
      const model = row.original.manual_model;
      return (
        <code className="text-xs font-mono text-muted-foreground">
          {model ?? '—'}
        </code>
      );
    },
  },
  {
    id: 'filters',
    accessorKey: 'filters',
    meta: {
      headerClassName: 'hidden md:table-cell',
      cellClassName: 'hidden md:table-cell',
    },
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.filters')} />,
    cell: ({ row }) => {
      const n = filtersKeyCount(row.original.filters);
      return (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            n > 0 ? 'bg-muted text-foreground' : 'text-muted-foreground'
          }`}
        >
          {n > 0 ? t('columns.filtersCountLabel', { count: n }) : '—'}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={PageSectionSchema}
        row={row}
        viewDetails={`/sections/page-sections/details/${row.original.id}`}
        editItem={`/sections/page-sections/update/${row.original.id}`}
        onDelete={onDelete}
        isDeleting={isDeleting}
        isDeleteDialogOpen={isDeleteDialogOpen}
        onDeleteConfirm={onDeleteConfirm}
        onDeleteCancel={onDeleteCancel}
        deletingId={deletingId}
        permissions={permissions}
      />
    ),
  },
];
