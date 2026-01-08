import type { SvgColorProps } from './types';

import { mergeClasses } from 'minimal-shared/utils';

import { svgColorClasses } from './classes';

// ----------------------------------------------------------------------

export function SvgColor({ src, className, style, ...other }: SvgColorProps) {
  return (
    <span
      className={mergeClasses([
        svgColorClasses.root,
        'w-6 h-6 shrink-0 inline-flex',
        className,
      ])}
      style={{
        mask: `url(${src}) no-repeat center / contain`,
        WebkitMask: `url(${src}) no-repeat center / contain`,
        backgroundColor: 'currentColor',
        ...style,
      }}
      {...other}
    />
  );
}
