import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { VendorSubscriptionListItem } from '@/pages/dashboard/vendor/types/vendor-subscription.types';

import { z } from 'zod';
import { formatTranslated } from '@/utils/format-translated';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const VendorSubscriptionSchema = z.object({ id: z.number() });

export interface VendorSubscriptionFormValues extends VendorSubscriptionListItem {
  [key: string]: any;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/10 text-green-600 border-green-500/20',
  expired: 'bg-red-500/10 text-red-600 border-red-500/20',
  cancelled: 'bg-neutral-500/10 text-neutral-600 border-neutral-500/20',
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
};

export const vendorSubscriptionColumns = (
  _t: TFunction<'table'>
): ColumnDef<VendorSubscriptionFormValues>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => (
      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
        <span className="text-xs font-semibold text-primary">{row.original.id}</span>
      </div>
    ),
  },
  {
    id: 'shop_name',
    accessorKey: 'shop_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Shop" />,
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.shop_name}</span>
    ),
  },
  {
    id: 'package',
    accessorKey: 'package',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Package" />,
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary border-primary/20">
        {formatTranslated(row.original.package?.name) || '-'}
      </span>
    ),
  },
  {
    id: 'starts_at',
    accessorKey: 'starts_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Starts" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.starts_at}</span>
    ),
  },
  {
    id: 'ends_at',
    accessorKey: 'ends_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ends" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.ends_at}</span>
    ),
  },
  {
    id: 'auto_renew',
    accessorKey: 'auto_renew',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Auto Renew" />,
    cell: ({ row }) =>
      row.original.auto_renew ? (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-600">
          Yes
        </span>
      ) : (
        <span className="text-muted-foreground text-xs">No</span>
      ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? STATUS_COLORS.pending}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.created_at}</span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={VendorSubscriptionSchema}
        row={row}
        viewDetails={`/vendor-subscriptions/${row.original.id}`}
        permissions={{ update: false, delete: false }}
      />
    ),
  },
];
