import type { LabelProps } from './types';

import { upperFirst } from 'es-toolkit';
import { mergeClasses } from 'minimal-shared/utils';

import { labelClasses } from './classes';

// ----------------------------------------------------------------------

const getLabelClasses = (
  color: LabelProps['color'],
  variant: LabelProps['variant'],
  disabled?: boolean
) => {
  const baseClasses =
    'h-6 min-w-6 leading-none shrink-0 cursor-default items-center whitespace-nowrap inline-flex gap-1.5 justify-center px-1.5 text-xs font-bold rounded-md transition-all duration-200';

  const variantClasses = {
    filled: {
      default: 'text-white bg-foreground/80',
      primary: 'text-primary-foreground bg-primary',
      secondary: 'text-white bg-[#8E33FF]',
      info: 'text-white bg-sky-500',
      success: 'text-white bg-emerald-500',
      warning: 'text-white bg-amber-500',
      error: 'text-white bg-red-500',
    },
    outlined: {
      default: 'bg-transparent text-foreground border border-foreground/40',
      primary: 'bg-transparent text-primary border border-primary/60',
      secondary: 'bg-transparent text-[#8E33FF] border border-[#8E33FF]/60',
      info: 'bg-transparent text-sky-600 border border-sky-500/60',
      success: 'bg-transparent text-emerald-600 border border-emerald-500/60',
      warning: 'bg-transparent text-amber-600 border border-amber-500/60',
      error: 'bg-transparent text-red-600 border border-red-500/60',
    },
    soft: {
      default: 'text-foreground bg-muted',
      primary: 'text-primary bg-primary/10',
      secondary: 'text-[#8E33FF] bg-[#8E33FF]/10',
      info: 'text-sky-700 bg-sky-100',
      success: 'text-emerald-700 bg-emerald-100',
      warning: 'text-amber-700 bg-amber-100',
      error: 'text-red-700 bg-red-100',
    },
    inverted: {
      default: 'text-foreground/80 bg-muted/70',
      primary: 'text-primary bg-primary/15',
      secondary: 'text-[#8E33FF] bg-[#8E33FF]/15',
      info: 'text-sky-800 bg-sky-200',
      success: 'text-emerald-800 bg-emerald-200',
      warning: 'text-amber-800 bg-amber-200',
      error: 'text-red-800 bg-red-200',
    },
  };

  const colorKey = color || 'default';
  const variantKey = variant || 'soft';
  const variantClass = variantClasses[variantKey]?.[colorKey] || variantClasses.soft.default;
  const disabledClass = disabled ? 'opacity-48 pointer-events-none' : '';

  return `${baseClasses} ${variantClass} ${disabledClass}`;
};

export function Label({
  endIcon,
  children,
  startIcon,
  className,
  disabled,
  variant = 'soft',
  color = 'default',
  ...other
}: LabelProps) {
  return (
    <span
      className={mergeClasses([
        labelClasses.root,
        getLabelClasses(color, variant, disabled),
        className,
      ])}
      {...other}
    >
      {startIcon && (
        <span
          className={mergeClasses([
            labelClasses.icon,
            'w-4 h-4 shrink-0 [&_svg,_img]:w-full [&_svg,_img]:h-full [&_svg,_img]:object-cover',
          ])}
        >
          {startIcon}
        </span>
      )}

      {typeof children === 'string' ? upperFirst(children) : children}

      {endIcon && (
        <span
          className={mergeClasses([
            labelClasses.icon,
            'w-4 h-4 shrink-0 [&_svg,_img]:w-full [&_svg,_img]:h-full [&_svg,_img]:object-cover',
          ])}
        >
          {endIcon}
        </span>
      )}
    </span>
  );
}
