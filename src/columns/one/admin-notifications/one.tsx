import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { NotificationItem } from '@/pages/dashboard/admin-notifications/types/notification.types';

import { z } from 'zod';
import { formatTranslated } from '@/utils/format-translated';
import { TableTonedStatusPill } from '@/shared/components/table-status-badges';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';
import { notificationTypeLabel } from '@/pages/dashboard/admin-notifications/utils/type-labels';

const NotificationRowSchema = z.object({
  id: z.number(),
});

const TYPE_PILL: Record<string, { icon: string; className: string }> = {
  all: { icon: 'solar:users-group-rounded-bold', className: 'border-blue-800 bg-blue-600' },
  user: { icon: 'solar:user-bold', className: 'border-emerald-800 bg-emerald-600' },
  driver: { icon: 'solar:delivery-bold', className: 'border-orange-800 bg-orange-600' },
  vendor: { icon: 'solar:shop-bold', className: 'border-violet-800 bg-violet-600' },
};

const CHANNEL_PILL: Record<string, { icon: string; className: string }> = {
  fcm: { icon: 'solar:bell-bold', className: 'border-orange-800 bg-orange-600' },
  sms: { icon: 'solar:chat-round-bold', className: 'border-blue-800 bg-blue-600' },
  email: { icon: 'solar:letter-bold', className: 'border-violet-800 bg-violet-600' },
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
      const raw = String(row.getValue(columnId) ?? '');
      const parts = raw.split(',').map((p) => p.trim());
      return parts.includes(String(filterValue));
    },
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.type')} />,
    cell: ({ row }) => {
      const type = String(row.original.type ?? '');
      const parts = type
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length === 0) return <span className="text-muted-foreground">—</span>;
      if (parts.length === 1) {
        const key = parts[0]!;
        const cfg = TYPE_PILL[key] ?? {
          icon: 'solar:tag-bold',
          className: 'border-slate-600 bg-slate-500',
        };
        return (
          <TableTonedStatusPill icon={cfg.icon} className={cfg.className}>
            {notificationTypeLabel(key, t)}
          </TableTonedStatusPill>
        );
      }
      return (
        <div className="flex flex-wrap gap-1 max-w-md">
          {parts.map((key) => {
            const cfg = TYPE_PILL[key] ?? {
              icon: 'solar:tag-bold',
              className: 'border-slate-600 bg-slate-500',
            };
            return (
              <TableTonedStatusPill key={key} icon={cfg.icon} className={cfg.className}>
                {notificationTypeLabel(key, t)}
              </TableTonedStatusPill>
            );
          })}
        </div>
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
          {channels.map((ch) => {
            const cfg = CHANNEL_PILL[ch] ?? {
              icon: 'solar:tag-bold',
              className: 'border-slate-600 bg-slate-500',
            };
            return (
              <TableTonedStatusPill key={ch} icon={cfg.icon} className={cfg.className}>
                {ch.toUpperCase()}
              </TableTonedStatusPill>
            );
          })}
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
