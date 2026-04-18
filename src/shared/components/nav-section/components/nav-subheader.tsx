import { useState, useEffect } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import { navSectionClasses } from '../styles';
import { Iconify, iconifyClasses } from '../../iconify';

// ----------------------------------------------------------------------

export type NavSubheaderProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  children?: React.ReactNode;
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
        'cursor-pointer items-center relative gap-2 inline-flex self-start w-full',
        'text-[var(--nav-subheader-color)] px-3 py-1.5 mt-5 mb-1',
        'text-[10px] font-bold uppercase tracking-[0.12em]',
        'transition-colors duration-200 ease-out',
        'hover:text-[var(--nav-subheader-hover-color)]',
        'rounded-md select-none',
        'group',
        'before:absolute before:start-1 before:top-1/2 before:-translate-y-1/2 before:h-3.5 before:w-[3px] before:rounded-full',
        'before:bg-gradient-to-b before:from-primary before:to-primary/30 before:opacity-70 group-hover:before:opacity-100',
        className,
      ])}
      {...other}
    >
      <span className="flex-1 truncate ps-1">{children}</span>
      <Iconify
        width={14}
        height={14}
        icon="solar:alt-arrow-down-outline"
        className={mergeClasses([
          iconifyClasses.root,
          'shrink-0 transition-transform duration-200 ease-out opacity-60 group-hover:opacity-100',
          open ? 'rotate-0' : '-rotate-90',
        ])}
      />
    </div>
  );
}
