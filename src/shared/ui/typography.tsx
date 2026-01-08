import { forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline'
  | 'subtitle1'
  | 'subtitle2';

type TypographyColor = 'primary' | 'secondary' | 'text' | 'error' | 'warning' | 'info' | 'success';

const variantClasses: Record<TypographyVariant, string> = {
  h1: 'text-4xl font-bold',
  h2: 'text-3xl font-bold',
  h3: 'text-2xl font-semibold',
  h4: 'text-xl font-semibold',
  h5: 'text-lg font-medium',
  h6: 'text-base font-medium',
  body1: 'text-base',
  body2: 'text-sm',
  caption: 'text-xs',
  overline: 'text-xs uppercase tracking-wider',
  subtitle1: 'text-base font-medium',
  subtitle2: 'text-sm font-medium',
};

const colorClasses: Record<TypographyColor, string> = {
  primary: 'text-primary',
  secondary: 'text-muted-foreground',
  text: 'text-foreground',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-500',
  success: 'text-green-600',
};

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  color?: TypographyColor;
  component?: React.ElementType;
  gutterBottom?: boolean;
}

const getComponent = (variant?: TypographyVariant): React.ElementType => {
  if (!variant) return 'p';
  if (variant.startsWith('h')) return variant as React.ElementType;
  return 'p';
};

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  (
    { variant = 'body1', color = 'text', component, className, gutterBottom, children, ...props },
    ref
  ) => {
    const Component = (component || getComponent(variant)) as any;
    const gutterClass = gutterBottom ? 'mb-2' : '';

    return (
      <Component
        ref={ref}
        className={mergeClasses([
          variantClasses[variant],
          colorClasses[color],
          gutterClass,
          className,
        ])}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = 'Typography';
