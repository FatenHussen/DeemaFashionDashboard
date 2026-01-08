import type { HTMLAttributes } from 'react';

import { m } from 'framer-motion';

import { varTap, varHover, AnimateBorder, transitionTap } from 'src/shared/components/animate';

// ----------------------------------------------------------------------

export type AccountButtonProps = Omit<HTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragStart'> & {
  photoURL: string;
  displayName: string;
};

export function AccountButton({ photoURL, displayName, className, ...other }: AccountButtonProps) {
  return (
    <m.button
      whileTap={varTap(0.96)}
      whileHover={varHover(1.04)}
      transition={transitionTap()}
      aria-label="Account button"
      className={`p-0 inline-flex items-center justify-center ${className || ''}`}
      {...(other as any)}
    >
      <AnimateBorder
        style={{ padding: '3px', borderRadius: '50%', width: 40, height: 40 }}
        slotProps={{
          primaryBorder: { size: 60, width: '1px' },
          secondaryBorder: {},
        }}
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-muted flex items-center justify-center">
          {photoURL ? (
            <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-medium text-foreground">
              {displayName?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </AnimateBorder>
    </m.button>
  );
}
