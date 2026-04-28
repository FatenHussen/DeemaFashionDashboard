import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { WithdrawRequest } from '@/pages/dashboard/vendor-accounting/types';

import { Iconify } from '@/shared/components/iconify';
import { formatCurrency } from '@/utils/format-currency';
import { formatTranslated } from '@/utils/format-translated';
import { TableTonedStatusPill } from '@/shared/components/table-status-badges';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const statusConfig = {
  pending: {
    icon: 'solar:clock-circle-bold',
    className: 'border-amber-700 bg-amber-500',
  },
  paid: {
    icon: 'solar:check-circle-bold',
    className: 'border-emerald-800 bg-emerald-600',
  },
  rejected: {
    icon: 'solar:close-circle-bold',
    className: 'border-red-800 bg-red-600',
  },
} as const;

function withdrawStatusLabel(
  t: TFunction<'table'>,
  status: keyof typeof statusConfig
) {
  if (status === 'pending') return t('statusPending');
  if (status === 'paid') return t('vendorAccounting.statusPaid');
  return t('statusRejected');
}

function translatePaymentMethod(t: TFunction<'table'>, method: string | undefined | null) {
  if (!method) return '—';
  if (method === 'bank_transfer') return t('vendorAccounting.bankTransfer');
  if (method === 'cash') return t('vendorAccounting.cash');
  if (method === 'wallet') return t('vendorAccounting.walletMethod');
  if (method === 'other') return t('vendorAccounting.other');
  return method;
}

export const withdrawRequestColumns = (
  t: TFunction<'table'>,
  onProcess?: (id: number) => void
): ColumnDef<WithdrawRequest>[] => [
  {
    id: 'vendor',
    accessorKey: 'vendor',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.vendor')} />,
    cell: ({ row }) => {
      const vendor = row.original.vendor;
      if (!vendor) return <span className="text-muted-foreground text-sm">-</span>;
      return (
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Iconify icon="solar:shop-bold" className="text-primary" width={14} height={14} />
          </div>
          <span className="text-sm font-medium truncate">{formatTranslated(vendor.name)}</span>
        </div>
      );
    },
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('vendorAccounting.amount')} />
    ),
    cell: ({ row }) => (
      <span className="text-sm font-bold text-foreground">
        {formatCurrency(row.original.amount, { decimals: 2 })}
      </span>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const status = row.original.status as keyof typeof statusConfig;
      const cfg = statusConfig[status];
      if (!cfg) return null;
      return (
        <TableTonedStatusPill icon={cfg.icon} className={cfg.className}>
          {withdrawStatusLabel(t, status)}
        </TableTonedStatusPill>
      );
    },
  },
  {
    id: 'payment_method',
    accessorKey: 'payment_method',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('vendorAccounting.paymentMethod')} />
    ),
    cell: ({ row }) => {
      const method = row.original.payment_method;
      return (
        <span className="text-sm text-muted-foreground">
          {translatePaymentMethod(t, method)}
        </span>
      );
    },
  },
  {
    id: 'requested_at',
    accessorKey: 'requested_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('vendorAccounting.requestedAt')} />
    ),
    cell: ({ row }) => {
      const date = row.original.requested_at ?? row.original.created_at;
      return (
        <div className="flex items-center gap-2">
          <Iconify
            icon="solar:calendar-date-bold"
            className="text-muted-foreground flex-shrink-0"
            width={14}
            height={14}
          />
          <span className="text-sm text-muted-foreground">{date ?? '-'}</span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const isPending = row.original.status === 'pending';
      if (!isPending || !onProcess) return null;
      return (
        <button
          type="button"
          onClick={() => onProcess(row.original.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium transition-colors"
        >
          <Iconify icon="solar:play-bold" width={14} height={14} />
          {t('vendorAccounting.processAction')}
        </button>
      );
    },
  },
];
