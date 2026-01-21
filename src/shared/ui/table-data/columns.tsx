// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - @tanstack/react-table types
import type { ColumnDef } from '@tanstack/react-table';

import { Label } from 'src/shared/components/label';
import { Iconify } from 'src/shared/components/iconify';

import { Checkbox } from '../checkbox';
import { DataTableColumnHeader } from './data-table-column-header';
import { label_options, status_options, priority_options } from './filters';

// ----------------------------------------------------------------------

 
export const columns: ColumnDef<any>[] = [
  {
    id: 'select',
     
    header: ({ table }: any) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
     
    cell: ({ row }: any) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
     
    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Task" />,
     
    cell: ({ row }: any) => <div className="w-[80px] text-foreground">{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
     
    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Title" />,
     
    cell: ({ row }: any) => {
       
      const label = label_options.find(
        
        (opt: any) => opt.value === row.original.label
      );

      return (
        <div className="flex space-x-2">
          {label && <Label variant="outlined">{label.label}</Label>}
          <span className="max-w-[500px] truncate font-medium text-foreground">
            {row.getValue('title')}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
     
    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Status" />,
     
    cell: ({ row }: any) => {
       
      const status = status_options.find(
        
        (opt: any) => opt.value === row.getValue('status')
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <Iconify icon={status.icon as any} width={16} className="mr-2 text-muted-foreground" />
          )}
          <span className="text-foreground">{status.label}</span>
        </div>
      );
    },
     
    filterFn: (row: any, id: any, value: any) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'priority',
     
    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Priority" />,
     
    cell: ({ row }: any) => {
       
      const priority = priority_options.find(
        
        (opt: any) => opt.value === row.getValue('priority')
      );

      if (!priority) {
        return null;
      }

      return (
        <div className="flex items-center">
          {priority.icon && (
            <Iconify
              icon={priority.icon as any}
              width={16}
              className="mr-2 text-muted-foreground"
            />
          )}
          <span className="text-foreground">{priority.label}</span>
        </div>
      );
    },
     
    filterFn: (row: any, id: any, value: any) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'due_date',
     
    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Due Date" />,
     
    cell: ({ row }: any) => {
      const field = row.getValue('due_date') as Date;
      return <div className="text-foreground">{field.toDateString()}</div>;
    },
  },
  {
    id: 'actions',
    // cell: ({ row }) => <DataTableRowActions row={row} schema={}/>,
  },
];
