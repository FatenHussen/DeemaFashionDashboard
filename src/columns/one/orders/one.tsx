import type { TFunction } from 'i18next';
import type { NavigateFunction } from 'react-router';
import type { ColumnDef } from '@tanstack/react-table';
import type { OrderData, OrderStatus } from '@/pages/dashboard/orders/types/order.types';

import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { Iconify } from '@/shared/components/iconify';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const OrderSchema = z.object({
  id: z.number(),
  order_number: z.string(),
  status: z.string(),
  total: z.number(),
  created_at: z.string(),
});

export interface OrderFormValues extends OrderData {
  [key: string]: any;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-600',
  preparing: 'bg-blue-500/20 text-blue-600',
  out_delivery: 'bg-purple-500/20 text-purple-600',
  delivered: 'bg-green-500/20 text-green-600',
};

const STATUS_NEXT: Record<OrderStatus, OrderStatus | null> = {
  pending: 'preparing',
  preparing: 'out_delivery',
  out_delivery: 'delivered',
  delivered: null,
};

export const orderColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  navigate: NavigateFunction,
  options?: {
    onStatusChange?: (orderId: number, newStatus: OrderStatus) => void;
    changingOrderId?: number | null;
  }
): ColumnDef<OrderFormValues>[] => [
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
    id: 'order_number',
    accessorKey: 'order_number',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.orderNumber')} />,
    cell: ({ row }) => (
      <code className="px-2 py-1 rounded bg-muted text-sm font-mono">
        {row.original.order_number}
      </code>
    ),
  },
  {
    id: 'user',
    accessorKey: 'user',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('customer')} />,
    cell: ({ row }) => (
      <div className="font-medium text-foreground truncate">
        {row.original.user?.name || '-'}
      </div>
    ),
  },
  {
    id: 'total',
    accessorKey: 'total',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.total')} />,
    cell: ({ row }) => (
      <span className="font-semibold text-sm">{row.original.total}</span>
    ),
  },
  {
    id: 'discount',
    accessorKey: 'discount',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.discount')} />,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.discount != null ? row.original.discount : '-'}</span>
    ),
  },
  {
    id: 'delivery_price',
    accessorKey: 'delivery_price',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.delivery')} />,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.delivery_price != null ? row.original.delivery_price : '-'}</span>
    ),
  },
  {
    id: 'price_after_discount',
    accessorKey: 'price_after_discount',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.priceAfterDiscount')} />,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.price_after_discount != null ? row.original.price_after_discount : '-'}</span>
    ),
  },
  {
    id: 'rating',
    accessorKey: 'rating',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.rating')} />,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.rating != null ? row.original.rating : '-'}</span>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[status] || 'bg-muted text-muted-foreground'}`}
        >
          {status?.replace('_', ' ')}
        </span>
      );
    },
  },
  {
    id: 'driver',
    accessorKey: 'driver',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.driver')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.driver?.phone || 'Not assigned'}
      </span>
    ),
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.date')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.created_at).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original;
      const nextStatus = STATUS_NEXT[order.status as OrderStatus];
      const changingId = options?.changingOrderId;
      const isChanging = changingId === order.id;
      const canChangeStatus = permissions.update && nextStatus !== null;

      const statusButtonLabels: Record<OrderStatus, string> = {
        pending: t('btnChangeStatusToPreparing'),
        preparing: t('btnChangeStatusToOutDelivery'),
        out_delivery: t('btnChangeStatusToDelivered'),
        delivered: '',
      };

      return (
        <div className="flex items-center gap-1">
          {canChangeStatus && (
            <Button
              size="small"
              variant="outlined"
              disabled={isChanging}
              onClick={() => options?.onStatusChange?.(order.id, nextStatus!)}
              className="text-xs"
            >
              {isChanging ? '...' : statusButtonLabels[order.status as OrderStatus]}
            </Button>
          )}
          <button
            type="button"
            onClick={() =>
              navigate(`/orders/details/${row.original.id}`, { state: { order: row.original } })
            }
            className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            title="View Details"
          >
            <Iconify icon="solar:eye-bold" width={18} />
          </button>
        </div>
      );
    },
  },
];
