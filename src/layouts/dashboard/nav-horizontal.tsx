import type { NavSectionProps } from 'src/shared/components/nav-section';

import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import { Box } from 'src/shared/ui';
import { NavSectionHorizontal } from 'src/shared/components/nav-section';

import { layoutClasses } from '../core';

// ----------------------------------------------------------------------

export type NavHorizontalProps = NavSectionProps & {
  layoutQuery?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
  checkPermission?: (permission?: string) => boolean;
};

export function NavHorizontal({
  data,
  className,
  checkPermissions,
  checkPermission,
  layoutQuery = 'md',
  style,
  ...other
}: NavHorizontalProps) {
  return (
    <Box
      className={mergeClasses([
        layoutClasses.nav.root,
        layoutClasses.nav.horizontal,
        'w-full relative flex-col',
        'hidden',
        `${layoutQuery}:flex`,
        'border-b border-border',
        className,
      ])}
      style={{
        borderColor: varAlpha('145 158 171', 0.08),
        ...style,
      }}
    >
      <div className="absolute top-0 left-0 w-full z-[9] border-t border-dashed border-border" />

      <Box
        className="px-3 h-[var(--layout-nav-horizontal-height)] bg-[var(--layout-nav-horizontal-bg)] backdrop-blur-[var(--layout-header-blur)]"
        style={{
          WebkitBackdropFilter: `blur(var(--layout-header-blur))`,
        }}
      >
        <NavSectionHorizontal
          data={data}
          checkPermissions={checkPermissions}
          checkPermission={checkPermission}
          {...other}
        />
      </Box>
    </Box>
  );
}
