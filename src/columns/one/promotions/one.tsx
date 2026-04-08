import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { PromotionListItem } from '@/pages/dashboard/promotions/types/promotion.types';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const PromotionSchema = z.object({
  id: z.number(),
  name: z.any(),
  type: z.string(),
  is_active: z.boolean(),
});

const typeColors: Record<string, string> = {
  simple_discount: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  spend_x_discount: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  buy_x_get_y: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export const promotionColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void
): ColumnDef<PromotionListItem>[] => {
  const typeLabels: Record<string, string> = {
    simple_discount: t('promotionTypes.simpleDiscount'),
    spend_x_discount: t('promotionTypes.spendXDiscount'),
    buy_x_get_y: t('promotionTypes.buyXGetY'),
  };

  return [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.id')} />,
    cell: ({ row }) => (
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <span className="text-xs font-semibold text-primary">{row.original.id}</span>
      </div>
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => (
      <span className="font-semibold text-foreground">{row.original.name}</span>
    ),
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.type')} />,
    cell: ({ row }) => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[row.original.type] ?? 'bg-muted text-muted-foreground'}`}>
        {typeLabels[row.original.type] ?? row.original.type}
      </span>
    ),
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.original.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
        {row.original.is_active ? t('active') : t('inactive')}
      </span>
    ),
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.createdAt')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.created_at}</span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={PromotionSchema}
        row={row}
        editItem={onEdit ? undefined : `/promotions/update/${row.original.id}`}
        onEdit={onEdit}
        onDelete={onDelete}
        isDeleting={isDeleting}
        isDeleteDialogOpen={isDeleteDialogOpen}
        onDeleteConfirm={onDeleteConfirm}
        onDeleteCancel={onDeleteCancel}
        deletingId={deletingId}
        adminToggleEntityType="promotion"
        permissions={permissions}
        viewDetails={`/promotions/${row.original.id}`}
      />
    ),
  },
  ];
};
