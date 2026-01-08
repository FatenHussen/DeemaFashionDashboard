// ----------------------------------------------------------------------

/**
 * Creates a CSS object for a gradient border.
 *
 * @param color - (Optional) The border color or CSS gradient definition. Defaults to `undefined`.
 * @param padding - (Optional) Padding inside the border. Defaults to `'2px'`.
 * @returns A CSS object with styles.
 *
 * @example
 * borderGradient({
 *   color: `to right, ${palette.primary.main}, ${varAlpha(palette.primary.mainChannel, 0.2)}`,
 *   padding: '4px'
 * })
 */

export type BorderGradientProps = {
  color?: string;
  padding?: string;
};

export function borderGradient(props?: BorderGradientProps): React.CSSProperties {
  const { color, padding = '2px' } = props ?? {};

  return {
    padding,
    inset: 0,
    width: '100%',
    content: '""',
    height: '100%',
    margin: 'auto',
    position: 'absolute',
    borderRadius: 'inherit',
    /********/
    mask: 'linear-gradient(#FFF 0 0) content-box, linear-gradient(#FFF 0 0)',
    WebkitMask: 'linear-gradient(#FFF 0 0) content-box, linear-gradient(#FFF 0 0)',
    maskComposite: 'exclude',
    WebkitMaskComposite: 'xor',
    ...(color && {
      background: color,
    }),
  };
}
