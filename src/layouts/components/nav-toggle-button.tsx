import type { HTMLAttributes } from 'react';

import { Iconify } from 'src/shared/components/iconify';

// ----------------------------------------------------------------------

export type NavToggleButtonProps = HTMLAttributes<HTMLButtonElement> & {
  isNavMini: boolean;
};

export function NavToggleButton({ isNavMini, className, ...other }: NavToggleButtonProps) {
  const leftPosition = isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)';

  return (
    <button
      type="button"
      className={`p-1.5 absolute text-muted-foreground bg-card transform -translate-x-1/2 -translate-y-1/2 z-[calc(var(--layout-nav-zIndex)+1)] pointer-events-auto border border-border/50 rounded-xl hover:text-primary hover:border-primary/45 hover:bg-primary/10 hover:shadow-[0_0_0_4px_rgb(var(--primary)_/_0.12)] shadow-md transition-all duration-200 active:scale-90 ${className || ''}`}
      style={{
        top: 'calc(var(--layout-header-desktop-height) / 2)',
        left: leftPosition,
        transitionDuration: 'var(--layout-transition-duration)',
        transitionTimingFunction: 'var(--layout-transition-easing)',
      }}
      {...other}
    >
      <Iconify
        width={16}
        icon={isNavMini ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-back-fill'}
        className="rtl:scale-x-[-1]"
      />
    </button>
  );
}
