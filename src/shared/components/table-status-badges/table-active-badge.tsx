import { mergeClasses } from 'minimal-shared/utils';

import { Iconify } from '../iconify';

type TableActiveBadgeProps = {
  isActive: boolean;
  activeLabel: string;
  inactiveLabel: string;
  className?: string;
};

/** High-contrast active / inactive chip for data tables (solid fill, white text). */
export function TableActiveBadge({
  isActive,
  activeLabel,
  inactiveLabel,
  className,
}: TableActiveBadgeProps) {
  return (
    <span
      className={mergeClasses([
        'inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-xs font-bold leading-tight text-white shadow-sm',
        isActive
          ? 'border-emerald-800 bg-emerald-600 dark:border-emerald-400'
          : 'border-red-900 bg-red-600 dark:border-red-300',
        className,
      ])}
    >
      <Iconify
        icon={isActive ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
        width={15}
        height={15}
        className="shrink-0 opacity-95"
      />
      <span className="truncate">{isActive ? activeLabel : inactiveLabel}</span>
    </span>
  );
}
