import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { PageBuilderListItem } from '@/pages/dashboard/sections/types/page-builder.types';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';
import { cmsPageSelectLabel } from '@/pages/dashboard/sections/utils/cms-page-select-label';
import {
  canDeleteCmsPage,
  isCategoryCmsPage,
  canEditPageMetadata,
} from '@/pages/dashboard/sections/utils/category-page';

const PageRowSchema = z.object({
  id: z.number(),
  slug: z.string().optional().nullable(),
});

function filtersKeyCount(filters: unknown): number {
  if (filters == null) return 0;
  if (Array.isArray(filters)) return filters.length;
  if (typeof filters === 'object') return Object.keys(filters as object).length;
  return 0;
}

export const pagesColumns = (
  t: TFunction<'table'>,
  rowActions?: {
    permissions: { update: boolean; delete: boolean };
    onDelete: (id: number) => void;
    isDeleting?: boolean;
    isDeleteDialogOpen?: boolean;
    onDeleteConfirm?: () => void;
    onDeleteCancel?: () => void;
    deletingId?: number | null;
  },
  options?: {
    /** Category pages do not use page-variable filters. */
    hideFiltersColumn?: boolean;
  }
): ColumnDef<PageBuilderListItem>[] => [
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
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-medium truncate">{cmsPageSelectLabel(row.original)}</span>
        {isCategoryCmsPage(row.original) && (
          <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {t('columns.categoryPageBadge')}
          </span>
        )}
      </div>
    ),
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
    id: 'sections_count',
    accessorKey: 'sections_count',
    meta: {
      headerClassName: 'whitespace-nowrap',
      cellClassName: 'whitespace-nowrap',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.sectionsCount')} />
    ),
    cell: ({ row }) => {
      const n = row.original.sections_count;
      return (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            n != null && n > 0 ? 'bg-muted text-foreground' : 'text-muted-foreground'
          }`}
        >
          {n ?? '—'}
        </span>
      );
    },
  },
  ...(options?.hideFiltersColumn
    ? []
    : [
        {
          id: 'filters',
          accessorKey: 'filters',
          meta: {
            headerClassName: 'hidden md:table-cell',
            cellClassName: 'hidden md:table-cell',
          },
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('columns.filters')} />
          ),
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
        } as ColumnDef<PageBuilderListItem>,
      ]),
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
  ...(rowActions
    ? [
        {
          id: 'actions',
          cell: ({ row }) => {
            const id = row.original.id;
            // Category pages follow their category: no manual edit/delete, sections only.
            // Prefer the explicit API flags; fall back to is_category_page on older backends.
            const isCategoryPage = isCategoryCmsPage(row.original);
            const canEditMetadata = canEditPageMetadata(row.original);
            const canDeletePage = canDeleteCmsPage(row.original);
            return (
              <DataTableRowActions
                schema={PageRowSchema}
                row={row as any}
                viewDetails={`/sections/pages/details/${id}`}
                viewDetailsLabel={isCategoryPage ? t('openBuildCategoryPage') : undefined}
                editItem={canEditMetadata ? `/sections/pages/update/${id}` : undefined}
                permissions={{
                  update: canEditMetadata && rowActions.permissions.update,
                  delete: canDeletePage && rowActions.permissions.delete,
                }}
                onDelete={rowActions.onDelete}
                isDeleting={rowActions.isDeleting}
                isDeleteDialogOpen={rowActions.isDeleteDialogOpen}
                onDeleteConfirm={rowActions.onDeleteConfirm}
                onDeleteCancel={rowActions.onDeleteCancel}
                deletingId={rowActions.deletingId}
              />
            );
          },
        } as ColumnDef<PageBuilderListItem>,
      ]
    : []),
];
