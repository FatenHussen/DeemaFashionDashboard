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
      className={`p-0.5 absolute text-foreground bg-background transform -translate-x-1/2 -translate-y-1/2 z-[var(--layout-nav-zIndex)] border border-border rounded-lg hover:text-foreground hover:bg-muted transition-all ${className || ''}`}
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
