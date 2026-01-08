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
      default: 'text-white bg-foreground',
      primary: 'text-white bg-blue-600',
      secondary: 'text-white bg-gray-600',
      info: 'text-white bg-blue-500',
      success: 'text-white bg-green-600',
      warning: 'text-white bg-yellow-600',
      error: 'text-white bg-red-600',
    },
    outlined: {
      default: 'bg-transparent text-foreground border-2 border-foreground',
      primary: 'bg-transparent text-primary border-2 border-blue-600',
      secondary: 'bg-transparent text-gray-600 border-2 border-gray-600',
      info: 'bg-transparent text-blue-500 border-2 border-blue-500',
      success: 'bg-transparent text-green-600 border-2 border-green-600',
      warning: 'bg-transparent text-yellow-600 border-2 border-yellow-600',
      error: 'bg-transparent text-red-600 border-2 border-red-600',
    },
    soft: {
      default: 'text-foreground bg-muted',
      primary: 'text-blue-800 bg-blue-100',
      secondary: 'text-foreground bg-muted',
      info: 'text-blue-700 bg-blue-100',
      success: 'text-green-800 bg-green-100',
      warning: 'text-yellow-800 bg-yellow-100',
      error: 'text-red-800 bg-red-100',
    },
    inverted: {
      default: 'text-gray-800 bg-gray-300',
      primary: 'text-blue-900 bg-blue-200',
      secondary: 'text-gray-800 bg-gray-200',
      info: 'text-blue-900 bg-blue-200',
      success: 'text-green-900 bg-green-200',
      warning: 'text-yellow-900 bg-yellow-200',
      error: 'text-red-900 bg-red-200',
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
