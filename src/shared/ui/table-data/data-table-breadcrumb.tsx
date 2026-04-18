import { Fragment } from 'react';
import { cn } from '@/utils/utils';

// ----------------------------------------------------------------------

export interface DataTableBreadcrumbItem {
  id: string | number;
  label: string;
}

export interface DataTableBreadcrumbProps {
  /** Accessible name for the nav landmark */
  ariaLabel: string;
  /** First crumb when `items` is empty (current root) */
  rootLabel: string;
  /** Path after root; last item is the current level */
  items: DataTableBreadcrumbItem[];
  /** Receives the new trail (empty = root only) */
  onNavigate: (nextItems: DataTableBreadcrumbItem[]) => void;
  className?: string;
}

/**
 * Trail-style breadcrumb for hierarchical lists (e.g. category drill-down).
 * Root is always shown; last segment is current (non-clickable).
 */
export function DataTableBreadcrumb({
  ariaLabel,
  rootLabel,
  items,
  onNavigate,
  className,
}: DataTableBreadcrumbProps) {
  const atRoot = items.length === 0;

  return (
    <nav
      aria-label={ariaLabel}
      className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-sm', className)}
    >
      <button
        type="button"
        onClick={() => onNavigate([])}
        className={cn(
          'rounded-md px-0.5 py-0.5 transition-colors',
          atRoot
            ? 'cursor-default font-semibold text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {rootLabel}
      </button>
      {items.map((seg, i) => {
        const isLast = i === items.length - 1;
        return (
          <Fragment key={`${String(seg.id)}-${i}`}>
            <span className="text-muted-foreground/70 select-none" aria-hidden>
              &gt;
            </span>
            <button
              type="button"
              disabled={isLast}
              onClick={() => onNavigate(items.slice(0, i + 1))}
              className={cn(
                'max-w-[220px] truncate rounded-md px-0.5 py-0.5 text-start transition-colors',
                isLast
                  ? 'cursor-default font-semibold text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {seg.label}
            </button>
          </Fragment>
        );
      })}
    </nav>
  );
}
