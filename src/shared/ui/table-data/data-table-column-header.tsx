import { type Column } from '@tanstack/react-table';
import { mergeClasses } from 'minimal-shared/utils';

import { Iconify } from 'src/shared/components/iconify';

import { Button } from '../button';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={mergeClasses([className])}>{title}</div>;
  }

  return (
    <div className={mergeClasses(['flex items-center space-x-2', className])}>
      <Button
        aria-label={
          column.getIsSorted() === 'desc'
            ? `Sorted descending. Click to sort ascending.`
            : column.getIsSorted() === 'asc'
              ? `Sorted ascending. Click to sort descending.`
              : `Not sorted. Click to sort ascending.`
        }
        variant="text"
        size="small"
        className="-ml-3 text-sm h-8"
        onClick={() => {
          if (column.getIsSorted() === 'desc') {
            column.toggleSorting(false);
          } else if (column.getIsSorted() === 'asc') {
            column.toggleSorting(true);
          } else {
            column.toggleSorting(false);
          }
        }}
      >
        <span>{title}</span>
        {column.getIsSorted() === 'desc' ? (
          <Iconify icon="eva:arrow-downward-fill" width={16} className="ml-2" />
        ) : column.getIsSorted() === 'asc' ? (
          <Iconify icon="eva:arrow-upward-fill" width={16} className="ml-2" />
        ) : (
          <Iconify icon="carbon:chevron-sort" width={16} className="ml-2" />
        )}
      </Button>
    </div>
  );
}
