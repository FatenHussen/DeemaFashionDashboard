import { remToPx } from 'minimal-shared/utils';

// ----------------------------------------------------------------------

/**
 * Creates a text gradient effect by applying a linear gradient as the text color.
 *
 * @param color - The gradient color definition.
 * @returns A CSS properties object that applies the gradient as text color.
 *
 * @example
 * textGradient(`to right, ${palette.text.primary}, ${varAlpha(palette.text.primary, 0.2)}`)
 */

export function textGradient(color?: string): React.CSSProperties {
  return {
    background: `linear-gradient(${color})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent',
  };
}

// ----------------------------------------------------------------------

/**
 * Creates a multi-line text truncation style with optional height calculation based on typography.
 *
 * @param line - The number of lines to clamp.
 * @param persistent - (Optional) Typography properties to calculate fixed height (e.g., fontSize, lineHeight).
 * @returns A CSS object with styles.
 *
 * @example
 * // Simple multi-line clamp
 * maxLine({ line: 2 })
 *
 * @example
 * // Clamp with calculated height based on typography
 * maxLine({
 *  line: 2,
 *  persistent: { fontSize: '0.75rem', lineHeight: 1.5 },
 * })
 */

type MediaFontSize = {
  [key: string]: {
    fontSize: React.CSSProperties['fontSize'];
  };
};

export type MaxLineProps = {
  line: number;
  persistent?: Partial<React.CSSProperties>;
};

function getFontSize(fontSize: React.CSSProperties['fontSize']) {
  return typeof fontSize === 'string' ? remToPx(fontSize) : fontSize;
}

function getLineHeight(lineHeight: React.CSSProperties['lineHeight'], fontSize?: number) {
  if (typeof lineHeight === 'string') {
    return fontSize ? remToPx(lineHeight) / fontSize : 1;
  }

  return lineHeight;
}

function calculateHeight(fontSize: number, lineHeight: number, line: number): number {
  return fontSize * lineHeight * line;
}

// Breakpoint map for responsive styles
const breakpointMap: Record<string, string> = {
  xs: '@media (min-width: 0px)',
  sm: '@media (min-width: 600px)',
  md: '@media (min-width: 900px)',
  lg: '@media (min-width: 1200px)',
  xl: '@media (min-width: 1536px)',
};

const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export function maxLine({ line, persistent }: MaxLineProps): React.CSSProperties & {
  [key: string]: React.CSSProperties;
} {
  const baseStyles: React.CSSProperties = {
    overflow: 'hidden',
    display: '-webkit-box',
    textOverflow: 'ellipsis',
    WebkitLineClamp: line,
    WebkitBoxOrient: 'vertical',
  };

  if (!persistent) {
    return baseStyles as React.CSSProperties & { [key: string]: React.CSSProperties };
  }

  const fontSizeBase = getFontSize(persistent.fontSize);
  const lineHeight = getLineHeight(persistent.lineHeight, fontSizeBase);

  if (!lineHeight || !fontSizeBase) {
    return baseStyles as React.CSSProperties & { [key: string]: React.CSSProperties };
  }

  const responsiveStyles = breakpoints.reduce((acc, breakpoint) => {
    const mediaQuery = breakpointMap[breakpoint];
    const fontSize = getFontSize((persistent as MediaFontSize)[mediaQuery]?.fontSize);

    if (fontSize && mediaQuery) {
      acc[mediaQuery] = {
        height: calculateHeight(fontSize, lineHeight, line),
      };
    }

    return acc;
  }, {} as Record<string, React.CSSProperties>);

  return {
    ...baseStyles,
    height: `${calculateHeight(fontSizeBase, lineHeight, line)}px`,
    ...responsiveStyles,
  } as React.CSSProperties & { [key: string]: React.CSSProperties };
}
