import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { FlashSaleListItem } from '@/pages/dashboard/flash-sales/types';

import { z } from 'zod';
import { Iconify } from '@/shared/components/iconify';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const RowSchema = z.object({ id: z.number() }).passthrough();

export type FlashSaleRow = FlashSaleListItem;

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
        <span className="text-sm text-muted-foreground">{row.original.end_date ?? '—'}</span>
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
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border w-fit ${
            active
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300'
              : 'bg-muted/40 border-border/60 text-muted-foreground'
          }`}
        >
          <Iconify
            icon={active ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
            width={14}
            height={14}
          />
          <span className="text-xs font-medium">
            {active ? t('form.flashSaleStatusActive') : t('form.flashSaleStatusInactive')}
          </span>
        </div>
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
