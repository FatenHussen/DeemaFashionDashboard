import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';

import { Link } from 'react-router';
import { Button } from '@/shared/ui';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

// Type for service data
export interface ServiceFormValues {
  id: number;
  name: string;
  created_at: string;
  [key: string]: any;
}

export const serviceColumns = (
  permissions: {
    update: boolean;
    delete: boolean;
  },
  t: TFunction<'table'>,
  onDelete?: (id: number) => void,
  isDeleting?: boolean
): ColumnDef<ServiceFormValues>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.id')} />,
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
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Iconify icon="solar:service-bold" className="text-primary" width={18} height={18} />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-foreground truncate">{formatTranslated(row.original.name)}</div>
        </div>
      </div>
    ),
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.createdAt')} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <Iconify
          icon="solar:calendar-bold"
          className="text-muted-foreground shrink-0"
          width={16}
          height={16}
        />
        <span className="text-sm text-muted-foreground truncate">{row.original.created_at}</span>
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <div className="flex items-center gap-2 justify-end">
        {permissions.update && (
          <Link
            to={`/services/update/${row.original.id}`}
            state={{ service: row.original }}
          >
            <Button variant="text" size="small">
              <Iconify icon="solar:pen-bold" width={16} height={16} />
            </Button>
          </Link>
        )}
        {permissions.delete && (
          <Button
            variant="text"
            size="small"
            color="error"
            onClick={() => onDelete?.(row.original.id)}
            disabled={isDeleting}
          >
            <Iconify icon="solar:trash-bin-trash-bold" width={16} height={16} />
          </Button>
        )}
      </div>
    ),
  },
];
