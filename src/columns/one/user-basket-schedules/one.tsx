import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { TableActiveBadge } from '@/shared/components/table-status-badges';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const UserBasketScheduleRowSchema = z.object({
  id: z.number(),
  user: z.any(),
  name: z.string(),
  is_active: z.union([z.boolean(), z.number()]),
});

export interface UserBasketScheduleTableItem {
  id: number;
  user: { id: number; name: string; email?: string; phone?: string };
  name: string;
  items_preview?: string | string[] | null;
  num_varieties: number;
  original_price: number;
  final_price: number;
  discount_value: string;
  discount_type: string;
  discount_amount?: number;
  schedule: { id: number; name: string; interval_days: number };
  start_date: string;
  next_run_date: string;
  is_active: boolean | number;
}

export const userBasketScheduleColumns = (
  t: TFunction<'table'>,
  rowActions?: {
    permissions: { update: boolean; delete: boolean };
    onDisable: (id: number) => void | Promise<void>;
    onEnable: (id: number) => void | Promise<void>;
    pendingId?: number | string | null;
  }
): ColumnDef<UserBasketScheduleTableItem>[] => [
  {
    id: 'user',
    accessorKey: 'user',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.user')} />,
    cell: ({ row }) => {
      const u = row.original.user;
      return (
        <div>
          <span className="font-semibold text-foreground">{u?.name || '—'}</span>
          {u?.email && (
            <>
              <br />
              <span className="text-xs text-muted-foreground">{u.email}</span>
            </>
          )}
          {u?.phone && (
            <>
              <br />
              <span className="text-xs text-muted-foreground">{u.phone}</span>
            </>
          )}
        </div>
      );
    },
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('form.basketLabel')} />,
    cell: ({ row }) => <span className="text-sm font-medium">{row.original.name || '—'}</span>,
  },
  {
    id: 'items_preview',
    accessorKey: 'items_preview',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.itemsPreview')} />
    ),
    cell: ({ row }) => {
      const v = row.original.items_preview;
      if (v == null) return <span className="text-sm text-muted-foreground">—</span>;
      const text = Array.isArray(v) ? v.filter(Boolean).join(', ') : String(v).trim();
      return (
        <span
          className="text-sm text-muted-foreground line-clamp-2 max-w-[min(100%,14rem)]"
          title={text}
        >
          {text || '—'}
        </span>
      );
    },
  },
  {
    id: 'num_varieties',
    accessorKey: 'num_varieties',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.varieties')} />,
    cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.num_varieties ?? '—'}</span>,
  },
  {
    id: 'original_price',
    accessorKey: 'original_price',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.originalPrice')} />,
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{row.original.original_price ?? '—'}</span>
    ),
  },
  {
    id: 'discount_amount',
    accessorKey: 'discount_amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.discountAmount')} />,
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-orange-700">
        {row.original.discount_amount != null ? row.original.discount_amount : '—'}
      </span>
    ),
  },
  {
    id: 'final_price',
    accessorKey: 'final_price',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.finalPrice')} />,
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-primary tabular-nums">{row.original.final_price ?? '—'}</span>
    ),
  },
  {
    id: 'discount',
    accessorKey: 'discount_value',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.discount')} />,
    cell: ({ row }) => {
      const d = row.original;
      const text =
        d.discount_type === 'percentage'
          ? `${d.discount_value}%`
          : d.discount_value ?? '—';
      return (
        <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-xs font-medium">
          {text}
        </span>
      );
    },
  },
  {
    id: 'schedule',
    accessorKey: 'schedule',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('form.scheduleLabel')} />,
    cell: ({ row }) => {
      const s = row.original.schedule;
      if (!s) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="text-sm">
          <div>{s.name || '—'}</div>
          <div className="text-xs text-muted-foreground">
            {t('columns.everyNDays', { count: s.interval_days })}
          </div>
        </div>
      );
    },
  },
  {
    id: 'start_date',
    accessorKey: 'start_date',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.startDate')} />,
    cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.start_date || '—'}</span>,
  },
  {
    id: 'next_run_date',
    accessorKey: 'next_run_date',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.nextRunDate')} />,
    cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.next_run_date || '—'}</span>,
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
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={UserBasketScheduleRowSchema}
        row={row}
        permissions={rowActions?.permissions ?? { update: false, delete: false }}
        enableDisableHandlers={
          rowActions
            ? {
                onDisable: rowActions.onDisable,
                onEnable: rowActions.onEnable,
                pendingId: rowActions.pendingId,
                disableLabel: t('disableUserBasketSchedule'),
                enableLabel: t('enableUserBasketSchedule'),
              }
            : undefined
        }
      />
    ),
  },
];
