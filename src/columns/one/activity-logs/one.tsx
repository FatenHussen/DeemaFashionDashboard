import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { ActivityLogItem } from '@/pages/dashboard/activity-logs/types/activity-log.types';

import { Button } from '@/shared/ui/button';
import { Iconify } from '@/shared/components/iconify';
import { TableTonedStatusPill } from '@/shared/components/table-status-badges';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const actionPill: Record<string, { icon: string; className: string }> = {
  created: { icon: 'solar:add-circle-bold', className: 'border-emerald-800 bg-emerald-600' },
  Created: { icon: 'solar:add-circle-bold', className: 'border-emerald-800 bg-emerald-600' },
  updated: { icon: 'solar:pen-bold', className: 'border-sky-800 bg-sky-600' },
  Updated: { icon: 'solar:pen-bold', className: 'border-sky-800 bg-sky-600' },
  deleted: { icon: 'solar:trash-bin-trash-bold', className: 'border-red-800 bg-red-600' },
  Deleted: { icon: 'solar:trash-bin-trash-bold', className: 'border-red-800 bg-red-600' },
};

export type ActivityLogColumnsOptions = {
  onViewChanges: (item: ActivityLogItem) => void;
};

function hasActivityChanges(changes: ActivityLogItem['changes']): boolean {
  return Boolean(changes && typeof changes === 'object' && Object.keys(changes).length > 0);
}

export const activityLogColumns = (
  t: TFunction<'table'>,
  options: ActivityLogColumnsOptions
): ColumnDef<ActivityLogItem>[] => [
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
    cell: ({ row }) => {
      const a = row.original.action;
      const cfg = actionPill[a] ?? {
        icon: 'solar:bolt-bold',
        className: 'border-slate-600 bg-slate-500',
      };
      return (
        <TableTonedStatusPill icon={cfg.icon} className={cfg.className}>
          {a}
        </TableTonedStatusPill>
      );
    },
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
    id: 'changes_detail',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('form.activityLogChangesColumn')} />
    ),
    cell: ({ row }) => {
      const item = row.original;
      const hasChanges = hasActivityChanges(item.changes);
      return (
        <Button
          type="button"
          variant="outlined"
          size="small"
          className="h-8 gap-1.5 border-primary/30 text-primary hover:bg-primary/5 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            options.onViewChanges(item);
          }}
        >
          <Iconify icon={hasChanges ? 'solar:documents-bold' : 'solar:eye-bold'} width={16} />
          <span className="hidden sm:inline">
            {hasChanges ? t('form.activityLogViewChanges') : t('form.activityLogViewDetails')}
          </span>
        </Button>
      );
    },
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
