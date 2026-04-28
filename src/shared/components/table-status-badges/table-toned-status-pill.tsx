import type { ReactNode } from 'react';

import { mergeClasses } from 'minimal-shared/utils';

import { Iconify } from '../iconify';

type TableTonedStatusPillProps = {
  icon: string;
  children: ReactNode;
  /** Border + background (text is always white; include dark: variants if needed). */
  className: string;
  classNameInner?: string;
};

/**
 * Status pill with icon: solid background and white label for strong contrast on table rows.
 */
export function TableTonedStatusPill({
  icon,
  children,
  className,
  classNameInner,
}: TableTonedStatusPillProps) {
  return (
    <div
      className={mergeClasses([
        'inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-xs font-bold leading-tight text-white shadow-sm w-fit',
        className,
      ])}
    >
      <Iconify icon={icon} width={15} height={15} className="shrink-0 opacity-95" />
      <span className={mergeClasses(['min-w-0 capitalize truncate', classNameInner])}>{children}</span>
    </div>
  );
}
