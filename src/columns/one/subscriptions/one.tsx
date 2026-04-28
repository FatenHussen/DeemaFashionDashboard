import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { SubscriptionListItem } from '@/pages/dashboard/subscriptions/types/subscription.types';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';
import { TableActiveBadge, TableTonedStatusPill } from '@/shared/components/table-status-badges';

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
      const status = String(row.original.status);
      const label = subscriptionStatusLabel(status, t);
      const cfg =
        status === 'active'
          ? { icon: 'solar:check-circle-bold', className: 'border-emerald-800 bg-emerald-600' }
          : status === 'expired'
            ? { icon: 'solar:calendar-minimalistic-bold', className: 'border-slate-600 bg-slate-500' }
            : status === 'cancelled'
              ? { icon: 'solar:close-circle-bold', className: 'border-red-800 bg-red-600' }
              : { icon: 'solar:clock-circle-bold', className: 'border-amber-700 bg-amber-500' };
      return (
        <TableTonedStatusPill icon={cfg.icon} className={cfg.className}>
          {label}
        </TableTonedStatusPill>
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
        <TableActiveBadge
          isActive={Boolean(isActive)}
          activeLabel={t('active')}
          inactiveLabel={t('inactive')}
        />
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
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={z.object({ id: z.number() })}
        row={row}
        viewDetails={`/subscriptions/details/${row.original.id}`}
        permissions={{ update: false, delete: false }}
      />
    ),
  },
];
