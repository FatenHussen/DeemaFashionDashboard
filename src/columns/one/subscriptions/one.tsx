import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { SubscriptionListItem } from '@/pages/dashboard/subscriptions/types/subscription.types';

import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const pkgDisplayName = (name: SubscriptionListItem['package']['name']): string => {
  if (!name) return '';
  if (typeof name === 'string') return name;
  return name.en || name.ar || '';
};

/** `remaining_orders`: null = unlimited per API */
const formatRemainingOrders = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '∞';
  return String(value);
};

/** `remaining_free_deliveries`: null = not applicable / unknown */
const formatRemainingFreeDeliveries = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '—';
  return String(value);
};

const subscriptionStatusLabel = (status: string, t: TFunction<'table'>): string => {
  if (status === 'active') return t('active');
  if (status === 'expired') return t('expired');
  if (status === 'cancelled') return t('statusCancelled');
  return status;
};

export type SubscriptionRow = SubscriptionListItem;

export const subscriptionColumns = (t: TFunction<'table'>): ColumnDef<SubscriptionRow>[] => [
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
    id: 'user',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.user')} />,
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-foreground truncate">{row.original.user?.name ?? '—'}</div>
        {row.original.user?.email && (
          <div className="text-xs text-muted-foreground truncate">{row.original.user.email}</div>
        )}
      </div>
    ),
  },
  {
    id: 'package',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.package')} />,
    cell: ({ row }) => {
      const display = pkgDisplayName(row.original.package?.name);
      const price = row.original.package?.price;
      return (
        <div className="text-sm">
          <div>{display || '—'}</div>
          {price != null && (
            <div className="text-xs text-muted-foreground">
              {t('columns.price')}: {Number(price).toFixed(2)}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: 'start_date',
    accessorKey: 'start_date',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.startDate')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.start_date ? new Date(row.original.start_date).toLocaleDateString() : '—'}
      </span>
    ),
  },
  {
    id: 'end_date',
    accessorKey: 'end_date',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.endDate')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.end_date != null && row.original.end_date !== ''
          ? new Date(row.original.end_date).toLocaleDateString()
          : '—'}
      </span>
    ),
  },
  {
    id: 'remaining_orders',
    accessorKey: 'remaining_orders',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.remainingOrders')} />
    ),
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{formatRemainingOrders(row.original.remaining_orders)}</span>
    ),
  },
  {
    id: 'remaining_free_deliveries',
    accessorKey: 'remaining_free_deliveries',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.remainingFreeDeliveries')} />
    ),
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {formatRemainingFreeDeliveries(row.original.remaining_free_deliveries)}
      </span>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const status = row.original.status;
      const colorClass =
        status === 'active'
          ? 'bg-green-500/20 text-green-600'
          : status === 'expired'
            ? 'bg-muted text-muted-foreground'
            : status === 'cancelled'
              ? 'bg-red-500/20 text-red-600'
              : 'bg-yellow-500/20 text-yellow-600';
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
        >
          {subscriptionStatusLabel(String(status), t)}
        </span>
      );
    },
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.active')} />,
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            isActive ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
          }`}
        >
          {isActive ? t('active') : t('inactive')}
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
        {row.original.created_at ? new Date(row.original.created_at).toLocaleString() : '—'}
      </span>
    ),
  },
];
