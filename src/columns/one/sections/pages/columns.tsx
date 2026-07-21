import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { Page } from '@/pages/dashboard/sections/types/page-section.types';

import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';
import { cmsPageSelectLabel } from '@/pages/dashboard/sections/utils/cms-page-select-label';

function filtersKeyCount(filters: unknown): number {
  if (filters == null) return 0;
  if (Array.isArray(filters)) return filters.length;
  if (typeof filters === 'object') return Object.keys(filters as object).length;
  return 0;
}

export const pagesColumns = (t: TFunction<'table'>): ColumnDef<Page>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    meta: {
      headerClassName: 'whitespace-nowrap',
      cellClassName: 'whitespace-nowrap',
    },
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.id')} />,
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.id}</span>,
  },
  {
    id: 'title',
    accessorKey: 'title',
    meta: {
      headerClassName: 'min-w-0',
      cellClassName: 'min-w-0 max-w-[min(48vw,12rem)] sm:max-w-[18rem] lg:max-w-none',
    },
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.title')} />,
    cell: ({ row }) => <div className="font-medium">{cmsPageSelectLabel(row.original)}</div>,
  },
  {
    id: 'slug',
    accessorKey: 'slug',
    meta: {
      headerClassName: 'whitespace-nowrap',
      cellClassName: 'whitespace-nowrap',
    },
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.slug')} />,
    cell: ({ row }) => (
      <code className="text-xs font-mono text-muted-foreground">{row.original.slug ?? '—'}</code>
    ),
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
    id: 'created_at',
    accessorKey: 'created_at',
    meta: {
      headerClassName: 'hidden sm:table-cell whitespace-nowrap',
      cellClassName: 'hidden sm:table-cell whitespace-nowrap',
    },
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.createdAt')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : '—'}
      </span>
    ),
  },
];
