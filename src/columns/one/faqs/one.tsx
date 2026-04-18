import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { FaqItem } from '@/pages/dashboard/content/types/faq.types';

import { z } from 'zod';
import { formatTranslated } from '@/utils/format-translated';
import { faqTypeLabel } from '@/pages/dashboard/content/utils/faq-type-label';
import { createToggleColumn } from '@/shared/ui/table-data/data-table-toggle-cell';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const FaqSchema = z.object({ id: z.number() });

export interface FaqFormValues extends FaqItem {
  [key: string]: any;
}

const TYPE_COLORS: Record<string, string> = {
  orders: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  delivery: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  payments: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  account: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  'stores&drivers': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'stores & drivers': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  other: 'bg-muted text-muted-foreground border-border',
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
      return (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[type] ?? TYPE_COLORS.other}`}
        >
          {faqTypeLabel(t, type)}
        </span>
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
