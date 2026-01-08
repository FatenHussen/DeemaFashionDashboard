import { Skeleton } from '../skeleton';
import { TableRow, TableCell } from '../table';

// ----------------------------------------------------------------------

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow
          key={rowIndex}
          className={`hover:bg-transparent ${
            rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'
          }`}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex} className="first:pl-6 last:pr-6">
              <div className="flex items-center gap-2">
                {/* Varied skeleton widths for more realistic appearance */}
                {colIndex === 0 ? (
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ) : colIndex === 1 ? (
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ) : colIndex === columns - 1 ? (
                  <div className="flex items-center justify-end gap-2">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                ) : (
                  <Skeleton className="h-5 w-full max-w-[120px]" />
                )}
              </div>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
