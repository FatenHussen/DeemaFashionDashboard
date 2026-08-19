import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { TableTonedStatusPill } from '@/shared/components/table-status-badges';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { sectionTypeLabel } from '@/pages/dashboard/sections/utils/section-type-label';
import { contentTypeLabel } from '@/pages/dashboard/sections/utils/content-type-config';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const SectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.enum(['api', 'manual']),
});

export interface SectionFormValues {
  id: number;
  name: string;
  type: 'api' | 'manual';
  content_type?: string;
  variant?: string | null;
  background_color?: string | null;
  background_card_color?: string | null;
  pages_count?: number;
  [key: string]: any;
}

const sectionTypePill: Record<SectionFormValues['type'], { icon: string; className: string }> = {
  api: {
    icon: 'solar:code-bold',
    className: 'border-blue-800 bg-blue-600 dark:border-blue-300',
  },
  manual: {
    icon: 'solar:book-bookmark-bold',
    className: 'border-violet-800 bg-violet-600 dark:border-violet-300',
  },
};

function ColorDot({ color }: { color?: string | null }) {
  if (!color) return null;
  return (
    <span
      className="inline-block h-4 w-4 shrink-0 rounded-md border border-border/60"
      style={{ backgroundColor: color }}
    />
  );
}

export const sectionColumns = (
  permissions: {
    update: boolean;
    delete: boolean;
  },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean,
  isDeleteDialogOpen?: boolean,
  onDeleteConfirm?: () => void,
  onDeleteCancel?: () => void,
  deletingId?: number | null
): ColumnDef<SectionFormValues>[] => [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => <div className="font-medium">{formatTranslated(row.original.name)}</div>,
  },
  {
    id: 'content_type',
    accessorKey: 'content_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.contentType')} />
    ),
    cell: ({ row }) => {
      const contentType = row.original.content_type;
      if (!contentType) return <span className="text-muted-foreground">—</span>;
      return (
        <span className="inline-flex items-center rounded-full border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
          {contentTypeLabel(t, contentType)}
        </span>
      );
    },
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.type')} />,
    cell: ({ row }) => {
      const type = row.original.type;
      const pill = sectionTypePill[type];
      return (
        <TableTonedStatusPill icon={pill.icon} className={pill.className}>
          {sectionTypeLabel(t, type)}
        </TableTonedStatusPill>
      );
    },
  },
  {
    id: 'variant',
    accessorKey: 'variant',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.variant')} />,
    cell: ({ row }) => {
      const { variant, background_color, background_card_color } = row.original;
      if (!variant && !background_color && !background_card_color) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <div className="flex items-center gap-2">
          {variant && (
            <span className="inline-flex items-center rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {t(`form.pageSectionVariant_${variant}`, { defaultValue: variant })}
            </span>
          )}
          <ColorDot color={background_color} />
          <ColorDot color={background_card_color} />
        </div>
      );
    },
  },
  {
    id: 'pages_count',
    accessorKey: 'pages_count',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.pagesCount')} />
    ),
    cell: ({ row }) => {
      const count = row.original.pages_count;
      if (count == null) return <span className="text-muted-foreground">—</span>;
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
            count > 0
              ? 'border-amber-500/20 bg-amber-500/10 text-amber-600'
              : 'border-border/60 bg-background/80 text-muted-foreground'
          }`}
        >
          <Iconify icon="solar:documents-bold" width={12} />
          {count}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }: any) => {
      // Legacy system feeds (`api` without a library content type) stay read-only.
      const isLegacyApi = row.original.type === 'api' && !row.original.content_type;
      const rowPermissions = isLegacyApi ? { update: false, delete: false } : permissions;
      return (
        <DataTableRowActions
          schema={SectionSchema}
          row={row}
          viewDetails={`/sections/details/${row.original.id}`}
          editItem={isLegacyApi ? undefined : `/sections/update/${row.original.id}`}
          onDelete={isLegacyApi ? undefined : onDelete}
          isDeleting={isDeleting}
          isDeleteDialogOpen={isDeleteDialogOpen}
          onDeleteConfirm={onDeleteConfirm}
          onDeleteCancel={onDeleteCancel}
          deletingId={deletingId}
          permissions={rowPermissions}
        />
      );
    },
  },
];
