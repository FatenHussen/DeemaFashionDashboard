import { mergeClasses } from 'minimal-shared/utils';

// ----------------------------------------------------------------------

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={mergeClasses([
        'animate-pulse rounded-md bg-muted',
        className,
      ])}
      {...props}
    />
  );
}

