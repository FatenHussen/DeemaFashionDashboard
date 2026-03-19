import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { RecipeData } from '@/pages/dashboard/recipes/types/recipe.types';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const RecipeSchema = z.object({
  id: z.number(),
  name: z.any(),
  created_at: z.string(),
});

export interface RecipeFormValues extends RecipeData {
  [key: string]: any;
}

export const recipeColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void
): ColumnDef<RecipeFormValues>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.id')} />,
    cell: ({ row }) => (
      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
        <span className="text-xs font-semibold text-primary">{row.original.id}</span>
      </div>
    ),
  },
  {
    id: 'image',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.image')} />,
    cell: ({ row }) => {
      const image = row.original.image;
      return image ? (
        <img src={image} alt="" className="w-12 h-12 rounded-lg object-cover border border-border/60" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">—</div>
      );
    },
  },
  {
    id: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => {
      const name = row.original.name;
      const display = typeof name === 'object' ? (name as any)?.en || (name as any)?.ar : name;
      return <div className="font-semibold text-foreground truncate max-w-[200px]">{display || '-'}</div>;
    },
  },
  {
    id: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.description')} />,
    cell: ({ row }) => {
      const desc = row.original.description;
      const display = typeof desc === 'object' ? (desc as any)?.en || (desc as any)?.ar : desc;
      return <div className="text-sm text-muted-foreground truncate max-w-[200px]">{display || '-'}</div>;
    },
  },
  {
    id: 'price',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.price')} />,
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.price_after_discount != null && row.original.price_after_discount !== row.original.price ? (
          <div className="flex flex-col">
            <span className="line-through text-muted-foreground text-xs">{row.original.price_formatted}</span>
            <span className="font-semibold text-foreground">{row.original.price_after_discount_formatted}</span>
          </div>
        ) : (
          <span className="font-semibold text-foreground">{row.original.price_formatted || '-'}</span>
        )}
      </div>
    ),
  },
  {
    id: 'discount',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.discount')} />,
    cell: ({ row }) => {
      const discount = row.original.discount;
      if (!discount || Number(discount) === 0) return <span className="text-sm text-muted-foreground">—</span>;
      return (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {Number(discount).toFixed(0)}%
        </span>
      );
    },
  },
  {
    id: 'rating',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.rating')} />,
    cell: ({ row }) => {
      const rating = row.original.rating;
      if (rating == null) return <span className="text-sm text-muted-foreground">—</span>;
      return (
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span className="text-sm font-medium">{rating}</span>
        </div>
      );
    },
  },
  {
    id: 'orders_count',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.orders')} />,
    cell: ({ row }) => <span className="text-sm">{row.original.orders_count ?? 0}</span>,
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.createdAt')} />,
    cell: ({ row }) => {
      const date = row.original.created_at;
      if (!date) return <span className="text-sm text-muted-foreground">—</span>;
      return <span className="text-sm text-muted-foreground">{new Date(date).toLocaleDateString()}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={RecipeSchema}
        row={row}
        editItem={onEdit ? undefined : `/recipes/update/${row.original.id}`}
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
