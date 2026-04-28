import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { AffiliateWithdrawItem } from '@/pages/dashboard/affiliate-withdraw-requests/types/affiliate-withdraw.types';

import { z } from 'zod';
import { TableTonedStatusPill } from '@/shared/components/table-status-badges';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const AffiliateWithdrawSchema = z.object({
  id: z.number(),
  amount: z.number(),
  status: z.string(),
});

const statusPill: Record<string, { icon: string; className: string }> = {
  pending: { icon: 'solar:clock-circle-bold', className: 'border-amber-700 bg-amber-500' },
  approved: { icon: 'solar:check-circle-bold', className: 'border-emerald-800 bg-emerald-600' },
  rejected: { icon: 'solar:close-circle-bold', className: 'border-red-800 bg-red-600' },
};

export const affiliateWithdrawColumns = (
  t: TFunction<'table'>
): ColumnDef<AffiliateWithdrawItem>[] => [
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
    cell: ({ row }) => {
      const key = String(row.original.status);
      const cfg = statusPill[key] ?? {
        icon: 'solar:info-circle-bold',
        className: 'border-slate-600 bg-slate-500',
      };
      const label = t(`form.affiliateWithdrawStatus_${key}`, { defaultValue: key });
      return (
        <TableTonedStatusPill icon={cfg.icon} className={cfg.className}>
          {label}
        </TableTonedStatusPill>
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
        schema={AffiliateWithdrawSchema}
        row={row}
        viewDetails={`/affiliate-withdraw-requests/${row.original.id}`}
        permissions={{ update: false, delete: false }}
      />
    ),
  },
];
