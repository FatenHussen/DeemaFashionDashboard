import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { AffiliateWalletTransactionItem } from '@/pages/dashboard/affiliate-wallet-transactions/types/affiliate-wallet-transaction.types';

import { z } from 'zod';
import { Link } from 'react-router';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';
import { normalizeAffiliateId } from '@/pages/dashboard/affiliate-wallet-transactions/utils/affiliate-display';
import { AffiliateCreativeAvatar } from '@/pages/dashboard/affiliate-wallet-transactions/components/affiliate-creative-avatar';

import { paths } from 'src/routes/paths';

function AffiliateTableCell({
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
      <AffiliateCreativeAvatar name={name} imageUrl={imageUrl} size="sm" />
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
  commission: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  withdraw: 'bg-slate-100 text-slate-800 dark:bg-slate-800/60 dark:text-slate-200',
};

const detailsPath = paths.dashboard.affiliateWalletTransactions;

export const affiliateWalletTransactionColumns = (
  t: TFunction<'table'>
): ColumnDef<AffiliateWalletTransactionItem>[] => [
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
    id: 'affiliate_id',
    accessorKey: 'affiliate_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('form.affiliateWalletTxAffiliateCode')} />
    ),
    cell: ({ row }) => (
      <span className="text-sm font-medium text-foreground">
        {normalizeAffiliateId(row.original.affiliate_id)}
      </span>
    ),
  },
  {
    id: 'affiliate',
    accessorKey: 'affiliate',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.affiliate')} />,
    cell: ({ row }) => (
      <AffiliateTableCell
        key={row.original.id}
        name={row.original.affiliate?.name}
        email={row.original.affiliate?.email}
        imageUrl={row.original.affiliate?.image_url}
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
        {t(`form.affiliateWalletTxType_${row.original.type}`, { defaultValue: row.original.type })}
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
