import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { ServiceOrderData, ServiceOrderStatus } from '@/pages/dashboard/service-orders/types';

import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { FINAL_STATUSES } from '@/pages/dashboard/service-orders/types';
import { TableTonedStatusPill } from '@/shared/components/table-status-badges';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

export type ServiceOrderRow = ServiceOrderData;

const STATUS_CONFIG: Record<
  ServiceOrderStatus,
  { icon: string; className: string }
> = {
  pending: {
    icon: 'solar:hourglass-bold',
    className: 'border-amber-700 bg-amber-500',
  },
  confirmed: {
    icon: 'solar:check-circle-bold',
    className: 'border-blue-800 bg-blue-600',
  },
  in_progress: {
    icon: 'solar:play-circle-bold',
    className: 'border-violet-800 bg-violet-600',
  },
  completed: {
    icon: 'solar:check-square-bold',
    className: 'border-emerald-800 bg-emerald-600',
  },
  canceled: {
    icon: 'solar:close-circle-bold',
    className: 'border-red-800 bg-red-600',
  },
  rejected: {
    icon: 'solar:close-square-bold',
    className: 'border-rose-900 bg-rose-600',
  },
};

const ALL_STATUSES: ServiceOrderStatus[] = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'canceled',
  'rejected',
];

function getServiceOrderStatusLabel(status: ServiceOrderStatus, t: TFunction<'table'>): string {
  const labels: Record<ServiceOrderStatus, string> = {
    pending: t('statusPending'),
    confirmed: t('statusConfirmed'),
    in_progress: t('statusInProgress'),
    completed: t('columns.completed'),
    canceled: t('statusCancelled'),
    rejected: t('statusRejected'),
  };

  return labels[status] ?? status.replace(/_/g, ' ');
}

export const serviceOrderColumns = (
  permissions: { update: boolean },
  t: TFunction<'table'>,
  onStatusChange?: (id: number, status: ServiceOrderStatus) => void,
  changingOrderId?: number | null
): ColumnDef<ServiceOrderRow>[] => [
  {
    id: 'user',
    accessorKey: 'user',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.user')} />,
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-muted border border-border/60 flex items-center justify-center flex-shrink-0">
            <Iconify icon="solar:user-bold" className="text-muted-foreground" width={16} height={16} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground truncate">
              {user?.name ?? `#${row.original.user_id ?? '-'}`}
            </div>
            {user?.email && (
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    id: 'shop',
    accessorKey: 'shop',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.shop')} />,
    cell: ({ row }) => {
      const shopName = row.original.shop
        ? formatTranslated(row.original.shop.name)
        : `#${row.original.shop_id ?? '-'}`;
      return (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-muted border border-border/60 flex items-center justify-center flex-shrink-0">
            <Iconify icon="solar:case-minimalistic-bold" className="text-muted-foreground" width={14} height={14} />
          </div>
          <span className="text-sm text-foreground truncate">{shopName}</span>
        </div>
      );
    },
  },
  {
    id: 'vendor_service',
    accessorKey: 'vendor_service',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.vendorService')} />
    ),
    cell: ({ row }) => {
      const serviceName = row.original.vendor_service
        ? formatTranslated(row.original.vendor_service.name)
        : `#${row.original.vendor_service_id ?? '-'}`;
      return (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-muted border border-border/60 flex items-center justify-center flex-shrink-0">
            <Iconify icon="solar:course-bold" className="text-muted-foreground" width={14} height={14} />
          </div>
          <span className="text-sm text-foreground truncate">{serviceName}</span>
        </div>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const status = row.original.status as ServiceOrderStatus;
      const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
      const isFinal = FINAL_STATUSES.includes(status);
      const isChanging = changingOrderId === row.original.id;

      if (!permissions.update || isFinal) {
        return (
          <TableTonedStatusPill icon={config.icon} className={config.className}>
            {getServiceOrderStatusLabel(status, t)}
          </TableTonedStatusPill>
        );
      }

      return (
        <div className="relative">
          <select
            value={status}
            disabled={isChanging}
            onChange={(e) => onStatusChange?.(row.original.id, e.target.value as ServiceOrderStatus)}
            className={`appearance-none cursor-pointer rounded-full border-2 px-2.5 py-1 pr-7 text-xs font-bold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 ${config.className}`}
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-background text-foreground">
                {getServiceOrderStatusLabel(s, t)}
              </option>
            ))}
          </select>
          {isChanging && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/50">
              <Iconify icon="solar:refresh-bold" className="animate-spin text-primary" width={14} height={14} />
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: 'scheduled_at',
    accessorKey: 'scheduled_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.scheduledAt')} />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Iconify icon="solar:calendar-date-bold" className="text-muted-foreground flex-shrink-0" width={16} height={16} />
        <span className="text-sm text-muted-foreground">{row.original.scheduled_at ?? '-'}</span>
      </div>
    ),
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.createdAt')} />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Iconify icon="solar:calendar-date-bold" className="text-muted-foreground flex-shrink-0" width={16} height={16} />
        <span className="text-sm text-muted-foreground">{row.original.created_at ?? '-'}</span>
      </div>
    ),
  },
];
