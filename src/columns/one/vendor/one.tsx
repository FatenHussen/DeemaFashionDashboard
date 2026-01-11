import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

// Schema for vendor validation
const VendorSchema = z.object({
  id: z.number(),
  name: z.string(),
  owner_name: z.string(),
  logo_url: z.string().nullable(),
  is_active: z.boolean(),
  average_rating: z.number(),
  ratings_count: z.number(),
  created_at: z.string(),
});

// Type for vendor data
export interface VendorFormValues {
  id: number;
  name: string;
  owner_name: string;
  logo_url: string | null;
  is_active: boolean;
  average_rating: number;
  ratings_count: number;
  created_at: string;
  [key: string]: any;
}

export const vendorColumns = (
  permissions: {
    update: boolean;
    delete: boolean;
  },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null
): ColumnDef<VendorFormValues>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <div className="font-medium">{row.original.id}</div>,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    id: 'owner_name',
    accessorKey: 'owner_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Owner Name" />,
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{row.original.owner_name}</div>
    ),
  },
  {
    id: 'average_rating',
    accessorKey: 'average_rating',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rating" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">{row.original.average_rating.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">
          ({row.original.ratings_count} reviews)
        </span>
      </div>
    ),
  },
  {
    id: 'status',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      return (
        <div
          className={`text-xs px-2 py-1 rounded-full w-fit ${
            isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </div>
      );
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{row.original.created_at}</div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={VendorSchema}
        row={row}
        editItem={`/vendor/update/${row.original.id}`}
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

