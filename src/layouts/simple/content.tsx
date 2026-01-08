import { mergeClasses } from 'minimal-shared/utils';

import { Box } from 'src/shared/ui';

import { layoutClasses } from '../core';

// ----------------------------------------------------------------------

export type SimpleCompactContentProps = React.ComponentProps<'div'> & {
  layoutQuery?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
};

export function SimpleCompactContent({
  children,
  className,
  layoutQuery = 'md',
  style,
  ...other
}: SimpleCompactContentProps) {
  return (
    <Box
      className={mergeClasses([
        layoutClasses.content,
        'w-full mx-auto flex flex-auto text-center flex-col',
        'p-6 pb-20',
        'max-w-[var(--layout-simple-content-compact-width)]',
        `${layoutQuery}:justify-center ${layoutQuery}:py-20 ${layoutQuery}:px-0`,
        className,
      ])}
      style={style}
      {...other}
    >
      {children}
    </Box>
  );
}
