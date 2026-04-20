import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { Iconify } from '@/shared/components/iconify';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

// Schema for admin validation
const AdminSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  is_active: z.union([z.number(), z.boolean()]),
  roles: z.array(z.string()),
  created_at: z.string(),
});

// Type for admin data
export interface AdminFormValues {
  id: number;
  name: string;
  email: string;
  is_active: number | boolean;
  roles: string[];
  created_at: string;
  [key: string]: any;
}

export const adminColumns = (
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
  deletingId?: number | null,
  onUpdatePassword?: (row: { original: AdminFormValues }) => void
): ColumnDef<AdminFormValues>[] => [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Iconify icon="solar:user-rounded-bold" className="text-primary" width={18} height={18} />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-foreground truncate">{row.original.name}</div>
        </div>
      </div>
    ),
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.email')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <Iconify icon="solar:letter-bold" className="text-muted-foreground flex-shrink-0" width={16} height={16} />
        <span className="text-sm text-muted-foreground truncate">{row.original.email}</span>
      </div>
    ),
  },
  {
    id: 'roles',
    accessorKey: 'roles',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.roles')} />,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1.5">
        {row.original.roles?.map((role, index) => (
          <span
            key={index}
            className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-medium"
          >
            {role}
          </span>
        ))}
        {(!row.original.roles || row.original.roles.length === 0) && (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </div>
    ),
  },
  {
    id: 'status',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const isActive = Boolean(row.original.is_active);
      return (
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border w-fit ${
            isActive
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300'
          }`}
        >
          <Iconify
            icon={isActive ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
            width={14}
            height={14}
            className="flex-shrink-0"
          />
          <span className="text-xs font-medium">{isActive ? t('active') : t('inactive')}</span>
        </div>
      );
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.createdAt')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Iconify icon="solar:calendar-date-bold" className="text-muted-foreground flex-shrink-0" width={16} height={16} />
        <span className="text-sm text-muted-foreground">{row.original.created_at}</span>
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={AdminSchema}
        row={row}
        viewDetails={`/admin/details/${row.original.id}`}
        editItem={`/admin/update/${row.original.id}`}
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
