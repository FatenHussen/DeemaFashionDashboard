import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { RecipeData } from '@/pages/dashboard/recipes/types/recipe.types';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const RecipeSchema = z.object({
  id: z.number(),
  name: z.any(),
  is_active: z.boolean(),
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
    id: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => {
      const name = row.original.name;
      const display = typeof name === 'object' ? (name as any)?.en || (name as any)?.ar : name;
      return <div className="font-semibold text-foreground truncate">{display || '-'}</div>;
    },
  },
  {
    id: 'prep_time',
    accessorKey: 'prep_time',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.prepTime')} />,
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.prep_time || '-'}</span>,
  },
  {
    id: 'cook_time',
    accessorKey: 'cook_time',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.cookTime')} />,
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.cook_time || '-'}</span>,
  },
  {
    id: 'servings',
    accessorKey: 'servings',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.servings')} />,
    cell: ({ row }) => <span className="text-sm">{row.original.servings ?? '-'}</span>,
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${row.original.is_active ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
        {row.original.is_active ? 'Active' : 'Inactive'}
      </span>
    ),
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
