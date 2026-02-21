import { useState, useEffect } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import { navSectionClasses } from '../styles';
import { Iconify, iconifyClasses } from '../../iconify';

// ----------------------------------------------------------------------

export type NavSubheaderProps = React.ComponentProps<'div'> & {
  open?: boolean;
  'data-title'?: string;
};

export function NavSubheader({ open, children, className, ...other }: NavSubheaderProps) {
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    setIsRtl(document.documentElement.dir === 'rtl');
  }, []);

  return (
    <div
      className={mergeClasses([
        navSectionClasses.subheader,
        'text-sm cursor-pointer items-center relative gap-2 inline-flex self-start w-full',
        'text-[var(--nav-subheader-color)] px-3 py-2.5 mt-4 mb-2',
        'font-semibold',
        'transition-all duration-200 ease-out',
        'hover:text-[var(--nav-subheader-hover-color)]',
        'hover:bg-muted/30 rounded-lg',
        'group',
        className,
      ])}
      {...other}
    >
      {children}
      <Iconify
        width={16}
        height={16}
        icon="solar:alt-arrow-down-outline"
        className={mergeClasses([
          iconifyClasses.root,
          'ml-auto shrink-0 transition-transform duration-200 ease-out',
          open ? 'rotate-0' : '-rotate-90',
          'text-[var(--nav-subheader-color)]',
          'group-hover:text-[var(--nav-subheader-hover-color)]',
        ])}
      />
    </div>
  );
}
