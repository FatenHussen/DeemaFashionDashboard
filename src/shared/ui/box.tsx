import { forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

export interface BoxProps extends React.HTMLAttributes<HTMLElement> {
  component?: React.ElementType;
  sx?: React.CSSProperties | ((theme: any) => React.CSSProperties) | Array<React.CSSProperties | ((theme: any) => React.CSSProperties)>;
}

export const Box = forwardRef<HTMLElement, BoxProps>(
  ({ component = 'div', className, children, sx, style, ...props }, ref) => {
    const Component = component as any;
    
    // Handle sx prop - convert to inline styles
    let computedStyle = style;
    if (sx) {
      const sxArray = Array.isArray(sx) ? sx : [sx];
      const sxStyles = sxArray.reduce((acc, item) => {
        if (typeof item === 'function') {
          // For theme callbacks, we'll use a minimal theme object
          const theme = { spacing: (n: number) => `${n * 8}px` };
          return { ...acc, ...item(theme) };
        }
        return { ...acc, ...item };
      }, {} as React.CSSProperties);
      computedStyle = { ...sxStyles, ...style };
    }
    
    return (
      <Component ref={ref} className={mergeClasses([className])} style={computedStyle} {...props}>
        {children}
      </Component>
    );
  }
);

Box.displayName = 'Box';

