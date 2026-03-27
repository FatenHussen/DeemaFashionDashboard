import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { ComplaintItem } from '@/pages/dashboard/complaints/types/complaint.types';

import { z } from 'zod';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';
import {
  translateComplaintType,
  translateComplaintStatus,
} from '@/pages/dashboard/complaints/utils/labels';

import i18n from 'src/lib/i18n';

const ComplaintSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  message: z.string(),
  status: z.string(),
  type: z.string(),
  admin_response: z.string().nullable(),
  images: z.array(z.string()),
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    phone: z.string().nullable(),
    created_at: z.string(),
  }),
  created_at: z.string(),
});

export interface ComplaintFormValues extends ComplaintItem {
  [key: string]: any;
}

export const complaintColumns = (
  permissions: { update: boolean },
  t: TFunction<'table'>,
  detailsPath: string
): ColumnDef<ComplaintFormValues>[] => [
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
    id: 'order_id',
    accessorKey: 'order_id',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.orderRef')} />,
    cell: ({ row }) => (
      <span className="text-sm font-medium">#{row.original.order_id}</span>
    ),
  },
  {
    id: 'message',
    accessorKey: 'message',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.message')} />,
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        <span className="text-sm text-muted-foreground truncate block" title={row.original.message}>
          {row.original.message || '-'}
        </span>
      </div>
    ),
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.type')} />,
    cell: ({ row }) => (
      <span className="text-sm">{translateComplaintType(row.original.type, t)}</span>
    ),
  },
  {
    id: 'user',
    accessorKey: 'user',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.user')} />,
    cell: ({ row }) => (
      <div className="text-sm">
        <div className="font-medium">{row.original.user?.name || '-'}</div>
        <div className="text-muted-foreground text-xs">{row.original.user?.email}</div>
      </div>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const status = row.original.status;
      const variant =
        status === 'new'
          ? 'bg-amber-500/20 text-amber-600'
          : status === 'resolved'
            ? 'bg-green-500/20 text-green-600'
            : 'bg-red-500/20 text-red-600';
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variant}`}>
          {translateComplaintStatus(status, t)}
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
        {new Date(row.original.created_at).toLocaleDateString(
          i18n.language === 'ar' ? 'ar' : undefined,
          { dateStyle: 'medium' }
        )}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={ComplaintSchema}
        row={row}
        viewDetails={`${detailsPath}/${row.original.id}`}
        editItem={`${detailsPath}/${row.original.id}`}
        permissions={{
          update: permissions.update,
          delete: false,
        }}
      />
    ),
  },
];
