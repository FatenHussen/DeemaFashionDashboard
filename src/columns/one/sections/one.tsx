import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { formatTranslated } from '@/utils/format-translated';
import { TableTonedStatusPill } from '@/shared/components/table-status-badges';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { sectionTypeLabel } from '@/pages/dashboard/sections/utils/section-type-label';
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
    id: 'actions',
    cell: ({ row }: any) => {
      const isApiType = row.original.type === 'api';
      const rowPermissions = isApiType
        ? { update: false, delete: false }
        : permissions;
      return (
        <DataTableRowActions
          schema={SectionSchema}
          row={row}
          viewDetails={`/sections/details/${row.original.id}`}
          editItem={isApiType ? undefined : `/sections/update/${row.original.id}`}
          onDelete={isApiType ? undefined : onDelete}
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
