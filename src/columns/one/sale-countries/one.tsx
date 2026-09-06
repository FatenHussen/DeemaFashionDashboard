import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { SaleCountryListItem } from '@/pages/dashboard/sale-countries/types/sale-country.types';

import { z } from 'zod';
import { TableActiveBadge } from '@/shared/components/table-status-badges';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const SaleCountrySchema = z.object({
  id: z.number(),
  name: z.string(),
  is_active: z.boolean(),
});

export const saleCountryColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void
): ColumnDef<SaleCountryListItem>[] => [
  {
    id: 'icon',
    accessorKey: 'icon',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.image')} />,
    cell: ({ row }) => {
      const icon = row.original.icon;
      // Seeder icons are emoji flags (e.g. 🇸🇾); legacy rows may still be image URLs.
      const isUrl = typeof icon === 'string' && /^https?:\/\//i.test(icon);
      return (
        <div className="w-10 h-10 rounded-lg border border-border overflow-hidden bg-muted/30 flex items-center justify-center text-xl leading-none">
          {!icon ? (
            <span className="text-muted-foreground text-xs">—</span>
          ) : isUrl ? (
            <img src={icon} alt="" className="w-full h-full object-cover" />
          ) : (
            <span aria-hidden>{icon}</span>
          )}
        </div>
      );
    },
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.name}</span>,
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
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.created_at).toLocaleDateString()}
      </span>
    ),
  },
  ...(permissions.update
    ? [createToggleColumn<SaleCountryListItem>({ entityType: 'sale_country' })]
    : []),
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={SaleCountrySchema}
        row={row}
        viewDetails={`/sale-countries/update/${row.original.id}`}
        editItem={onEdit ? undefined : `/sale-countries/update/${row.original.id}`}
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
