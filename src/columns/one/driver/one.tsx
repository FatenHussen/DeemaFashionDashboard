import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { Iconify } from '@/shared/components/iconify';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

// Schema for driver validation
const DriverSchema = z.object({
  id: z.number(),
  phone: z.string(),
  address: z.string(),
  status: z.string(),
  is_active: z.number(),
  rate_per_order: z.string(),
  created_at: z.string(),
});

// Type for driver data
export interface DriverFormValues {
  id: number;
  phone: string;
  address: string;
  status: string;
  is_active: number;
  rate_per_order: string;
  created_at: string;
  [key: string]: any;
}

export const driverColumns = (
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
): ColumnDef<DriverFormValues>[] => [
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
    id: 'phone',
    accessorKey: 'phone',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <Iconify icon="solar:phone-bold" className="text-muted-foreground flex-shrink-0" width={16} height={16} />
        <span className="text-sm text-muted-foreground truncate">{row.original.phone}</span>
      </div>
    ),
  },
  {
    id: 'address',
    accessorKey: 'address',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Address" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <Iconify icon="solar:map-point-bold" className="text-muted-foreground flex-shrink-0" width={16} height={16} />
        <span className="text-sm text-muted-foreground truncate">{row.original.address}</span>
      </div>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      const statusColors: Record<string, { bg: string; border: string; text: string }> = {
        available: {
          bg: 'bg-emerald-50 dark:bg-emerald-950/20',
          border: 'border-emerald-200 dark:border-emerald-800/50',
          text: 'text-emerald-700 dark:text-emerald-300',
        },
        busy: {
          bg: 'bg-orange-50 dark:bg-orange-950/20',
          border: 'border-orange-200 dark:border-orange-800/50',
          text: 'text-orange-700 dark:text-orange-300',
        },
        offline: {
          bg: 'bg-gray-50 dark:bg-gray-950/20',
          border: 'border-gray-200 dark:border-gray-800/50',
          text: 'text-gray-700 dark:text-gray-300',
        },
      };
      const colors = statusColors[status] || statusColors.offline;
      return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border w-fit ${colors.bg} ${colors.border} ${colors.text}`}>
          <Iconify
            icon={status === 'available' ? 'solar:check-circle-bold' : status === 'busy' ? 'solar:clock-circle-bold' : 'solar:close-circle-bold'}
            width={14}
            height={14}
            className="flex-shrink-0"
          />
          <span className="text-xs font-medium capitalize">{status}</span>
        </div>
      );
    },
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Active" />,
    cell: ({ row }) => {
      const isActive = row.original.is_active === 1;
      return (
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border w-fit ${
            isActive
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300'
          }`}
        >
          <Iconify
            icon={isActive ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
            width={14}
            height={14}
            className="flex-shrink-0"
          />
          <span className="text-xs font-medium">{isActive ? 'Active' : 'Inactive'}</span>
        </div>
      );
    },
  },
  {
    id: 'rate_per_order',
    accessorKey: 'rate_per_order',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rate per Order" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Iconify icon="solar:dollar-bold" className="text-muted-foreground flex-shrink-0" width={16} height={16} />
        <span className="text-sm text-muted-foreground">{row.original.rate_per_order}</span>
      </div>
    ),
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Iconify icon="solar:calendar-date-bold" className="text-muted-foreground flex-shrink-0" width={16} height={16} />
        <span className="text-sm text-muted-foreground">{row.original.created_at}</span>
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={DriverSchema}
        row={row}
        viewDetails={`/driver/details/${row.original.id}`}
        editItem={`/driver/update/${row.original.id}`}
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

