// ----------------------------------------------------------------------

export type PopoverArrow = {
  hide?: boolean;
  size?: number;
  offset?: number;
  className?: string;
  placement?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
    | 'left-top'
    | 'left-center'
    | 'left-bottom'
    | 'right-top'
    | 'right-center'
    | 'right-bottom';
};

export type PopoverOrigin = {
  vertical: 'top' | 'center' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
};

export type CustomPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  anchorOrigin?: PopoverOrigin;
  transformOrigin?: PopoverOrigin;
  slotProps?: {
    arrow?: PopoverArrow;
    paper?: React.HTMLAttributes<HTMLDivElement>;
  };
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
};
