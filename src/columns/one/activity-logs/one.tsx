import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { ActivityLogItem } from '@/pages/dashboard/activity-logs/types/activity-log.types';

import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const actionColors: Record<string, string> = {
  created: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Created: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  updated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Updated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  deleted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Deleted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const activityLogColumns = (
  t: TFunction<'table'>
): ColumnDef<ActivityLogItem>[] => [
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
        <span className="font-semibold text-foreground text-sm">{row.original.user}</span>
        <span className="text-xs text-muted-foreground ml-1">({row.original.user_type})</span>
      </div>
    ),
  },
  {
    id: 'action',
    accessorKey: 'action',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.action')} />,
    cell: ({ row }) => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${actionColors[row.original.action] ?? 'bg-muted text-muted-foreground'}`}>
        {row.original.action}
      </span>
    ),
  },
  {
    id: 'model',
    accessorKey: 'model',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.model')} />,
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {row.original.model} <span className="text-muted-foreground">#{row.original.model_id}</span>
      </span>
    ),
  },
  {
    id: 'message',
    accessorKey: 'message',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.message')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.message}</span>
    ),
  },
  {
    id: 'date',
    accessorKey: 'date',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.date')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.date}</span>
    ),
  },
];
