import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
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

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export const promotionRequestColumns = (
  t: TFunction<'table'>,
  onViewDetails?: (id: number) => void
): ColumnDef<PromotionRequestTableItem>[] => [
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
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[row.original.status] ?? 'bg-muted text-muted-foreground'}`}>
        {row.original.status}
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
    cell: ({ row }) => (
      <button
        onClick={() => onViewDetails?.(row.original.id)}
        className="text-primary hover:text-primary/80 text-sm font-medium"
      >
        {t('viewDetails')}
      </button>
    ),
  },
];
