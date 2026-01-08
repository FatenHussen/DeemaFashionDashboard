import { mergeClasses } from 'minimal-shared/utils';
import { useScrollOffsetTop } from 'minimal-shared/hooks';

import { Box } from 'src/shared/ui';

import { layoutClasses } from './classes';

// ----------------------------------------------------------------------

export type HeaderSectionProps = React.HTMLAttributes<HTMLElement> & {
  layoutQuery?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disableOffset?: boolean;
  disableElevation?: boolean;
  className?: string;
  slots?: {
    leftArea?: React.ReactNode;
    rightArea?: React.ReactNode;
    topArea?: React.ReactNode;
    centerArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  slotProps?: {
    container?: React.HTMLAttributes<HTMLDivElement>;
    centerArea?: React.HTMLAttributes<HTMLDivElement>;
  };
};

export function HeaderSection({
  slots,
  slotProps,
  className,
  disableOffset,
  disableElevation,
  layoutQuery = 'md',
  ...other
}: HeaderSectionProps) {
  const { offsetTop: isOffset } = useScrollOffsetTop();

  return (
    <header
      className={mergeClasses([
        layoutClasses.header,
        'sticky py-4 top-0 z-[var(--layout-header-zIndex)]',
        'relative overflow-hidden',
        // Creative glassmorphism backdrop with enhanced gradients
        !disableOffset && isOffset
          ? 'before:absolute before:inset-0 before:bg-gradient-to-br before:from-background/95 before:via-background/92 before:to-background/95 before:backdrop-blur-xl before:transition-all before:duration-300'
          : 'before:absolute before:inset-0 before:bg-gradient-to-br before:from-background/70 before:via-background/65 before:to-background/70 before:backdrop-blur-lg before:transition-all before:duration-300',
        // Animated radial gradient overlay for depth and visual interest
        'after:absolute after:inset-0 after:pointer-events-none after:opacity-20 after:transition-opacity after:duration-500',
        !disableOffset && isOffset
          ? 'after:bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_60%)]'
          : 'after:bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.06),transparent_60%)]',
        // Creative bottom border with animated gradient
        !disableElevation && isOffset ? 'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)]' : 'shadow-sm',
        // Subtle border with gradient effect
        'border-b',
        !disableOffset && isOffset ? 'border-b-border/60' : 'border-b-border/40',
        // Smooth transitions for all state changes
        'transition-all duration-300 ease-out',
        className,
      ])}
      {...other}
    >
      {/* Creative animated bottom border gradient */}
      {!disableElevation && isOffset && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent transition-opacity duration-300 pointer-events-none z-20" />
      )}
      {slots?.topArea}

      <div
        className={mergeClasses([
          'flex  justify-between w-full items-center',
          'text-[var(--color)]',
          'h-[var(--layout-header-mobile-height)]',
          `md:h-[var(--layout-header-desktop-height)]`,
          'relative',
          // Creative visual enhancements
          'min-h-[64px]',
        ])}
        {...slotProps?.container}
      >
        {slots?.leftArea && (
          <Box className="flex items-center flex-shrink-0 relative z-10">{slots.leftArea}</Box>
        )}

        {slots?.centerArea && (
          <Box
            className={mergeClasses([
              'flex flex-1 justify-center items-center',
              'relative z-10',
              'px-4',
            ])}
            {...slotProps?.centerArea}
          >
            {slots.centerArea}
          </Box>
        )}

        {slots?.rightArea && (
          <Box className="flex items-center flex-shrink-0 relative z-10">{slots.rightArea}</Box>
        )}
      </div>

      {slots?.bottomArea}
    </header>
  );
}
