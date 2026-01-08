import type { PaletteColorKey } from '../palette';

import { varAlpha } from 'minimal-shared/utils';

// ----------------------------------------------------------------------

/**
 * Generates styles for menu item components.
 *
 * @param options - Style options
 * @returns A CSS object with styles.
 *
 * @example
 * menuItemStyles({ fontSize: '0.875rem', padding: '6px 8px' })
 */

export type MenuItemStyleOptions = {
  fontSize?: React.CSSProperties['fontSize'];
  padding?: React.CSSProperties['padding'];
  borderRadius?: React.CSSProperties['borderRadius'];
  selectedBgColor?: string;
  hoverBgColor?: string;
};

export function menuItemStyles(options?: MenuItemStyleOptions): React.CSSProperties & {
  [key: string]: React.CSSProperties | string | number | undefined;
} {
  const {
    fontSize = '0.875rem',
    padding = '6px 8px',
    borderRadius = '6px',
    selectedBgColor,
    hoverBgColor,
  } = options ?? {};

  return {
    fontSize,
    padding,
    borderRadius,
    '&:not(:last-of-type)': {
      marginBottom: 4,
    } as React.CSSProperties,
    ...(selectedBgColor && {
      '&.selected': {
        fontWeight: 600,
        backgroundColor: selectedBgColor,
        '&:hover': { backgroundColor: hoverBgColor || selectedBgColor },
      } as React.CSSProperties,
    }),
  } as React.CSSProperties & {
    [key: string]: React.CSSProperties | string | number | undefined;
  };
}

// ----------------------------------------------------------------------

/**
 * Generates styles for paper components.
 *
 * @param options.blur - (Optional) Blur intensity in pixels. Defaults to 20.
 * @param options.color - (Optional) Background color. Defaults to semi-transparent paper color.
 * @param options.dropdown - (Optional) If true, applies padding, box-shadow, and border-radius for dropdowns.
 * @param options.direction - (Optional) Text direction 'ltr' or 'rtl'. Defaults to 'ltr'.
 * @returns A CSS object with styles.
 *
 * @example
 * // Paper with default styles
 * paperStyles();
 *
 * @example
 * // Paper with dropdown styles and custom blur
 * paperStyles({
 *   blur: 10,
 *   color: varAlpha(palette.background.defaultChannel, 0.9),
 *   dropdown: true
 * })
 */

/**
 * Tools for creating image base64
 * https://www.fffuel.co/eeencode/
 */
const cyanShape =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSJ1cmwoI3BhaW50MF9yYWRpYWxfNDQ2NF81NTMzOCkiIGZpbGwtb3BhY2l0eT0iMC4xIi8+CjxkZWZzPgo8cmFkaWFsR3JhZGllbnQgaWQ9InBhaW50MF9yYWRpYWxfNDQ2NF81NTMzOCIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgxMjAgMS44MTgxMmUtMDUpIHJvdGF0ZSgtNDUpIHNjYWxlKDEyMy4yNSkiPgo8c3RvcCBzdG9wLWNvbG9yPSIjMDBCOEQ5Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwQjhEOSIgc3RvcC1vcGFjaXR5PSIwIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==';

const redShape =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSJ1cmwoI3BhaW50MF9yYWRpYWxfNDQ2NF81NTMzNykiIGZpbGwtb3BhY2l0eT0iMC4xIi8+CjxkZWZzPgo8cmFkaWFsR3JhZGllbnQgaWQ9InBhaW50MF9yYWRpYWxfNDQ2NF81NTMzNyIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgwIDEyMCkgcm90YXRlKDEzNSkgc2NhbGUoMTIzLjI1KSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRjU2MzAiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkY1NjMwIiBzdG9wLW9wYWNpdHk9IjAiLz4KPC9yYWRpYWxHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K';

export type PaperStyleOptions = {
  blur?: number;
  color?: string;
  dropdown?: boolean;
  direction?: 'ltr' | 'rtl';
  borderRadius?: number;
  customShadows?: {
    dropdown?: string;
  };
};

export function paperStyles(options?: PaperStyleOptions): React.CSSProperties {
  const { blur = 20, color, dropdown, direction = 'ltr', borderRadius = 8, customShadows } = options ?? {};

  const positions = direction === 'rtl' ? ['top left', 'right bottom'] : ['top right', 'left bottom'];

  return {
    backgroundImage: `url(${cyanShape}), url(${redShape})`,
    backgroundSize: '50%, 50%',
    backgroundPosition: positions.join(', '),
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    backgroundColor: color,
    ...(dropdown && {
      padding: '4px',
      boxShadow: customShadows?.dropdown,
      borderRadius: `${borderRadius * 1.25}px`,
    }),
  };
}

// ----------------------------------------------------------------------

/**
 * Generate style variant for components like Button or Chip
 *
 * @param colorKey - 'default', 'inherit', or a palette color key like 'primary', 'secondary', etc.
 * @param options - Style options including hover styles
 * @param palette - Palette colors object
 * @returns A CSS object with styles.
 *
 * @example
 * // Filled styles
 * filledStyles('inherit', { hover: true }, palette)
 * filledStyles('inherit', { hover: { boxShadow: customShadows.z8 } }, palette)
 *
 * // Soft styles
 * softStyles('inherit', {}, palette)
 * softStyles('primary', { hover: true }, palette)
 */

export type StyleOptions = {
  hover?: boolean | React.CSSProperties;
};

export type PaletteColors = {
  grey: Record<string, string>;
  common: { white: string; black: string };
  [key: string]: {
    dark?: string;
    light?: string;
    mainChannel?: string;
    [key: string]: unknown;
  };
};

export function filledStyles(
  colorKey: 'default' | 'inherit' | PaletteColorKey,
  options: StyleOptions,
  palette: PaletteColors
): React.CSSProperties {
  if (colorKey === 'default') {
    return {
      color: palette.grey[800],
      backgroundColor: palette.grey[300],
      ...(!!options?.hover && {
        '&:hover': {
          backgroundColor: palette.grey[400],
          ...(typeof options.hover === 'object' ? options.hover : {}),
        } as React.CSSProperties,
      }),
    };
  }

  if (colorKey === 'inherit') {
    return {
      color: palette.common.white,
      backgroundColor: palette.grey[800],
      ...(!!options?.hover && {
        '&:hover': {
          backgroundColor: palette.grey[700],
          ...(typeof options.hover === 'object' ? options.hover : {}),
        } as React.CSSProperties,
      }),
    };
  }

  return {};
}

export function softStyles(
  colorKey: 'default' | 'inherit' | PaletteColorKey,
  options: StyleOptions,
  palette: PaletteColors
): React.CSSProperties {
  if (colorKey === 'default') {
    return filledStyles('default', options, palette);
  }

  if (colorKey === 'inherit') {
    return {
      backgroundColor: varAlpha(palette.grey['500Channel'], 0.16),
      ...(!!options?.hover && {
        '&:hover': {
          backgroundColor: varAlpha(palette.grey['500Channel'], 0.32),
          ...(typeof options.hover === 'object' ? options.hover : {}),
        } as React.CSSProperties,
      }),
    };
  }

  const colorPalette = palette[colorKey] as { dark?: string; light?: string; mainChannel?: string };

  return {
    color: colorPalette.dark,
    backgroundColor: varAlpha(colorPalette.mainChannel || '', 0.16),
    ...(!!options?.hover && {
      '&:hover': {
        backgroundColor: varAlpha(colorPalette.mainChannel || '', 0.32),
        ...(typeof options.hover === 'object' ? options.hover : {}),
      } as React.CSSProperties,
    }),
  };
}
