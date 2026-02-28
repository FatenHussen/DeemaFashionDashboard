import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { CouponItem } from '@/pages/dashboard/coupons/types/coupon.types';

import { z } from 'zod';
import { formatTranslated } from '@/utils/format-translated';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const CouponSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  discount: z.object({ type: z.string(), value: z.string() }),
  start_at: z.string(),
  end_at: z.string(),
  max_uses: z.number(),
  used_count: z.number(),
  is_active: z.boolean(),
  is_expired: z.boolean(),
  is_valid: z.boolean(),
  created_at: z.string(),
});

export interface CouponFormValues extends CouponItem {
  [key: string]: any;
}

export const couponColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void
): ColumnDef<CouponFormValues>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <div className="font-semibold text-foreground truncate">{formatTranslated(row.original.name)}</div>
    ),
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
    cell: ({ row }) => (
      <code className="px-2 py-1 rounded bg-muted text-sm font-mono">{row.original.code}</code>
    ),
  },
  {
    id: 'discount',
    accessorKey: 'discount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Discount" />,
    cell: ({ row }) => {
      const d = row.original.discount;
      const text =
        d?.type === 'percentage'
          ? `${d?.value ?? 0}%`
          : `Fixed: ${d?.value ?? 0}`;
      return <span className="text-sm">{text}</span>;
    },
  },
  {
    id: 'start_at',
    accessorKey: 'start_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Start" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.start_at).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: 'end_at',
    accessorKey: 'end_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="End" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.end_at).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: 'used_count',
    accessorKey: 'used_count',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Used" />,
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.used_count} / {row.original.max_uses}
      </span>
    ),
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      const isExpired = row.original.is_expired;
      const label = isExpired ? 'Expired' : isActive ? 'Active' : 'Inactive';
      const variant = isExpired ? 'secondary' : isActive ? 'default' : 'destructive';
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            variant === 'default'
              ? 'bg-green-500/20 text-green-600'
              : variant === 'destructive'
                ? 'bg-red-500/20 text-red-600'
                : 'bg-muted text-muted-foreground'
          }`}
        >
          {label}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={CouponSchema}
        row={row}
        editItem={onEdit ? undefined : `/coupons/update/${row.original.id}`}
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
