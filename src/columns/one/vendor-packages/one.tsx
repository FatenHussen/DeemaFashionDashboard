import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { VendorPackageItem } from '@/pages/dashboard/vendor/types/vendor-package.types';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const VendorPackageSchema = z.object({
  id: z.number(),
  name: z.any(),
  price: z.number(),
  duration_days: z.number(),
  max_products: z.number(),
  commission_rate: z.number(),
  is_active: z.boolean(),
  created_at: z.string(),
});

export interface VendorPackageFormValues extends VendorPackageItem {
  [key: string]: any;
}

export const vendorPackageColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null
): ColumnDef<VendorPackageFormValues>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.id')} />,
    cell: ({ row }) => (
      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
        <span className="text-xs font-semibold text-primary">{row.original.id}</span>
      </div>
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => {
      const name = row.original.name;
      const display =
        typeof name === 'object' ? (name as any)?.en || (name as any)?.ar : name;
      return <div className="font-semibold text-foreground truncate">{display || '-'}</div>;
    },
  },
  {
    id: 'price',
    accessorKey: 'price',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.price')} />,
    cell: ({ row }) => <span className="text-sm font-medium">{row.original.price}</span>,
  },
  {
    id: 'duration_days',
    accessorKey: 'duration_days',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.durationDays')} />,
    cell: ({ row }) => <span className="text-sm">{row.original.duration_days}</span>,
  },
  {
    id: 'max_products',
    accessorKey: 'max_products',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.maxProducts')} />,
    cell: ({ row }) => <span className="text-sm">{row.original.max_products}</span>,
  },
  {
    id: 'commission_rate',
    accessorKey: 'commission_rate',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.commissionPercent')} />,
    cell: ({ row }) => <span className="text-sm">{row.original.commission_rate}%</span>,
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
            isActive ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      );
    },
  },
  {
    id: 'active_subscriptions_count',
    accessorKey: 'active_subscriptions_count',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.activeSubs')} />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.active_subscriptions_count ?? 0}
      </span>
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
        schema={VendorPackageSchema}
        row={row}
        viewDetails={`/vendor-packages/details/${row.original.id}`}
        editItem={`/vendor-packages/update/${row.original.id}`}
        onDelete={onDelete}
        isDeleting={isDeleting}
        isDeleteDialogOpen={isDeleteDialogOpen}
        onDeleteConfirm={onDeleteConfirm}
        onDeleteCancel={onDeleteCancel}
        deletingId={deletingId}
        adminToggleEntityType="vendor_package"
        permissions={permissions}
      />
    ),
  },
];
