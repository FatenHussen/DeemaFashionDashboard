import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { BasketData } from '@/pages/dashboard/baskets/types/basket.types';

import { z } from 'zod';
import { formatTranslated } from '@/utils/format-translated';
import { resolveBasketGalleryUrls } from '@/utils/basket-gallery';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const BasketSchema = z.object({
  id: z.number(),
  name: z.any(),
  discount: z.union([z.number(), z.string()]).optional(),
  discount_value: z.union([z.number(), z.string()]).optional(),
  discount_type: z.string().optional(),
  created_at: z.string(),
});

export interface BasketFormValues extends BasketData {
  [key: string]: any;
}

export const basketColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void
): ColumnDef<BasketFormValues>[] => [
  {
    id: 'image',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.image')} />,
    cell: ({ row }) => {
      const urls = resolveBasketGalleryUrls(row.original);
      const img = urls[0];
      return img ? (
        <img src={img} alt="" className="h-10 w-10 rounded-lg border border-border/50 object-cover" />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
          —
        </div>
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
      return <div className="font-semibold text-foreground truncate">{display || '-'}</div>;
    },
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.category')} />,
    cell: ({ row }) => {
      const r = row.original;
      if (r.categories?.length) {
        const text = r.categories
          .map((c) => formatTranslated(c.name as Parameters<typeof formatTranslated>[0]))
          .filter(Boolean)
          .join(' · ');
        return <span className="text-sm">{text || '-'}</span>;
      }
      const cat = r.category;
      if (typeof cat === 'string') return <span className="text-sm">{cat || '-'}</span>;
      if (cat && typeof cat === 'object' && 'name' in cat) {
        return (
          <span className="text-sm">
            {formatTranslated((cat as { name: unknown }).name as Parameters<typeof formatTranslated>[0]) || '-'}
          </span>
        );
      }
      return <span className="text-sm">-</span>;
    },
  },
  {
    id: 'discount',
    accessorKey: 'discount',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.discount')} />,
    cell: ({ row }) => {
      const d = row.original;
      const value = d.discount ?? d.discount_value ?? d.discount_amount ?? 0;
      const text =
        d.discount_type === 'percentage'
          ? `${value}%`
          : `Fixed: ${typeof value === 'number' ? value : parseFloat(String(value)) || 0}`;
      return <span className="text-sm">{text}</span>;
    },
  },
  {
    id: 'items_count',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.items')} />,
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.items_count ?? row.original.items?.length ?? 0}
      </span>
    ),
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.created')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.created_at).toLocaleDateString()}
      </span>
    ),
  },
  ...(permissions.update
    ? [createToggleColumn<BasketFormValues>({ entityType: 'basket' })]
    : []),
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={BasketSchema}
        row={row}
        viewDetails={`/baskets/details/${row.original.id}`}
        editItem={onEdit ? undefined : `/baskets/update/${row.original.id}`}
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
