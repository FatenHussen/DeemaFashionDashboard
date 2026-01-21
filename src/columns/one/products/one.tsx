import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { Iconify } from '@/shared/components/iconify';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

import { CONFIG } from 'src/global-config';

// Schema for brand validation
const BrandSchema = z.object({
  id: z.number(),
  name: z.string(),
  image: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Type for brand data
export interface BrandFormValues {
  id: number;
  name: string;
  image: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export const brandColumns = (
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
): ColumnDef<BrandFormValues>[] => [
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
    id: 'image',
    accessorKey: 'image',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Image" />,
    cell: ({ row }) => {
      const imageUrl = row.original.image ? `${CONFIG.serverUrl}/${row.original.image}` : null;
      return (
        <div className="flex items-center gap-2">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={row.original.name}
              className="w-12 h-12 rounded-lg object-cover border border-border/60"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Iconify
                icon="solar:gallery-add-bold"
                className="text-primary"
                width={20}
                height={20}
              />
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="min-w-0">
          <div className="font-semibold text-foreground truncate">{row.original.name}</div>
        </div>
      </div>
    ),
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Iconify
          icon="solar:calendar-date-bold"
          className="text-muted-foreground flex-shrink-0"
          width={16}
          height={16}
        />
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.created_at).toLocaleDateString()}
        </span>
      </div>
    ),
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Iconify
          icon="solar:calendar-date-bold"
          className="text-muted-foreground flex-shrink-0"
          width={16}
          height={16}
        />
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.updated_at).toLocaleDateString()}
        </span>
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={BrandSchema}
        row={row}
        viewDetails={`/products/details/${row.original.id}`}
        editItem={`/products/update/${row.original.id}`}
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
