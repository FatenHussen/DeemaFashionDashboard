import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { DeliveryDistanceRangeItem } from '@/pages/dashboard/delivery-distance-ranges/types/delivery-distance-range.types';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const RowSchema = z.object({
  id: z.number(),
  min_distance: z.number(),
  max_distance: z.number().nullable(),
  multiplier: z.number(),
  created_at: z.string(),
});

export type DeliveryDistanceRangeTableItem = DeliveryDistanceRangeItem;

function formatMax(max: number | null, t: TFunction<'table'>): string {
  if (max === null) return t('form.deliveryDistanceRangeMaxInfinity');
  return String(max);
}

export const deliveryDistanceRangeColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void
): ColumnDef<DeliveryDistanceRangeTableItem>[] => [
  {
    id: 'range',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.distanceRange')} />,
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original.min_distance} → {formatMax(row.original.max_distance, t)}
      </span>
    ),
  },
  {
    id: 'min_distance',
    accessorKey: 'min_distance',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.minDistance')} />,
    cell: ({ row }) => <span className="text-sm font-medium">{row.original.min_distance}</span>,
  },
  {
    id: 'max_distance',
    accessorKey: 'max_distance',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.maxDistance')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{formatMax(row.original.max_distance, t)}</span>
    ),
  },
  {
    id: 'multiplier',
    accessorKey: 'multiplier',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.multiplier')} />,
    cell: ({ row }) => (
      <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-sm font-semibold">
        {row.original.multiplier}
      </span>
    ),
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.createdAt')} />,
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.created_at}</span>,
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={RowSchema}
        row={row}
        viewDetails={`/delivery-distance-ranges/details/${row.original.id}`}
        editItem={onEdit ? undefined : `/delivery-distance-ranges/update/${row.original.id}`}
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
