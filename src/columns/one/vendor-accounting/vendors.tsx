import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { VendorAccountingRow } from '@/pages/dashboard/vendor-accounting/types';

import { paths } from '@/routes/paths';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { formatCurrency } from '@/utils/format-currency';
import { formatTranslated } from '@/utils/format-translated';
import { TableActiveBadge } from '@/shared/components/table-status-badges';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

function ViewStatementButton({ vendorId }: { vendorId: number }) {
  const navigate = useNavigate();
  const { t } = useTranslation('table');
  return (
    <button
      type="button"
      onClick={() => navigate(paths.dashboard.vendorAccounting.vendorDetails(vendorId))}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-xs font-medium transition-colors"
    >
      <Iconify icon="solar:eye-bold" width={14} height={14} />
      {t('vendorAccounting.viewStatement')}
    </button>
  );
}

export const vendorAccountingColumns = (
  t: TFunction<'table'>
): ColumnDef<VendorAccountingRow>[] => [
  {
    id: 'vendor',
    accessorKey: 'vendor',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.vendor')} />,
    cell: ({ row }) => {
      const vendor = row.original.vendor;
      return (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Iconify icon="solar:shop-bold" className="text-primary" width={18} height={18} />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-foreground truncate">
              {formatTranslated(vendor.name)}
            </div>
            <div className="text-xs text-muted-foreground truncate">{vendor.owner_name}</div>
          </div>
        </div>
      );
    },
  },
  {
    id: 'commission_rate',
    accessorKey: 'wallet.commission_rate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('vendorAccounting.commissionRate')} />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Iconify icon="solar:percent-bold" className="text-muted-foreground" width={14} height={14} />
        <span className="text-sm font-medium">{row.original.wallet.commission_rate}%</span>
      </div>
    ),
  },
  {
    id: 'gross_sales',
    accessorKey: 'wallet.gross_sales',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('vendorAccounting.grossSales')} />
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-foreground">
        {formatCurrency(row.original.wallet.gross_sales, { decimals: 2 })}
      </span>
    ),
  },
  {
    id: 'platform_commission',
    accessorKey: 'wallet.platform_commission',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('vendorAccounting.platformCommission')} />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
        {formatCurrency(row.original.wallet.platform_commission, { decimals: 2 })}
      </span>
    ),
  },
  {
    id: 'net_due',
    accessorKey: 'wallet.net_due',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('vendorAccounting.netDue')} />
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
        {formatCurrency(row.original.wallet.net_due, { decimals: 2 })}
      </span>
    ),
  },
  {
    id: 'paid',
    accessorKey: 'wallet.paid',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('vendorAccounting.paid')} />
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
        {formatCurrency(row.original.wallet.paid, { decimals: 2 })}
      </span>
    ),
  },
  {
    id: 'available_for_withdraw',
    accessorKey: 'wallet.available_for_withdraw',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('vendorAccounting.availableForWithdraw')} />
    ),
    cell: ({ row }) => (
      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
        {formatCurrency(row.original.wallet.available_for_withdraw, { decimals: 2 })}
      </span>
    ),
  },
  {
    id: 'status',
    accessorKey: 'vendor.is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const isActive = row.original.vendor.is_active;
      return (
        <TableActiveBadge
          isActive={isActive}
          activeLabel={t('active')}
          inactiveLabel={t('inactive')}
        />
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ViewStatementButton vendorId={row.original.vendor.id} />,
  },
];
