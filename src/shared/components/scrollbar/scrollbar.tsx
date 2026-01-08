import type { ScrollbarProps } from './types';

import SimpleBar from 'simplebar-react';
import { mergeClasses } from 'minimal-shared/utils';

import { scrollbarClasses } from './classes';

// ----------------------------------------------------------------------

export function Scrollbar({
  className,
  ref,
  children,
  slotProps,
  fillContent = true,
  ...other
}: ScrollbarProps) {
  return (
    <SimpleBar
      scrollableNodeProps={{ ref }}
      clickOnTrack={false}
      className={mergeClasses([
        scrollbarClasses.root,
        'min-w-0 min-h-0 flex-1 flex flex-col',
        fillContent
          ? '[&_.simplebar-content]:flex [&_.simplebar-content]:flex-1 [&_.simplebar-content]:min-h-full [&_.simplebar-content]:flex-col'
          : '',
        className,
      ])}
      style={
        {
          ...(slotProps?.wrapperSx && { '--wrapper-style': slotProps.wrapperSx }),
          ...(slotProps?.contentWrapperSx && {
            '--content-wrapper-style': slotProps.contentWrapperSx,
          }),
          ...(slotProps?.contentSx && { '--content-style': slotProps.contentSx }),
        } as React.CSSProperties
      }
      {...other}
    >
      {children}
    </SimpleBar>
  );
}
