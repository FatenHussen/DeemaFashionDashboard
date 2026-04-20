import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const LanguageSchema = z.object({
  id: z.number(),
  code: z.string(),
  native_name: z.string(),
  direction: z.enum(['ltr', 'rtl']),
  is_active: z.boolean(),
  is_default: z.boolean(),
  order: z.number(),
  flag_icon: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export interface LanguageFormValues {
  id: number;
  code: string;
  native_name: string;
  direction: 'ltr' | 'rtl';
  is_active: boolean;
  is_default: boolean;
  order: number;
  flag_icon: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export const languageColumns = (
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
  deletingId?: number | null
): ColumnDef<LanguageFormValues>[] => [
  {
    id: 'flag_icon',
    accessorKey: 'flag_icon',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.flag')} />,
    cell: ({ row }) => <div className="text-2xl">{row.original.flag_icon}</div>,
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.code')} />,
    cell: ({ row }) => <div className="font-medium uppercase">{row.original.code}</div>,
  },
  {
    id: 'native_name',
    accessorKey: 'native_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.nativeName')} />,
    cell: ({ row }) => <div className="font-medium">{row.original.native_name}</div>,
  },
  {
    id: 'direction',
    accessorKey: 'direction',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.direction')} />,
    cell: ({ row }) => (
      <div className="text-sm uppercase font-medium">{row.original.direction}</div>
    ),
  },
  {
    id: 'order',
    accessorKey: 'order',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.orderRef')} />,
    cell: ({ row }) => <div className="text-sm">{row.original.order}</div>,
  },
  {
    id: 'is_default',
    accessorKey: 'is_default',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.default')} />,
    cell: ({ row }) => {
      const isDefault = row.original.is_default;
      return isDefault ? (
        <div className="text-xs px-2 py-1 rounded-full w-fit bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          Default
        </div>
      ) : null;
    },
  },
  {
    id: 'status',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      return (
        <div
          className={`text-xs px-2 py-1 rounded-full w-fit ${
            isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {isActive ? t('active') : t('inactive')}
        </div>
      );
    },
  },
  ...(permissions.update
    ? [createToggleColumn<LanguageFormValues>({ entityType: 'language' })]
    : []),
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={LanguageSchema}
        row={row}
        viewDetails={`/languages/update/${row.original.id}`}
        editItem={`/languages/update/${row.original.id}`}
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
