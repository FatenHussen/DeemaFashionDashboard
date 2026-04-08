import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { UserItem } from '@/pages/dashboard/users/types/user.types';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  affiliate: z.object({
    is_affiliate: z.boolean(),
    affiliate_approved: z.boolean(),
    affiliate_id: z.union([z.number(), z.string()]).nullable(),
    affiliate_rate: z.union([z.number(), z.string()]).nullable().optional(),
  }).optional(),
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
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.id')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="text-xs font-semibold text-primary">{row.original.id}</span>
        </div>
      </div>
    ),
  },
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
    id: 'affiliate',
    accessorKey: 'affiliate',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.affiliate')} />,
    cell: ({ row }) => {
      const aff = row.original.affiliate;
      const isAff = aff?.is_affiliate ?? false;
      const approved = aff?.affiliate_approved ?? false;
      const label = !isAff ? 'No' : approved ? 'Approved' : 'Pending';
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
        adminToggleEntityType="user"
        permissions={permissions}
      />
    ),
  },
];
