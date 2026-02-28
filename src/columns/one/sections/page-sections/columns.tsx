import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { formatTranslated } from '@/utils/format-translated';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const PageSectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.enum(['api', 'manual']),
  position: z.enum(['before', 'after']),
  order: z.number(),
  display_type_id: z.number(),
});

export interface PageSectionFormValues {
  id: number;
  name: string;
  type: 'api' | 'manual';
  position: 'before' | 'after';
  order: number;
  display_type_id: number;
  background_color?: string | null;
  background_card_color?: string | null;
  [key: string]: any;
}

export const pageSectionColumns = (
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
): ColumnDef<PageSectionFormValues>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <div className="font-medium">{row.original.id}</div>,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => <div className="font-medium">{formatTranslated(row.original.name)}</div>,
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <div
          className={`text-xs px-2 py-1 rounded-full w-fit uppercase ${
            type === 'api'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
          }`}
        >
          {type}
        </div>
      );
    },
  },
  {
    id: 'position',
    accessorKey: 'position',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Position" />,
    cell: ({ row }) => {
      const position = row.original.position;
      return (
        <div
          className={`text-xs px-2 py-1 rounded-full w-fit uppercase ${
            position === 'before'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
          }`}
        >
          {position}
        </div>
      );
    },
  },
  {
    id: 'order',
    accessorKey: 'order',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
    cell: ({ row }) => <div className="font-medium">{row.original.order}</div>,
  },
  {
    id: 'display_type_id',
    accessorKey: 'display_type_id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Display Type" />,
    cell: ({ row }) => <div className="font-medium">{row.original.display_type_id}</div>,
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={PageSectionSchema}
        row={row}
        editItem={`/sections/page-sections/update/${row.original.id}`}
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
