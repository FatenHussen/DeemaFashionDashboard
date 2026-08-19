import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

// Schema for category attribute validation
const CategoryAttributeSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string(),
  type: z.string(),
});

// Type for category attribute data
export interface CategoryAttributeFormValues {
  id: number;
  name: string;
  category: string;
  type: string;
  [key: string]: any;
}

export const categoryAttributeColumns = (
  permissions: {
    update: boolean;
    delete: boolean;
  },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void
): ColumnDef<CategoryAttributeFormValues>[] => [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Iconify
            icon="solar:tag-bold"
            className="text-primary"
            width={18}
            height={18}
          />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-foreground truncate">{formatTranslated(row.original.name)}</div>
        </div>
      </div>
    ),
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.category')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <Iconify
          icon="solar:diagram-bold"
          className="text-muted-foreground shrink-0"
          width={16}
          height={16}
        />
        <span className="text-sm text-muted-foreground truncate">
          {row.original.category}
        </span>
      </div>
    ),
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.type')} />,
    cell: ({ row }) => {
      const typeColors: Record<string, { bg: string; text: string }> = {
        color: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
        square: { bg: 'bg-green-500/10', text: 'text-green-500' },
        circle: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
      };
      const colors = typeColors[row.original.type] || {
        bg: 'bg-gray-500/10',
        text: 'text-gray-500',
      };
      return (
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border w-fit ${colors.bg} ${colors.text} border-current/20`}
          >
            <Iconify
              icon={
                row.original.type === 'color'
                  ? 'solar:palette-bold'
                  : row.original.type === 'square'
                  ? 'solar:square-bold'
                  : 'solar:circle-bold'
              }
              className="shrink-0"
              width={14}
              height={14}
            />
            <span className="text-xs font-semibold capitalize">{row.original.type}</span>
          </div>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={CategoryAttributeSchema}
        row={row}
        viewDetails={`/categories/attributes/update/${row.original.id}`}
        editItem={`/categories/attributes/update/${row.original.id}`}
        onDelete={onDelete}
        permissions={permissions}
      />
    ),
  },
];

