import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { NotificationItem } from '@/pages/dashboard/admin-notifications/types/notification.types';

import { formatTranslated } from '@/utils/format-translated';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const TYPE_COLORS: Record<string, string> = {
  all: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  user: 'bg-green-500/10 text-green-600 border-green-500/20',
  driver: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  vendor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

export interface NotificationFormValues extends NotificationItem {
  [key: string]: any;
}

export const adminNotificationColumns = (
  _t: TFunction<'table'>
): ColumnDef<NotificationFormValues>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => (
      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
        <span className="text-xs font-semibold text-primary">{row.original.id}</span>
      </div>
    ),
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => (
      <p className="max-w-sm text-sm font-medium text-foreground truncate">{formatTranslated(row.original.title)}</p>
    ),
  },
  {
    id: 'body',
    accessorKey: 'body',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Body" />,
    cell: ({ row }) => (
      <p className="max-w-md text-sm text-muted-foreground line-clamp-2">{formatTranslated(row.original.body)}</p>
    ),
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[type] ?? 'bg-muted text-muted-foreground border-border'}`}
        >
          {type}
        </span>
      );
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.created_at}</span>
    ),
  },
];
