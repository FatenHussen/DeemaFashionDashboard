import { forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

// ----------------------------------------------------------------------

const Table = forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-x-auto rounded-xl">
      <table
        ref={ref}
        className={mergeClasses([
          'w-full caption-bottom text-sm table-modern',
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
    className={mergeClasses(['[&_tr]:border-b table-header-glass', 'sticky top-0 z-20', className])}
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
        'transition-all duration-300 ease-out',
        'hover:bg-linear-to-r hover:from-primary/5 hover:via-primary/3 hover:to-transparent',
        'hover:shadow-[inset_4px_0_0_0_rgb(var(--primary))]',
        'data-[state=selected]:bg-primary/10 data-[state=selected]:shadow-[inset_4px_0_0_0_rgb(var(--primary))]',
        'table-row-gradient-hover',
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
        'h-14 px-3 sm:px-4 lg:px-6',
        'text-left align-middle',
        'font-semibold text-muted-foreground text-xs uppercase tracking-wider',
        'bg-muted/30 first:rounded-tl-lg last:rounded-tr-lg',
        'border-b-2 border-primary/20',
        'transition-colors duration-200',
        'hover:bg-muted/50 hover:text-foreground',
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
        'py-4 px-3 sm:px-4 lg:px-6',
        'align-middle text-sm text-foreground',
        'transition-all duration-200',
        'group-hover:text-foreground',
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
