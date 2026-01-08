import { forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

export interface SvgIconProps extends React.SVGProps<SVGSVGElement> {
  children: React.ReactNode;
}

export const SvgIcon = forwardRef<SVGSVGElement, SvgIconProps>(
  ({ children, className, ...props }, ref) => (
    <svg
      ref={ref}
      className={mergeClasses(['inline-block fill-current', className])}
      viewBox="0 0 24 24"
      {...props}
    >
      {children}
    </svg>
  )
);

SvgIcon.displayName = 'SvgIcon';

