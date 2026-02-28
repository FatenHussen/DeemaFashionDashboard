import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { BasketData } from '@/pages/dashboard/baskets/types/basket.types';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const BasketSchema = z.object({
  id: z.number(),
  name: z.any(),
  discount: z.number(),
  discount_type: z.string(),
  created_at: z.string(),
});

export interface BasketFormValues extends BasketData {
  [key: string]: any;
}

export const basketColumns = (
  permissions: { update: boolean; delete: boolean },
  _t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void
): ColumnDef<BasketFormValues>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="text-xs font-semibold text-primary">{row.original.id}</span>
        </div>
      </div>
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const name = row.original.name;
      const display = typeof name === 'object' ? (name as any)?.en || (name as any)?.ar : name;
      return <div className="font-semibold text-foreground truncate">{display || '-'}</div>;
    },
  },
  {
    id: 'discount',
    accessorKey: 'discount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Discount" />,
    cell: ({ row }) => {
      const d = row.original;
      const text = d.discount_type === 'percentage' ? `${d.discount}%` : `Fixed: ${d.discount}`;
      return <span className="text-sm">{text}</span>;
    },
  },
  {
    id: 'items_count',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Items" />,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.items?.length || 0}</span>
    ),
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.created_at).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={BasketSchema}
        row={row}
        editItem={onEdit ? undefined : `/baskets/update/${row.original.id}`}
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
