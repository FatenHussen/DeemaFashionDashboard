import { mergeClasses } from 'minimal-shared/utils';

import { Box } from 'src/shared/ui';
import { useSettingsContext } from 'src/shared/components/settings';

import { layoutClasses } from '../core';

// ----------------------------------------------------------------------

export type DashboardContentProps = React.ComponentProps<'div'> & {
  layoutQuery?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disablePadding?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  className?: string;
  style?: React.CSSProperties;
};

export function DashboardContent({
  children,
  className,
  disablePadding,
  maxWidth = 'lg',
  layoutQuery = 'lg',
  style,
  ...other
}: DashboardContentProps) {
  const settings = useSettingsContext();

  const isNavHorizontal = settings.state.navLayout === 'horizontal';

  const maxWidthClasses = {
    xs: 'max-w-screen-xs',
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
  };

  return (
    <Box
      className={mergeClasses([
        layoutClasses.content,
        'flex flex-auto flex-col',
        'relative',
        'pt-[var(--layout-dashboard-content-pt)] pb-[var(--layout-dashboard-content-pb)]',
        ` lg:px-[var(--layout-dashboard-content-px)]`,
        isNavHorizontal ? 'lg:[--layout-dashboard-content-pt:40px]' : '',
        maxWidth ? maxWidthClasses[maxWidth] : '',
        disablePadding ? 'p-0' : '',
        // Creative visual enhancements
        'before:absolute before:top-0 before:left-0 before:right-0 before:h-px',
        'before:bg-gradient-to-r before:from-transparent before:via-border before:to-transparent',
        className,
      ])}
      style={style}
      {...other}
    >
      {children}
    </Box>
  );
}

// ----------------------------------------------------------------------

export function VerticalDivider({ className, ...other }: React.ComponentProps<'span'>) {
  return (
    <span
      className={mergeClasses([
        'w-px h-[10px] shrink-0 hidden relative items-center flex-col',
        'mx-5 bg-current text-muted-foreground',
        'before:absolute before:top-[-5px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-current before:shrink-0',
        'after:absolute after:bottom-[-5px] after:w-1.5 after:h-1.5 after:rounded-full after:bg-current after:shrink-0',
        className,
      ])}
      {...other}
    />
  );
}
