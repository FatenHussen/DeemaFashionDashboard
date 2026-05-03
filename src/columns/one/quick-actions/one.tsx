import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { Iconify } from '@/shared/components/iconify';
import { TableActiveBadge } from '@/shared/components/table-status-badges';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const RowSchema = z.object({ id: z.number() }).passthrough();

export interface QuickActionRow {
  id: number;
  title: string;
  button_text?: string | { en?: string; ar?: string };
  page?: { id: number; title: string; slug: string };
  icon: string;
  order: number;
  is_active: boolean;
  created_at?: string;
  [key: string]: unknown;
}

const formatSimpleDate = (value?: string) => {
  if (!value) return '-';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

const formatQuickActionButtonText = (raw: QuickActionRow['button_text']) => {
  if (raw == null || raw === '') return '';
  if (typeof raw === 'string') return raw.trim();
  const en = raw.en?.trim() ?? '';
  const ar = raw.ar?.trim() ?? '';
  if (en && ar) return `${en} · ${ar}`;
  return en || ar || '';
};

export const quickActionColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null
): ColumnDef<QuickActionRow>[] => [
  {
    id: 'icon',
    accessorKey: 'icon',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('form.quickActionColBackgroundImage')} />
    ),
    cell: ({ row }) => {
      const src = row.original.icon;
      return (
        <div className="flex items-center gap-2">
          {src ? (
            <img
              src={src}
              alt=""
              className="h-9 w-9 rounded-lg border border-border/60 object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-lg bg-muted border border-border/60 flex items-center justify-center">
              <Iconify icon="solar:gallery-bold" width={18} className="text-muted-foreground" />
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.title')} />,
    cell: ({ row }) => (
      <span className="text-sm font-medium text-foreground line-clamp-2">{row.original.title}</span>
    ),
  },
  {
    id: 'button_text',
    accessorFn: (row) => formatQuickActionButtonText(row.button_text),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('form.quickActionColButtonText')} />
    ),
    cell: ({ row }) => {
      const label = formatQuickActionButtonText(row.original.button_text);
      return (
        <span className="text-sm text-muted-foreground line-clamp-2">
          {label || '—'}
        </span>
      );
    },
  },
  {
    id: 'page',
    accessorKey: 'page',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.page')} />,
    cell: ({ row }) => {
      const p = row.original.page;
      return (
        <div className="flex flex-col gap-0.5 text-sm">
          <span className="font-medium text-foreground">{p?.title ?? '—'}</span>
          {p?.slug ? (
            <span className="text-xs text-muted-foreground font-mono">{p.slug}</span>
          ) : null}
        </div>
      );
    },
  },
  {
    id: 'order',
    accessorKey: 'order',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.order')} />,
    cell: ({ row }) => {
      const order = row.original.order;
      return (
        <div className="flex items-center gap-1.5">
          <Iconify icon="solar:sort-vertical-bold" className="text-muted-foreground" width={16} height={16} />
          <span className="text-sm font-medium text-foreground">{order ?? 0}</span>
        </div>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      return (
        <TableActiveBadge
          isActive={isActive}
          activeLabel={t('active')}
          inactiveLabel={t('inactive')}
        />
      );
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.createdAt')} />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Iconify
          icon="solar:calendar-date-bold"
          className="text-muted-foreground flex-shrink-0"
          width={16}
          height={16}
        />
        <span className="text-sm text-muted-foreground">{formatSimpleDate(row.original.created_at)}</span>
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={RowSchema}
        row={row}
        viewDetails={`/quick-actions/update/${row.original.id}`}
        editItem={`/quick-actions/update/${row.original.id}`}
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
