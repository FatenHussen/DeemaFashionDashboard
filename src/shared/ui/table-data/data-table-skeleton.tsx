import { TableRow, TableCell } from '../table';

// ----------------------------------------------------------------------

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

// Modern animated skeleton component
function AnimatedSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`table-skeleton-animated rounded-md ${className || ''}`}
      style={{
        background: `linear-gradient(
          90deg,
          rgba(var(--muted), 0.3) 0%,
          rgba(var(--muted), 0.6) 50%,
          rgba(var(--muted), 0.3) 100%
        )`,
        backgroundSize: '200% 100%',
      }}
    />
  );
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow
          key={rowIndex}
          style={
            {
              '--row-index': rowIndex,
              animationDelay: `${rowIndex * 80}ms`,
            } as React.CSSProperties
          }
          className={`hover:bg-transparent animate-[tableRowSlideUp_0.4s_ease-out_both] ${
            rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/10'
          }`}
        >
          {Array.from({ length: columns }).map((__unused, colIndex) => (
            <TableCell
              key={colIndex}
              className="first:pl-6 last:pr-6"
              style={{ animationDelay: `${colIndex * 50}ms` } as React.CSSProperties}
            >
              <div className="flex items-center gap-2">
                {/* Varied skeleton widths for more realistic appearance */}
                {colIndex === 0 ? (
                  <div className="flex items-center gap-3">
                    <AnimatedSkeleton className="h-9 w-9 rounded-xl" />
                    <AnimatedSkeleton className="h-4 w-14" />
                  </div>
                ) : colIndex === 1 ? (
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <AnimatedSkeleton className="h-10 w-10 rounded-xl shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <AnimatedSkeleton className="h-4 w-28" />
                      <AnimatedSkeleton className="h-3 w-20" />
                    </div>
                  </div>
                ) : colIndex === columns - 1 ? (
                  <div className="flex items-center justify-end gap-2">
                    <AnimatedSkeleton className="h-8 w-8 rounded-lg" />
                    <AnimatedSkeleton className="h-8 w-8 rounded-lg" />
                  </div>
                ) : (
                  <AnimatedSkeleton className="h-5 w-full max-w-35" />
                )}
              </div>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
