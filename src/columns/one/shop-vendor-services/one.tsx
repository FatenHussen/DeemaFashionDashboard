import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { TableActiveBadge } from '@/shared/components/table-status-badges';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const RowSchema = z.object({ id: z.number() }).passthrough();

export interface ShopVendorServiceRow {
  id: number;
  shop_id: number;
  vendor_service_id: number;
  shop?: { id: number; name: string | { ar?: string; en?: string } };
  vendor_service?: { id: number; name: string | { ar?: string; en?: string } };
  price: number;
  price_unit?: string;
  duration_minutes?: number;
  is_active: boolean;
  created_at?: string;
  [key: string]: any;
}

export const shopVendorServiceColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null
): ColumnDef<ShopVendorServiceRow>[] => [
  {
    id: 'shop',
    accessorKey: 'shop',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.shop')} />,
    cell: ({ row }) => {
      const shopName = row.original.shop
        ? formatTranslated(row.original.shop.name)
        : `#${row.original.shop_id}`;
      return (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-muted border border-border/60 flex items-center justify-center flex-shrink-0">
            <Iconify icon="solar:case-minimalistic-bold" className="text-muted-foreground" width={14} height={14} />
          </div>
          <span className="text-sm font-medium text-foreground truncate">{shopName}</span>
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
        : `#${row.original.vendor_service_id}`;
      return (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-muted border border-border/60 flex items-center justify-center flex-shrink-0">
            <Iconify icon="solar:course-bold" className="text-muted-foreground" width={14} height={14} />
          </div>
          <span className="text-sm font-medium text-foreground truncate">{serviceName}</span>
        </div>
      );
    },
  },
  {
    id: 'price',
    accessorKey: 'price',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.price')} />,
    cell: ({ row }) => {
      const rawUnit = (row.original.price_unit ?? '').trim().toLowerCase();
      const priceUnitLabelMap: Record<string, string> = {
        'per hour': t('form.perHour'),
        'per visit': t('form.perVisit'),
        'per day': t('form.perDay'),
        'per service': t('form.perService'),
        per_service: t('form.perService'),
        fixed: t('form.fixed'),
      };
      const priceUnitLabel = priceUnitLabelMap[rawUnit] ?? row.original.price_unit;

      return (
        <div className="flex items-center gap-1.5">
          <Iconify icon="solar:tag-price-bold" className="text-muted-foreground" width={16} height={16} />
          <span className="text-sm font-semibold text-foreground">
            {row.original.price}
            {priceUnitLabel && (
              <span className="text-xs text-muted-foreground ml-1">/ {priceUnitLabel}</span>
            )}
          </span>
        </div>
      );
    },
  },
  {
    id: 'duration',
    accessorKey: 'duration_minutes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.duration')} />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Iconify icon="solar:clock-circle-bold" className="text-muted-foreground" width={16} height={16} />
        <span className="text-sm text-muted-foreground">
          {row.original.duration_minutes != null
            ? `${row.original.duration_minutes} ${t('form.durationMinutesShort')
                .replace('(', '')
                .replace(')', '')
                .trim()}`
            : '-'}
        </span>
      </div>
    ),
  },
  {
    id: 'status',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      return (
        <TableActiveBadge
          isActive={isActive}
          activeLabel={t('active')}
          inactiveLabel={t('inactive')}
        />
      );
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.createdAt')} />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Iconify
          icon="solar:calendar-date-bold"
          className="text-muted-foreground flex-shrink-0"
          width={16}
          height={16}
        />
        <span className="text-sm text-muted-foreground">{row.original.created_at ?? '-'}</span>
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={RowSchema}
        row={row}
        viewDetails={`/shop-vendor-services/update/${row.original.id}`}
        editItem={`/shop-vendor-services/update/${row.original.id}`}
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
