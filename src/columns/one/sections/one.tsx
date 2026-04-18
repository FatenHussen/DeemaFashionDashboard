import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { formatTranslated } from '@/utils/format-translated';
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
      return (
        <div
          className={`text-xs px-2 py-1 rounded-full w-fit ${
            type === 'api'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
          }`}
        >
          {sectionTypeLabel(t, type)}
        </div>
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
