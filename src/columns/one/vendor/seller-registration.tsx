import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { SellerRegistrationItem } from '@/pages/dashboard/vendor/types/seller-registration.types';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

// ----------------------------------------------------------------------

const SellerRegistrationSchema = z.object({ id: z.number() });

export interface SellerRegistrationFormValues extends SellerRegistrationItem {
  [key: string]: any;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30',
  approved: 'bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30',
  rejected: 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30',
};

export const sellerRegistrationColumns = (
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onApprove?: (id: number) => void,
  onReject?: (id: number) => void
): ColumnDef<SellerRegistrationFormValues>[] => [
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
    id: 'seller_name',
    accessorKey: 'seller_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Seller" />,
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-foreground">{row.original.seller_name}</div>
        <div className="text-xs text-muted-foreground">{row.original.email}</div>
      </div>
    ),
  },
  {
    id: 'store_name',
    accessorKey: 'store_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Store" />,
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.store_name}</span>
    ),
  },
  {
    id: 'country',
    accessorKey: 'country',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Location" />,
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        <div>{row.original.country}</div>
        {row.original.governorate && (
          <div className="text-xs">{row.original.governorate.name}</div>
        )}
      </div>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            STATUS_COLORS[status] ?? STATUS_COLORS.pending
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    id: 'registered_at',
    accessorKey: 'registered_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Registered" />,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {new Date(row.original.registered_at).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => {
      const isPending = row.original.status === 'pending';
      return (
        <div className="flex items-center gap-1">
          {isPending && onApprove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApprove(row.original.id);
              }}
              className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25 transition-colors"
              title="Approve"
            >
              ✓ Approve
            </button>
          )}
          {isPending && onReject && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReject(row.original.id);
              }}
              className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-red-500/15 text-red-700 dark:text-red-400 hover:bg-red-500/25 transition-colors"
              title="Reject"
            >
              ✗ Reject
            </button>
          )}
          <DataTableRowActions
            schema={SellerRegistrationSchema}
            row={row}
            viewDetails={`/seller-registrations/${row.original.id}`}
            onDelete={onDelete}
            isDeleting={isDeleting}
            isDeleteDialogOpen={isDeleteDialogOpen}
            onDeleteConfirm={onDeleteConfirm}
            onDeleteCancel={onDeleteCancel}
            deletingId={deletingId}
            permissions={{ update: false, delete: true }}
          />
        </div>
      );
    },
  },
];
