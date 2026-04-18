import { forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'medium' | 'large';
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

const sizeClasses = {
  small: 'h-8 w-8',
  medium: 'h-9 w-9',
  large: 'h-10 w-10',
};

const colorClasses = {
  default: 'text-muted-foreground hover:text-foreground hover:bg-muted/80 active:bg-muted',
  primary: 'text-primary hover:bg-primary/10 active:bg-primary/15',
  secondary: 'text-foreground hover:bg-muted active:bg-muted',
  error: 'text-red-600 hover:bg-red-50 active:bg-red-100',
  warning: 'text-amber-600 hover:bg-amber-50 active:bg-amber-100',
  info: 'text-sky-600 hover:bg-sky-50 active:bg-sky-100',
  success: 'text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'medium', color = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={mergeClasses([
        'inline-flex items-center justify-center rounded-lg transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        sizeClasses[size],
        colorClasses[color],
        className,
      ])}
      {...props}
    />
  )
);

IconButton.displayName = 'IconButton';
