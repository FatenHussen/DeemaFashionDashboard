import type { HTMLAttributes } from 'react';

import { mergeClasses } from 'minimal-shared/utils';

import { layoutClasses } from '../core';

// ----------------------------------------------------------------------

export type AuthSplitContentProps = HTMLAttributes<HTMLDivElement> & {
  layoutQuery?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
};

export function AuthSplitContent({
  children,
  className,
  layoutQuery = 'md',
  ...other
}: AuthSplitContentProps) {
  const paddingClass =
    layoutQuery === 'md'
      ? 'px-2 py-12 md:justify-center md:py-10'
      : layoutQuery === 'lg'
        ? 'px-2 py-12 lg:justify-center lg:py-10'
        : layoutQuery === 'xl'
          ? 'px-2 py-12 xl:justify-center xl:py-10'
          : layoutQuery === '2xl'
            ? 'px-2 py-12 2xl:justify-center 2xl:py-10'
            : 'px-2 py-12 sm:justify-center sm:py-10';

  return (
    <div
      className={mergeClasses([
        layoutClasses.content,
        'flex flex-auto items-center flex-col',
        paddingClass,
        className,
      ])}
      {...other}
    >
      <div
        className="w-full flex flex-col"
        style={{ maxWidth: 'var(--layout-auth-content-width)' }}
      >
        {children}
      </div>
    </div>
  );
}
