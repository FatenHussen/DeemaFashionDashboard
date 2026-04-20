import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { CurrencyData } from '@/pages/dashboard/currencies/types/currency.types';

import { z } from 'zod';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const CurrencySchema = z.object({
  id: z.number(),
  code: z.string(),
  symbol: z.string(),
  exchange_rate: z.number(),
  is_default: z.boolean(),
  is_active: z.boolean(),
  created_at: z.string(),
});

export interface CurrencyFormValues extends CurrencyData {
  [key: string]: any;
}

export const currencyColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void
): ColumnDef<CurrencyFormValues>[] => [
  {
    id: 'code',
    accessorKey: 'code',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.code')} />,
    cell: ({ row }) => <code className="px-2 py-1 rounded bg-muted text-sm font-mono">{row.original.code}</code>,
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
    id: 'symbol',
    accessorKey: 'symbol',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.symbol')} />,
    cell: ({ row }) => <span className="text-lg font-medium">{row.original.symbol}</span>,
  },
  {
    id: 'exchange_rate',
    accessorKey: 'exchange_rate',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.rate')} />,
    cell: ({ row }) => <span className="text-sm font-mono">{row.original.exchange_rate}</span>,
  },
  {
    id: 'is_default',
    accessorKey: 'is_default',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.default')} />,
    cell: ({ row }) => row.original.is_default ? (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-600">{t('columns.default')}</span>
    ) : <span className="text-muted-foreground text-xs">-</span>,
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${row.original.is_active ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
        {row.original.is_active ? t('active') : t('inactive')}
      </span>
    ),
  },
  ...(permissions.update
    ? [createToggleColumn<CurrencyFormValues>({ entityType: 'currency' })]
    : []),
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={CurrencySchema}
        row={row}
        editItem={onEdit ? undefined : `/currencies/update/${row.original.id}`}
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
