import type { PopoverOrigin } from '../../custom-popover/types';

import { mergeClasses } from 'minimal-shared/utils';

import { CustomPopover } from '../../custom-popover';

// ----------------------------------------------------------------------

type NavDropdownProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  anchorOrigin?: PopoverOrigin;
  transformOrigin?: PopoverOrigin;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  children: React.ReactNode;
  className?: string;
  id?: string;
  'aria-hidden'?: boolean;
  disableScrollLock?: boolean;
  slotProps?: {
    paper?: React.HTMLAttributes<HTMLDivElement>;
  };
  style?: React.CSSProperties;
};

export const NavDropdownPaper = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={mergeClasses(['min-w-[180px] rounded-lg bg-background shadow-lg', className])}
    {...props}
  >
    {children}
  </div>
);

// ----------------------------------------------------------------------

export const NavDropdown = ({
  open,
  anchorEl,
  anchorOrigin,
  transformOrigin,
  onMouseEnter,
  onMouseLeave,
  children,
  className,
  slotProps,
  style,
  ...other
}: NavDropdownProps) => (
    <CustomPopover
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      className={mergeClasses(['pointer-events-none', className])}
      slotProps={{
        paper: {
          className: mergeClasses([
            'shadow-none overflow-visible bg-transparent backdrop-blur-none p-0',
            open ? 'pointer-events-auto' : '',
            slotProps?.paper?.className,
          ]),
          onMouseEnter,
          onMouseLeave,
          style: {
            ...style,
            ...slotProps?.paper?.style,
          },
          ...slotProps?.paper,
        },
      }}
      {...other}
    >
      {children}
    </CustomPopover>
  );
