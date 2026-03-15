import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { formatTranslated } from '@/utils/format-translated';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

// ----------------------------------------------------------------------

const VendorUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  is_active: z.boolean(),
  vendor_id: z.number(),
  shops_count: z.number().optional(),
  created_at: z.string(),
});

export interface VendorUserFormValues {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  vendor_id: number;
  vendor_name?: { ar: string; en: string };
  shops_count?: number;
  created_at: string;
  [key: string]: any;
}

export const vendorUserColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onUpdatePassword?: (row: { original: VendorUserFormValues }) => void
): ColumnDef<VendorUserFormValues>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.id')} />,
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
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => (
      <div className="font-semibold text-foreground">{row.original.name}</div>
    ),
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.email')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    id: 'vendor_name',
    accessorKey: 'vendor_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.vendor')} />,
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.vendor_name ? formatTranslated(row.original.vendor_name) : '-'}
      </span>
    ),
  },
  {
    id: 'shops_count',
    accessorKey: 'shops_count',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.shops')} />,
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
        {row.original.shops_count ?? 0}
      </span>
    ),
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            isActive
              ? 'bg-green-500/20 text-green-700 dark:text-green-400'
              : 'bg-red-500/20 text-red-700 dark:text-red-400'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      );
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.created')} />,
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
        schema={VendorUserSchema}
        row={row}
        viewDetails={`/vendor-users/details/${row.original.id}`}
        editItem={`/vendor-users/update/${row.original.id}`}
        onDelete={onDelete}
        onUpdatePassword={onUpdatePassword}
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
