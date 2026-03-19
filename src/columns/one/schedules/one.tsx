import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const ScheduleSchema = z.object({
  id: z.number(),
  name: z.any(),
  day: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  is_active: z.number(),
});

export interface ScheduleTableItem {
  id: number;
  name: any;
  day: string;
  start_time: string;
  end_time: string;
  is_active: number;
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
    id: 'day',
    accessorKey: 'day',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('form.dayLabel')} />,
    cell: ({ row }) => (
      <span className="px-2 py-1 rounded-md bg-muted text-sm capitalize">{row.original.day}</span>
    ),
  },
  {
    id: 'time',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('form.timeRange')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.start_time} - {row.original.end_time}
      </span>
    ),
  },
  {
    id: 'status',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {row.original.is_active ? t('active') : t('inactive')}
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
        permissions={permissions}
      />
    ),
  },
];
