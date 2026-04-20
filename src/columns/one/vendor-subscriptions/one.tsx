import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { VendorSubscriptionListItem } from '@/pages/dashboard/vendor/types/vendor-subscription.types';

import { z } from 'zod';
import { formatTranslated } from '@/utils/format-translated';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const VendorSubscriptionSchema = z.object({ id: z.number() });

export interface VendorSubscriptionFormValues extends VendorSubscriptionListItem {
  [key: string]: any;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/10 text-green-600 border-green-500/20',
  expired: 'bg-red-500/10 text-red-600 border-red-500/20',
  cancelled: 'bg-neutral-500/10 text-neutral-600 border-neutral-500/20',
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
};

/** List API returns `vendor_name`; older payloads used `shop_name`. */
const vendorOrShopLabel = (row: VendorSubscriptionListItem): string =>
  row.vendor_name ?? row.shop_name ?? '—';

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
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.starts_at}</span>
    ),
  },
  {
    id: 'ends_at',
    accessorKey: 'ends_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.ends')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.ends_at}</span>
    ),
  },
  {
    id: 'auto_renew',
    accessorKey: 'auto_renew',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.autoRenew')} />,
    cell: ({ row }) =>
      row.original.auto_renew ? (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-600">
          Yes
        </span>
      ) : (
        <span className="text-muted-foreground text-xs">No</span>
      ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? STATUS_COLORS.pending}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.created')} />,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.created_at}</span>
    ),
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
