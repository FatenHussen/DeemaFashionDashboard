import { pxToRem, setFont } from 'minimal-shared/utils';

import { themeConfig } from '../theme-config';

// ----------------------------------------------------------------------

/**
 * Typography variants extend
 */
export type TypographyVariantsExtend = {
  fontWeightSemiBold: React.CSSProperties['fontWeight'];
  fontWeightExtraBold: React.CSSProperties['fontWeight'];
  fontSecondaryFamily: React.CSSProperties['fontFamily'];
};

/**
 * Typography variant configuration
 */
export type TypographyVariant = {
  fontFamily?: React.CSSProperties['fontFamily'];
  fontWeight?: React.CSSProperties['fontWeight'];
  lineHeight?: React.CSSProperties['lineHeight'];
  fontSize?: React.CSSProperties['fontSize'];
  textTransform?: React.CSSProperties['textTransform'];
  [key: string]: unknown; // For responsive font sizes
};

/**
 * Typography configuration
 */
export type TypographyVariantsOptions = {
  fontFamily: React.CSSProperties['fontFamily'];
  fontSecondaryFamily: React.CSSProperties['fontFamily'];
  fontWeightLight: React.CSSProperties['fontWeight'];
  fontWeightRegular: React.CSSProperties['fontWeight'];
  fontWeightMedium: React.CSSProperties['fontWeight'];
  fontWeightSemiBold: React.CSSProperties['fontWeight'];
  fontWeightBold: React.CSSProperties['fontWeight'];
  fontWeightExtraBold: React.CSSProperties['fontWeight'];
  h1: TypographyVariant;
  h2: TypographyVariant;
  h3: TypographyVariant;
  h4: TypographyVariant;
  h5: TypographyVariant;
  h6: TypographyVariant;
  subtitle1: TypographyVariant;
  subtitle2: TypographyVariant;
  body1: TypographyVariant;
  body2: TypographyVariant;
  caption: TypographyVariant;
  overline: TypographyVariant;
  button: TypographyVariant;
};

/**
 * Breakpoint type
 */
type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Generates responsive font styles for given breakpoints
 * @param sizes - Object mapping breakpoints to font sizes in pixels
 * @returns CSS media query styles for responsive font sizes
 */
type FontSizesInput = Partial<Record<Breakpoint, number>>;
type FontSizesResult = Record<string, { fontSize: React.CSSProperties['fontSize'] }>;

function responsiveFontSizes(sizes: FontSizesInput): FontSizesResult {
  const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  const breakpointMap: Record<Breakpoint, string> = {
    xs: '@media (min-width: 0px)',
    sm: '@media (min-width: 600px)',
    md: '@media (min-width: 900px)',
    lg: '@media (min-width: 1200px)',
    xl: '@media (min-width: 1536px)',
  };

  return breakpoints.reduce((styles: FontSizesResult, breakpoint) => {
    const size = sizes[breakpoint];

    if (size !== undefined && size >= 0) {
      styles[breakpointMap[breakpoint]] = {
        fontSize: pxToRem(size),
      };
    }

    return styles;
  }, {});
}

function roundToDecimals(value: number): number {
  return Number(value.toFixed(2));
}

// ----------------------------------------------------------------------

const primaryFont = setFont(themeConfig.fontFamily.primary);
const secondaryFont = setFont(themeConfig.fontFamily.secondary);

const baseTypography: Omit<
  TypographyVariantsOptions,
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline'
  | 'button'
> = {
  fontFamily: primaryFont,
  fontSecondaryFamily: secondaryFont,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600,
  fontWeightBold: 700,
  fontWeightExtraBold: 800,
};

/* **********************************************************************
 * 📦 Final
 * **********************************************************************/
export const typography: TypographyVariantsOptions = {
  ...baseTypography,
  h1: {
    fontFamily: secondaryFont,
    fontWeight: baseTypography.fontWeightExtraBold,
    lineHeight: roundToDecimals(80 / 64),
    fontSize: pxToRem(40),
    ...responsiveFontSizes({ sm: 52, md: 58, lg: 64 }),
  },
  h2: {
    fontFamily: secondaryFont,
    fontWeight: baseTypography.fontWeightExtraBold,
    lineHeight: roundToDecimals(64 / 48),
    fontSize: pxToRem(32),
    ...responsiveFontSizes({ sm: 40, md: 44, lg: 48 }),
  },
  h3: {
    fontFamily: secondaryFont,
    fontWeight: baseTypography.fontWeightBold,
    lineHeight: 1.5,
    fontSize: pxToRem(24),
    ...responsiveFontSizes({ sm: 26, md: 30, lg: 32 }),
  },
  h4: {
    fontWeight: baseTypography.fontWeightBold,
    lineHeight: 1.5,
    fontSize: pxToRem(20),
    ...responsiveFontSizes({ md: 24 }),
  },
  h5: {
    fontWeight: baseTypography.fontWeightBold,
    lineHeight: 1.5,
    fontSize: pxToRem(18),
    ...responsiveFontSizes({ sm: 19 }),
  },
  h6: {
    fontWeight: baseTypography.fontWeightSemiBold,
    lineHeight: roundToDecimals(28 / 18),
    fontSize: pxToRem(17),
    ...responsiveFontSizes({ sm: 18 }),
  },
  subtitle1: {
    fontWeight: baseTypography.fontWeightSemiBold,
    lineHeight: 1.5,
    fontSize: pxToRem(16),
  },
  subtitle2: {
    fontWeight: baseTypography.fontWeightSemiBold,
    lineHeight: roundToDecimals(22 / 14),
    fontSize: pxToRem(14),
  },
  body1: {
    lineHeight: 1.5,
    fontSize: pxToRem(16),
  },
  body2: {
    lineHeight: roundToDecimals(22 / 14),
    fontSize: pxToRem(14),
  },
  caption: {
    lineHeight: 1.5,
    fontSize: pxToRem(12),
  },
  overline: {
    fontWeight: baseTypography.fontWeightBold,
    lineHeight: 1.5,
    fontSize: pxToRem(12),
    textTransform: 'uppercase',
  },
  button: {
    fontWeight: baseTypography.fontWeightBold,
    lineHeight: roundToDecimals(24 / 14),
    fontSize: pxToRem(14),
    textTransform: 'unset',
  },
};
