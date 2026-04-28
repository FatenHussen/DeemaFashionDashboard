import { forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

// ----------------------------------------------------------------------

const Table = forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={mergeClasses([
        // Scroll lives on the DataTable (or page) wrapper — avoid nested overflow-x + min-w-max always showing a scroll track.
        'table-scroll-shell relative w-full min-w-0 max-w-full rounded-[inherit]',
      ])}
    >
      <table
        ref={ref}
        className={mergeClasses([
          'w-full min-w-0 caption-bottom text-sm table-modern',
          'border-separate border-spacing-0',
          className,
        ])}
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
  <thead
    ref={ref}
    className={mergeClasses(['[&_tr]:border-b', 'sticky top-0 z-20', className])}
    {...props}
  />
));

TableHeader.displayName = 'TableHeader';

// ----------------------------------------------------------------------

const TableBody = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={mergeClasses(['[&_tr:last-child]:border-0', 'relative', className])}
    {...props}
  />
));

TableBody.displayName = 'TableBody';

// ----------------------------------------------------------------------

const TableFooter = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={mergeClasses([
      'border-t bg-linear-to-r from-muted/50 via-muted/30 to-muted/50',
      'font-medium [&>tr]:last:border-b-0',
      'backdrop-blur-sm',
      className,
    ])}
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
        'h-14 border-b border-border/30',
        'transition-colors duration-150',
        'data-[state=selected]:bg-primary/8 data-[state=selected]:shadow-[inset_3px_0_0_0_rgb(var(--primary))]',
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
        'h-11 sm:h-12 px-3 sm:px-4 lg:px-5',
        'text-start align-middle',
        'text-sm font-semibold text-primary',
        'bg-muted/50',
        'transition-colors duration-150',
        '[&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5',
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
        'py-3 px-3 sm:px-4 lg:px-5',
        'align-middle text-sm text-foreground',
        '[&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5',
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
    className={mergeClasses([
      'mt-4 text-sm text-muted-foreground',
      'py-3 px-4',
      'bg-muted/20 rounded-lg',
      'animate-[tableRowSlideUp_0.3s_ease-out]',
      className,
    ])}
    {...props}
  />
));

TableCaption.displayName = 'TableCaption';

// ----------------------------------------------------------------------

export { Table, TableRow, TableBody, TableHead, TableCell, TableHeader, TableFooter, TableCaption };
