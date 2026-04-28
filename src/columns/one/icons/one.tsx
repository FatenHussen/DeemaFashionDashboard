import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { IconItem } from '@/pages/dashboard/icons/types/icon.types';

import { z } from 'zod';
import { TableActiveBadge } from '@/shared/components/table-status-badges';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const IconSchema = z.object({
  id: z.number(),
  name: z.any(),
  is_active: z.boolean(),
});

export const iconColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void
): ColumnDef<IconItem>[] => [
  {
    id: 'image',
    accessorKey: 'image',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.image')} />,
    cell: ({ row }) => (
      <div className="w-10 h-10 rounded-lg border border-border overflow-hidden bg-muted/30">
        {row.original.image ? (
          <img src={row.original.image} alt="icon" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">—</div>
        )}
      </div>
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => {
      const name = row.original.name;
      const display = typeof name === 'string' ? name : name?.en || name?.ar || '—';
      return <span className="font-semibold text-foreground">{display}</span>;
    },
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => (
      <TableActiveBadge
        isActive={row.original.is_active}
        activeLabel={t('active')}
        inactiveLabel={t('inactive')}
      />
    ),
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.createdAt')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{new Date(row.original.created_at).toLocaleDateString()}</span>
    ),
  },
  ...(permissions.update
    ? [createToggleColumn<IconItem>({ entityType: 'icon' })]
    : []),
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={IconSchema}
        row={row}
        viewDetails={`/icons/update/${row.original.id}`}
        editItem={onEdit ? undefined : `/icons/update/${row.original.id}`}
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
