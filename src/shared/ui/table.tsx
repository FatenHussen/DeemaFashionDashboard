import { forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

// ----------------------------------------------------------------------

const Table = forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-x-auto">
      <table
        ref={ref}
        className={mergeClasses(['w-full caption-bottom text-sm', className])}
        {...props}
      />
    </div>
  )
);

Table.displayName = 'Table';

// ----------------------------------------------------------------------

const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={mergeClasses(['[&_tr]:border-b', className])} {...props} />
));

TableHeader.displayName = 'TableHeader';

// ----------------------------------------------------------------------

const TableBody = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={mergeClasses(['[&_tr:last-child]:border-0', className])} {...props} />
));

TableBody.displayName = 'TableBody';

// ----------------------------------------------------------------------

const TableFooter = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={mergeClasses(['border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className])}
    {...props}
  />
));

TableFooter.displayName = 'TableFooter';

// ----------------------------------------------------------------------

const TableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={mergeClasses([
        'h-1 border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        className,
      ])}
      {...props}
    />
  )
);

TableRow.displayName = 'TableRow';

// ----------------------------------------------------------------------

const TableHead = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, style, ...props }, ref) => (
    <th
      ref={ref}
      className={mergeClasses([
        'h-12 px-3 sm:px-4 lg:px-6 text-left align-middle font-semibold text-muted-foreground text-[14px] [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      ])}
      style={style}
      {...props}
    />
  )
);

TableHead.displayName = 'TableHead';

// ----------------------------------------------------------------------

const TableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={mergeClasses([
        'p-0.7 px-3 sm:px-4 lg:px-6 align-middle text-[0.8rem] [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-foreground',
        className,
      ])}
      {...props}
    />
  )
);

TableCell.displayName = 'TableCell';

// ----------------------------------------------------------------------

const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={mergeClasses(['mt-4 text-sm text-muted-foreground', className])}
    {...props}
  />
));

TableCaption.displayName = 'TableCaption';

// ----------------------------------------------------------------------

export { Table, TableRow, TableBody, TableHead, TableCell, TableHeader, TableFooter, TableCaption };
