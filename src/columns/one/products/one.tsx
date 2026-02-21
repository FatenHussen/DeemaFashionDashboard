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

// Schema for product validation
const ProductSchema = z.object({
  id: z.number(),
  category_id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  quantity: z.number().nullable(),
  image: z.string().nullable(),
  sku: z.string().nullable(),
  barcode: z.string().nullable(),
  created_at: z.string(),
});

// Type for product data
export interface ProductFormValues {
  id: number;
  category_id: string;
  name: string;
  description: string;
  price: number;
  quantity: number | null;
  image: string | null;
  sku: string | null;
  barcode: string | null;
  created_at: string;
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
        viewDetails={`/products/brands/details/${row.original.id}`}
        editItem={`/products/brands/update/${row.original.id}`}
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

export const productColumns = (
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
): ColumnDef<ProductFormValues>[] => [
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
              <Iconify icon="solar:box-bold" className="text-primary" width={20} height={20} />
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
          <div className="text-xs text-muted-foreground truncate">
            {row.original.description}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'category_id',
    accessorKey: 'category_id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Iconify
          icon="solar:folder-bold"
          className="text-muted-foreground flex-shrink-0"
          width={16}
          height={16}
        />
        <span className="text-sm text-foreground">{row.original.category_id}</span>
      </div>
    ),
  },
  {
    id: 'price',
    accessorKey: 'price',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Iconify
          icon="solar:dollar-bold"
          className="text-green-500 flex-shrink-0"
          width={16}
          height={16}
        />
        <span className="text-sm font-semibold text-foreground">${row.original.price}</span>
      </div>
    ),
  },
  {
    id: 'quantity',
    accessorKey: 'quantity',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
    cell: ({ row }) => {
      const quantity = row.original.quantity ?? 0;
      const isLowStock = quantity < 10 && quantity > 0;
      const isOutOfStock = quantity === 0;

      return (
        <div className="flex items-center gap-2">
          <Iconify
            icon="solar:box-bold"
            className={`flex-shrink-0 ${
              isOutOfStock
                ? 'text-destructive'
                : isLowStock
                  ? 'text-yellow-500'
                  : 'text-green-500'
            }`}
            width={16}
            height={16}
          />
          <span
            className={`text-sm font-medium ${
              isOutOfStock
                ? 'text-destructive'
                : isLowStock
                  ? 'text-yellow-600'
                  : 'text-foreground'
            }`}
          >
            {quantity}
          </span>
        </div>
      );
    },
  },
  {
    id: 'sku',
    accessorKey: 'sku',
    header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground font-mono">
        {row.original.sku || 'N/A'}
      </span>
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
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={ProductSchema}
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
