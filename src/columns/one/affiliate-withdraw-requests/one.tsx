import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { AffiliateWithdrawItem } from '@/pages/dashboard/affiliate-withdraw-requests/types/affiliate-withdraw.types';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const AffiliateWithdrawSchema = z.object({
  id: z.number(),
  amount: z.number(),
  status: z.string(),
});

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const affiliateWithdrawColumns = (
  t: TFunction<'table'>,
  onViewDetails?: (id: number) => void
): ColumnDef<AffiliateWithdrawItem>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.id')} />,
    cell: ({ row }) => (
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <span className="text-xs font-semibold text-primary">{row.original.id}</span>
      </div>
    ),
  },
  {
    id: 'affiliate',
    accessorKey: 'affiliate',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.affiliate')} />,
    cell: ({ row }) => (
      <div>
        <p className="font-semibold text-sm text-foreground">{row.original.affiliate?.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.affiliate?.email}</p>
      </div>
    ),
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.total')} />,
    cell: ({ row }) => (
      <span className="font-semibold text-foreground">{row.original.amount?.toLocaleString()}</span>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[row.original.status] ?? 'bg-muted text-muted-foreground'}`}>
        {t(`form.affiliateWithdrawStatus_${row.original.status}`, { defaultValue: row.original.status })}
      </span>
    ),
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
        schema={AffiliateWithdrawSchema}
        row={row}
        editItem={`/affiliate-withdraw-requests/${row.original.id}`}
        permissions={{ update: true, delete: false }}
      />
    ),
  },
];
