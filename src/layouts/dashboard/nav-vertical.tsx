import type { NavSectionProps } from 'src/shared/components/nav-section';

import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import { Box } from 'src/shared/ui';

import { Logo } from 'src/shared/components/logo';
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
        <Box className="pl-3 pt-4 pb-3 relative z-10 border-b border-border/30">
          <Box className="transition-all duration-300 hover:scale-[1.02]">
            <Logo href="/" />
          </Box>
        </Box>
      )}

      <Scrollbar fillContent className="relative z-10 py-1">
        <NavSectionVertical
          data={data}
          cssVars={cssVars}
          checkPermissions={checkPermissions}
          checkPermission={checkPermission}
          className="px-2 flex-auto"
        />
      </Scrollbar>
    </>
  );

  const renderNavMini = () => (
    <>
      {slots?.topArea ?? (
        <Box className="flex justify-center py-6 relative z-10 border-b border-border/30">
          <Box className="transition-all duration-300 hover:scale-110">
            <Logo href="/" />
          </Box>
        </Box>
      )}

      <NavSectionMini
        data={data}
        cssVars={cssVars}
        checkPermissions={checkPermissions}
        checkPermission={checkPermission}
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
        ' top-0 left-0 h-full hidden fixed flex-col z-[var(--layout-nav-zIndex)]',
        'bg-gradient-to-b from-background via-background to-muted/20',
        'backdrop-blur-xl backdrop-saturate-150',
        'overflow-hidden',
        isNavMini ? 'w-[var(--layout-nav-mini-width)]' : 'w-[var(--layout-nav-vertical-width)]',
        'border-r border-border/40',
        'shadow-[0_0_0_1px_rgba(0,0,0,0.02),0_4px_24px_rgba(0,0,0,0.04)]',
        'dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.3)]',
        // Ensure content is visible
        'text-foreground',
        'transition-[width] duration-[var(--layout-transition-duration)] ease-[var(--layout-transition-easing)]',
        'before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary/5 before:via-transparent before:to-transparent before:pointer-events-none',
        'after:absolute after:top-0 after:right-0 after:w-px after:h-full after:bg-gradient-to-b after:from-transparent after:via-border/60 after:to-transparent after:pointer-events-none',
        `${layoutQuery}:flex`,
        className,
      ])}
      style={{
        borderColor: `var(--layout-nav-border-color, ${varAlpha('145 158 171', 0.12)})`,
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
