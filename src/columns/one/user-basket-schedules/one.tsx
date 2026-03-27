import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

export interface UserBasketScheduleTableItem {
  id: number;
  user: { id: number; name: string; email?: string };
  basket: { id: number; name: any };
  schedule: { id: number; name: any };
  is_active: number;
}

export const userBasketScheduleColumns = (
  t: TFunction<'table'>
): ColumnDef<UserBasketScheduleTableItem>[] => [
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
        {row.original.user?.email && (
          <>
            <br />
            <span className="text-xs text-muted-foreground">{row.original.user.email}</span>
          </>
        )}
      </div>
    ),
  },
  {
    id: 'basket',
    accessorKey: 'basket',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('form.basketLabel')} />,
    cell: ({ row }) => {
      const name = row.original.basket?.name;
      const display = typeof name === 'string' ? name : name?.en || name?.ar || '—';
      return <span className="text-sm">{display}</span>;
    },
  },
  {
    id: 'schedule',
    accessorKey: 'schedule',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('form.scheduleLabel')} />,
    cell: ({ row }) => {
      const name = row.original.schedule?.name;
      const display = typeof name === 'string' ? name : name?.en || name?.ar || '—';
      return <span className="text-sm">{display}</span>;
    },
  },
  {
    id: 'status',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
      >
        {row.original.is_active ? t('active') : t('inactive')}
      </span>
    ),
  },
];
