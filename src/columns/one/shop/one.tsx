import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { TableActiveBadge } from '@/shared/components/table-status-badges';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { normalizeShopTypeFromApi } from '@/pages/dashboard/vendor/types/shop.types';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

// Schema for shop validation
const ShopSchema = z
  .object({
    id: z.number(),
    name: z.union([z.string(), z.record(z.string())]),
    description: z.union([z.string(), z.record(z.string()), z.array(z.unknown())]).optional(),
    logo_url: z.string().nullable().optional(),
    is_active: z.boolean(),
    average_rating: z.number().optional(),
    ratings_count: z.number().optional(),
    is_open_now: z.boolean().optional(),
    created_at: z.string().optional(),
    vendor: z.any().optional(),
    vendor_id: z.number().optional(),
    address: z.union([z.string(), z.record(z.string())]).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    phone: z.union([z.string(), z.null()]).optional(),
    mobile: z.union([z.string(), z.null()]).optional(),
    email: z.union([z.string(), z.null()]).optional(),
    area_id: z.number().optional(),
  })
  .passthrough();

// Type for shop data (API may return name/description as { ar, en })
export interface ShopFormValues {
  id: number;
  name: string | { ar?: string; en?: string };
  description?: string | { ar?: string; en?: string } | unknown[];
  logo_url?: string | null;
  is_active: boolean;
  average_rating?: number;
  ratings_count?: number;
  is_open_now?: boolean;
  created_at?: string;
  vendor?: any;
  vendor_id?: number;
  address?: string | { ar?: string; en?: string };
  lat?: number | null;
  lng?: number | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  area_id?: number;
  shop_type?: string;
  is_restaurant?: boolean;
  is_service_provider?: boolean;
  [key: string]: any;
}

/** Pill badges: vivid border, dark fill, white label — matches dashboard status style */
type PillStatusVariant =
  | 'available'
  | 'inactive'
  | 'busy'
  | 'neutral'
  | 'openNow'
  | 'closedNow';

function PillStatusBadge({ label, variant }: { label: string; variant: PillStatusVariant }) {
  const cfg: Record<
    PillStatusVariant,
    { wrap: string; iconWrap: string; icon: string }
  > = {
    available: {
      wrap: 'border-cyan-400 bg-slate-600 shadow-sm dark:bg-slate-700',
      iconWrap: 'bg-cyan-400 text-white',
      icon: 'solar:check-circle-bold',
    },
    openNow: {
      wrap: 'border-emerald-400 bg-emerald-950/90 shadow-sm dark:bg-emerald-950',
      iconWrap: 'bg-emerald-500 text-white',
      icon: 'solar:shop-2-bold',
    },
    closedNow: {
      wrap: 'border-red-400 bg-red-950/90 shadow-sm dark:bg-red-950',
      iconWrap: 'bg-red-500 text-white',
      icon: 'solar:close-circle-bold',
    },
    inactive: {
      wrap: 'border-slate-500 bg-slate-900 shadow-sm dark:bg-slate-950',
      iconWrap: 'bg-slate-800 text-white',
      icon: 'solar:close-circle-bold',
    },
    busy: {
      wrap: 'border-orange-400 bg-stone-600 shadow-sm dark:bg-stone-700',
      iconWrap: 'bg-orange-400 text-white',
      icon: 'solar:clock-circle-bold',
    },
    neutral: {
      wrap: 'border-slate-400 bg-slate-700 shadow-sm dark:bg-slate-800',
      iconWrap: 'bg-slate-500 text-white',
      icon: 'solar:shop-bold',
    },
  };
  const s = cfg[variant];
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border-2 py-1 pl-1 pr-2.5 text-xs font-bold leading-none text-white ${s.wrap}`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${s.iconWrap}`}
      >
        <Iconify icon={s.icon} width={14} height={14} />
      </span>
      <span className="truncate">{label}</span>
    </span>
  );
}

