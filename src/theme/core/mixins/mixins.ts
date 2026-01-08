import { borderGradient } from './border';
import { maxLine, textGradient } from './text';
import { bgBlur, bgGradient } from './background';
import { softStyles, paperStyles, filledStyles, menuItemStyles } from './global-styles-components';

// ----------------------------------------------------------------------

export type * from './text';
export type * from './border';
export type * from './background';
export type * from './global-styles-components';

export type MixinsExtend = {
  hideScrollX: React.CSSProperties;
  hideScrollY: React.CSSProperties;
  bgBlur: typeof bgBlur;
  maxLine: typeof maxLine;
  bgGradient: typeof bgGradient;
  softStyles: typeof softStyles;
  paperStyles: typeof paperStyles;
  textGradient: typeof textGradient;
  filledStyles: typeof filledStyles;
  borderGradient: typeof borderGradient;
  menuItemStyles: typeof menuItemStyles;
};

/* **********************************************************************
 * 📦 Final
 * **********************************************************************/
export const mixins: MixinsExtend = {
  hideScrollX: {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    overflowX: 'auto',
    '&::-webkit-scrollbar': { display: 'none' },
  } as React.CSSProperties,
  hideScrollY: {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    overflowY: 'auto',
    '&::-webkit-scrollbar': { display: 'none' },
  } as React.CSSProperties,
  bgBlur,
  maxLine,
  bgGradient,
  softStyles,
  paperStyles,
  textGradient,
  filledStyles,
  borderGradient,
  menuItemStyles,
};
