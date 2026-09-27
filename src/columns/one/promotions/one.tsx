import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { PromotionListItem } from '@/pages/dashboard/promotions/types/promotion.types';

import { z } from 'zod';
import { TableActiveBadge } from '@/shared/components/table-status-badges';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';
import {
  PROMOTION_TYPE_COLORS,
  PROMOTION_TYPE_LABEL_KEYS,
} from '@/pages/dashboard/promotions/utils/promotion-fields';

const PromotionSchema = z.object({
  id: z.number(),
  name: z.any(),
  type: z.string(),
  is_active: z.boolean(),
});

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
  const typeLabels: Record<string, string> = {};
  for (const [type, key] of Object.entries(PROMOTION_TYPE_LABEL_KEYS)) {
    typeLabels[type] = t(key);
  }

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
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PROMOTION_TYPE_COLORS[row.original.type] ?? 'bg-muted text-muted-foreground'}`}>
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
