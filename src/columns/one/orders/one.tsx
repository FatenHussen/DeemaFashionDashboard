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
  order_code: z.string().optional(),
  order_number: z.string().optional(),
  status: z.string(),
  total: z.number(),
  created_at: z.string(),
});

export interface OrderFormValues extends OrderData {
  [key: string]: any;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-800 ring-1 ring-amber-500/25 dark:text-amber-300',
  preparing: 'bg-sky-500/15 text-sky-800 ring-1 ring-sky-500/25 dark:text-sky-300',
  out_delivery: 'bg-violet-500/15 text-violet-800 ring-1 ring-violet-500/25 dark:text-violet-300',
  delivered: 'bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-500/25 dark:text-emerald-300',
  cancelled: 'bg-muted text-muted-foreground ring-1 ring-border',
};

const STATUS_NEXT: Record<OrderStatus, OrderStatus | null> = {
  pending: 'preparing',
  preparing: 'out_delivery',
  out_delivery: 'delivered',
  delivered: null,
};

function toNum(v: unknown): number {
  if (v == null || v === '') return 0;
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Total discount from list/detail payload (basket + coupon + subscription). */
function sumOrderDiscounts(row: OrderFormValues): number {
  const legacy = toNum(row.discount);
  if (legacy > 0) return legacy;
  return (
    toNum(row.basket_discount) +
    toNum(row.coupon_discount) +
    toNum(row.subscription_discount)
  );
}

/** Items total after discounts, excluding delivery (matches list API shape). */
function priceAfterDiscountValue(o: OrderFormValues): number | undefined {
  if (o.price_after_discount != null) return toNum(o.price_after_discount);
  if (o.total != null) return toNum(o.total) - toNum(o.delivery_price);
  if (o.subtotal != null) return toNum(o.subtotal);
  return undefined;
}

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
    id: 'order_code',
    accessorFn: (row) => row.order_code ?? row.order_number ?? '',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.orderNumber')} />,
    cell: ({ row }) => {
      const ref = row.original.order_code ?? row.original.order_number;
      return (
        <code className="min-w-0 max-w-[14rem] truncate px-2 py-1 rounded bg-muted text-sm font-mono">
          {ref != null && String(ref).trim() !== '' ? String(ref) : '-'}
        </code>
      );
    },
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
    accessorFn: (row) => sumOrderDiscounts(row),
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.discount')} />,
    cell: ({ row }) => {
      const d = sumOrderDiscounts(row.original);
      return <span className="text-sm">{d > 0 ? d : d === 0 ? 0 : '-'}</span>;
    },
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
    accessorFn: (row) => priceAfterDiscountValue(row),
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.priceAfterDiscount')} />,
    cell: ({ row }) => {
      const v = priceAfterDiscountValue(row.original);
      return (
        <span className="text-sm">
          {v != null && Number.isFinite(v) ? String(v) : '-'}
        </span>
      );
    },
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
          className={`inline-flex max-w-full min-w-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status] || 'bg-muted text-muted-foreground'}`}
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
      const canChangeStatus =
        permissions.update && nextStatus != null && typeof nextStatus === 'string';

      const statusButtonLabels: Record<OrderStatus, string> = {
        pending: t('btnChangeStatusToPreparing'),
        preparing: t('btnChangeStatusToOutDelivery'),
        out_delivery: t('btnChangeStatusToDelivered'),
        delivered: '',
      };

      const statusActionIcon: Record<OrderStatus, string> = {
        pending: 'solar:chef-hat-bold',
        preparing: 'solar:delivery-bold',
        out_delivery: 'solar:box-bold',
        delivered: 'solar:check-circle-bold',
      };

      return (
        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          {canChangeStatus && (
            <Button
              type="button"
              size="small"
              disabled={isChanging}
              onClick={() => options?.onStatusChange?.(order.id, nextStatus!)}
              className="min-h-9 gap-1.5 rounded-xl border-0 bg-linear-to-br from-primary to-primary/88 px-2.5 py-2 text-[11px] font-semibold text-primary-foreground shadow-md shadow-primary/25 ring-1 ring-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-[0.97] sm:min-h-10 sm:px-3 sm:text-xs"
            >
              <Iconify
                icon={statusActionIcon[order.status as OrderStatus] || 'solar:arrow-right-bold'}
                width={16}
                height={16}
                className="shrink-0"
              />
              <span className="max-w-[9rem] truncate sm:max-w-[11rem]">
                {isChanging ? t('updating') : statusButtonLabels[order.status as OrderStatus]}
              </span>
            </Button>
          )}
          <button
            type="button"
            onClick={() =>
              navigate(`/orders/details/${row.original.id}`, { state: { order: row.original } })
            }
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-border/70 bg-card/90 p-2 text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-primary/8 hover:text-primary hover:shadow-md active:scale-95 sm:min-h-10 sm:min-w-10"
            title={t('viewDetails')}
          >
            <Iconify icon="solar:eye-bold" width={18} />
          </button>
        </div>
      );
    },
  },
];
