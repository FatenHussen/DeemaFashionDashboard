import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { SellerRegistrationItem } from '@/pages/dashboard/vendor/types/seller-registration.types';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';
import {
  formatSellerRegistrationCountry,
  normalizeSellerRegistrationShopType,
} from '@/pages/dashboard/vendor/utils/seller-registration-display';

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

const SELLER_REG_TYPE_STYLES: Record<string, string> = {
  restaurant: 'bg-orange-500/0 text-orange-100 dark:text-orange-300 border border-orange-500/500',
  service_provider:
    'bg-cyan-500/0 text-cyan-100 dark:text-cyan-300 border border-cyan-500/500',
  store: 'bg-slate-500/0 text-slate-1000 red:text-slate-300 border border-slate-500/500',
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
    id: 'seller_name',
    accessorKey: 'seller_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.seller')} />,
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-foreground">{row.original.seller_name}</div>
        <div className="text-xs text-muted-foreground">{row.original.email}</div>
      </div>
    ),
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('form.sellerRegColContactPhone')} />
    ),
    cell: ({ row }) => {
      const value = row.original.phone?.trim() ?? '';
      return (
        <span className="text-sm tabular-nums text-muted-foreground" dir="ltr">
          {value || t('form.emptyEmDash')}
        </span>
      );
    },
  },
  {
    id: 'store_name',
    accessorKey: 'store_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.store')} />,
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.store_name}</span>
    ),
  },
  {
    id: 'seller_type',
    accessorFn: (row) => normalizeSellerRegistrationShopType(row),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('form.sellerRegColType')} />
    ),
    cell: ({ row }) => {
      const type = normalizeSellerRegistrationShopType(row.original);
      const labelKey =
        type === 'restaurant'
          ? 'form.shopTypeRestaurant'
          : type === 'service_provider'
            ? 'form.shopTypeServiceProvider'
            : 'form.shopTypeStore';
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            SELLER_REG_TYPE_STYLES[type] ?? SELLER_REG_TYPE_STYLES.store
          }`}
        >
          {t(labelKey)}
        </span>
      );
    },
  },
  {
    id: 'country',
    accessorKey: 'country',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.location')} />,
    cell: ({ row }) => {
      const gov = row.original.governorate;
      const city = row.original.city;
      const govStr = typeof gov === 'string' ? gov : gov?.name;
      const cityStr = typeof city === 'string' ? city : city?.name;
      const countryStr = formatSellerRegistrationCountry(row.original.country);
      const location =
        [govStr, cityStr].filter(Boolean).join(', ') || countryStr || '-';
      return (
        <div className="text-sm text-muted-foreground">
          {location}
        </div>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const status = row.original.status;
      const statusKey =
        status === 'pending'
          ? 'form.sellerRegStatusPending'
          : status === 'approved'
            ? 'form.sellerRegStatusApproved'
            : status === 'rejected'
              ? 'form.sellerRegStatusRejected'
              : null;
      const label = statusKey ? t(statusKey) : status;
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            STATUS_COLORS[status] ?? STATUS_COLORS.pending
          }`}
        >
          {label}
        </span>
      );
    },
  },
  {
    id: 'registered_at',
    accessorKey: 'registered_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.registered')} />,
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
              title={t('approve')}
            >
              ✓ {t('approve')}
            </button>
          )}
          {isPending && onReject && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReject(row.original.id);
              }}
              className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-red-500/15 text-red-700 dark:text-red-400 hover:bg-red-500/25 transition-colors"
              title={t('reject')}
            >
              ✗ {t('reject')}
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
