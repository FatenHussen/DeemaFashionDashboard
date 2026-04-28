import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { FlashSaleListItem } from '@/pages/dashboard/flash-sales/types';

import { z } from 'zod';
import { Iconify } from '@/shared/components/iconify';
import { TableActiveBadge } from '@/shared/components/table-status-badges';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const RowSchema = z.object({ id: z.number() }).passthrough();

export type FlashSaleRow = FlashSaleListItem;

const formatSimpleDate = (value?: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

export const flashSaleColumns = (
  permissions: { update: boolean },
  t: TFunction<'table'>,
  onEditNavigate?: (row: FlashSaleRow) => void
): ColumnDef<FlashSaleRow>[] => [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => (
      <span className="text-sm font-medium text-foreground line-clamp-2 max-w-[280px]">
        {row.original.name ?? '—'}
      </span>
    ),
  },
  {
    id: 'discount',
    accessorKey: 'discount',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.discount')} />,
    cell: ({ row }) => {
      const d = row.original.discount;
      const rawType = row.original.discount_type;
      const isPercent = rawType === 'percent';
      if (Number.isNaN(Number(d))) {
        return <span className="text-sm text-muted-foreground">—</span>;
      }
      const n = Number(d);
      return (
        <span className="text-sm font-medium text-foreground">
          {isPercent ? `${n}%` : String(n)}
        </span>
      );
    },
  },
  {
    id: 'end_date',
    accessorKey: 'end_date',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.endDate')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Iconify
          icon="solar:calendar-date-bold"
          className="text-muted-foreground flex-shrink-0"
          width={16}
          height={16}
        />
        <span className="text-sm text-muted-foreground">{formatSimpleDate(row.original.end_date)}</span>
      </div>
    ),
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const active = Boolean(row.original.is_active);
      return (
        <TableActiveBadge
          isActive={active}
          activeLabel={t('form.flashSaleStatusActive')}
          inactiveLabel={t('form.flashSaleStatusInactive')}
        />
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={RowSchema}
        row={row}
        onEdit={onEditNavigate ? () => onEditNavigate(row.original) : undefined}
        permissions={{ update: permissions.update, delete: false }}
      />
    ),
  },
];
