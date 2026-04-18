import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { ColorListItem } from '@/pages/dashboard/colors/types/color.types';

import { z } from 'zod';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const ColorRowSchema = z.object({
  id: z.number(),
  name: z.string(),
  hex: z.string(),
  is_active: z.boolean(),
});

export const colorColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void
): ColumnDef<ColorListItem>[] => [
  {
    id: 'hex',
    accessorKey: 'hex',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.hex')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span
          className="h-8 w-8 shrink-0 rounded-md border border-border shadow-sm"
          style={{ backgroundColor: row.original.hex }}
          aria-hidden
        />
        <span className="font-mono text-sm text-foreground">{row.original.hex}</span>
      </div>
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.name}</span>,
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => (
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          row.original.is_active
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {row.original.is_active ? t('active') : t('inactive')}
      </span>
    ),
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.createdAt')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.created_at).toLocaleDateString()}
      </span>
    ),
  },
  ...(permissions.update
    ? [createToggleColumn<ColorListItem>({ entityType: 'color' })]
    : []),
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={ColorRowSchema}
        row={row}
        viewDetails={`/colors/update/${row.original.id}`}
        editItem={onEdit ? undefined : `/colors/update/${row.original.id}`}
        onEdit={onEdit}
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
