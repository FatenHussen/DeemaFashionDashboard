import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { z } from 'zod';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

// Schema for area validation
const AreaSchema = z.object({
  id: z.number(),
  name: z.string(),
  city: z.object({
    id: z.number(),
    name: z.string(),
    governorate: z.object({
      id: z.number(),
      name: z.string(),
      created_at: z.string(),
    }),
    created_at: z.string(),
  }),
  created_at: z.string(),
});

// Type for area data
export interface AreaFormValues {
  id: number;
  name: string;
  city: {
    id: number;
    name: string;
    governorate: {
      id: number;
      name: string;
      created_at: string;
    };
    created_at: string;
  };
  created_at: string;
  [key: string]: any;
}

export const areaColumns = (
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
): ColumnDef<AreaFormValues>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="text-xs font-semibold text-primary">{row.original.id}</span>
        </div>
      </div>
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Iconify
            icon="solar:map-point-bold"
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
    id: 'city',
    accessorKey: 'city.name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="City" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <Iconify
          icon="solar:flag-bold"
          className="text-muted-foreground shrink-0"
          width={16}
          height={16}
        />
        <span className="text-sm text-muted-foreground truncate">
          {formatTranslated(row.original.city?.name) || '-'}
        </span>
      </div>
    ),
  },
  {
    id: 'governorate',
    accessorKey: 'city.governorate.name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Governorate" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <Iconify
          icon="solar:flag-bold"
          className="text-muted-foreground shrink-0"
          width={16}
          height={16}
        />
        <span className="text-sm text-muted-foreground truncate">
          {formatTranslated(row.original.city?.governorate?.name) || '-'}
        </span>
      </div>
    ),
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Iconify
          icon="solar:calendar-date-bold"
          className="text-muted-foreground shrink-0"
          width={16}
          height={16}
        />
        <span className="text-sm text-muted-foreground">{row.original.created_at}</span>
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={AreaSchema}
        row={row}
        viewDetails={`/locations/area/details/${row.original.id}`}
        editItem={`/locations/area/update/${row.original.id}`}
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

