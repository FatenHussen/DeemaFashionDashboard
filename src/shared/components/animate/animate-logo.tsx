import type { LogoProps } from '../logo';

import { m } from 'framer-motion';
import { mergeClasses } from 'minimal-shared/utils';

import { Logo } from '../logo';

// ----------------------------------------------------------------------

export type AnimateLogoProps = React.ComponentProps<'div'> & {
  className?: string;
  logo?: React.ReactNode;
  slotProps?: {
    logo?: LogoProps;
  };
};

export function AnimateLogoZoom({ logo, slotProps, className, ...other }: AnimateLogoProps) {
  return (
    <div
      className={mergeClasses([
        'w-[120px] h-[120px] items-center relative inline-flex justify-center',
        className,
      ])}
      {...other}
    >
      <m.span
        animate={{ scale: [1, 0.9, 0.9, 1, 1], opacity: [1, 0.48, 0.48, 1, 1] }}
        transition={{
          duration: 2,
          repeatDelay: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {logo ?? (
          <Logo
            disabled
            href={slotProps?.logo?.href || '/'}
            {...slotProps?.logo}
            className={mergeClasses(['w-16 h-16', slotProps?.logo?.className])}
          />
        )}
      </m.span>

      <m.span
        animate={{
          scale: [1.6, 1, 1, 1.6, 1.6],
          rotate: [270, 0, 0, 270, 270],
          opacity: [0.25, 1, 1, 1, 0.25],
          borderRadius: ['25%', '25%', '50%', '50%', '25%'],
        }}
        transition={{ ease: 'linear', duration: 3.2, repeat: Infinity }}
        className="absolute w-[calc(100%-20px)] h-[calc(100%-20px)] border-[3px] border-blue-900/24"
      />

      <m.span
        animate={{
          scale: [1, 1.2, 1.2, 1, 1],
          rotate: [0, 270, 270, 0, 0],
          opacity: [1, 0.25, 0.25, 0.25, 1],
          borderRadius: ['25%', '25%', '50%', '50%', '25%'],
        }}
        transition={{ ease: 'linear', duration: 3.2, repeat: Infinity }}
        className="w-full h-full absolute border-8 border-blue-900/24"
      />
    </div>
  );
}

// ----------------------------------------------------------------------

export function AnimateLogoRotate({ logo, className, slotProps, ...other }: AnimateLogoProps) {
  return (
    <div
      className={mergeClasses([
        'w-24 h-24 items-center relative inline-flex justify-center',
        className,
      ])}
      {...other}
    >
      {logo ?? (
        <Logo
          href={slotProps?.logo?.href || '/'}
          {...slotProps?.logo}
          className={mergeClasses(['z-9 w-10 h-10', slotProps?.logo?.className])}
        />
      )}

      <m.span
        animate={{ rotate: 360 }}
        transition={{ duration: 10, ease: 'linear', repeat: Infinity }}
        className="w-full h-full opacity-16 rounded-full absolute bg-gradient-to-br from-transparent via-transparent to-blue-600 transition-opacity duration-200"
      />
    </div>
  );
}
