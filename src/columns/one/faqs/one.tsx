import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { FaqItem } from '@/pages/dashboard/content/types/faq.types';

import { z } from 'zod';
import { formatTranslated } from '@/utils/format-translated';
import { faqTypeLabel } from '@/pages/dashboard/content/utils/faq-type-label';
import { TableTonedStatusPill } from '@/shared/components/table-status-badges';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const FaqSchema = z.object({ id: z.number() });

export interface FaqFormValues extends FaqItem {
  [key: string]: any;
}

const TYPE_PILL: Record<string, { icon: string; className: string }> = {
  orders: { icon: 'solar:cart-bold', className: 'border-blue-800 bg-blue-600' },
  delivery: { icon: 'solar:delivery-bold', className: 'border-emerald-800 bg-emerald-600' },
  payments: { icon: 'solar:wallet-bold', className: 'border-amber-800 bg-amber-500' },
  account: { icon: 'solar:user-bold', className: 'border-violet-800 bg-violet-600' },
  'stores&drivers': { icon: 'solar:shop-bold', className: 'border-orange-800 bg-orange-600' },
  'stores & drivers': { icon: 'solar:shop-bold', className: 'border-orange-800 bg-orange-600' },
  other: { icon: 'solar:question-circle-bold', className: 'border-slate-600 bg-slate-500' },
};

export const faqColumns = (
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null
): ColumnDef<FaqFormValues>[] => [
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.type')} />,
    cell: ({ row }) => {
      const type = row.original.type;
      const cfg = TYPE_PILL[type] ?? TYPE_PILL.other;
      return (
        <TableTonedStatusPill icon={cfg.icon} className={cfg.className}>
          {faqTypeLabel(t, type)}
        </TableTonedStatusPill>
      );
    },
  },
  {
    id: 'question',
    accessorKey: 'question',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.question')} />,
    cell: ({ row }) => (
      <p className="max-w-sm text-sm text-foreground line-clamp-2">{row.original.question}</p>
    ),
  },
  {
    id: 'answer',
    accessorKey: 'answer',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.answer')} />,
    cell: ({ row }) => (
      <p className="max-w-sm text-sm text-muted-foreground line-clamp-2">{formatTranslated(row.original.answer)}</p>
    ),
  },
  createToggleColumn<FaqFormValues>({ entityType: 'faq' }),
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={FaqSchema}
        row={row}
        viewDetails={`/faqs/update/${row.original.id}`}
        editItem={`/faqs/update/${row.original.id}`}
        onDelete={onDelete}
        isDeleting={isDeleting}
        isDeleteDialogOpen={isDeleteDialogOpen}
        onDeleteConfirm={onDeleteConfirm}
        onDeleteCancel={onDeleteCancel}
        deletingId={deletingId}
        permissions={{ update: true, delete: true }}
      />
    ),
  },
];
