import type { NavSectionProps } from 'src/shared/components/nav-section';

import { mergeClasses } from 'minimal-shared/utils';

import { RouterLink } from 'src/routes/components';

import { Box } from 'src/shared/ui';
import { Scrollbar } from 'src/shared/components/scrollbar';
import { NavSectionMini, NavSectionVertical } from 'src/shared/components/nav-section';

import { layoutClasses } from '../core';
import { NavToggleButton } from '../components/nav-toggle-button';

// ----------------------------------------------------------------------

export type NavVerticalProps = React.ComponentProps<'div'> &
  NavSectionProps & {
    isNavMini: boolean;
    layoutQuery?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    onToggleNav: () => void;
    slots?: {
      topArea?: React.ReactNode;
      bottomArea?: React.ReactNode;
    };
    className?: string;
    style?: React.CSSProperties;
    checkPermission?: (permission?: string) => boolean;
  };

export function NavVertical({
  data,
  slots,
  cssVars,
  className,
  isNavMini,
  onToggleNav,
  checkPermissions,
  checkPermission,
  layoutQuery = 'md',
  style,
  ...other
}: NavVerticalProps) {
  const renderNavVertical = () => (
    <>
      {slots?.topArea ?? (
        <Box className="flex justify-center items-center pt-6 pb-4 relative z-10">
          <Box className="transition-all duration-300">
            <RouterLink href="/" className="block">
              <img src="/logo/logo.png" alt="Logo" className="h-22 w-42 object-contain" />
            </RouterLink>
          </Box>
        </Box>
      )}

      <Scrollbar fillContent className="relative z-10 py-2">
        <NavSectionVertical
          data={data}
          cssVars={cssVars}
          checkPermissions={checkPermissions}
          checkPermission={checkPermission}
          className="px-3 flex-auto"
        />
      </Scrollbar>
    </>
  );

  const renderNavMini = () => (
    <>
      {slots?.topArea ?? (
        <Box className="flex justify-center py-6 relative z-10 border-b border-border/30">
          <Box className="transition-all duration-300 hover:scale-110">
            <RouterLink href="/" className="block w-10 h-10">
              <img src="/logo/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </RouterLink>
          </Box>
        </Box>
      )}

      <NavSectionMini
        data={data}
        cssVars={cssVars}
        checkPermissions={checkPermissions}
        checkPermission={checkPermission}
        enabledRootRedirect
        className="pb-4 px-1 flex-auto overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative z-10"
      />

      {slots?.bottomArea}
    </>
  );

  return (
    <div
      className={mergeClasses([
        layoutClasses.nav.root,
        layoutClasses.nav.vertical,
        ' top-0 start-0 h-full hidden fixed flex-col z-[var(--layout-nav-zIndex)]',
        'bg-background border-e border-border/60',
        'overflow-hidden',
        isNavMini ? 'w-[var(--layout-nav-mini-width)]' : 'w-[var(--layout-nav-vertical-width)]',
        `${layoutQuery}:flex`,
        className,
      ])}
      style={{
        ...style,
      }}
      {...other}
    >
      <NavToggleButton
        isNavMini={isNavMini}
        onClick={onToggleNav}
        className="hidden lg:inline-flex"
      />
      {isNavMini ? renderNavMini() : renderNavVertical()}
    </div>
  );
}
