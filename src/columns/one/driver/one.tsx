import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { Iconify } from '@/shared/components/iconify';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';
import {
  DRIVER_AVAILABILITY_BADGE,
  DRIVER_ACCOUNT_ACTIVE_BADGE,
  normalizeDriverAvailabilityStatus,
} from '@/shared/utils/driver-status-badge';

// Schema for driver table/row data
const DriverSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  phone: z.string(),
  address: z.string(),
  status: z.string(),
  is_active: z.union([z.number(), z.boolean()]),
  rate_per_order: z.union([z.string(), z.number()]).optional(),
  vehicle_name: z.string().optional().nullable(),
  vehicle_type: z.string().optional().nullable(),
  vehicle_number: z.string().optional().nullable(),
  vehicle_image: z.string().optional().nullable(),
  shops: z.array(z.object({ id: z.number(), name: z.any() })).optional(),
  average_rating: z.number().optional(),
  total_orders: z.number().optional(),
  completed_orders: z.number().optional(),
  total_earnings: z.number().optional(),
  created_at: z.string(),
});

// Type for driver table row
export interface DriverFormValues {
  id: number;
  name?: string;
  phone: string;
  address: string;
  status: string;
  is_active: number | boolean;
  rate_per_order?: string | number;
  vehicle_name?: string | null;
  vehicle_type?: string | null;
  vehicle_number?: string | null;
  vehicle_image?: string | null;
  average_rating?: number;
  total_orders?: number;
  completed_orders?: number;
  total_earnings?: number;
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
  deletingId?: number | null,
  onUpdatePassword?: (row: { original: DriverFormValues }) => void,
  onOpenStatusActiveModal?: (row: DriverFormValues) => void,
  onAssignOrderToDriver?: (row: DriverFormValues) => void
): ColumnDef<DriverFormValues>[] => [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <Iconify icon="solar:user-rounded-bold" className="text-muted-foreground flex-shrink-0" width={16} height={16} />
        <span className="text-sm text-foreground font-medium truncate">{row.original.name || '-'}</span>
      </div>
    ),
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.phone')} />,
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
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.address')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <Iconify icon="solar:map-point-bold" className="text-muted-foreground flex-shrink-0" width={16} height={16} />
        <span className="text-sm text-muted-foreground truncate">{row.original.address}</span>
      </div>
    ),
  },
  {
    id: 'vehicle_name',
    accessorKey: 'vehicle_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.vehicleName')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground truncate max-w-[140px] block">
        {row.original.vehicle_name || '-'}
      </span>
    ),
  },
  {
    id: 'vehicle_type',
    accessorKey: 'vehicle_type',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.vehicleType')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground capitalize truncate max-w-[120px] block">
        {row.original.vehicle_type || '-'}
      </span>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const key = normalizeDriverAvailabilityStatus(String(row.original.status));
      const badge = DRIVER_AVAILABILITY_BADGE[key];
      const labelKey =
        key === 'available'
          ? 'driverAvailAvailable'
          : key === 'busy'
            ? 'driverAvailBusy'
            : 'driverAvailInactive';
      const interactive = Boolean(permissions.update && onOpenStatusActiveModal);
      const inner = (
        <>
          <Iconify
            icon={
              key === 'available'
                ? 'solar:check-circle-bold'
                : key === 'busy'
                  ? 'solar:clock-circle-bold'
                  : 'solar:close-circle-bold'
            }
            width={14}
            height={14}
            className={`flex-shrink-0 ${badge.iconClassName}`}
          />
          <span>{t(labelKey)}</span>
        </>
      );
      return interactive ? (
        <button
          type="button"
          className={`${badge.className} cursor-pointer transition hover:brightness-[0.97] active:scale-[0.98] dark:hover:brightness-110`}
          onClick={(e) => {
            e.stopPropagation();
            onOpenStatusActiveModal?.(row.original);
          }}
        >
          {inner}
        </button>
      ) : (
        <div className={badge.className}>{inner}</div>
      );
    },
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.active')} />,
    cell: ({ row }) => {
      const isActive = Boolean(row.original.is_active);
      const interactive = Boolean(permissions.update && onOpenStatusActiveModal);
      const inner = (
        <>
          <Iconify
            icon={isActive ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
            width={14}
            height={14}
            className="flex-shrink-0 text-white"
          />
          <span>{isActive ? t('active') : t('inactive')}</span>
        </>
      );
      return interactive ? (
        <button
          type="button"
          className={`${
            isActive ? DRIVER_ACCOUNT_ACTIVE_BADGE.active : DRIVER_ACCOUNT_ACTIVE_BADGE.inactive
          } cursor-pointer transition hover:brightness-110 active:scale-[0.98]`}
          onClick={(e) => {
            e.stopPropagation();
            onOpenStatusActiveModal?.(row.original);
          }}
        >
          {inner}
        </button>
      ) : (
        <div
          className={
            isActive ? DRIVER_ACCOUNT_ACTIVE_BADGE.active : DRIVER_ACCOUNT_ACTIVE_BADGE.inactive
          }
        >
          {inner}
        </div>
      );
    },
  },
  {
    id: 'total_earnings',
    accessorKey: 'total_earnings',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.totalEarnings')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Iconify icon="solar:wallet-money-bold" className="text-muted-foreground flex-shrink-0" width={16} height={16} />
        <span className="text-sm text-muted-foreground">{row.original.total_earnings ?? '-'}</span>
      </div>
    ),
  },
  ...(permissions.update
    ? [createToggleColumn<DriverFormValues>({ entityType: 'driver' })]
    : []),
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={DriverSchema}
        row={row}
        viewDetails={`/driver/details/${row.original.id}`}
        editItem={`/driver/update/${row.original.id}`}
        onDelete={onDelete}
        onUpdatePassword={onUpdatePassword}
        onAssignOrderToDriver={
          onAssignOrderToDriver ? (driverRow: any) => onAssignOrderToDriver(driverRow.original) : undefined
        }
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

