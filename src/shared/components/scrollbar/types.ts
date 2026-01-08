import type { Props as SimplebarProps } from 'simplebar-react';

// ----------------------------------------------------------------------

export type ScrollbarProps = SimplebarProps &
  React.ComponentProps<'div'> & {
    className?: string;
    fillContent?: boolean;
    slotProps?: {
      wrapperSx?: React.CSSProperties;
      contentSx?: React.CSSProperties;
      contentWrapperSx?: React.CSSProperties;
    };
  };