export const shopColumns = (
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
  paths?: {
    viewDetailsBase?: string;
    editItemBase?: string;
  },
  options?: { hideShopTypeColumn?: boolean }
): ColumnDef<ShopFormValues>[] => [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 min-w-0">
        {row.original.logo_url ? (
          <img
            src={row.original.logo_url}
            alt={formatTranslated(row.original.name)}
            className="w-9 h-9 rounded-lg object-cover border border-border/60 flex-shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Iconify icon="solar:case-minimalistic-bold" className="text-primary" width={18} height={18} />
          </div>
        )}
        <div className="min-w-0">
          <div className="font-semibold text-foreground truncate">{formatTranslated(row.original.name)}</div>
          {row.original.description != null && formatTranslated(row.original.description) !== '-' && (
            <div className="text-xs text-muted-foreground truncate mt-0.5">
              {formatTranslated(row.original.description)}
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    id: 'vendor',
    accessorKey: 'vendor',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.vendor')} />,
    cell: ({ row }) => {
      const vendorName = formatTranslated(row.original.vendor?.name) || row.original.vendor_id || '-';
      return (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-muted border border-border/60 flex items-center justify-center flex-shrink-0">
            <Iconify icon="solar:case-minimalistic-bold" className="text-muted-foreground" width={14} height={14} />
          </div>
          <span className="text-sm font-medium text-foreground truncate">{vendorName}</span>
        </div>
      );
    },
  },
  ...(options?.hideShopTypeColumn
    ? []
    : [
        {
          id: 'shop_type',
          accessorKey: 'shop_type',
          meta: {
            headerClassName: 'min-w-[220px]',
            cellClassName: 'min-w-[220px]',
          },
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('columns.shopType')} />
          ),
          cell: ({ row }) => {
            const type = normalizeShopTypeFromApi(row.original);
            const labelKey =
              type === 'restaurant'
                ? 'form.shopTypeRestaurant'
                : type === 'service_provider'
                  ? 'form.shopTypeServiceProvider'
                  : 'form.shopTypeStore';
            const variant: PillStatusVariant =
              type === 'restaurant' ? 'busy' : type === 'service_provider' ? 'available' : 'neutral';
            return <PillStatusBadge label={t(labelKey)} variant={variant} />;
          },
        } satisfies ColumnDef<ShopFormValues>,
      ]),
  {
    id: 'rating',
    accessorKey: 'average_rating',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.rating')} />,
    cell: ({ row }) => {
      const rating = row.original.average_rating || 0;
      const reviewsCount = row.original.ratings_count || 0;
      const filledStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      
      return (
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => {
              const isFilled = i < filledStars;
              const isHalf = i === filledStars && hasHalfStar;
              
              return (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    isFilled
                      ? 'text-amber-500'
                      : isHalf
                        ? 'text-amber-500/50'
                        : 'text-muted-foreground/30'
                  }`}
                >
                  <Iconify 
                    icon={isFilled ? 'eva:star-fill' : isHalf ? 'eva:star-fill' : 'eva:star-outline'} 
                    width={14} 
                    height={14} 
                    className={isFilled || isHalf ? 'fill-current' : ''}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">
              ({reviewsCount})
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: 'is_open_now',
    accessorKey: 'is_open_now',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.openNow')} />,
    cell: ({ row }) => {
      const isOpen = row.original.is_open_now;
      return (
        <PillStatusBadge
          label={isOpen ? t('open') : t('closed')}
          variant={isOpen ? 'openNow' : 'closedNow'}
        />
      );
    },
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.email')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <Iconify icon="solar:letter-bold" className="text-muted-foreground flex-shrink-0" width={16} height={16} />
        <span className="text-sm text-muted-foreground truncate">{row.original.email || '-'}</span>
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
        <span className="text-sm text-muted-foreground truncate">{row.original.phone || '-'}</span>
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
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.createdAt')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Iconify icon="solar:calendar-date-bold" className="text-muted-foreground flex-shrink-0" width={16} height={16} />
        <span className="text-sm text-muted-foreground">{row.original.created_at}</span>
      </div>
    ),
  },
  ...(permissions.update
    ? [createToggleColumn<ShopFormValues>({ entityType: 'shop' })]
    : []),
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={ShopSchema}
        row={row}
        viewDetails={`${paths?.viewDetailsBase ?? '/shop/details'}/${row.original.id}`}
        editItem={`${paths?.editItemBase ?? '/shop/update'}/${row.original.id}`}
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
