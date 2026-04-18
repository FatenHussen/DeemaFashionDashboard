import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { NotificationItem } from '@/pages/dashboard/admin-notifications/types/notification.types';

import { z } from 'zod';
import { formatTranslated } from '@/utils/format-translated';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';
import { notificationTypeLabel } from '@/pages/dashboard/admin-notifications/utils/type-labels';

const NotificationRowSchema = z.object({
  id: z.number(),
});

const TYPE_COLORS: Record<string, string> = {
  all: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  user: 'bg-green-500/10 text-green-600 border-green-500/20',
  driver: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  vendor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

const CHANNEL_COLORS: Record<string, string> = {
  fcm: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  sms: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  email: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

export interface NotificationFormValues extends NotificationItem {
  [key: string]: any;
}

export const adminNotificationColumns = (
  permissions: { update: boolean },
  t: TFunction<'table'>,
  updatePathBase: string
): ColumnDef<NotificationFormValues>[] => [
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.title')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 max-w-sm">
        {row.original.emoji ? (
          <span className="text-base shrink-0">{row.original.emoji}</span>
        ) : null}
        <p className="text-sm font-medium text-foreground truncate">
          {formatTranslated(row.original.title)}
        </p>
      </div>
    ),
  },
  {
    id: 'body',
    accessorKey: 'body',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.body')} />,
    cell: ({ row }) => (
      <p className="max-w-md text-sm text-muted-foreground line-clamp-2">
        {formatTranslated(row.original.body)}
      </p>
    ),
  },
  {
    id: 'type',
    accessorKey: 'type',
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (filterValue == null || filterValue === '' || filterValue === 'all') return true;
      return row.getValue(columnId) === filterValue;
    },
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.type')} />,
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            TYPE_COLORS[type] ?? 'bg-muted text-muted-foreground border-border'
          }`}
        >
          {notificationTypeLabel(type, t)}
        </span>
      );
    },
  },
  {
    id: 'channels',
    accessorKey: 'channels',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('form.notificationChannelsLabel')} />
    ),
    cell: ({ row }) => {
      const channels: string[] = row.original.channels ?? [];
      return (
        <div className="flex flex-wrap gap-1">
          {channels.map((ch) => (
            <span
              key={ch}
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                CHANNEL_COLORS[ch] ?? 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {ch.toUpperCase()}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    id: 'media',
    accessorKey: 'media',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('form.notificationMediaLabel')} />
    ),
    cell: ({ row }) => {
      const media = row.original.media;
      if (!media?.url) return <span className="text-sm text-muted-foreground">—</span>;
      return (
        <a href={media.url} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={media.url}
            alt="media"
            className="h-10 w-10 rounded-md border border-border object-cover"
          />
        </a>
      );
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.createdAt')} />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.created_at}</span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={NotificationRowSchema}
        row={row}
        viewDetails={`${updatePathBase}/${row.original.id}`}
        permissions={{
          update: false,
          delete: false,
        }}
      />
    ),
  },
];
