import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { ScheduledBasketData } from '@/pages/dashboard/baskets/types/scheduled-basket.types';

import { z } from 'zod';
import { formatTranslated } from '@/utils/format-translated';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const ScheduledBasketSchema = z.object({
  id: z.number(),
  name: z.any(),
  discount: z.any(),
  discount_type: z.string(),
  is_active: z.boolean(),
});

export interface ScheduledBasketFormValues extends ScheduledBasketData {
  [key: string]: any;
}

export const scheduledBasketColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void
): ColumnDef<ScheduledBasketFormValues>[] => [
  {
    id: 'image',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.image')} />,
    cell: ({ row }) => {
      const img = row.original.image;
      return img ? (
        <img src={img} alt="" className="w-10 h-10 rounded-lg object-cover border border-border/50" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">—</div>
      );
    },
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => {
      const name = row.original.name;
      const display = typeof name === 'object' ? (name as any)?.en || (name as any)?.ar : name;
      return <div className="font-semibold text-foreground truncate max-w-[180px]">{display || '—'}</div>;
    },
  },
  {
    id: 'category',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.category')} />,
    cell: ({ row }) => {
      const r = row.original;
      if (r.categories?.length) {
        const text = r.categories
          .map((c) => formatTranslated(c.name as Parameters<typeof formatTranslated>[0]))
          .filter(Boolean)
          .join(' · ');
        return <span className="text-sm">{text || '—'}</span>;
      }
      const cat = r.category;
      if (!cat) return <span className="text-muted-foreground">—</span>;
      if (typeof cat === 'string') return <span className="text-sm">{cat}</span>;
      const catName = formatTranslated((cat as { name?: unknown }).name as Parameters<typeof formatTranslated>[0]);
      return <span className="text-sm">{catName || '—'}</span>;
    },
  },
  {
    id: 'original_price',
    accessorKey: 'original_price',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.originalPrice')} />,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.original_price ?? '—'}</span>
    ),
  },
  {
    id: 'final_price',
    accessorKey: 'final_price',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.finalPrice')} />,
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-primary">{row.original.final_price ?? '—'}</span>
    ),
  },
  {
    id: 'discount',
    accessorKey: 'discount',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.discount')} />,
    cell: ({ row }) => {
      const d = row.original;
      const text = d.discount_type === 'percentage' ? `${d.discount}%` : d.discount;
      return (
        <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-xs font-medium">
          {text}
        </span>
      );
    },
  },
  {
    id: 'rating',
    accessorKey: 'average_rating',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.rating')} />,
    cell: ({ row }) => {
      const rating = row.original.average_rating ?? row.original.rating;
      return rating != null ? (
        <span className="flex items-center gap-1 text-sm">
          <span className="text-yellow-500">★</span> {rating}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    id: 'num_sold',
    accessorKey: 'num_sold',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.numSold')} />,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.num_sold ?? '—'}</span>
    ),
  },
  {
    id: 'schedule_count',
    accessorKey: 'schedule_count',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.scheduleCount')} />,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.schedule_count ?? '—'}</span>
    ),
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
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
          {isActive ? t('active') : t('inactive')}
        </span>
      );
    },
  },
  ...(permissions.update
    ? [createToggleColumn<ScheduledBasketFormValues>({ entityType: 'basket_schedule' })]
    : []),
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={ScheduledBasketSchema}
        row={row}
        viewDetails={`/scheduled-baskets/details/${row.original.id}`}
        editItem={onEdit ? undefined : `/scheduled-baskets/update/${row.original.id}`}
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
