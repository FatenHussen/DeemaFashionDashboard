import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { TableActiveBadge } from '@/shared/components/table-status-badges';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const PointRuleSchema = z.object({
  id: z.number(),
  code: z.string(),
  title: z.string(),
  type: z.string(),
  value: z.number(),
  min_order_amount: z.number().nullable(),
  expires_after_days: z.number(),
  is_active: z.boolean(),
});

export interface PointRuleTableItem {
  id: number;
  code: string;
  title: string;
  type: string;
  value: number;
  min_order_amount: number | null;
  expires_after_days: number;
  is_active: boolean;
}

export const pointRuleColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void
): ColumnDef<PointRuleTableItem>[] => [
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.title')} />,
    cell: ({ row }) => {
      const title = row.original.title;
      const display = typeof title === 'string' ? title : (title as any)?.en || (title as any)?.ar || '—';
      return <span className="font-semibold text-foreground">{display}</span>;
    },
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.code')} />,
    cell: ({ row }) => (
      <span className="px-2 py-1 rounded-md bg-muted text-sm font-mono">{row.original.code}</span>
    ),
  },
  {
    id: 'value',
    accessorKey: 'value',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.points')} />,
    cell: ({ row }) => (
      <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-sm font-semibold">
        {row.original.value}
      </span>
    ),
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.type')} />,
    cell: ({ row }) => (
      <span className="px-2 py-1 rounded-md bg-muted text-sm capitalize">{row.original.type}</span>
    ),
  },
  {
    id: 'expires',
    accessorKey: 'expires_after_days',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.expires')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.expires_after_days} days</span>
    ),
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
  ...(permissions.update
    ? [createToggleColumn<PointRuleTableItem>({ entityType: 'point_rule' })]
    : []),
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={PointRuleSchema}
        row={row}
        viewDetails={`/point-rules/details/${row.original.id}`}
        editItem={onEdit ? undefined : `/point-rules/update/${row.original.id}`}
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
