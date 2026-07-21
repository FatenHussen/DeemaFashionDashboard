import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { ContactMethodItem } from '@/pages/dashboard/contact-methods/types/contact-method.types';

import { z } from 'zod';
import { TableTonedStatusPill } from '@/shared/components/table-status-badges';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';
import { contactMethodTypeLabel } from '@/pages/dashboard/contact-methods/utils/contact-method-type-label';

const RowSchema = z.object({ id: z.number() });

export interface ContactMethodFormValues extends ContactMethodItem {
  [key: string]: unknown;
}

const TYPE_PILL: Record<string, { icon: string; className: string }> = {
  number: { icon: 'solar:phone-bold', className: 'border-sky-800 bg-sky-600' },
  email: { icon: 'solar:letter-bold', className: 'border-violet-800 bg-violet-600' },
  url: { icon: 'solar:link-bold', className: 'border-emerald-800 bg-emerald-600' },
  whts: { icon: 'solar:chat-round-dots-bold', className: 'border-green-800 bg-green-600' },
};

export const contactMethodColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null
): ColumnDef<ContactMethodFormValues>[] => [
  {
    id: 'icon',
    accessorKey: 'icon',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.image')} />,
    cell: ({ row }) => {
      const src = row.original.icon;
      if (!src)
        return <span className="text-xs text-muted-foreground">{t('form.emptyEmDash')}</span>;
      return (
        <img
          src={src}
          alt=""
          className="h-9 w-9 rounded-lg border border-border object-cover"
        />
      );
    },
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.type')} />,
    cell: ({ row }) => {
      const type = row.original.type;
      const cfg = TYPE_PILL[type] ?? TYPE_PILL.url;
      return (
        <TableTonedStatusPill icon={cfg.icon} className={cfg.className}>
          {contactMethodTypeLabel(t, type)}
        </TableTonedStatusPill>
      );
    },
  },
  {
    id: 'value',
    accessorKey: 'value',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.value')} />,
    cell: ({ row }) => (
      <span className="max-w-xs truncate text-sm font-medium dir-ltr text-start" dir="ltr">
        {row.original.value}
      </span>
    ),
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.createdAt')} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.created_at ?? '—'}</span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: { row: { original: ContactMethodFormValues } }) => (
      <DataTableRowActions
        schema={RowSchema}
        row={row as any}
        viewDetails={`/contact-methods/update/${row.original.id}`}
        editItem={`/contact-methods/update/${row.original.id}`}
        onDelete={onDelete}
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
