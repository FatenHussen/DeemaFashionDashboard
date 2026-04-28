import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { TableTonedStatusPill } from '@/shared/components/table-status-badges';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const PromotionRequestSchema = z.object({
  id: z.number(),
  user: z.any(),
  promotion: z.any(),
  status: z.string(),
  created_at: z.string(),
});

export interface PromotionRequestTableItem {
  id: number;
  user: { id: number; name: string; email: string };
  promotion: { id: number; name: any };
  status: string;
  created_at: string;
}

const statusPill: Record<string, { icon: string; className: string }> = {
  pending: { icon: 'solar:clock-circle-bold', className: 'border-amber-700 bg-amber-500' },
  approved: { icon: 'solar:check-circle-bold', className: 'border-emerald-800 bg-emerald-600' },
  rejected: { icon: 'solar:close-circle-bold', className: 'border-red-800 bg-red-600' },
};

export const promotionRequestColumns = (
  t: TFunction<'table'>
): ColumnDef<PromotionRequestTableItem>[] => [
  {
    id: 'user',
    accessorKey: 'user',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.user')} />,
    cell: ({ row }) => (
      <div>
        <span className="font-semibold text-foreground">{row.original.user?.name || '—'}</span>
        <br />
        <span className="text-xs text-muted-foreground">{row.original.user?.email}</span>
      </div>
    ),
  },
  {
    id: 'promotion',
    accessorKey: 'promotion',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => {
      const name = row.original.promotion?.name;
      const display = typeof name === 'string' ? name : name?.en || name?.ar || '—';
      return <span className="text-sm">{display}</span>;
    },
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
      return (
        <TableTonedStatusPill icon={cfg.icon} className={cfg.className}>
          {row.original.status}
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
        schema={PromotionRequestSchema}
        row={row}
        viewDetails={`/promotion-requests/${row.original.id}`}
        permissions={{ update: false, delete: false }}
      />
    ),
  },
];
