import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { PackageData } from '@/pages/dashboard/packages/types/package.types';

import { z } from 'zod';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const PackageSchema = z.object({
  id: z.number(),
  name: z.any(),
  price: z.number(),
  duration_days: z.number(),
  monthly_orders_limit: z.number(),
  discount_percentage: z.number(),
  is_active: z.boolean(),
  created_at: z.string(),
});

export interface PackageFormValues extends PackageData {
  [key: string]: any;
}

export const packageColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void
): ColumnDef<PackageFormValues>[] => [
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
    id: 'price',
    accessorKey: 'price',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.price')} />,
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.price}</span>
    ),
  },
  {
    id: 'duration_days',
    accessorKey: 'duration_days',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.durationDays')} />,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.duration_days}</span>
    ),
  },
  {
    id: 'monthly_orders_limit',
    accessorKey: 'monthly_orders_limit',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.monthlyOrders')} />,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.monthly_orders_limit}</span>
    ),
  },
  {
    id: 'discount_percentage',
    accessorKey: 'discount_percentage',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.discountPercent')} />,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.discount_percentage}%</span>
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
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.created')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.created_at).toLocaleDateString()}
      </span>
    ),
  },
  ...(permissions.update
    ? [createToggleColumn<PackageFormValues>({ entityType: 'package' })]
    : []),
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={PackageSchema}
        row={row}
        viewDetails={`/packages/details/${row.original.id}`}
        editItem={onEdit ? undefined : `/packages/update/${row.original.id}`}
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
