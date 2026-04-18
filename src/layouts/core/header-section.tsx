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

  const { className: containerClassName, ...containerRest } = slotProps?.container ?? {};

  return (
    <header
      className={mergeClasses([
        layoutClasses.header,
        'dashboard-header-shell sticky py-0 top-0 z-[var(--layout-header-zIndex)]',
        disableElevation ? 'dashboard-header-shell--quiet' : '',
        'relative overflow-hidden bg-white',
        'border-b border-b-[var(--chrome-edge)]',
        'transition-shadow duration-300 ease-out',
        className,
      ])}
      {...other}
    >
      {/* Top accent — continuous with sidebar chrome-top-accent */}
      <div className="chrome-top-accent pointer-events-none absolute inset-x-0 top-0 z-[21]" />
      {/* Ambient brand blobs — mirror sidebar so the L-corner feels like one surface */}
      <div
        className="pointer-events-none absolute -top-10 start-0 size-[min(200px,40vw)]  blur-3xl opacity-50 z-0"
        style={{ background: 'radial-gradient(circle, rgb(var(--primary) / 0.1) 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 end-0 size-[min(160px,30vw)]  blur-3xl opacity-35 z-0"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent-amber) / 0.28) 0%, transparent 70%)' }}
      />
      {slots?.topArea}

      <div
        className={mergeClasses([
          'flex w-full min-w-0 items-center justify-between gap-2',
          'text-[var(--color)]',
          'h-[var(--layout-header-mobile-height)]',
          `md:h-[var(--layout-header-desktop-height)]`,
          'relative z-[2]',
          containerClassName,
        ])}
        {...containerRest}
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
