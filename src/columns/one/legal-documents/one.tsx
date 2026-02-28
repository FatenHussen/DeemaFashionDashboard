import type { TFunction } from 'i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { LegalDocumentItem } from '@/pages/dashboard/content/types/legal-document.types';

import { z } from 'zod';
import { formatTranslated } from '@/utils/format-translated';
import { DataTableRowActions } from '@/shared/ui/table-data/data-table-row-actions';
import { DataTableColumnHeader } from '@/shared/ui/table-data/data-table-column-header';

const LegalDocumentSchema = z.object({ id: z.number() });

export interface LegalDocumentFormValues extends LegalDocumentItem {
  [key: string]: any;
}

export const legalDocumentColumns = (
  _t: TFunction<'table'>
): ColumnDef<LegalDocumentFormValues>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => (
      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
        <span className="text-xs font-semibold text-primary">{row.original.id}</span>
      </div>
    ),
  },
  {
    id: 'key',
    accessorKey: 'key',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Key" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
        {row.original.key}
      </span>
    ),
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{formatTranslated(row.original.title)}</span>
    ),
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.created_at}</span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DataTableRowActions
        schema={LegalDocumentSchema}
        row={row}
        editItem={`/legal-documents/update/${row.original.id}`}
        permissions={{ update: true, delete: false }}
      />
    ),
  },
];
