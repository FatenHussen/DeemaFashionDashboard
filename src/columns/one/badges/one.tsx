import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const BadgeSchema = z.object({
  id: z.number(),
  name: z.any(),
  color: z.string(),
  postion: z.any().nullable(),
});

export interface BadgeTableItem {
  id: number;
  name: any;
  color: string;
  postion: number | null;
}

export const badgeColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void
): ColumnDef<BadgeTableItem>[] => [
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
    id: 'color',
    accessorKey: 'color',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('form.colorLabel')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div
          className="w-5 h-5 rounded-full border border-border/60"
          style={{ backgroundColor: row.original.color }}
        />
        <span className="text-sm font-mono text-muted-foreground">{row.original.color}</span>
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={BadgeSchema}
        row={row}
        editItem={onEdit ? undefined : `/badges/update/${row.original.id}`}
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
