import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { PointExchangeItem } from '@/pages/dashboard/point-exchanges/types/point-exchange.types';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const PointExchangeSchema = z.object({
  id: z.number(),
  user: z.object({ id: z.number(), name: z.string(), email: z.string().optional() }),
  exchange_type: z.string().optional(),
  points: z.number().optional(),
  points_used: z.number().optional(),
  status: z.string(),
  delivered_at: z.string().nullable().optional(),
  created_at: z.string(),
});

export interface PointExchangeFormValues extends PointExchangeItem {
  [key: string]: any;
}

export const pointExchangeColumns = (
  t: TFunction<'table'>
): ColumnDef<PointExchangeFormValues>[] => [
  {
    id: 'user_name',
    accessorKey: 'user.name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.user')} />,
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-foreground truncate">{row.original.user?.name ?? '-'}</div>
        {row.original.user?.email && (
          <div className="text-xs text-muted-foreground">{row.original.user.email}</div>
        )}
      </div>
    ),
  },
  {
    id: 'exchange_type',
    accessorKey: 'exchange_type',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.type')} />,
    cell: ({ row }) => (
      <span className="text-sm capitalize">{row.original.exchange_type?.replace(/_/g, ' ') ?? '-'}</span>
    ),
  },
  {
    id: 'points_used',
    accessorKey: 'points_used',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.points')} />,
    cell: ({ row }) => {
      const pts = row.original.points_used ?? row.original.points;
      return <span className="text-sm font-medium">{pts ?? '-'}</span>;
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const status = row.original.status;
      const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : '-';
      const statusClass =
        status === 'completed' || status === 'approved'
          ? 'bg-green-500/20 text-green-600'
          : status === 'rejected'
            ? 'bg-red-500/20 text-red-600'
            : 'bg-yellow-500/20 text-yellow-600';
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
          {label}
        </span>
      );
    },
  },
  {
    id: 'delivered_at',
    accessorKey: 'delivered_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.delivered')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.delivered_at
          ? new Date(row.original.delivered_at).toLocaleDateString()
          : '-'}
      </span>
    ),
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.createdAt')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.created_at).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={PointExchangeSchema}
        row={row}
        viewDetails={`/point-exchanges/details/${row.original.id}`}
        permissions={{ update: false, delete: false }}
      />
    ),
  },
];
