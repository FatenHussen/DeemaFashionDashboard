import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const BadgeSchema = z.object({
  id: z.number(),
  name: z.any().nullable(),
  color: z.string().nullable(),
  position: z.enum(['top', 'bottom']),
  image: z.string().nullable().optional(),
});

export interface BadgeTableItem {
  id: number;
  name: any;
  color: string | null;
  position: 'top' | 'bottom';
  image?: string | null;
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
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => {
      const { name, image } = row.original;
      const display = typeof name === 'string' ? name : name?.en || name?.ar || '—';
      return (
        <div className="flex items-center gap-2.5">
          {image && (
            <img
              src={image}
              alt=""
              className="w-8 h-8 rounded-md object-cover border border-border/60 shrink-0"
            />
          )}
          <span className="font-semibold text-foreground">{display}</span>
        </div>
      );
    },
  },
  {
    id: 'color',
    accessorKey: 'color',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('form.colorLabel')} />,
    cell: ({ row }) => {
      const color = row.original.color;
      if (!color) return <span className="text-sm text-muted-foreground">—</span>;
      return (
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full border border-border/60"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-mono text-muted-foreground">{color}</span>
        </div>
      );
    },
  },
  {
    id: 'position',
    accessorKey: 'position',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('form.badgePositionLabel')} />,
    cell: ({ row }) => {
      const pos = row.original.position;
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
          pos === 'top'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        }`}>
          {pos === 'top' ? t('form.badgePositionTop') : t('form.badgePositionBottom')}
        </span>
      );
    },
  },
  ...(permissions.update
    ? [createToggleColumn<BadgeTableItem>({ entityType: 'badge' })]
    : []),
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={BadgeSchema}
        row={row}
        viewDetails={`/badges/update/${row.original.id}`}
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
