import { createPortal } from 'react-dom';
import { mergeClasses } from 'minimal-shared/utils';

import { AnimateLogoZoom } from '../animate';

// ----------------------------------------------------------------------

export type SplashScreenProps = React.ComponentProps<'div'> & {
  portal?: boolean;
  className?: string;
  slotProps?: {
    wrapper?: React.HTMLAttributes<HTMLDivElement>;
  };
};

export function SplashScreen({ portal = true, slotProps, className, ...other }: SplashScreenProps) {
  const content = (
    <div className="flex-1 flex flex-col" {...slotProps?.wrapper}>
      <div
        className={mergeClasses([
          'right-0 bottom-0 z-[9998] flex-1 w-full h-full flex fixed items-center justify-center bg-background',
          className,
        ])}
        {...other}
      >
        <AnimateLogoZoom />
      </div>
    </div>
  );

  if (portal) {
    return createPortal(content, document.body);
  }

  return content;
}
