import { forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  component?: React.ElementType;
  underline?: 'none' | 'hover' | 'always';
  color?: 'inherit' | 'primary' | 'secondary';
}

const underlineClasses = {
  none: 'no-underline',
  hover: 'hover:underline',
  always: 'underline',
};

const colorClasses = {
  inherit: 'text-inherit',
  primary: 'text-primary hover:text-blue-700',
  secondary: 'text-gray-600 hover:text-gray-700',
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ component, underline = 'always', color = 'primary', className, children, ...props }, ref) => {
    const Component = (component || 'a') as any;
    return (
      <Component
        ref={ref}
        className={mergeClasses([
          'transition-colors',
          underlineClasses[underline],
          colorClasses[color],
          className,
        ])}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Link.displayName = 'Link';
