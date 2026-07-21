import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

// Schema for category validation
const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  icon: z.string().nullable(),
  parent_id: z.number().nullable(),
  parent: z.object({
    id: z.number(),
    name: z.string(),
  }).nullable(),
  children_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Type for category data
export interface CategoryFormValues {
  id: number;
  name: string;
  description: string;
  icon: string | null;
  parent_id: number | null;
  parent: {
    id: number;
    name: string;
  } | null;
  children_count: number;
  created_at: string;
  updated_at: string;
  /** From list API — drives row Show/Hide in actions menu. */
  is_active?: boolean | number;
  is_restaurant?: boolean;
  [key: string]: any;
}

export const categoryColumns = (
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
  options?: {
    subcategoriesPath?: (id: number) => string;
    /** Same as row drill-down; when set, overrides navigation via `subcategoriesPath`. */
    onSubcategoriesClick?: (row: CategoryFormValues) => void;
    /** Hide parent column when listing root categories only. */
    hideParentColumn?: boolean;
    /** Hide type column when tabs already separate normal vs restaurant. */
    hideTypeColumn?: boolean;
    /** Active list tab — used for edit/update query params. */
    categoryTab?: 'normal' | 'restaurant';
  }
): ColumnDef<CategoryFormValues>[] => {
  const subcategoriesPath = options?.subcategoriesPath;
  const onSubcategoriesClick = options?.onSubcategoriesClick;
  const hideParentColumn = options?.hideParentColumn;
  const hideTypeColumn = options?.hideTypeColumn;
  const categoryTypeQuery = options?.categoryTab ?? 'normal';
  const editPath = (rowId: number) =>
    `/categories/update/${rowId}?type=${categoryTypeQuery}`;

  const parentColumn: ColumnDef<CategoryFormValues> = {
    id: 'parent',
    accessorKey: 'parent.name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.parent')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        {row.original.parent ? (
          <>
            <Iconify
              icon="solar:diagram-bold"
              className="text-muted-foreground shrink-0"
              width={16}
              height={16}
            />
            <span className="text-sm text-muted-foreground truncate">
              {formatTranslated(row.original.parent.name)}
            </span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </div>
    ),
  };

  return [
  {
    id: 'icon',
    accessorKey: 'icon',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.icon')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.icon ? (
          <img
            src={row.original.icon}
            alt={formatTranslated(row.original.name)}
            className="w-10 h-10 rounded-lg object-cover border border-border/60"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-muted border border-border/60 flex items-center justify-center">
            <Iconify
              icon="solar:gallery-bold"
              className="text-muted-foreground"
              width={18}
              height={18}
            />
          </div>
        )}
      </div>
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Iconify
            icon="solar:tag-bold"
            className="text-primary"
            width={18}
            height={18}
          />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-foreground truncate">{formatTranslated(row.original.name)}</div>
        </div>
      </div>
    ),
  },
  // {
  //   id: 'description',
  //   accessorKey: 'description',
  //   header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.description')} />,
  //   cell: ({ row }) => (
  //     <div className="flex items-center gap-2 min-w-0">
  //       <span className="text-sm text-muted-foreground truncate">
  //         {formatTranslated(row.original.description) || '-'}
  //       </span>
  //     </div>
  //   ),
  // },
  ...(hideParentColumn ? [] : [parentColumn]),
  {
    id: 'children_count',
    accessorKey: 'children_count',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.children')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 w-fit">
          <Iconify
            icon="solar:folder-bold"
            className="text-primary shrink-0"
            width={14}
            height={14}
          />
          <span className="text-xs font-semibold text-primary">
            {row.original.children_count}
          </span>
        </div>
      </div>
    ),
  },
  ...(hideTypeColumn
    ? []
    : [
        {
          id: 'is_restaurant',
          accessorKey: 'is_restaurant',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('columns.type')} />
          ),
          cell: ({ row }) => {
            const isRestaurant = row.original.is_restaurant;
            return (
              <div className="flex items-center gap-2">
                {isRestaurant ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 w-fit">
                    <Iconify
                      icon="solar:shop-bold"
                      className="text-orange-500 shrink-0"
                      width={13}
                      height={13}
                    />
                    <span className="text-xs font-semibold text-orange-500">
                      {t('columns.restaurant')}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border border-border w-fit">
                    <Iconify
                      icon="solar:shop-2-bold"
                      className="text-muted-foreground shrink-0"
                      width={13}
                      height={13}
                    />
                    <span className="text-xs font-semibold text-muted-foreground">
                      {t('columns.normal')}
                    </span>
                  </div>
                )}
              </div>
            );
          },
        } as ColumnDef<CategoryFormValues>,
      ]),
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.createdAt')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Iconify
          icon="solar:calendar-date-bold"
          className="text-muted-foreground shrink-0"
          width={16}
          height={16}
        />
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.created_at).toLocaleDateString()}
        </span>
      </div>
    ),
  },
  ...(permissions.update
    ? [createToggleColumn<CategoryFormValues>({ entityType: 'category' })]
    : []),
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={CategorySchema}
        row={row}
        subcategoriesPath={subcategoriesPath}
        onSubcategoriesClick={
          onSubcategoriesClick
            ? (r) => onSubcategoriesClick(r.original as CategoryFormValues)
            : undefined
        }
        viewDetails={editPath(row.original.id)}
        editItem={editPath(row.original.id)}
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
};

