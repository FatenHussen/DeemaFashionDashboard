import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const ScheduleSchema = z.object({
  id: z.number(),
  name: z.any(),
  interval_days: z.number(),
  is_active: z.any(),
  discount_type: z.any(),
  discount_value: z.any(),
});

export interface ScheduleTableItem {
  id: number;
  name: any;
  interval_days: number;
  is_active: boolean;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number | null;
  created_at?: string;
}

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
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => {
      const name = row.original.name;
      const display = typeof name === 'string' ? name : name?.en || name?.ar || '—';
      return <span className="font-semibold text-foreground">{display}</span>;
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.is_active ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'}`}>
        {row.original.is_active ? t('active') : t('inactive')}
      </span>
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
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={ScheduleSchema}
        row={row}
        editItem={onEdit ? undefined : `/schedules/update/${row.original.id}`}
        onEdit={onEdit}
        onDelete={onDelete}
        isDeleting={isDeleting}
        isDeleteDialogOpen={isDeleteDialogOpen}
        onDeleteConfirm={onDeleteConfirm}
        onDeleteCancel={onDeleteCancel}
        deletingId={deletingId}
        adminToggleEntityType="schedule"
        permissions={permissions}
      />
    ),
  },
];
