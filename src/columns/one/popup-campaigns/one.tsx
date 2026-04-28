import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { PopupCampaignListItem } from '@/pages/dashboard/popup-campaigns/types';

import { z } from 'zod';
import { Iconify } from '@/shared/components/iconify';
import { TableTonedStatusPill } from '@/shared/components/table-status-badges';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const RowSchema = z.object({ id: z.number() }).passthrough();

export type PopupCampaignRow = PopupCampaignListItem;

function rowTitle(row: PopupCampaignRow): string {
  const t = row.title;
  if (typeof t === 'string') return t;
  if (t && typeof t === 'object' && 'en' in t) {
    return (t as { en?: string; ar?: string }).en || (t as { en?: string; ar?: string }).ar || '';
  }
  return '';
}

function rowHeadline(row: PopupCampaignRow): string {
  const h = row.headline;
  if (!h) return '';
  if (typeof h === 'string') return h;
  if (typeof h === 'object' && 'en' in h) {
    return (h as { en?: string; ar?: string }).en || (h as { en?: string; ar?: string }).ar || '';
  }
  return '';
}

export const popupCampaignColumns = (
  permissions: { update: boolean; delete: boolean },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null
): ColumnDef<PopupCampaignRow>[] => [
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.title')} />,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 min-w-0 max-w-[240px]">
        <span className="text-sm font-medium text-foreground line-clamp-2">{rowTitle(row.original)}</span>
        {rowHeadline(row.original) ? (
          <span className="text-xs text-muted-foreground line-clamp-1">{rowHeadline(row.original)}</span>
        ) : null}
      </div>
    ),
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.type')} />,
    cell: ({ row }) => (
      <span className="text-xs font-mono text-muted-foreground">{String(row.original.type ?? '—')}</span>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const s = String(row.original.status ?? '');
      const active = s === 'active';
      if (!s) {
        return <span className="text-xs text-muted-foreground">—</span>;
      }
      return (
        <TableTonedStatusPill
          icon={active ? 'solar:check-circle-bold' : 'solar:clock-circle-bold'}
          className={
            active
              ? 'border-emerald-800 bg-emerald-600'
              : 'border-slate-600 bg-slate-500'
          }
        >
          {s}
        </TableTonedStatusPill>
      );
    },
  },
  {
    id: 'priority',
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.priority')} />
    ),
    cell: ({ row }) => (
      <span className="text-xs font-mono text-muted-foreground">
        {String(row.original.priority ?? 0)}
      </span>
    ),
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
        <span className="text-sm text-muted-foreground">{row.original.created_at ?? '—'}</span>
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={RowSchema}
        row={row}
        viewDetails={`/popup-campaigns/update/${row.original.id}`}
        editItem={`/popup-campaigns/update/${row.original.id}`}
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
