import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { PointExchangeItem } from '@/pages/dashboard/point-exchanges/types/point-exchange.types';

import { z } from 'zod';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const PointExchangeSchema = z.object({
  id: z.number(),
  user: z.object({ id: z.number(), name: z.string(), email: z.string() }),
  points: z.number(),
  status: z.string(),
  created_at: z.string(),
});

export interface PointExchangeFormValues extends PointExchangeItem {
  [key: string]: any;
}

export const pointExchangeColumns = (
  t: TFunction<'table'>
): ColumnDef<PointExchangeFormValues>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="text-xs font-semibold text-primary">{row.original.id}</span>
        </div>
      </div>
    ),
  },
  {
    id: 'user_name',
    accessorKey: 'user.name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-foreground truncate">{row.original.user?.name ?? '-'}</div>
        <div className="text-xs text-muted-foreground">{row.original.user?.email ?? '-'}</div>
      </div>
    ),
  },
  {
    id: 'points',
    accessorKey: 'points',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Points" />,
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.points}</span>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      const label = status.charAt(0).toUpperCase() + status.slice(1);
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            status === 'approved'
              ? 'bg-green-500/20 text-green-600'
              : status === 'rejected'
                ? 'bg-red-500/20 text-red-600'
                : 'bg-yellow-500/20 text-yellow-600'
          }`}
        >
          {label}
        </span>
      );
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.created_at).toLocaleDateString()}
      </span>
    ),
  },
];
