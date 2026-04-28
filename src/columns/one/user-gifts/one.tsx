import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { UserGiftData } from '@/pages/dashboard/user-gifts/types/user-gift.types';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

export interface UserGiftFormValues extends UserGiftData {
  [key: string]: any;
}

const toStr = (val: string | { ar?: string; en?: string } | undefined): string => {
  if (!val) return '-';
  if (typeof val === 'string') return val;
  return val.en || val.ar || '-';
};

export const userGiftColumns = (t: TFunction<'table'>): ColumnDef<UserGiftFormValues>[] => [
  {
    id: 'gift_name',
    accessorKey: 'gift.name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.gift')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.gift?.image && (
          <img
            src={row.original.gift.image}
            alt=""
            className="w-8 h-8 rounded object-cover border border-border"
          />
        )}
        <span className="font-medium truncate">{toStr(row.original.gift?.name)}</span>
      </div>
    ),
  },
  {
    id: 'user_name',
    accessorKey: 'user.name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.user')} />,
    cell: ({ row }) => (
      <div>
        <div className="font-medium truncate">{row.original.user?.name ?? '-'}</div>
        {row.original.user?.phone && (
          <div className="text-xs text-muted-foreground">{row.original.user.phone}</div>
        )}
      </div>
    ),
  },
  {
    id: 'address',
    accessorKey: 'address',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.address')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground truncate max-w-[160px] block">
        {row.original.address?.full_address ?? '-'}
      </span>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const status = row.original.status;
      const label = status
        ? t(`form.userGiftStatus_${status}` as const, { defaultValue: status })
        : '-';
      const statusClass =
        status === 'delivered'
          ? 'bg-green-500/20 text-green-600'
          : status === 'cancelled'
            ? 'bg-red-500/20 text-red-600'
            : status === 'shipped'
              ? 'bg-blue-500/20 text-blue-600'
              : status === 'processing'
                ? 'bg-amber-500/20 text-amber-600'
                : 'bg-yellow-500/20 text-yellow-600';
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
          {label}
        </span>
      );
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.created')} />,
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
        schema={z.object({ id: z.number() })}
        row={row}
        viewDetails={`/user-gifts/details/${row.original.id}`}
        permissions={{ update: false, delete: false }}
      />
    ),
  },
];
