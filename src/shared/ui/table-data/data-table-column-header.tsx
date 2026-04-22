import { type Column } from '@tanstack/react-table';
import { mergeClasses } from 'minimal-shared/utils';

import { Iconify } from 'src/shared/components/iconify';

import { Button } from '../button';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

const titleClass = 'text-sm font-semibold text-primary text-start w-full min-w-0 leading-tight';

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={mergeClasses([titleClass, className])}>{title}</div>;
  }

  return (
    <div
      className={mergeClasses(['flex w-full min-w-0 items-center justify-start', className])}
    >
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
        color="primary"
        className="!m-0 h-auto min-h-0 w-full justify-start gap-1.5 px-0 py-0.5 !font-semibold !text-sm !normal-case text-primary"
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
        <span className="text-start leading-tight">{title}</span>
        {column.getIsSorted() === 'desc' ? (
          <Iconify icon="eva:arrow-downward-fill" width={16} className="shrink-0 opacity-80" />
        ) : column.getIsSorted() === 'asc' ? (
          <Iconify icon="eva:arrow-upward-fill" width={16} className="shrink-0 opacity-80" />
        ) : (
          <Iconify icon="carbon:chevron-sort" width={16} className="shrink-0 opacity-50" />
        )}
      </Button>
    </div>
  );
}
