import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { UserPointsItem } from '@/pages/dashboard/user-points/types/user-points.types';

import { formatTranslated } from '@/utils/format-translated';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

export interface UserPointsFormValues extends UserPointsItem {
  [key: string]: any;
}

export const userPointsColumns = (
  t: TFunction<'table'>
): ColumnDef<UserPointsFormValues>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.id')} />,
    cell: ({ row }) => (
      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
        <span className="text-xs font-semibold text-primary">{row.original.id}</span>
      </div>
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.user')} />,
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-foreground truncate">{formatTranslated(row.original.name)}</div>
        <div className="text-xs text-muted-foreground">{row.original.email}</div>
        {row.original.phone && (
          <div className="text-xs text-muted-foreground">{row.original.phone}</div>
        )}
      </div>
    ),
  },
  {
    id: 'balance',
    accessorKey: 'wallet',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.balance')} />,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
        {row.original.wallet?.balance ?? 0} pts
      </span>
    ),
  },
  {
    id: 'total_earned',
    accessorKey: 'total_earned',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.earned')} />,
    cell: ({ row }) => (
      <span className="text-sm font-medium text-green-600">+{row.original.total_earned}</span>
    ),
  },
  {
    id: 'total_redeemed',
    accessorKey: 'total_redeemed',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.redeemed')} />,
    cell: ({ row }) => (
      <span className="text-sm font-medium text-orange-600">-{row.original.total_redeemed}</span>
    ),
  },
  {
    id: 'total_transactions',
    accessorKey: 'total_transactions',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.transactions')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.total_transactions}</span>
    ),
  },
  {
    id: 'expire_at',
    accessorKey: 'wallet',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.expires')} />,
    cell: ({ row }) => {
      const expire = row.original.wallet?.expire_at;
      if (!expire) return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <span className="text-xs text-muted-foreground">
          {new Date(expire).toLocaleDateString()}
        </span>
      );
    },
  },
];
