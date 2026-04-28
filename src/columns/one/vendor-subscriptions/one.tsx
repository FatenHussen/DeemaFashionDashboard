import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { VendorSubscriptionListItem } from '@/pages/dashboard/vendor/types/vendor-subscription.types';

import { z } from 'zod';
import { formatTranslated } from '@/utils/format-translated';
import { TableTonedStatusPill } from '@/shared/components/table-status-badges';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const VendorSubscriptionSchema = z.object({ id: z.number() });

export interface VendorSubscriptionFormValues extends VendorSubscriptionListItem {
  [key: string]: any;
}

const STATUS_PILL: Record<string, { icon: string; className: string }> = {
  active: { icon: 'solar:check-circle-bold', className: 'border-emerald-800 bg-emerald-600' },
  expired: { icon: 'solar:calendar-minimalistic-bold', className: 'border-red-800 bg-red-600' },
  cancelled: { icon: 'solar:close-circle-bold', className: 'border-slate-600 bg-slate-500' },
  pending: { icon: 'solar:clock-circle-bold', className: 'border-amber-700 bg-amber-500' },
};

/** List API returns `vendor_name`; older payloads used `shop_name`. */
const vendorOrShopLabel = (row: VendorSubscriptionListItem): string =>
  row.vendor_name ?? row.shop_name ?? '—';

const formatSimpleDate = (value?: string | null): string => {
  if (!value) return '-';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

const getVendorSubscriptionStatusLabel = (status: string, t: TFunction<'table'>): string => {
  const key = status.toLowerCase();
  const labels: Record<string, string> = {
    active: t('active'),
    expired: t('expired'),
    cancelled: t('statusCancelled'),
    canceled: t('statusCancelled'),
    pending: t('pending'),
  };
  return labels[key] ?? status;
};

export const vendorSubscriptionColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null
): ColumnDef<VendorSubscriptionFormValues>[] => [
  {
    id: 'shop_name',
    accessorFn: (row) => vendorOrShopLabel(row),
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.shop')} />,
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{vendorOrShopLabel(row.original)}</span>
    ),
  },
  {
    id: 'package',
    accessorKey: 'package',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.package')} />,
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary border-primary/20">
        {formatTranslated(row.original.package?.name) || '-'}
      </span>
    ),
  },
  {
    id: 'starts_at',
    accessorKey: 'starts_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.starts')} />,
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatSimpleDate(row.original.starts_at)}</span>,
  },
  {
    id: 'ends_at',
    accessorKey: 'ends_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.ends')} />,
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatSimpleDate(row.original.ends_at)}</span>,
  },
  {
    id: 'auto_renew',
    accessorKey: 'auto_renew',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.autoRenew')} />,
    cell: ({ row }) =>
      row.original.auto_renew ? (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-600">
          {t('yes')}
        </span>
      ) : (
        <span className="text-muted-foreground text-xs">{t('no')}</span>
      ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const status = row.original.status;
      const cfg = STATUS_PILL[status] ?? STATUS_PILL.pending;
      return (
        <TableTonedStatusPill icon={cfg.icon} className={cfg.className}>
          {getVendorSubscriptionStatusLabel(status, t)}
        </TableTonedStatusPill>
      );
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.created')} />,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatSimpleDate(row.original.created_at)}</span>,
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={VendorSubscriptionSchema}
        row={row}
        viewDetails={`/vendor-subscriptions/${row.original.id}`}
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
