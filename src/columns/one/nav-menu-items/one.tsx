import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { NavMenuItem } from '@/pages/dashboard/nav-menu-items/types';

import { z } from 'zod';
import { Switch } from '@/shared/ui/switch';
import { Iconify } from '@/shared/components/iconify';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';
import {
  navMenuTypeLabel,
  navMenuItemTitle,
  navMenuTargetLabel,
} from '@/pages/dashboard/nav-menu-items/utils/nav-menu-labels';

// ----------------------------------------------------------------------

const RowSchema = z.object({ id: z.number() }).passthrough();

export type NavMenuItemRow = NavMenuItem;

/** Tint per destination kind so the bar's make-up is readable at a glance. */
const TYPE_BADGE_CLASS: Record<string, string> = {
  route: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
  category: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30',
  brand: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  page: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  url: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/30',
};

const TYPE_ICON: Record<string, string> = {
  route: 'solar:smartphone-2-bold',
  category: 'solar:widget-4-bold',
  brand: 'solar:tag-bold',
  page: 'solar:document-text-bold',
  url: 'solar:link-bold',
};

export interface NavMenuItemColumnsOptions {
  permissions: { update: boolean; delete: boolean };
  t: TFunction<'table'>;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
  isDeleteDialogOpen?: boolean;
  onDeleteConfirm?: () => void;
  onDeleteCancel?: () => void;
  deletingId?: number | null;
  /** In-table show/hide switch. */
  onToggleActive?: (id: number, nextValue: boolean) => void;
  togglingId?: number | null;
}

export const navMenuItemColumns = ({
  permissions,
  t,
  onDelete,
  isDeleting,
  isDeleteDialogOpen,
  onDeleteConfirm,
  onDeleteCancel,
  deletingId,
  onToggleActive,
  togglingId,
}: NavMenuItemColumnsOptions): ColumnDef<NavMenuItemRow>[] => [
  {
    id: 'order',
    accessorKey: 'order',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.order')} />,
    cell: ({ row }) => (
      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-primary/10 px-1.5 text-xs font-semibold text-primary">
        {row.original.order ?? 0}
      </span>
    ),
  },
  {
    id: 'icon',
    accessorKey: 'icon',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.image')} />,
    cell: ({ row }) => {
      const src = row.original.icon;
      return src ? (
        <img src={src} alt="" className="h-9 w-9 rounded-lg border border-border/60 object-cover" />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted">
          <Iconify icon="solar:gallery-bold" width={18} className="text-muted-foreground" />
        </div>
      );
    },
  },
  {
    id: 'title',
    accessorFn: (row) => navMenuItemTitle(row),
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.title')} />,
    cell: ({ row }) => (
      <span className="line-clamp-2 text-sm font-medium text-foreground">
        {navMenuItemTitle(row.original) || '—'}
      </span>
    ),
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.type')} />,
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-semibold ${
            TYPE_BADGE_CLASS[type] ?? TYPE_BADGE_CLASS.url
          }`}
        >
          <Iconify icon={TYPE_ICON[type] ?? TYPE_ICON.url} width={14} />
          {navMenuTypeLabel(type, t)}
        </span>
      );
    },
  },
  {
    id: 'destination',
    accessorFn: (row) => navMenuTargetLabel(row, t),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('form.navMenuColDestination')} />
    ),
    cell: ({ row }) => {
      const item = row.original;
      const label = navMenuTargetLabel(item, t);
      const isUrl = item.type === 'url';
      return (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span
            className={`truncate text-sm ${
              isUrl ? 'font-mono text-xs text-muted-foreground' : 'font-medium text-foreground'
            }`}
            title={label || undefined}
          >
            {label || '—'}
          </span>
          {isUrl && item.open_in_new_tab ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Iconify icon="solar:arrow-right-up-bold" width={12} />
              {t('form.navMenuOpenInNewTabLabel')}
            </span>
          ) : null}
        </div>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
    cell: ({ row }) => {
      const item = row.original;
      const isActive = Boolean(item.is_active);
      const isPending = togglingId === item.id;
      const canToggle = permissions.update && !!onToggleActive;

      return (
        // The row navigates to the edit screen — keep clicks on the switch local to the switch.
        <div
          className="flex items-center gap-2"
          onClick={(event) => event.stopPropagation()}
          role="presentation"
        >
          <Switch
            checked={isActive}
            disabled={!canToggle || isPending}
            aria-label={t('columns.status')}
            onChange={(event) =>
              onToggleActive?.(item.id, (event.target as HTMLInputElement).checked)
            }
          />
          <span
            className={`text-xs font-medium ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}
          >
            {isActive ? t('active') : t('inactive')}
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
        viewDetails={`/sections/nav-menu-items/update/${row.original.id}`}
        editItem={`/sections/nav-menu-items/update/${row.original.id}`}
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
