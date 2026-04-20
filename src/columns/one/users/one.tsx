import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { UserItem } from '@/pages/dashboard/users/types/user.types';

import { z } from 'zod';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  area: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  affiliate: z
    .object({
      is_affiliate: z.boolean(),
      affiliate_approved: z.boolean(),
      affiliate_id: z.union([z.number(), z.string()]).nullable(),
      affiliate_rate: z.union([z.number(), z.string()]).nullable().optional(),
      affiliate_commission_type: z.string().nullable().optional(),
      affiliate_fixed_commission: z.union([z.number(), z.string()]).nullable().optional(),
      affiliate_product_ids: z.array(z.number()).nullable().optional(),
      affiliate_visit_commission_enabled: z.boolean().optional(),
      affiliate_visit_commission_threshold: z.union([z.number(), z.string()]).nullable().optional(),
      affiliate_visit_commission_amount: z.union([z.number(), z.string()]).nullable().optional(),
      coupon_code: z.string().nullable().optional(),
    })
    .optional(),
  created_at: z.string(),
});

export interface UserFormValues extends UserItem {
  [key: string]: any;
}

export const userColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null,
  onEdit?: (row: any) => void,
  onUpdatePassword?: (row: { original: UserFormValues }) => void
): ColumnDef<UserFormValues>[] => [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => (
      <div className="font-semibold text-foreground truncate">{row.original.name}</div>
    ),
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.email')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.phone')} />,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.phone || '-'}</span>
    ),
  },
  {
    id: 'area',
    accessorKey: 'area',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.area')} />,
    cell: ({ row }) => {
      const area = row.original.area;
      return (
        <span className="text-sm text-foreground max-w-[200px] truncate" title={area ?? undefined}>
          {area?.trim() ? area : '—'}
        </span>
      );
    },
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const isActive = Boolean(row.original.is_active);
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            isActive
              ? 'bg-green-500/20 text-green-700 dark:text-green-400'
              : 'bg-red-500/20 text-red-700 dark:text-red-400'
          }`}
        >
          {isActive ? t('active') : t('inactive')}
        </span>
      );
    },
  },
  {
    id: 'affiliate',
    accessorKey: 'affiliate',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.affiliate')} />,
    cell: ({ row }) => {
      const aff = row.original.affiliate;
      const isAff = aff?.is_affiliate ?? false;
      const approved = aff?.affiliate_approved ?? false;
      const label = !isAff ? t('no') : approved ? t('columns.approved') : t('columns.pending');
      const variant = !isAff
        ? 'bg-muted text-muted-foreground'
        : approved
          ? 'bg-green-500/20 text-green-600'
          : 'bg-amber-500/20 text-amber-600';
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variant}`}
        >
          {label}
        </span>
      );
    },
  },
  {
    id: 'coupon_code',
    accessorFn: (row) => row.affiliate?.coupon_code ?? null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.couponCode')} />
    ),
    cell: ({ row }) => {
      const aff = row.original.affiliate;
      if (!aff?.is_affiliate) {
        return <span className="text-sm text-muted-foreground">—</span>;
      }
      const code = aff.coupon_code;
      return (
        <span className="text-sm font-mono">{code?.trim() ? code : '—'}</span>
      );
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.created')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.created_at
          ? new Date(row.original.created_at).toLocaleDateString()
          : '-'}
      </span>
    ),
  },
  ...(permissions.update
    ? [createToggleColumn<UserFormValues>({ entityType: 'user' })]
    : []),
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={UserSchema}
        row={row}
        viewDetails={`/users/details/${row.original.id}`}
        editItem={onEdit ? undefined : `/users/update/${row.original.id}`}
        onEdit={onEdit}
        onDelete={onDelete}
        onUpdatePassword={onUpdatePassword}
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
