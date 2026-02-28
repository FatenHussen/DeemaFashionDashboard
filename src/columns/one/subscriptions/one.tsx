import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { SubscriptionData } from '@/pages/dashboard/subscriptions/types/subscription.types';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const SubscriptionSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  package_id: z.number(),
  start_date: z.string(),
  end_date: z.string(),
  status: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
});

export interface SubscriptionFormValues extends SubscriptionData {
  [key: string]: any;
}

export const subscriptionColumns = (
  permissions: { update: boolean; delete: boolean },
  _t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void
): ColumnDef<SubscriptionFormValues>[] => [
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
    id: 'user',
    header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
    cell: ({ row }) => (
      <div className="font-semibold text-foreground truncate">
        {row.original.user?.name || `User #${row.original.user_id}`}
      </div>
    ),
  },
  {
    id: 'package',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Package" />,
    cell: ({ row }) => {
      const pkgName = row.original.package?.name;
      const display = typeof pkgName === 'object' ? (pkgName as any)?.en || (pkgName as any)?.ar : pkgName;
      return <div className="text-sm">{display || `Package #${row.original.package_id}`}</div>;
    },
  },
  {
    id: 'start_date',
    accessorKey: 'start_date',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Start Date" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.start_date ? new Date(row.original.start_date).toLocaleDateString() : '-'}
      </span>
    ),
  },
  {
    id: 'end_date',
    accessorKey: 'end_date',
    header: ({ column }) => <DataTableColumnHeader column={column} title="End Date" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.end_date ? new Date(row.original.end_date).toLocaleDateString() : '-'}
      </span>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      const colorClass =
        status === 'active'
          ? 'bg-green-500/20 text-green-600'
          : status === 'expired'
            ? 'bg-muted text-muted-foreground'
            : status === 'cancelled'
              ? 'bg-red-500/20 text-red-600'
              : 'bg-yellow-500/20 text-yellow-600';
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colorClass}`}>
          {status}
        </span>
      );
    },
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Active" />,
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            isActive
              ? 'bg-green-500/20 text-green-600'
              : 'bg-red-500/20 text-red-600'
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
        schema={SubscriptionSchema}
        row={row}
        editItem={onEdit ? undefined : `/subscriptions/update/${row.original.id}`}
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
