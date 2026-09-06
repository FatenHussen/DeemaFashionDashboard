import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { ScheduleItem } from '@/pages/dashboard/schedules/types/schedule.types';

import { z } from 'zod';
import { formatTranslated } from '@/utils/format-translated';
import { TableActiveBadge } from '@/shared/components/table-status-badges';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';
import { schedulePrimaryImageUrl } from '@/pages/dashboard/schedules/utils/schedule-media';

const ScheduleSchema = z.object({
  id: z.number(),
  name: z.any(),
  interval_days: z.number(),
  is_active: z.any(),
  discount_type: z.any(),
  discount_value: z.any(),
});

export type ScheduleTableItem = ScheduleItem;

export const scheduleColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void
): ColumnDef<ScheduleTableItem>[] => [
  {
    id: 'image',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.image')} />,
    cell: ({ row }) => {
      const img = schedulePrimaryImageUrl(row.original);
      return img ? (
        <img src={img} alt="" className="h-10 w-10 rounded-full object-cover border border-border/50" />
      ) : (
        <div className="h-10 w-10 rounded-full bg-muted border border-border/50" />
      );
    },
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => (
      <span className="font-semibold text-foreground">
        {formatTranslated(row.original.name as Parameters<typeof formatTranslated>[0])}
      </span>
    ),
  },
  {
    id: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.description')} />,
    cell: ({ row }) => {
      const text = formatTranslated(row.original.description as Parameters<typeof formatTranslated>[0], '');
      return (
        <span className="text-sm text-muted-foreground line-clamp-2 max-w-[220px]">
          {text || '—'}
        </span>
      );
    },
  },
  {
    id: 'badges',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('form.badgesLabel')} />,
    cell: ({ row }) => {
      const top = row.original.top_badges?.length ?? 0;
      const bottom = row.original.bottom_badges?.length ?? 0;
      const fallback = row.original.badges?.length ?? 0;
      const count = top + bottom || fallback;
      if (!count) return <span className="text-muted-foreground">—</span>;
      return (
        <span className="text-xs text-muted-foreground">
          {count}
          {top || bottom ? ` · ${t('form.badgePositionTop')} ${top} / ${t('form.badgePositionBottom')} ${bottom}` : ''}
        </span>
      );
    },
  },
  {
    id: 'interval_days',
    accessorKey: 'interval_days',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('form.intervalDays')} />,
    cell: ({ row }) => (
      <span className="px-2 py-1 rounded-md bg-muted text-sm">
        {row.original.interval_days} {t('days')}
      </span>
    ),
  },
  {
    id: 'discount',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.discount')} />,
    cell: ({ row }) => {
      const { discount_type, discount_value } = row.original;
      if (!discount_type || discount_value == null) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-medium dark:bg-blue-950 dark:text-blue-300">
          {discount_type === 'percentage' ? `${discount_value}%` : `${discount_value}`}
        </span>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => (
      <TableActiveBadge
        isActive={row.original.is_active}
        activeLabel={t('active')}
        inactiveLabel={t('inactive')}
      />
    ),
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.created')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.created_at ? new Date(row.original.created_at).toLocaleString() : '—'}
      </span>
    ),
  },
  ...(permissions.update
    ? [createToggleColumn<ScheduleTableItem>({ entityType: 'schedule' })]
    : []),
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={ScheduleSchema}
        row={row}
        viewDetails={`/schedules/update/${row.original.id}`}
        editItem={onEdit ? undefined : `/schedules/update/${row.original.id}`}
        onEdit={onEdit}
        onDelete={onDelete}
        isDeleting={isDeleting}
        isDeleteDialogOpen={isDeleteDialogOpen}
        onDeleteConfirm={onDeleteConfirm}
        onDeleteCancel={onDeleteCancel}
        deletingId={deletingId}
        permissions={permissions}
      />
    ),
  },
];
