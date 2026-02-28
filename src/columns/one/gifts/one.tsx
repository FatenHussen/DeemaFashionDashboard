import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { GiftData } from '@/pages/dashboard/gifts/types/gift.types';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const GiftSchema = z.object({
  id: z.number(),
  name: z.string(),
  points_required: z.number(),
  stock_quantity: z.number(),
  is_active: z.boolean(),
  created_at: z.string(),
});

export interface GiftFormValues extends GiftData {
  [key: string]: any;
}

export const giftColumns = (
  permissions: { update: boolean; delete: boolean },
  _t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void
): ColumnDef<GiftFormValues>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => (
      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
        <span className="text-xs font-semibold text-primary">{row.original.id}</span>
      </div>
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const name = row.original.name;
      const display = typeof name === 'object' ? (name as any)?.en || (name as any)?.ar || '-' : String(name || '-');
      return <div className="font-semibold text-foreground truncate">{display}</div>;
    },
  },
  {
    id: 'points_required',
    accessorKey: 'points_required',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Points Required" />,
    cell: ({ row }) => <span className="font-medium text-sm">{row.original.points_required}</span>,
  },
  {
    id: 'stock_quantity',
    accessorKey: 'stock_quantity',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
    cell: ({ row }) => <span className="text-sm">{row.original.stock_quantity}</span>,
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${row.original.is_active ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
        {row.original.is_active ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{new Date(row.original.created_at).toLocaleDateString()}</span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={GiftSchema}
        row={row}
        editItem={onEdit ? undefined : `/gifts/update/${row.original.id}`}
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
