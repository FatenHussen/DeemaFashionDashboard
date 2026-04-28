import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { ComplaintItem } from '@/pages/dashboard/complaints/types/complaint.types';

import { z } from 'zod';
import { TableTonedStatusPill } from '@/shared/components/table-status-badges';
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
      const cfg =
        status === 'new'
          ? { icon: 'solar:letter-unread-bold', className: 'border-amber-700 bg-amber-500' }
          : status === 'resolved'
            ? { icon: 'solar:check-circle-bold', className: 'border-emerald-800 bg-emerald-600' }
            : { icon: 'solar:close-circle-bold', className: 'border-red-800 bg-red-600' };
      return (
        <TableTonedStatusPill icon={cfg.icon} className={cfg.className}>
          {translateComplaintStatus(status, t)}
        </TableTonedStatusPill>
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
