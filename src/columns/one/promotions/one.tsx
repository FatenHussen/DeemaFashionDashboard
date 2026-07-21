import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { PromotionListItem } from '@/pages/dashboard/promotions/types/promotion.types';

import { z } from 'zod';
import { TableActiveBadge } from '@/shared/components/table-status-badges';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
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
  spend_x_get_gift: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  spend_x_get_points: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  free_shipping: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  spend_x_get_free_shipping: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
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
    spend_x_get_gift: t('promotionTypes.spendXGetGift'),
    spend_x_get_points: t('promotionTypes.spendXGetPoints'),
    free_shipping: t('promotionTypes.freeShipping'),
    spend_x_get_free_shipping: t('promotionTypes.spendXGetFreeShipping'),
  };

  return [
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
      <TableActiveBadge
        isActive={row.original.is_active}
        activeLabel={t('active')}
        inactiveLabel={t('inactive')}
      />
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
  ...(permissions.update
    ? [createToggleColumn<PromotionListItem>({ entityType: 'promotion' })]
    : []),
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
        permissions={permissions}
        viewDetails={`/promotions/${row.original.id}`}
      />
    ),
  },
  ];
};
