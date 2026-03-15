import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { ScheduledBasketData } from '@/pages/dashboard/baskets/types/scheduled-basket.types';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const ScheduledBasketSchema = z.object({
  id: z.number(),
  name: z.any(),
  discount: z.number(),
  discount_type: z.string(),
  scheduled_at: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
});

export interface ScheduledBasketFormValues extends ScheduledBasketData {
  [key: string]: any;
}

export const scheduledBasketColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void
): ColumnDef<ScheduledBasketFormValues>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.id')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="text-xs font-semibold text-primary">{row.original.id}</span>
        </div>
      </div>
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => {
      const name = row.original.name;
      const display = typeof name === 'object' ? (name as any)?.en || (name as any)?.ar : name;
      return <div className="font-semibold text-foreground truncate">{display || '-'}</div>;
    },
  },
  {
    id: 'discount',
    accessorKey: 'discount',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.discount')} />,
    cell: ({ row }) => {
      const d = row.original;
      const text = d.discount_type === 'percentage' ? `${d.discount}%` : `Fixed: ${d.discount}`;
      return <span className="text-sm">{text}</span>;
    },
  },
  {
    id: 'scheduled_at',
    accessorKey: 'scheduled_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.scheduledAt')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.scheduled_at ? new Date(row.original.scheduled_at).toLocaleString() : '-'}
      </span>
    ),
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            isActive
              ? 'bg-green-500/20 text-green-600'
              : 'bg-red-500/20 text-red-600'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      );
    },
  },
  {
    id: 'items_count',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.items')} />,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.items?.length || 0}</span>
    ),
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.created')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.created_at).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={ScheduledBasketSchema}
        row={row}
        editItem={onEdit ? undefined : `/scheduled-baskets/update/${row.original.id}`}
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
