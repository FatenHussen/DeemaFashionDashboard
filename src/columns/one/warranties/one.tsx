import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { TableActiveBadge } from '@/shared/components/table-status-badges';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const WarrantyRowSchema = z.object({
  id: z.number(),
  name: z.union([z.object({ en: z.string(), ar: z.string() }), z.string()]),
  name_translations: z.object({ en: z.string().optional(), ar: z.string().optional() }).optional(),
  description: z
    .union([z.object({ en: z.string().optional(), ar: z.string().optional() }), z.string(), z.null()])
    .optional(),
  description_translations: z.object({ en: z.string().optional(), ar: z.string().optional() }).optional(),
  is_active: z.union([z.boolean(), z.number()]),
});

export interface WarrantyTableItem {
  id: number;
  name: { en: string; ar: string } | string;
  name_translations?: { en?: string; ar?: string };
  description?: { en?: string; ar?: string } | string | null;
  description_translations?: { en?: string; ar?: string };
  is_active: boolean | number;
  created_at?: string;
  updated_at?: string;
}

const clip = (value: string, max = 90) => (value.length > max ? `${value.slice(0, max)}…` : value);

const getTranslatedPair = (
  value: { en?: string; ar?: string } | string | null | undefined,
  translations?: { en?: string; ar?: string }
) => {
  const fallback = typeof value === 'string' ? value : '';
  return {
    en:
      typeof value === 'object' && value !== null
        ? (value.en ?? translations?.en ?? fallback)
        : (translations?.en ?? fallback),
    ar:
      typeof value === 'object' && value !== null
        ? (value.ar ?? translations?.ar ?? fallback)
        : (translations?.ar ?? fallback),
  };
};

export const warrantyColumns = (
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
): ColumnDef<WarrantyTableItem>[] => [
  {
    id: 'name_ar',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.nameAr')} />,
    cell: ({ row }) => (
      <span className="text-sm font-medium" dir="rtl">
        {getTranslatedPair(row.original.name, row.original.name_translations).ar || '—'}
      </span>
    ),
  },
  {
    id: 'name_en',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.nameEn')} />,
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {getTranslatedPair(row.original.name, row.original.name_translations).en || '—'}
      </span>
    ),
  },
  {
    id: 'description_ar',
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.descriptionAr')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground max-w-[280px] block" dir="rtl">
        {clip(getTranslatedPair(row.original.description, row.original.description_translations).ar) || '—'}
      </span>
    ),
  },
  {
    id: 'description_en',
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.descriptionEn')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground max-w-[280px] block">
        {clip(getTranslatedPair(row.original.description, row.original.description_translations).en) || '—'}
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
          schema={WarrantyRowSchema}
          row={row as any}
          viewDetails={`/products/warranties/update/${id}`}
          editItem={`/products/warranties/update/${id}`}
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
