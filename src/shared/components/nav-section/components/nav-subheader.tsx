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
        'text-[11px] uppercase tracking-wider cursor-pointer items-center relative gap-2 inline-flex self-start',
        'text-[var(--nav-subheader-color)] px-3 py-2 pl-2.5 mt-4 mb-2',
        'font-semibold',
        'transition-all duration-200 ease-out',
        'hover:pl-3 hover:text-[var(--nav-subheader-hover-color)]',
        'hover:bg-muted/30 rounded-lg',
        'group',
        className,
      ])}
      style={{
        '--icon-left': '-4px',
        '--icon-opacity': open ? '1' : '0',
      } as React.CSSProperties}
      {...other}
    >
      <Iconify
        width={14}
        icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
        className={mergeClasses([
          iconifyClasses.root,
          'absolute left-[-2px] opacity-0 transition-all duration-200',
          'group-hover:opacity-100 group-hover:translate-x-0.5',
          isRtl ? 'scale-x-[-1]' : '',
        ])}
      />
      {children}
    </div>
  );
}
