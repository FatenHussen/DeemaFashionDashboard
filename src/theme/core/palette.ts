import type { SchemesRecord } from '../types';

import { varAlpha, createPaletteChannel } from 'minimal-shared/utils';

import { themeConfig } from '../theme-config';

// ----------------------------------------------------------------------

// Keys for core palette colors
export type PaletteColorKey = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

// Palette color without channels
export type PaletteColorNoChannels = {
  lighter: string;
  light: string;
  main: string;
  dark: string;
  darker: string;
  contrastText: string;
};

// Palette color with channels
export type PaletteColorWithChannels = PaletteColorNoChannels & {
  lighterChannel: string;
  lightChannel: string;
  mainChannel: string;
  darkChannel: string;
  darkerChannel: string;
  contrastTextChannel: string;
};

// Extended palette color shades
export type PaletteColorExtend = {
  lighter: string;
  darker: string;
  lighterChannel: string;
  darkerChannel: string;
};

// Extended common colors
export type CommonColorsExtend = {
  whiteChannel: string;
  blackChannel: string;
};

// Extended text colors
export type TypeTextExtend = {
  disabledChannel: string;
};

// Extended background colors
export type TypeBackgroundExtend = {
  neutral: string;
  neutralChannel: string;
};

// Extended grey colors
export type GreyExtend = {
  '50Channel': string;
  '100Channel': string;
  '200Channel': string;
  '300Channel': string;
  '400Channel': string;
  '500Channel': string;
  '600Channel': string;
  '700Channel': string;
  '800Channel': string;
  '900Channel': string;
};

// Extended palette
export type PaletteExtend = {
  shared: {
    inputOutlined: string;
    inputUnderline: string;
    paperOutlined: string;
    buttonOutlined: string;
  };
};

// Action colors type
export type ActionColors = {
  hover: string;
  selected: string;
  focus: string;
  disabled: string;
  disabledBackground: string;
  hoverOpacity: number;
  disabledOpacity: number;
  active: string;
};

// Palette type
export type Palette = {
  primary: PaletteColorWithChannels;
  secondary: PaletteColorWithChannels;
  info: PaletteColorWithChannels;
  success: PaletteColorWithChannels;
  warning: PaletteColorWithChannels;
  error: PaletteColorWithChannels;
  common: { white: string; black: string; whiteChannel: string; blackChannel: string };
  grey: Record<string, string> & GreyExtend;
  divider: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    primaryChannel: string;
    secondaryChannel: string;
    disabledChannel: string;
  };
  background: {
    paper: string;
    default: string;
    neutral: string;
    paperChannel: string;
    defaultChannel: string;
    neutralChannel: string;
  };
  action: ActionColors;
  shared: PaletteExtend['shared'];
};

/**
 * ➤
 * ➤ ➤ Core palette (primary, secondary, info, success, warning, error, common, grey)
 * ➤
 */
export const primary = createPaletteChannel(themeConfig.palette.primary);
export const secondary = createPaletteChannel(themeConfig.palette.secondary);
export const info = createPaletteChannel(themeConfig.palette.info);
export const success = createPaletteChannel(themeConfig.palette.success);
export const warning = createPaletteChannel(themeConfig.palette.warning);
export const error = createPaletteChannel(themeConfig.palette.error);
export const common = createPaletteChannel(themeConfig.palette.common);
export const grey = createPaletteChannel(themeConfig.palette.grey);

/**
 * ➤
 * ➤ ➤ Text, background, action
 * ➤
 */
export const text = {
  light: createPaletteChannel({ primary: grey[900], secondary: grey[700], disabled: grey[600] }),
  dark: createPaletteChannel({ primary: '#FFFFFF', secondary: grey[400], disabled: grey[500] }),
};

export const background = {
  light: createPaletteChannel({ paper: '#FFFFFF', default: '#F3F4F6', neutral: grey[200] }),
  dark: createPaletteChannel({ paper: grey[800], default: grey[900], neutral: '#28323D' }),
};

export const action = (mode: 'light' | 'dark'): ActionColors => ({
  hover: varAlpha(grey['500Channel'], 0.08),
  selected: varAlpha(grey['500Channel'], 0.16),
  focus: varAlpha(grey['500Channel'], 0.24),
  disabled: varAlpha(grey['500Channel'], 0.8),
  disabledBackground: varAlpha(grey['500Channel'], 0.24),
  hoverOpacity: 0.08,
  disabledOpacity: 0.48,
  active: mode === 'light' ? grey[600] : grey[500],
});

/**
 * ➤
 * ➤ ➤ Extended palette
 * ➤
 */
export const extendPalette: PaletteExtend = {
  shared: {
    inputUnderline: varAlpha(grey['500Channel'], 0.32),
    inputOutlined: varAlpha(grey['500Channel'], 0.2),
    paperOutlined: varAlpha(grey['500Channel'], 0.16),
    buttonOutlined: varAlpha(grey['500Channel'], 0.32),
  },
};

/**
 * ➤
 * ➤ ➤ Base configuration
 * ➤
 */
const basePalette: Omit<Palette, 'text' | 'background' | 'action'> = {
  primary,
  secondary,
  info,
  success,
  warning,
  error,
  common,
  grey,
  divider: varAlpha(grey['500Channel'], 0.2),
  ...extendPalette,
};

/* **********************************************************************
 * 📦 Final
 * **********************************************************************/
export const palette: SchemesRecord<Palette> = {
  light: {
    ...basePalette,
    text: text.light,
    background: background.light,
    action: action('light'),
  },
  dark: {
    ...basePalette,
    text: text.dark,
    background: background.dark,
    action: action('dark'),
  },
};
