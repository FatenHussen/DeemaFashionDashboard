import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { DriverWalletTransactionItem } from '@/pages/dashboard/driver-wallet-transactions/types/driver-wallet-transaction.types';

import { z } from 'zod';
import { Link } from 'react-router';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';
import { DriverCreativeAvatar } from '@/pages/dashboard/driver-wallet-transactions/components/driver-creative-avatar';

import { paths } from 'src/routes/paths';

function DriverTableCell({
  name,
  email,
  imageUrl,
}: {
  name?: string;
  email?: string;
  imageUrl?: string | null;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <DriverCreativeAvatar name={name} imageUrl={imageUrl} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      </div>
    </div>
  );
}

const RowSchema = z.object({
  id: z.number(),
  amount: z.number(),
  type: z.string(),
});

const typeColors: Record<string, string> = {
  paid_by_user: 'bg-sky-100 text-sky-900 dark:bg-sky-900/35 dark:text-sky-200',
  paid_by_system: 'bg-violet-100 text-violet-900 dark:bg-violet-900/35 dark:text-violet-200',
};

const detailsPath = paths.dashboard.driverWalletTransactions;

export const driverWalletTransactionColumns = (
  t: TFunction<'table'>
): ColumnDef<DriverWalletTransactionItem>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.id')} />,
    cell: ({ row }) => (
      <Link
        to={`${detailsPath}/${row.original.id}`}
        onClick={(e) => e.stopPropagation()}
        className="font-mono text-sm font-medium text-primary hover:underline"
      >
        {row.original.id}
      </Link>
    ),
  },
  {
    id: 'driver_id',
    accessorKey: 'driver_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('form.driverWalletTxDriverId')} />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium text-foreground">{row.original.driver_id}</span>
    ),
  },
  {
    id: 'driver',
    accessorKey: 'driver',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.driver')} />,
    cell: ({ row }) => (
      <DriverTableCell
        key={row.original.id}
        name={row.original.driver?.name}
        email={row.original.driver?.email}
        imageUrl={row.original.driver?.image_url}
      />
    ),
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.type')} />,
    cell: ({ row }) => (
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          typeColors[row.original.type] ?? 'bg-muted text-muted-foreground'
        }`}
      >
        {t(`form.driverWalletTxType_${row.original.type}`, { defaultValue: row.original.type })}
      </span>
    ),
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.amount')} />,
    cell: ({ row }) => (
      <span className="font-semibold text-foreground">{row.original.amount?.toLocaleString()}</span>
    ),
  },
  {
    id: 'delivery_fee',
    accessorKey: 'delivery_fee',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('form.driverWalletTxDeliveryFee')} />
    ),
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{row.original.delivery_fee?.toLocaleString()}</span>
    ),
  },
  {
    id: 'rate_percent',
    accessorKey: 'rate_percent',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('form.driverWalletTxRatePercent')} />
    ),
    cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.rate_percent}%</span>,
  },
  {
    id: 'order_id',
    accessorKey: 'order_id',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.order')} />,
    cell: ({ row }) => {
      const n = row.original.order_number ?? row.original.order_id;
      return n != null ? (
        <span className="text-sm font-mono">{n}</span>
      ) : (
        <span className="text-sm text-muted-foreground">{t('form.emptyEmDash')}</span>
      );
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.createdAt')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.created_at}</span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={RowSchema}
        row={row}
        viewDetails={`${detailsPath}/${row.original.id}`}
        permissions={{ update: false, delete: false }}
      />
    ),
  },
];
