import type { TFunction } from 'i18next';
import type { NavigateFunction } from 'react-router';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { Iconify } from '@/shared/components/iconify';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';
import {
  type OrderData,
  type OrderStatus,
  normalizeOrderStatus,
} from '@/pages/dashboard/orders/types/order.types';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/ui/dropdown-menu';

import { CONFIG } from 'src/global-config';

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

const ORDER_STATUS_BADGE: Record<
  OrderStatus,
  { icon: string; className: string }
> = {
  pending: {
    icon: 'solar:hourglass-bold',
    className:
      'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300',
  },
  preparing: {
    icon: 'solar:chef-hat-bold',
    className:
      'bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800/50 text-sky-700 dark:text-sky-300',
  },
  out_delivery: {
    icon: 'solar:delivery-bold',
    className:
      'bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800/50 text-violet-700 dark:text-violet-300',
  },
  delivered: {
    icon: 'solar:check-circle-bold',
    className:
      'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300',
  },
  cancelled: {
    icon: 'solar:close-circle-bold',
    className:
      'bg-slate-100 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300',
  },
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
    onOpenAssignDriverModal?: (order: OrderFormValues) => void;
    onOpenRejectModal?: (order: OrderFormValues) => void;
  }
): ColumnDef<OrderFormValues>[] => [
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
  // {
  //   id: 'total',
  //   accessorKey: 'total',
  //   header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.total')} />,
  //   cell: ({ row }) => (
  //     <span className="font-semibold text-sm">{row.original.total}</span>
  //   ),
  // },
  // {
  //   id: 'discount',
  //   accessorFn: (row) => sumOrderDiscounts(row),
  //   header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.discount')} />,
  //   cell: ({ row }) => {
  //     const d = sumOrderDiscounts(row.original);
  //     return <span className="text-sm">{d > 0 ? d : d === 0 ? 0 : '-'}</span>;
  //   },
  // },
  // {
  //   id: 'delivery_price',
  //   accessorKey: 'delivery_price',
  //   header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.delivery')} />,
  //   cell: ({ row }) => (
  //     <span className="text-sm">{row.original.delivery_price != null ? row.original.delivery_price : '-'}</span>
  //   ),
  // },
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
    id: 'payment_method',
    accessorFn: (row) => row.payment_method?.name ?? '',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.paymentMethod')} />
    ),
    cell: ({ row }) => {
      const pm = row.original.payment_method;
      if (!pm?.name) {
        return <span className="text-sm text-muted-foreground">—</span>;
      }
      const raw = pm.icon;
      const iconSrc =
        raw &&
        (String(raw).startsWith('http')
          ? raw
          : `${(CONFIG.serverUrl || '').replace(/\/$/, '')}/${String(raw).replace(/^\//, '')}`);
      return (
        <div className="flex min-w-0 max-w-[12rem] items-center gap-2">
          {iconSrc ? (
            <img
              src={iconSrc}
              alt=""
              className="h-7 w-7 shrink-0 rounded-md border border-border/50 bg-muted/40 object-contain p-0.5"
            />
          ) : (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
              <Iconify icon="solar:wallet-money-bold" width={16} height={16} />
            </span>
          )}
          <span className="truncate text-sm font-medium">{pm.name}</span>
        </div>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const n = normalizeOrderStatus(row.original.status);
      const cfg = ORDER_STATUS_BADGE[n] ?? ORDER_STATUS_BADGE.pending;
      return (
        <div
          className={`flex max-w-full min-w-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1 w-fit ${cfg.className}`}
        >
          <Iconify icon={cfg.icon} width={14} height={14} className="shrink-0" />
          <span className="text-xs font-medium capitalize">{n.replace(/_/g, ' ')}</span>
        </div>
      );
    },
  },
  {
    id: 'driver',
    accessorKey: 'driver',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.driver')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.driver?.phone || t('columns.notAssigned')}
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
      const st = normalizeOrderStatus(order.status);
      const canOpenAssignDriver =
        permissions.update &&
        st !== 'delivered' &&
        st !== 'out_delivery' &&
        st !== 'cancelled';
      const canRejectOrder =
        permissions.update && st !== 'delivered' && st !== 'cancelled';

      return (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-border/70 bg-card/90 p-2 text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-primary/8 hover:text-primary hover:shadow-md active:scale-95 sm:min-h-10 sm:min-w-10"
                title={t('orderRowActions')}
                aria-label={t('orderRowActions')}
              >
                <Iconify icon="solar:menu-dots-bold" width={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  navigate(`/orders/details/${order.id}`, { state: { order } });
                }}
                className="gap-2"
              >
                <Iconify icon="solar:eye-bold" width={18} className="text-muted-foreground" />
                {t('viewDetails')}
              </DropdownMenuItem>
              {permissions.update ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={!canOpenAssignDriver}
                    onSelect={(e) => {
                      e.preventDefault();
                      if (!canOpenAssignDriver) return;
                      options?.onOpenAssignDriverModal?.(order);
                    }}
                    className="gap-2"
                  >
                    <Iconify icon="solar:user-id-bold" width={18} className="text-muted-foreground" />
                    {t('assignOrderToDriver')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={!canRejectOrder}
                    onSelect={(e) => {
                      e.preventDefault();
                      if (!canRejectOrder) return;
                      options?.onOpenRejectModal?.(order);
                    }}
                    className="gap-2 text-destructive focus:text-destructive"
                  >
                    <Iconify icon="solar:close-circle-bold" width={18} />
                    {t('rejectOrder')}
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
