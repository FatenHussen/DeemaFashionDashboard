import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const CountrySchema = z.object({
  id: z.number(),
  name: z.any(),
  code: z.string(),
  is_active: z.number().optional(),
});

export interface CountryTableItem {
  id: number;
  name: any;
  code: string;
  is_active?: number;
}

export const countryColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void
): ColumnDef<CountryTableItem>[] => [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => {
      const name = row.original.name;
      const display = typeof name === 'string' ? name : name?.en || name?.ar || '—';
      return <span className="font-semibold text-foreground">{display}</span>;
    },
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.code')} />,
    cell: ({ row }) => (
      <span className="px-2 py-1 rounded-md bg-muted text-sm font-mono">{row.original.code}</span>
    ),
  },
  // {
  //   id: 'status',
  //   accessorKey: 'is_active',
  //   header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
  //   cell: ({ row }) => (
  //     <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
  //       {row.original.is_active ? t('active') : t('inactive')}
  //     </span>
  //   ),
  // },
  ...(permissions.update
    ? [createToggleColumn<CountryTableItem>({ entityType: 'country' })]
    : []),
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={CountrySchema}
        row={row}
        viewDetails={`/countries/update/${row.original.id}`}
        editItem={onEdit ? undefined : `/countries/update/${row.original.id}`}
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
