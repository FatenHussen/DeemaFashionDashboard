import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { TableActiveBadge } from '@/shared/components/table-status-badges';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const UnitRowSchema = z.object({
  id: z.number(),
  name: z.union([z.object({ en: z.string(), ar: z.string() }), z.string()]),
  name_translations: z.object({ en: z.string().optional(), ar: z.string().optional() }).optional(),
  is_active: z.union([z.boolean(), z.number()]),
});

export interface UnitTableItem {
  id: number;
  name: { en: string; ar: string } | string;
  name_translations?: { en?: string; ar?: string };
  is_active: boolean | number;
  created_at?: string;
  updated_at?: string;
}

const getUnitName = (row: UnitTableItem) => {
  const name = row.name;
  const translations = row.name_translations;
  const fallback = typeof name === 'string' ? name : '';

  return {
    en: typeof name === 'object' && name !== null ? (name.en ?? translations?.en ?? fallback) : (translations?.en ?? fallback),
    ar: typeof name === 'object' && name !== null ? (name.ar ?? translations?.ar ?? fallback) : (translations?.ar ?? fallback),
  };
};

export const unitColumns = (
  t: TFunction<'table'>,
  rowActions?: {
    permissions: { update: boolean; delete: boolean };
    onDelete: (id: number) => void;
    isDeleting?: boolean;
    isDeleteDialogOpen?: boolean;
    onDeleteConfirm?: () => void;
    onDeleteCancel?: () => void;
    deletingId?: number | null;
  }
): ColumnDef<UnitTableItem>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.id')} />,
    cell: ({ row }) => <span className="text-sm font-medium tabular-nums">{row.original.id}</span>,
  },
  {
    id: 'name_en',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.nameEn')} />,
    cell: ({ row }) => <span className="text-sm font-medium">{getUnitName(row.original).en || '—'}</span>,
  },
  {
    id: 'name_ar',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.nameAr')} />,
    cell: ({ row }) => (
      <span className="text-sm" dir="rtl">
        {getUnitName(row.original).ar || '—'}
      </span>
    ),
  },
  {
    id: 'status',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const active = Boolean(row.original.is_active);
      return (
        <TableActiveBadge
          isActive={active}
          activeLabel={t('active')}
          inactiveLabel={t('inactive')}
        />
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <DataTableRowActions
          schema={UnitRowSchema}
          row={row as any}
          viewDetails={`/products/units/update/${id}`}
          editItem={`/products/units/update/${id}`}
          permissions={rowActions?.permissions ?? { update: false, delete: false }}
          onDelete={rowActions?.onDelete}
          isDeleting={rowActions?.isDeleting}
          isDeleteDialogOpen={rowActions?.isDeleteDialogOpen}
          onDeleteConfirm={rowActions?.onDeleteConfirm}
          onDeleteCancel={rowActions?.onDeleteCancel}
          deletingId={rowActions?.deletingId}
        />
      );
    },
  },
];
